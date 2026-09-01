// Pulls published blog posts from a Notion database and writes them into
// src/content/blog/ as Markdown files that Astro's content collections pick up.
//
// Required env vars (see .env.example / README.md):
//   NOTION_TOKEN        - internal integration token (starts with "secret_" or "ntn_")
//   NOTION_DATABASE_ID  - the database's ID (from its URL)
//
// Expected Notion database properties (exact names, case-sensitive):
//   Title       (title)
//   Slug        (rich text)   - used as the URL: /blog/<slug>/
//   Date        (date)
//   Description (rich text)   - optional, used for previews/SEO
//   Tags        (multi-select) - optional
//   Status      (select)      - only pages with status "Published" are pulled
//
// This directory (src/content/blog/) is fully regenerated on every run —
// don't hand-edit files here, edit the posts in Notion instead.

import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';
import { createWriteStream } from 'node:fs';

// Load .env for local runs (Node 20.6+). In CI the vars come from GitHub Actions secrets.
try {
  process.loadEnvFile('.env');
} catch {
  // No .env file present — that's fine, fall through to process.env.
}

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.error(
    'Missing NOTION_TOKEN or NOTION_DATABASE_ID. Copy .env.example to .env and fill them in ' +
      '(or set them as GitHub Actions secrets). Skipping Notion fetch.'
  );
  process.exit(0);
}

const notion = new Client({ auth: NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

const CONTENT_DIR = path.resolve('src/content/blog');
const IMAGES_DIR = path.resolve('public/blog-images');

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getPlainText(richTextArray) {
  return (richTextArray || []).map((t) => t.plain_text).join('');
}

async function downloadImage(url, destPath) {
  await mkdir(path.dirname(destPath), { recursive: true });
  await new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadImage(res.headers.location, destPath).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${res.statusCode}`));
          return;
        }
        const file = createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', reject);
  });
}

// Notion image URLs are signed and expire, so we mirror every image locally
// and rewrite the markdown/frontmatter to point at the local copy.
async function localizeImages(markdown, slug) {
  const imageRegex = /!\[([^\]]*)\]\((https:\/\/[^\s)]+)\)/g;
  let result = markdown;
  let match;
  let index = 0;
  const matches = [...markdown.matchAll(imageRegex)];

  for (match of matches) {
    const [fullMatch, alt, url] = match;
    index += 1;
    try {
      const ext = path.extname(new URL(url).pathname).split('?')[0] || '.png';
      const filename = `${index}${ext}`;
      const destPath = path.join(IMAGES_DIR, slug, filename);
      await downloadImage(url, destPath);
      const publicPath = `/blog-images/${slug}/${filename}`;
      result = result.replace(fullMatch, `![${alt}](${publicPath})`);
    } catch (err) {
      console.warn(`  ! Could not download image for "${slug}": ${err.message}`);
    }
  }
  return result;
}

async function main() {
  console.log('Fetching published posts from Notion...');

  const pages = [];
  let cursor = undefined;
  do {
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      start_cursor: cursor,
      filter: {
        property: 'Status',
        select: { equals: 'Published' },
      },
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  if (pages.length === 0) {
    console.log('No published posts found in Notion.');
    return;
  }

  // Convert everything in memory FIRST. Only once every post has been fetched and
  // converted successfully do we touch src/content/blog/ — otherwise a network blip
  // halfway through would leave the site with a half-empty (or empty) blog.
  const rendered = [];

  for (const page of pages) {
    const props = page.properties;
    const title = getPlainText(props.Title?.title) || 'Untitled';
    const explicitSlug = getPlainText(props.Slug?.rich_text);
    const slug = explicitSlug ? slugify(explicitSlug) : slugify(title);
    const date = props.Date?.date?.start || new Date().toISOString().slice(0, 10);
    const description = getPlainText(props.Description?.rich_text);
    const tags = (props.Tags?.multi_select || []).map((t) => t.name);

    console.log(`  -> ${title} (${slug})`);

    const mdBlocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdBlocks);
    let body = mdString.parent || '';
    body = await localizeImages(body, slug);

    const frontmatter = [
      '---',
      `title: ${JSON.stringify(title)}`,
      `description: ${JSON.stringify(description)}`,
      `date: ${date}`,
      `tags: [${tags.map((t) => JSON.stringify(t)).join(', ')}]`,
      `notionId: ${JSON.stringify(page.id)}`,
      '---',
      '',
    ].join('\n');

    rendered.push({ slug, contents: frontmatter + body });
  }

  // Safe to swap in the new content now.
  await rm(CONTENT_DIR, { recursive: true, force: true });
  await mkdir(CONTENT_DIR, { recursive: true });

  for (const { slug, contents } of rendered) {
    await writeFile(path.join(CONTENT_DIR, `${slug}.md`), contents);
  }

  console.log(`Done. Wrote ${rendered.length} post(s) to src/content/blog/.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
