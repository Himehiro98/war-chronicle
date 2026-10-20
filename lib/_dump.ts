import { WARS } from './wars';
import { WAR_CONTENT } from './content';
import { LESSONS } from './lessons';
import { HUMAN_LAYERS } from './human-layers';
import { EXAM_QUESTIONS } from './exam-questions';
import { WANTA_COMMENTS } from './wanta';
import { THINK_QUESTIONS } from './think-questions';
const era = process.argv[2];
const strip = (s?: string) => (s ?? '').replace(/<br\s*\/?>/g, ' / ').replace(/<[^>]+>/g, '');
const ws = WARS.filter((w) => w.era === era).sort((a, b) => a.year - b.year);
for (const w of ws) {
  const c = WAR_CONTENT[w.id];
  console.log(`\n######## ${w.id} | ${w.name} | ${w.year}-${w.endYear} | ${w.theater} | tags:${(w.tags ?? []).join(',')}`);
  if (!c) { console.log('NO CONTENT'); continue; }
  for (const [k, v] of Object.entries(c.digest)) console.log(`[digest.${k}] ${strip(v)}`);
  console.log(`[detail] ${c.detail.title} | ${c.detail.kicker} | ${c.detail.lead}`);
  c.detail.sections.forEach((s, i) => console.log(`[detail.${i}] ${s.heading}: ${s.body}`));
  c.perspectives.forEach((p) => console.log(`[persp] ${p.nation}: ${p.text}`));
  console.log(`[structure] ${c.structure.summary}`);
  c.structure.factors.forEach((f) => console.log(`[factor] ${f.title}: ${f.body}`));
  c.legacy.forEach((l) => console.log(`[legacy] ${l.label}: ${l.text}`));
  const L = LESSONS[w.id]; if (L) for (const [k, v] of Object.entries(L)) console.log(`[lessons.${k}] ${strip(v)}`);
  const H = HUMAN_LAYERS[w.id]; if (H) for (const [k, v] of Object.entries(H)) console.log(`[human.${k}] ${strip(v)}`);
  (EXAM_QUESTIONS[w.id] ?? []).forEach((q, i) => console.log(`[exam.${i}] Q: ${q.question} A: ${q.answer}`));
  if (THINK_QUESTIONS[w.id]) console.log(`[think] ${THINK_QUESTIONS[w.id]}`);
  const W = WANTA_COMMENTS[w.id]; if (W) for (const [k, v] of Object.entries(W)) console.log(`[wanta.${k}] ${v}`);
}
