/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB, far too small for a downloadable app zip. Kept well
      // under 500MB+ on purpose -- server 1 only has ~500MB RAM and the whole
      // upload gets buffered in memory before it's written to disk.
      bodySizeLimit: '200mb',
    },
  },
};

module.exports = nextConfig;
