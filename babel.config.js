module.exports = (api) => {
  api.cache(true)
  return {
    presets: ["babel-preset-expo"],
    // Remove expo-router/babel as it's deprecated in SDK 50+
  }
}
