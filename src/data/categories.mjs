// Blog categories — the single place to define them.
//
// To add or rename a category, edit this list. The `id` is what gets stored in each post's
// frontmatter; `label` is what visitors see AND what you pick in Notion's "Category" property
// (the fetch script matches on label or id, case-insensitively).
//
// Posts with no category (or an unrecognised one) fall into `defaultCategory`.

export const categories = [
  {
    id: 'weekly',
    label: 'Weekly Space Industry Updates',
    short: 'Weekly Updates',
    description: 'A short, opinionated look at what mattered in the space industry last week.',
  },
  {
    id: 'topics',
    label: 'Topics I find interesting',
    short: 'Topics',
    description: 'Longer pieces on whatever in engineering, wireless and space has caught my attention.',
  },
];

export const defaultCategory = 'topics';

/** Resolve a Notion select name (or an id) to a category id, or null if unknown. */
export function resolveCategoryId(name) {
  if (!name) return null;
  const needle = String(name).trim().toLowerCase();
  const hit = categories.find(
    (c) => c.id.toLowerCase() === needle || c.label.toLowerCase() === needle
  );
  return hit ? hit.id : null;
}
