/** @type {import('next').NextConfig} */
// 全ページに付けるセキュリティヘッダ（CSP は表示崩れのリスクがあるため未導入）
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    return [
      // 旧URL（探索画面のドロワー）→ 戦争ごとの個別ページ
      {
        source: '/explore',
        has: [{ type: 'query', key: 'war', value: '(?<war>[a-z0-9-]+)' }],
        destination: '/wars/:war',
        permanent: true,
      },
      // 旧・因果ネットワーク図（非公開化済み）→ 因果の大河
      { source: '/network', destination: '/chains', permanent: true },
    ];
  },
};

export default nextConfig;
