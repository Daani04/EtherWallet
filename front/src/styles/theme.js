// src/styles/theme.js

const theme = {
  colors: {
    backgroundDark: "#102217",

    cardBg: "#1f2e26",
    inputBg: "#1c2720",
    border: "#355b49",

    primary: "#2bee79",
    primarySoft: "rgba(43,238,121,0.18)",
    primaryDark: "#1bbf63",

    danger: "#ff5c5c",
    dangerSoft: "rgba(255,92,92,0.15)",

    textMain: "#ffffff",
    textMuted: "#9db9a8",
    textSoft: "rgba(255,255,255,0.65)",
  },

  radius: {
    xl: 26,
    lg: 22,
    md: 18,
    sm: 16,
    pill: 999,
  },

  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 24,
  },
};

// Por si alguna vez lo usas como theme.primary en vez de theme.colors.primary
theme.primary = theme.colors.primary;
theme.backgroundDark = theme.colors.backgroundDark;

export default theme;
