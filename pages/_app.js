// pages/_app.js
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "../theme";
import { LanguageProvider } from "../context/LanguageContext"; // <-- import provider baru

function MyApp({ Component, pageProps }) {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <LanguageProvider> {/* <-- wrap seluruh app */}
          <Component {...pageProps} />
        </LanguageProvider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
