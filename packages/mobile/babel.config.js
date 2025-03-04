/** @type {import("@babel/core").ConfigFunction} */
module.exports = (api) => {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "transform-inline-environment-variables",
        {
          exclude: ["EXPO_ROUTER_APP_ROOT"],
        },
      ],
    ],
  };
};
