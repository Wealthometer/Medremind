const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...config.resolver.alias,
  "react-native-svg": "react-native-svg-web",
};

module.exports = config;
