// components/LoginInfo.js
import React, { useEffect, useState } from "react";
import { Box, Flex, Text, Icon } from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { EmailIcon } from "@chakra-ui/icons";
import * as jwt_decode from "jwt-decode"; // import semua sebagai object

// ================= IMPORT LANGUAGE CONTEXT =================
import { useLanguageContext } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";

const translations = { en, id };

export default function LoginInfo() {
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [loginMethod, setLoginMethod] = useState("");
  const [loginAt, setLoginAt] = useState("");

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // pakai .default karena versi terbaru
      const decoded = jwt_decode.default(token); 
      setLoginMethod(decoded.loginMethod || "Email");

      if (decoded.loginAt) {
        const date = new Date(decoded.loginAt);
        const formatted = new Intl.DateTimeFormat(language === "en" ? "en-US" : "id-ID", {
          year: "numeric",
          month: "long",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(date);
        setLoginAt(formatted);
      }
    } catch (err) {
      console.error("Gagal decode token:", err);
    }
  }, [language]);

  if (!loginMethod) return null;

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" w="full" maxW="400px">
      <Flex align="center" gap={3}>
        {loginMethod === "Google" ? (
          <Icon as={FcGoogle} boxSize={6} />
        ) : loginMethod === "Facebook" ? (
          <Icon as={FaFacebook} boxSize={6} color="#1877F2" />
        ) : (
          <EmailIcon boxSize={5} color="blue.500" />
        )}
        <Box>
          <Text fontWeight="bold">
            {t.loginWith || "Login dengan"}: {loginMethod}
          </Text>
          {loginAt && (
            <Text fontSize="sm">
              {t.lastLogin || "Terakhir login"}: {loginAt}
            </Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
}