"use client";

import { Flex, Box, Text } from "@chakra-ui/react";
import { FaCheck } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useLanguageContext } from "../context/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageContext();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("user");
        }
      }
    }
  }, []);

  // 🔥 WAJIB SAMA PERSIS KAYA NAVBAR
  const handleChangeLanguage = async (lang) => {
    setLanguage(lang);

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsed = JSON.parse(storedUser);

      const updated = { ...parsed, language: lang };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/language`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${parsed.token}`,
          },
          body: JSON.stringify({ language: lang }),
        });
      } catch (err) {
        console.error("Failed update language:", err);
      }
    }
  };

  return (
    <Flex
      bg="brand.500"
      borderRadius="full"
      p="4px"
      w="fit-content"
      align="center"
    >
      {["id", "en"].map((lang) => {
        const active = language === lang;

        return (
          <Flex
            key={lang}
            align="center"
            justify="center"
            px={4}
            py={1.5}
            borderRadius="full"
            cursor="pointer"
            bg={active ? "white" : "transparent"}
            transition="all 0.25s ease"
            onClick={() => handleChangeLanguage(lang)}
            position="relative"
          >
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="black"
              mr={active ? 2 : 0}
            >
              {lang.toUpperCase()}
            </Text>

            {/* ✅ CHECK ICON (premium feel) */}
            {active && (
              <Box display="flex" alignItems="center">
                <FaCheck size={12} color="black" />
              </Box>
            )}
          </Flex>
        );
      })}
    </Flex>
  );
}