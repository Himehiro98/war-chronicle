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
    ];
  },
};

export default nextConfig;
