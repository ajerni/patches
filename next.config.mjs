/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclude canvas and konva from server-side bundling
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas', 'konva'];
    }
    
    // Ignore canvas package
    config.resolve.alias.canvas = false;
    
    return config;
  },
};

export default nextConfig;

