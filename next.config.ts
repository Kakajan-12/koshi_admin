module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.koshibakery.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
    ],
  },
};
