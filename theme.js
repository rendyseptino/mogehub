// theme.js
import { extendTheme } from "@chakra-ui/react";

const breakpoints = {
  sm: "0em",    // mobile
  md: "0em",    // iPad ikut mobile
  lg: "62em",   // desktop
  xl: "80em",
};

const theme = extendTheme({
  colors: {
    brand: {
      50: "#e0f7ff",
      100: "#b3ecff",
      200: "#80e0ff",
      300: "#90cdf4",
      400: "#90cdf4",
      500: "#ceff00", // primary
      600: "#90cdf4",
      700: "#138799",
      800: "#0b5e66",
      900: "#033333",
    },
    secondary: "#000000",
  },

  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },

  // ✅ cuma ini yang diganti
  fonts: {
    heading: '"Proxima Nova", system-ui, sans-serif',
    body: '"Proxima Nova", system-ui, sans-serif',
  },

  breakpoints,
});

export default theme;