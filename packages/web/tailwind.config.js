// eslint-disable-next-line import/no-extraneous-dependencies
const defaultTheme = require("tailwindcss/defaultTheme");

const IS_FRONTIER = process.env.NEXT_PUBLIC_IS_FRONTIER === "true";

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./modals/**/*.{js,ts,jsx,tsx}",
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
      transparent: "transparent",
      primary: IS_FRONTIER
        ? {
            50: "#8A86FF",
            100: "#D6692E",
            200: "#A4432D",
            300: "#2722BB",
            400: "#1D18A8",
            500: "#16119E",
            600: "#110D8B",
            700: "#92630B",
            800: "#080559",
            900: "#02003F",
          }
        : {
            50: "#8A86FF",
            100: "#4540D8",
            200: "#322DC2",
            300: "#2722BB",
            400: "#1D18A8",
            500: "#16119E",
            600: "#110D8B",
            700: "#0A0674",
            800: "#080559",
            900: "#02003F",
          },
      primaryVariant: "#0A0674",
      secondary: IS_FRONTIER
        ? {
            50: "#F4CC82",
            100: "#D9A575",
            200: "#C68D5A",
            300: "#BC9856",
            400: "#B88E42",
            500: "#AA7E2D",
            600: "#9C701D",
            700: "#92630B",
            800: "#875903",
            900: "#734B00",
          }
        : {
            50: "#F4CC82",
            100: "#D9B575",
            200: "#C4A46A",
            300: "#BC9856",
            400: "#B88E42",
            500: "#AA7E2D",
            600: "#9C701D",
            700: "#92630B",
            800: "#875903",
            900: "#734B00",
          },
      wireframes: {
        darkGrey: "#282828",
        grey: "#818181",
        lightGrey: "#B7B7B7",
      },
      background: IS_FRONTIER ? "#221B18" : "#170F34",
      modalOverlay: IS_FRONTIER
        ? "rgb(56, 53, 50, 0.8)"
        : "rgba(23, 15, 52, 0.8)",
      surface: IS_FRONTIER ? "#282421" : "#231D4B",
      card: IS_FRONTIER ? "#2E2C2F" : "#2D2755",
      cardInner: IS_FRONTIER ? "#383532" : "#3C356D",
      cardInfoPlaceholder: "#3E3866",
      iconDefault: IS_FRONTIER ? "#8E867B" : "#8E83AA",
      error: IS_FRONTIER ? "#E91F4F" : "#EF3456",
      enabledGold: "#C4A46A",
      pass: IS_FRONTIER ? "#64BC3B" : "#34EF52",
      missionError: "#EF3456",
      black: "#000000",
      backdrop: "rgba(0, 0, 0, 0.3)",
      superfluid: "#8A86FF",
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
      "gradients-socialLive":
        "linear-gradient(180deg, #89EAFB 0%, #1377B0 100%)",
      "gradients-greenBeach":
        "linear-gradient(180deg, #00CEBA 0%, #008A7D 100%)",
      "gradients-kashmir": "linear-gradient(180deg, #6976FE 0%, #3339FF 100%)",
      "gradients-frost": "linear-gradient(180deg, #0069C4 0%, #00396A 100%)",
      "gradients-cherry": "linear-gradient(180deg, #FF652D 0%, #FF0000 100%)",
      "gradients-sunset": "linear-gradient(180deg, #FFBC00 0%, #FF8E00 100%)",
      "gradients-orangeCoral":
        "linear-gradient(180deg, #FF8200 0%, #FF2C00 100%)",
      "gradients-pinky": "linear-gradient(180deg, #FF7A45 0%, #FF00A7 100%)",
      "gradients-clip": IS_FRONTIER
        ? "linear-gradient(180deg, #F8C259 0%, #B38203 100%)"
        : "linear-gradient(180deg, #3A3369 0%, #231D4B 100%)",
      "gradients-clipInner": IS_FRONTIER
        ? "linear-gradient(180deg, #F8C259 0%, #F8C259 10.94%, #B38203 100%)"
        : "linear-gradient(180deg, #332C61 0%, #312A5D 10.94%, #2D2755 100%)",
      "home-bg-pattern": IS_FRONTIER
        ? "url('/images/osmosis-home-bg-pattern-frontier.svg')"
        : "url('/images/osmosis-home-bg-pattern.svg')",
      "loading-bar":
        "linear-gradient(to left,rgba(251, 251, 251, 0.1),rgba(251, 251, 251, 0.2),rgba(251, 251, 251, 0.3),rgba(251, 251, 251, 0.2),rgba(251, 251, 251, 0.1))",
      superfluid: "linear-gradient(90deg, #8A86FF 0.04%, #E13CBD 99.5%)",
      "superfluid-20":
        "linear-gradient(90deg, rgba(138, 134, 255, 0.2) 0.04%, rgba(225, 60, 189, 0.2) 99.5%)",
      "selected-validator":
        "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), linear-gradient(#231d4b, #231d4b)",
    },
    boxShadow: {
      container:
        "0px 8px 10px rgba(0, 0, 0, 0.14), 0px 3px 14px rgba(0, 0, 0, 0.12), 0px 5px 5px rgba(0, 0, 0, 0.2)",
      "elevation-04dp":
        "0px 4px 5px rgba(0, 0, 0, 0.14), 0px 1px 10px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.2)",
      "elevation-08dp":
        "0px 8px 10px rgba(0, 0, 0, 0.14), 0px 3px 14px rgba(0, 0, 0, 0.12), 0px 5px 5px rgba(0, 0, 0, 0.2)",
      "elevation-24dp":
        "0px 24px 38px rgba(0, 0, 0, 0.14), 0px 9px 46px rgba(0, 0, 0, 0.12), 0px 11px 15px rgba(0, 0, 0, 0.2)",
    },
    screens: {
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
        sidebar: "12.875rem",
        "mobile-header": "6rem",
        0.25: "1px",
      },
      maxWidth: {
        container: "70rem",
        clipboard: "32.5rem",
        modal: "42rem",
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
      },
      boxShadow: {
        separator: "0px -1px 0px 0px rgba(255, 255, 255, 0.12)",
      },
      borderRadius: {
        none: "0",
        lginset: "0.438rem", // 1px smaller than rounded-lg
        xlinset: "0.688rem", // 1px smaller than rounded-xl
        "2xlinset": "0.938rem", // 1 px smaller than rounded-2xl
      },
    },
  },
  plugins: [],
};
