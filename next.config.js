/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: [
      'res.cloudinary.com',
      'placehold.co',
      'media.istockphoto.com',
      'plus.unsplash.com',
      'images.unsplash.com',
      'json-server-blog.vercel.app',
    ],
  },
}
