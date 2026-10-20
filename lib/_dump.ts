import { WAR_CONTENT } from './content';
import { LESSONS } from './lessons';
const id = process.argv[2];
const c = WAR_CONTENT[id];
const strip = (s: string) => s.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '');
console.log('## digest'); for (const [k, v] of Object.entries(c.digest)) console.log(`[${k}] ${strip(v)}`);
console.log('## detail', c.detail.title, '|', c.detail.kicker); console.log(c.detail.lead);
for (const s of c.detail.sections) console.log(`- ${s.heading}: ${s.body}`);
console.log('## perspectives'); for (const p of c.perspectives) console.log(`- ${p.nation}: ${p.text}`);
console.log('## structure', c.structure.summary); for (const f of c.structure.factors) console.log(`- ${f.title}: ${f.body}`);
console.log('## legacy'); for (const l of c.legacy) console.log(`- ${l.label}: ${l.text}`);
const L = LESSONS[id]; if (L) { console.log('## lessons'); for (const [k, v] of Object.entries(L)) console.log(`[${k}] ${strip(v)}`); }
