/** Shared SWC transform config for Jest across workspace packages. */
const swcTransform = {
  "^.+\\.tsx?$": [
    "@swc/jest",
    {
      jsc: {
        parser: {
          syntax: "typescript",
          tsx: true,
          decorators: true,
        },
        target: "es2022",
      },
    },
  ],
  "^.+\\.(js|jsx|mjs)$": [
    "@swc/jest",
    {
      jsc: {
        parser: {
          syntax: "ecmascript",
          jsx: true,
        },
        target: "es2022",
      },
    },
  ],
};

module.exports = { swcTransform };
