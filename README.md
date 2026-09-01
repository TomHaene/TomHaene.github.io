# Thomas Haene — Personal Website

Personal hub + blog, built with [Astro](https://astro.build). Blog posts are written in
Notion and pulled in automatically at build time.

## Stack

- **Astro** — static site generator, ships almost no JS by default.
- **Content collections** — blog posts live as Markdown in `src/content/blog/`, generated
  from Notion (don't hand-edit these files, they get overwritten).
- **GitHub Actions + GitHub Pages** — pushing to `main` builds the site, pulls the latest
  posts from Notion, and deploys automatically. It also rebuilds once a day on a schedule
  so edits made in Notion show up without a code push.

## Local development

```bash
npm install
npm run dev       # http://localhost:4321
```

## Setting up the Notion blog

**The Notion database already exists** — it's called **Blog Posts**, and it lives inside your
"Blogs" page:

- Database: https://app.notion.com/p/eba6c35d20df4e7d8249af56d2db4212
- Database ID: `eba6c35d20df4e7d8249af56d2db4212` (already filled into `.env.example`)

It has the exact properties the fetch script expects:

| Property      | Type         | Purpose                                                        |
| ------------- | ------------ | -------------------------------------------------------------- |
| `Title`       | Title        | Post title                                                      |
| `Slug`        | Text         | URL path — `my-first-post` becomes `/blog/my-first-post/`        |
| `Date`        | Date         | Publication date shown on the site                              |
| `Description` | Text         | Short summary for previews and SEO                              |
| `Tags`        | Multi-select | Optional topic tags                                             |
| `Status`      | Select       | Only `Published` posts are pulled in; `Draft` stays private      |

It's already seeded with two test posts: one **Published** ("Hello World: Testing the Pipeline")
and one **Draft**, so you can confirm the status filter works — the draft should never appear
on the site.

### The one remaining manual step: the integration token

The Notion API needs a token, and tokens can only be created by you in the browser:

1. Go to https://www.notion.so/my-integrations and click **New integration**.
2. Name it something like "Personal Website", pick your workspace, and create it.
3. Copy the **Internal Integration Secret** (starts with `ntn_`). This is your `NOTION_TOKEN`.
4. Open the **Blog Posts** database in Notion → `•••` menu (top right) → **Connections** →
   add the integration you just created. Without this step the API returns "object not found."

### Test it locally

```bash
cp .env.example .env      # then paste your token into NOTION_TOKEN
npm run fetch-notion      # pulls posts into src/content/blog/
npm run dev               # http://localhost:4321
```

### Then add the same values to GitHub

Repo → Settings → Secrets and variables → Actions → New repository secret. Add both
`NOTION_TOKEN` and `NOTION_DATABASE_ID`. The deploy workflow reads them at build time.

### Writing posts

Write posts as normal Notion pages inside the Blog Posts database. Fill in the Slug and Date,
then set `Status` to `Published` when it's ready to go live — the next push to `main` (or the
next daily scheduled rebuild) picks it up. Images pasted into Notion are downloaded and stored
in `public/blog-images/` at build time, since Notion's own image links expire after an hour.

Note: `src/content/blog/` is wiped and regenerated on every fetch. Don't hand-edit files
there — edit the posts in Notion instead.

## Deploying to GitHub Pages

The site deploys from the repo **TomHaene.github.io** and is served at
**https://tomhaene.github.io**. Because the repo is named `<username>.github.io`, it serves
from the root, so `astro.config.mjs` sets `site` and needs no `base`.

First-time setup:

1. Create a new repo on GitHub named exactly `TomHaene.github.io` — public, and with no
   README/gitignore/license (this folder already has them).
2. Push this folder to it (see the commands printed in the chat, or below):
   ```bash
   git remote add origin https://github.com/TomHaene/TomHaene.github.io.git
   git branch -M main
   git push -u origin main
   ```
3. Repo → **Settings → Pages → Source → GitHub Actions**.
4. Repo → **Settings → Secrets and variables → Actions** → add two repository secrets:
   `NOTION_TOKEN` and `NOTION_DATABASE_ID` (same values as your local `.env`). Without these
   the build still succeeds, but no posts get pulled from Notion.
5. The "Deploy to GitHub Pages" workflow runs on that push. When it goes green, the site is
   live at https://tomhaene.github.io.

After that, every push to `main` redeploys, and the workflow also rebuilds daily so posts you
publish in Notion appear without a code push.

## Project structure

```
src/
  components/    Header, Footer
  content/blog/  blog posts (auto-generated from Notion — do not hand-edit)
  layouts/       shared page shell
  pages/         index.astro (Home), about.astro, contact.astro, blog/
  styles/        global.css
scripts/
  fetch-notion.mjs   pulls posts from Notion into src/content/blog/
public/
  blog-images/       images mirrored from Notion at build time
.github/workflows/
  deploy.yml         CI: fetch Notion posts -> build -> deploy to GitHub Pages
```
