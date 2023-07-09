/** @type {import('next').NextConfig} */
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)', // Apply these headers to all routes.
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self';`,
          },
        ],
      },
    ];
  },
};
