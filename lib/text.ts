/** 本文データに混在する簡易HTMLを扱うユーティリティ */

export function stripHtml(html: string | undefined): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/** HTMLから最初の一文を「文の途中で切らずに」抽出する */
export function firstSentence(html: string | undefined, hardCap = 220): string {
  if (!html) return '';
  const segmented = html.replace(/<br\s*\/?>/gi, '\n');
  const plain = segmented.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').replace(/[ \t]+/g, ' ').trim();
  const firstSeg = plain.split('\n')[0].trim();
  const idx = firstSeg.indexOf('。');
  const candidate = idx > 0 ? firstSeg.slice(0, idx + 1) : firstSeg;
  if (candidate.length > hardCap) {
    const cut = candidate.lastIndexOf('、', hardCap);
    return cut > 40 ? candidate.slice(0, cut) + '——' : candidate.slice(0, hardCap) + '…';
  }
  return candidate;
}

export const formatYear = (y: number) => (y < 0 ? `前${-y}` : `${y}`);

/** 期間表示（例：1914–1918年、前490年、2022年–継続中） */
export function formatPeriod(year: number, endYear: number, ongoing = false): string {
  if (ongoing) return `${formatYear(year)}年–継続中`;
  if (year === endYear) return `${formatYear(year)}年`;
  return `${formatYear(year)}–${formatYear(endYear)}年`;
}
