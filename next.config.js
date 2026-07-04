/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: 'standalone', // đóng gói tối giản để build Docker image nhẹ
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
