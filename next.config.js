import webpack from 'webpack'

const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
      url: require.resolve("url/"),
      net: false,
      tls: false,
      fs: false,
    };
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      })
    );
    return config;
  },
};

export default nextConfig;
