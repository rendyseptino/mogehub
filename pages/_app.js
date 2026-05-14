// pages/_app.js
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "../styles/globals.css";
import {
  ChakraProvider,
  ColorModeScript,
  createStandaloneToast,
} from "@chakra-ui/react";
import theme from "../theme";
import { LanguageProvider } from "../context/LanguageContext";
import { UserProvider } from "../context/UserContext";
import { SocketProvider } from "../context/SocketContext";
import { NotificationProvider } from "../context/NotificationContext"; // 🔥 TAMBAH INI
import { useEffect } from "react";
import { useRouter } from "next/router";

import MaintenanceMode from "../components/MaintenanceMode"; 

const { toast } = createStandaloneToast();

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // ================= SCROLL FIX =================
    const handleRouteChange = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    // ================= NETWORK WATCHER =================
    const handleOnline = () => {
      console.log("🔌 Back online! Refetching data...");
      window.dispatchEvent(new Event("networkReconnect"));
    };

    window.addEventListener("online", handleOnline);

    // ================= 🔥 GLOBAL FETCH OVERRIDE =================
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const res = await originalFetch(...args);

      if (res.status === 403) {
        localStorage.removeItem("token");

        toast({
          title: "Akun Anda disuspend",
          description: "Silakan hubungi admin untuk informasi lebih lanjut",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        setTimeout(() => {
          window.location.href = "/login";
        }, 3500);
      }

      if (res.status === 401) {
        localStorage.removeItem("token");

        toast({
          title: "Session berakhir",
          status: "warning",
          duration: 2000,
          isClosable: true,
          position: "top",
        });

        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }

      return res;
    };

    // ================= 🔥 AUTO CHECK USER (FORCE LOGOUT) =================
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await originalFetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 403) {
          localStorage.removeItem("token");

          toast({
            title: "Akun Anda disuspend",
            description: "Anda telah dikeluarkan dari sistem",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
          });

          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
        }

        if (res.status === 401) {
          localStorage.removeItem("token");

          toast({
            title: "Session berakhir",
            status: "warning",
            duration: 2000,
            isClosable: true,
            position: "top",
          });

          setTimeout(() => {
            window.location.href = "/login";
          }, 1000);
        }
      } catch (err) {
        console.error("Auto check error:", err);
      }
    };

    // 🔥 langsung cek saat load pertama
    checkUser();

    // 🔥 interval check
    const interval = setInterval(checkUser, 5000);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
    };
  }, [router.events]);

  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <LanguageProvider>
          <UserProvider>
            <SocketProvider>
              <NotificationProvider> {/* 🔥 FIX UTAMA DI SINI */}
                <MaintenanceMode />
                <Component {...pageProps} />
              </NotificationProvider>
            </SocketProvider>
          </UserProvider>
        </LanguageProvider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;