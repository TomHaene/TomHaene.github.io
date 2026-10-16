// Blog categories — the single place to define them.
//
// To add or rename a category, edit this list AND the matching option in the Notion
// "Category" property. `label` must match the Notion option name (the fetch script matches
// on label or id, case-insensitively). `id` is what gets stored in each post's frontmatter.
//
// Posts with no category (or an unrecognised one) still show under "All", just without a badge.

export const categories = [
  { id: 'space-industry', label: 'Space Industry' },
  { id: 'communications-theory', label: 'Communications Theory' },
  { id: 'mathematics', label: 'Mathematics' },
];

/** Resolve a Notion select name (or an id) to a category id, or null if unknown. */
export function resolveCategoryId(name) {
  if (!name) return null;
  const needle = String(name).trim().toLowerCase();
  const hit = categories.find(
    (c) => c.id.toLowerCase() === needle || c.label.toLowerCase() === needle
  );
  return hit ? hit.id : null;
}
