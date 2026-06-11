// ワンタコメントのカバレッジ分析
const fs = require('fs');

const files = ['lib/wanta.ts', 'lib/wanta-extra.ts', 'lib/wanta-extra2.ts', 'lib/wanta-extra3.ts', 'lib/wanta-human.ts'];
const coverage = {};

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  // 'war-id': { ... } トップレベルエントリを行ベースで解析
  const lines = src.split('\n');
  let currentId = null;
  for (const line of lines) {
    const idMatch = line.match(/^  '([a-z0-9-]+)': \{/);
    if (idMatch) {
      currentId = idMatch[1];
      coverage[currentId] = coverage[currentId] || new Set();
      continue;
    }
    if (currentId) {
      const keyMatch = line.match(/^    (digest|detail|perspectives|structure|legacy|lessons|human|exam):/);
      if (keyMatch) coverage[currentId].add(keyMatch[1]);
      if (/^  \},?\s*$/.test(line)) currentId = null;
    }
  }
}

const warFiles = ['lib/wars.ts', 'lib/wars-prehistoric.ts', 'lib/wars-ancient.ts', 'lib/wars-ancient-extra.ts', 'lib/wars-medieval.ts', 'lib/wars-medieval-extra.ts', 'lib/wars-renaissance.ts', 'lib/wars-extra.ts'];
const allIds = new Set();
for (const f of warFiles) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/id: '([a-z0-9-]+)'/g)) allIds.add(m[1]);
}

const MAIN = ['digest', 'detail', 'perspectives', 'structure', 'legacy', 'lessons'];
const noWanta = [];
const partial = [];
for (const id of [...allIds].sort()) {
  const c = coverage[id];
  if (!c || c.size === 0) { noWanta.push(id); continue; }
  const missing = MAIN.filter(k => !c.has(k));
  if (missing.length > 0) partial.push(`${id} (has: ${[...c].join(',')} / missing: ${missing.join(',')})`);
}

console.log(`=== 完全にワンタ無し: ${noWanta.length} 件 ===`);
console.log(noWanta.join(' '));
console.log(`=== 部分的に欠落: ${partial.length} 件 ===`);
console.log(partial.join('\n'));
