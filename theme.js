// theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#e0f7ff",
      100: "#b3ecff",
      200: "#80e0ff",
      300: "#4dd4ff",
      400: "#26c9ff",
      500: "#ceff00", // primary
      600: "#1bb0cc",
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

  fonts: {
    heading:
      '-apple-system, BlinkMacSystemFont, "Segoe UI Variable", "Segoe UI", Inter, system-ui, sans-serif',
    body:
      '-apple-system, BlinkMacSystemFont, "Segoe UI Variable", "Segoe UI", Inter, system-ui, sans-serif',
  },
});

export default theme;
