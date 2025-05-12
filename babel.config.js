module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      ["@babel/plugin-proposal-decorators", { "legacy": true }],
      "react-native-reanimated/plugin",
      ["module-resolver", {
        "root": ["./src"],
        "alias": {
          "@components": "./src/components",
          "@screens": "./src/screens",
          "@utils": "./src/utils",
        }
      }]
    ]
  };
};
