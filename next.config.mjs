/** @type {import('next').NextConfig} */
const nextConfig = {
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
