/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
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
