// eslint-disable-next-line import/no-extraneous-dependencies
const defaultTheme = require("tailwindcss/defaultTheme");

const IS_FRONTIER = process.env.NEXT_PUBLIC_IS_FRONTIER === "true";

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./modals/**/*.{js,ts,jsx,tsx}",
    "./config/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      white: {
        full: "#FFFFFF",
        high: "rgba(255, 255, 255, 0.95)",
        emphasis: "rgba(255, 255, 255, 0.87)",
        mid: "rgba(255, 255, 255, 0.6)",
        disabled: "rgba(255, 255, 255, 0.38)",
        faint: "rgba(255, 255, 255, 0.12)",
      },
      wosmongton: IS_FRONTIER
        ? {
            100: "#FFFAF0",
            200: "#F5E7CD",
            300: "#F4D7A0",
            400: "#EAC378",
            500: "#E9B34D",
            700: "#DFA12A",
          }
        : {
            100: "#D3D1FF",
            200: "#B3B1FD",
            300: "#8C8AF9",
            400: "#6A67EA",
            500: "#5B57FA",
            700: "#462ADF",
          },
      ion: IS_FRONTIER
        ? { 500: "#7DCACE", 700: "#61B5BA" }
        : {
            500: "#2994D0",
            700: "#1469AF",
          },
      bullish: IS_FRONTIER
        ? { 500: "#29D0B2", 600: "#00A399" }
        : {
            400: "#6BDEC9",
            500: "#29D0B2",
            600: "#00A399",
          },
      osmoverse: IS_FRONTIER
        ? {
            100: "#D6CDD6",
            200: "#CBBDCB",
            300: "#AF9BAF",
            400: "#8C748C",
            500: "#6C566C",
            600: "#563F56",
            700: "#422F42",
            800: "#332133",
            900: "#211321",
            1000: "#050305",
          }
        : {
            100: "#E4E1FB",
            200: "#CEC8F3",
            300: "#B0AADC",
            400: "#958FC0",
            500: "#736CA3",
            600: "#565081",
            700: "#3C356D",
            800: "#282750",
            900: "#140F34",
            1000: "#090524",
          },
      ammelia: {
        600: "#CA2EBD",
      },
      rust: {
        200: "#F8C2B0",
        300: "#F5A68C",
        500: "#FA825D",
        600: "#E06640",
        700: "#C6451C",
        800: "#B03A20",
      },
      wireframes: {
        darkGrey: "#282828",
        grey: "#818181",
        lightGrey: "#B7B7B7",
      },
      error: IS_FRONTIER ? "#E91F4F" : "#EF3456",
      missionError: "#EF3456",
      superfluid: "#8A86FF",
      supercharged: "#64C5EE",
      transparent: "transparent",
      black: "black",
      inherit: "inherit",
      barFill: "#4f4aa2",
    },
    fontSize: {
      xxs: "0.5rem",
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.25rem",
      xl: "1.5rem",
      "2xl": "2.25rem",
      "3xl": "3rem",
      "4xl": "3.75rem",
      "5xl": "6rem",
      h1: ["6rem", { lineHeight: "7rem", letterSpacing: "-1.5px" }],
      h2: ["3.75rem", { lineHeight: "4.5rem", letterSpacing: "-0.5px" }],
      h3: ["3rem", { lineHeight: "3.5rem", letterSpacing: "0" }],
      h4: ["2.25rem", { lineHeight: "2.25rem", letterSpacing: "0" }],
      h5: ["1.5rem", { lineHeight: "2rem", letterSpacing: "0.18px" }],
      h6: ["1.25rem", { lineHeight: "1.5rem", letterSpacing: "0.15px" }],
      subtitle1: ["1rem", { lineHeight: "1.5rem", letterSpacing: "0.15px" }],
      subtitle2: ["0.875rem", { lineHeight: "1.5rem", letterSpacing: "0.1px" }],
      body1: ["1rem", { lineHeight: "1.5rem", letterSpacing: "0.5px" }],
      body2: ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.25px" }],
      button: ["0.875rem", { lineHeight: "1rem", letterSpacing: "0" }],
      caption: ["0.75rem", { lineHeight: "0.875rem", letterSpacing: "0.4px" }],
      overline: ["0.625rem", { lineHeight: "1rem", letterSpacing: "2.5px" }],
    },
    fontFamily: {
      h1: ["Poppins", "ui-sans-serif", "system-ui"],
      h2: ["Poppins", "ui-sans-serif", "system-ui"],
      h3: ["Poppins", "ui-sans-serif", "system-ui"],
      h4: ["Poppins", "ui-sans-serif", "system-ui"],
      h5: ["Poppins", "ui-sans-serif", "system-ui"],
      h6: ["Poppins", "ui-sans-serif", "system-ui"],
      subtitle1: ["Inter", "ui-sans-serif", "system-ui"],
      subtitle2: ["Inter", "ui-sans-serif", "system-ui"],
      body1: ["Inter", "ui-sans-serif", "system-ui"],
      body2: ["Inter", "ui-sans-serif", "system-ui"],
      button: ["Inter", "ui-sans-serif", "system-ui"],
      caption: ["Inter", "ui-sans-serif", "system-ui"],
      overline: ["Poppins", "ui-sans-serif", "system-ui"],
    },
    fontWeight: {
      ...defaultTheme.fontWeight,
      h1: 600,
      h2: 600,
      h3: 600,
      h4: 600,
      h5: 600,
      h6: 600,
      subtitle1: 600,
      subtitle2: 400,
      body1: 400,
      body2: 400,
      button: 600,
      caption: 400,
      overline: 400,
    },
    backgroundImage: {
      none: "none",
      "home-bg-pattern": IS_FRONTIER
        ? "url('/images/osmosis-home-bg-pattern-frontier.svg')"
        : "url('/images/osmosis-home-bg-pattern.svg')",
      "loading-bar":
        "linear-gradient(to left,rgba(251, 251, 251, 0.1),rgba(251, 251, 251, 0.2),rgba(251, 251, 251, 0.3),rgba(251, 251, 251, 0.2),rgba(251, 251, 251, 0.1))",
      superfluid: "linear-gradient(90deg, #8A86FF 0.04%, #E13CBD 99.5%)",
      supercharged: "linear-gradient(270deg, #64C5EE 0%, #EE64E8 100%);",
      "superfluid-20": IS_FRONTIER
        ? "linear-gradient(90deg, #8A86FF 0.04%, #E13CBD 99.5%);"
        : "linear-gradient(90deg, rgba(138, 134, 255, 0.2) 0.04%, rgba(225, 60, 189, 0.2) 99.5%)",
      "gradient-neutral": IS_FRONTIER
        ? "linear-gradient(96.42deg, #9A690A -0.59%, #E9B34D 100%);"
        : "linear-gradient(96.42deg, #462ADF -0.59%, #8A86FF 100%);",
      "gradient-positive": IS_FRONTIER
        ? "linear-gradient(96.5deg, #17848A 1.78%, #2ADF9E 50.4%, #61B5BA 100%);"
        : "linear-gradient(96.28deg, #899EFF 0%, #28F6AF 99.28%);",
      "gradient-negative": IS_FRONTIER
        ? "linear-gradient(96.42deg, #B03A20 -0.59%, #FA825D 100%);"
        : "linear-gradient(96.42deg, #B03A20 -0.59%, #FA825D 100%);",
      "gradient-supercharged":
        "linear-gradient(270deg, #64C5EE 0%, #EE64E8 100%);",
      "gradient-hero-card":
        "linear-gradient(to bottom,rgba(0, 0, 0, 0),rgba(0, 0, 0, 0.8));",
    },
    screens: {
      "3xl": { max: "1792px" },
      // => @media (max-width: 1792px) { ... }

      "2xl": { max: "1536px" },
      // => @media (max-width: 1536px) { ... }

      "1.5xl": { max: "1408px" },
      // => @media (max-width: 1408px) { ... }

      xl: { max: "1280px" },
      // => @media (max-width: 1280px) { ... }

      "1.5lg": { max: "1152px" },
      // => @media (max-width: 1152px) { ... }

      lg: { max: "1024px" },
      // => @media (max-width: 1024px) { ... }

      "1.5md": { max: "896px" },
      // => @media (max-width: 896px) { ... }

      md: { max: "768px" },
      // => @media (max-width: 768px) { ... }

      sm: { max: "640px" },
      // => @media (max-width: 640px) { ... }

      "1.5xs": { max: "512px" },
      // => @media (max-width: 512px) { ... }

      xs: { max: "420px" },
    },
    extend: {
      height: {
        navbar: "72px",
        "navbar-mobile": "65px",
        content: "calc(100vh - 72px)",
        "content-mobile": "calc(100vh - 58px)",
      },
      flex: {
        "basis-50": "0 1 50%",
      },
      width: {
        loader: {
          1: "3.75rem",
          2: "4rem",
          3: "4.25rem",
          4: "4.5rem",
          5: "4.75rem",
          6: "5rem",
        },
      },
      spacing: {
        sidebar: "13.75rem",
        "mobile-header": "6rem",
        0.25: "1px",
      },
      maxWidth: {
        container: "70rem",
        clipboard: "32.5rem",
        modal: "42rem",
        35: "35%",
      },
      maxHeight: {
        terms: "28rem",
      },
      keyframes: {
        loading: {
          "0%": { transform: "translateX(-150%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
      animation: {
        loading: "loading 1s ease-in-out infinite",
        "spin-slow": "spin 1.5s ease-in-out infinite",
      },
      boxShadow: {
        separator: "0px -1px 0px 0px rgba(255, 255, 255, 0.12)",
        md: "0px 6px 8px rgba(9, 5, 36, 0.2)",
        "volatility-preset": "0px 0px 12px 2px #8C8AF9",
      },
      borderRadius: {
        none: "0",
        lginset: "0.438rem", // 1px smaller than rounded-lg
        xlinset: "0.688rem", // 1px smaller than rounded-xl
        "2xlinset": "0.938rem", // 1 px smaller than rounded-2xl
        "4x4pxlinset": "1.5rem", // 4px smaller than 4xl
        "4xl": "1.75rem",
      },
      transitionTimingFunction: {
        bounce: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        inOutBack: "cubic-bezier(0.7, -0.4, 0.4, 1.4)",
        outBack: "cubic-bezier(0.46, 0.47, 0.4, 1.4)",
        inBack: "cubic-bezier(0.7, -0.4, 0.52, 0.51)",
      },
      transitionProperty: {
        height: "height",
        width: "width",
        borderRadius: "border-radius",
      },
      letterSpacing: {
        wide: ".009375em",
        wider: ".025em",
      },
    },
  },
  plugins: [],
};
