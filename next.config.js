/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: 'standalone', // đóng gói tối giản để build Docker image nhẹ
  // utils/private-content.ts đọc ./private-content lúc request. File tracing của
  // standalone có thể đoán ra đường dẫn đó và chép cả thư mục vào output — tức
  // vào image public. Loại hẳn, kể cả bộ mẫu (không ai cần nó lúc chạy).
  outputFileTracingExcludes: {
    '*': ['private-content/**', 'private-content.example/**'],
  },
  images: {
    unoptimized: true, // bypass Next.js 15.5 LRUCache bug; images still serve via remote CDN
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { hostname: 'res.cloudinary.com' },
      { hostname: 'placehold.co' },
      { hostname: 'media.istockphoto.com' },
      { hostname: 'plus.unsplash.com' },
      { hostname: 'images.unsplash.com' },
      { hostname: 'json-server-blog.vercel.app' },
      { hostname: 'avatars.githubusercontent.com' },
    ],
  },
}
