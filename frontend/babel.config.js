module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-reanimated/plugin re-exports react-native-worklets/plugin
      // and MUST be listed last.
      'react-native-reanimated/plugin',
    ],
  };
};
