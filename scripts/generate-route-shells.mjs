// GitHub Pages serves 404.html (no meta tags) for any deep link that
// isn't a real file, so link-preview bots (WhatsApp, iMessage, Slack...)
// never see this SPA's per-page title/description, only the root's.
// This copies the built index.html (whose asset paths are absolute, so
// it works from any depth) into a static shell per route, with that
// route's own meta swapped in, so crawlers get the right preview while
// real visitors still boot the same React app and client-side route.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const siteOrigin = 'https://naick1994.github.io/scoring-system-redbull';

const template = readFileSync(path.join(distDir, 'index.html'), 'utf8');

function withMeta({ route, title, description }) {
  const url = `${siteOrigin}${route}`;
  return template
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${description}" />`);
}

const PROPOSAL_META = {
  1: {
    title: 'Top 3 jumps + progressive Auto Impression from a vote of 5.0',
    description: 'The proposal closest to today: same 3 jumps, no new rules to learn. Only the Auto Impression becomes progressive and starts counting from a vote of 5.0 instead of 6.5.',
  },
  2: {
    title: 'Top 5 jumps + progressive Auto Impression from a vote of 5.0',
    description: 'Like proposal 1, but with 5 jumps counted instead of 3.',
  },
  3: {
    title: 'Top 7 unique jumps + Judges Impression',
    description: 'Only jumps that are different-category tricks count, up to 7. No more separate Auto Impression: variety is already built into the jump scores themselves.',
  },
  4: {
    title: 'Recommended: Top 5 unique jumps + Judges Impression',
    description: 'Only jumps that are different-category tricks count, up to 5. No more separate Auto Impression: variety is already built into the jump scores. The proposal we recommend.',
  },
};

const routes = [
  {
    route: '/kota',
    title: '4 proposals to improve King of the Air scoring',
    description: "Red Bull King of the Air's scoring has 7 known problems. Here are 4 concrete proposals to fix them, including the one we recommend.",
  },
  ...Object.entries(PROPOSAL_META).map(([id, meta]) => ({ route: `/kota/${id}`, ...meta })),
  {
    route: '/about-nick',
    title: 'Nicholas Baruffaldi',
    description: 'CEO & Co-founder of Flight Mode, manager of pro riders Lorenzo and Leonardo Casati, Forbes Under 30. The story behind Change The System.',
  },
];

for (const r of routes) {
  const outDir = path.join(distDir, r.route.replace(/^\//, ''));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, 'index.html'), withMeta(r));
  console.log(`wrote ${r.route}/index.html`);
}
