import { defineConfig } from 'astro/config';

// Deployed to GitHub Pages from the repo "TomHaene.github.io",
// which serves at the root of https://tomhaene.github.io — so no `base` is needed.
export default defineConfig({
  site: 'https://tomhaene.github.io',
  markdown: {
    shikiConfig: {
      // Light syntax-highlighting theme to match the site's light design.
      theme: 'github-light',
    },
  },
});
