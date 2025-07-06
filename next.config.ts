import type { NextConfig } from "next";
import type { Configuration } from "webpack";
import webpack from "webpack";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {},
  },
  webpack(config: Configuration, options: any) {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
      url: require.resolve("url/"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      net: false,
      tls: false,
      fs: false,
    };

    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      })
    );

    return config;
  },
};

export default nextConfig;
