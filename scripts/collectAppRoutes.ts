// scripts/collectAppRoutes.ts
// pnpm add -D fast-glob tsx
import fg from 'fast-glob';
import fs from 'node:fs';
import path from 'node:path';

const exts = ['js','jsx','ts','tsx','mdx'];
const patterns = [
  ...exts.map(e => `app/**/page.${e}`),
  ...exts.map(e => `src/app/**/page.${e}`),
];

const removeSpecial = (s: string) => s && !s.startsWith('(') && !s.startsWith('@');

const toNext = (segs: string[]) => '/' + segs.filter(removeSpecial).join('/');
const toColon = (segs: string[]) => '/' + segs
  .filter(removeSpecial)
  .map(s => {
    if (/^\[\[\.\.\.[^\]]+\]\]$/.test(s)) return s.replace(/^\[\[\.\.\.([^\]]+)\]\]$/, ':$1*?');
    if (/^\[\.\.\.[^\]]+\]$/.test(s))      return s.replace(/^\[\.\.\.([^\]]+)\]$/, ':$1*');
    if (/^\[[^\]]+\]$/.test(s))            return s.replace(/^\[([^\]]+)\]$/, ':$1');
    return s;
  }).join('/');

const isDynamic = (p: string) => /[\[\]:\*\?]/.test(p);

(async () => {
  const files = await fg(patterns, { dot: false });
  const rows = files.map(file => {
    const rel = file.replace(/^src\//, '');
    const inside = rel.replace(/^app\//, '').replace(/\/page\.(?:jsx?|tsx|mdx)$/, '');
    const segs = inside.split('/').filter(Boolean);
    const next = segs.length ? toNext(segs) : '/';
    const pattern = segs.length ? toColon(segs) : '/';
    return { file, next, pattern };
  });

  // de-dup by next path and sort (static first)
  const map = new Map<string, {file:string; next:string; pattern:string}>();
  rows.forEach(r => map.set(r.next, r));
  const data = Array.from(map.values()).sort((a,b) => {
    const dyn = (s:string) => Number(isDynamic(s));
    return dyn(a.next) - dyn(b.next) || a.next.localeCompare(b.next);
  });

  // output path (default -> public/app-routes.json)
  const outFlagIndex = process.argv.indexOf('--out');
  const outPath = outFlagIndex > -1 && process.argv[outFlagIndex + 1]
    ? process.argv[outFlagIndex + 1]
    : 'public/app-routes.json';

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`Wrote ${data.length} routes → ${outPath}`);
})();
