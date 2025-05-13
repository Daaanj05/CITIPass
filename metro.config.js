// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config")

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
})

// Add polyfills for Node.js core modules
config.resolver.extraNodeModules = {
  stream: require.resolve("stream-browserify"),
  crypto: require.resolve("crypto-browserify"),
  buffer: require.resolve("buffer"),
  process: require.resolve("process/browser"),
  util: require.resolve("util"),
  assert: require.resolve("assert"),
  http: require.resolve("stream-http"),
  https: require.resolve("https-browserify"),
  os: require.resolve("os-browserify/browser"),
  url: require.resolve("url"),
  path: require.resolve("path-browserify"),
  events: require.resolve("events/"),
  fs: false,
  net: require.resolve("react-native-tcp"),
  tls: require.resolve("react-native-tcp"), // Add TLS polyfill
  zlib: require.resolve("browserify-zlib"),
}

module.exports = config
