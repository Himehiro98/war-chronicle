/**
 * 依存なし・インメモリのスライディングウィンドウ式レート制限（/api/diagnose 用）。
 *
 * 注意: カウンターはサーバーレス「インスタンスごと」のメモリにあるため、あくまでベストエフォート。
 * インスタンスが増えたり再起動したりすると数え直しになる。
 * 本当の上限は、Anthropic キー側の支出上限（Spend limit）と Vercel Firewall のレート制限で掛けること。
 */

type Rule = { windowMs: number; max: number };

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** 1クライアント（IP）あたり */
const CLIENT_RULES: Rule[] = [
  { windowMs: 10 * MIN, max: 5 },
  { windowMs: DAY, max: 30 },
];
/** インスタンス全体 */
const GLOBAL_RULES: Rule[] = [
  { windowMs: HOUR, max: 30 },
  { windowMs: DAY, max: 200 },
];

const MAX_WINDOW_MS = DAY;

const clientHits: Record<string, number[]> = Object.create(null);
let globalHits: number[] = [];

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

function prune(hits: number[], now: number): number[] {
  return hits.filter((t) => now - t < MAX_WINDOW_MS);
}

/** 違反しているルールがあれば、すべて満たされるまでの待ち時間(ms)を返す。違反なしは 0 */
function waitMs(hits: number[], rules: Rule[], now: number): number {
  let wait = 0;
  rules.forEach((rule) => {
    const inWindow = hits.filter((t) => now - t < rule.windowMs);
    if (inWindow.length >= rule.max) {
      // inWindow は時系列順。max 件目より古いものが窓から出れば空く
      const pivot = inWindow[inWindow.length - rule.max];
      wait = Math.max(wait, pivot + rule.windowMs - now);
    }
  });
  return wait;
}

/** 許可された場合のみ記録する（拒否はメモリを増やさない） */
export function checkRateLimit(clientKey: string, now: number = Date.now()): RateLimitResult {
  globalHits = prune(globalHits, now);
  // 期限切れのクライアントを掃除（メモリを有界に保つ）
  Object.keys(clientHits).forEach((k) => {
    const pruned = prune(clientHits[k], now);
    if (pruned.length === 0) delete clientHits[k];
    else clientHits[k] = pruned;
  });

  const mine = clientHits[clientKey] || [];
  const wait = Math.max(waitMs(mine, CLIENT_RULES, now), waitMs(globalHits, GLOBAL_RULES, now));
  if (wait > 0) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(wait / 1000)) };
  }
  mine.push(now);
  clientHits[clientKey] = mine;
  globalHits.push(now);
  return { ok: true };
}

/** IPv4射影アドレスはIPv4へ、IPv6は /64 単位にまとめる */
export function normalizeIp(raw: string): string {
  let ip = raw.trim().toLowerCase();
  if (!ip) return 'unknown';
  if (ip.charAt(0) === '[') {
    const end = ip.indexOf(']');
    ip = end > 0 ? ip.slice(1, end) : ip.slice(1);
  }
  const zone = ip.indexOf('%');
  if (zone >= 0) ip = ip.slice(0, zone);
  const v4 = ip.match(/^(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?$/);
  if (v4) return v4[1];
  if (ip.indexOf(':') < 0) return ip;
  const mapped = ip.match(/^(?:0*:)*:?ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return mapped[1];
  const mappedHex = ip.match(/^(?:0*:)*:?ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mappedHex) {
    const hi = parseInt(mappedHex[1], 16);
    const lo = parseInt(mappedHex[2], 16);
    return [hi >> 8, hi & 255, lo >> 8, lo & 255].join('.');
  }
  // IPv6 を8グループに展開して先頭4グループ(/64)を使う
  const halves = ip.split('::');
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length > 1 && halves[1] ? halves[1].split(':') : [];
  const missing = halves.length > 1 ? 8 - head.length - tail.length : 0;
  const groups = head.concat(new Array(Math.max(0, missing)).fill('0'), tail);
  return groups
    .slice(0, 4)
    .map((g) => (g || '0').replace(/^0+(?=.)/, ''))
    .join(':') + '::/64';
}

/**
 * クライアント識別キー。プロキシ由来のヘッダーを信用してよいのは Vercel 上か、
 * TRUST_PROXY_HEADERS=1 のときだけ。それ以外は偽装できるので全員で1つのキーを共有する（安全側）。
 */
export function getClientKey(headers: { get(name: string): string | null }): string {
  const trusted = process.env.VERCEL === '1' || process.env.TRUST_PROXY_HEADERS === '1';
  if (!trusted) return 'shared';
  const real = headers.get('x-real-ip');
  if (real && real.trim()) return normalizeIp(real);
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',');
    const last = parts[parts.length - 1];
    if (last && last.trim()) return normalizeIp(last);
  }
  return 'shared';
}
