"use client";

import {
  Input,
  InputGroup,
  InputLeftElement,
  Box,
  VStack,
  Text,
  useColorMode,
} from "@chakra-ui/react";

import { SearchIcon } from "@chakra-ui/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

export default function SearchBarDashboardUser({
  sidebarItems = [],
  setSelectedMenu,
  onSelect,
}) {
  const { colorMode } = useColorMode();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const wrapperRef = useRef();

  // 🔥 keyword mapping
  const searchableItems = useMemo(() => {
    return [
      {
        key: "dashboard",
        name: "Dashboard",
        keywords: [
          "dashboard",
          "home",
          "boost",
          "statistik",
          "performance",
        ],
      },

      {
        key: "ads",
        name: "Ads",
        keywords: [
          "ads",
          "iklan",
          "motor",
          "listing",
          "jual",
        ],
      },

      {
        key: "adsBanner",
        name: "Ads Banner",
        keywords: [
          "banner",
          "ads banner",
          "promosi",
        ],
      },

      {
        key: "wishlist",
        name: "Wishlist",
        keywords: [
          "wishlist",
          "favorite",
          "favorit",
          "simpan",
        ],
      },

      {
        key: "subscription",
        name: "Subscription",
        keywords: [
          "subscription",
          "premium",
          "langganan",
          "boost",
        ],
      },

      {
        key: "verification",
        name: "Verification",
        keywords: [
          "verification",
          "verified",
          "verifikasi",
          "centang",
        ],
      },

      {
        key: "myTransaction",
        name: "My Transaction",
        keywords: [
          "transaction",
          "transaksi",
          "payment",
          "pembayaran",
          "invoice",
        ],
      },

      {
        key: "supportTicket",
        name: "Support Ticket",
        keywords: [
          "support",
          "ticket",
          "bantuan",
          "cs",
          "customer service",
        ],
      },

      {
        key: "profileSettings",
        name: "Profile Settings",
        keywords: [
          "profile",
          "setting",
          "akun",
          "profile settings",
        ],
      },

      {
        key: "privacy",
        name: "Privacy",
        keywords: [
          "privacy",
          "delete",
          "hapus akun",
          "privasi",
        ],
      },
    ];
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lower = query.toLowerCase();

    const filtered = searchableItems.filter((item) =>
      item.keywords.some((keyword) =>
        keyword.toLowerCase().includes(lower)
      )
    );

    setResults(filtered);
  }, [query, searchableItems]);

  // close dropdown outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleSelect = (item) => {
  setSelectedMenu(item.key);

  setQuery("");
  setResults([]);

  if (onSelect) {
    onSelect();
  }
};
  return (
    <Box position="relative" ref={wrapperRef} w="100%">
      <InputGroup>
        <InputLeftElement
            pointerEvents="none"
            h="48px"
            pl={2}
            >
          <SearchIcon
            color={
              colorMode === "light"
                ? "gray.500"
                : "gray.400"
            }
          />
        </InputLeftElement>

        <Input
        placeholder={t.searchDashboard}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        h="48px"
        borderRadius="full"
        pl="48px"
        fontSize="15px"
        fontWeight="500"
        bg={
            colorMode === "light"
            ? "gray.100"
            : "whiteAlpha.100"
        }
        border="1px solid"
        borderColor={
            colorMode === "light"
            ? "gray.200"
            : "whiteAlpha.200"
        }
        backdropFilter="blur(10px)"
        transition="all 0.25s ease"
        _placeholder={{
            color:
            colorMode === "light"
                ? "gray.500"
                : "gray.400",
        }}
        _hover={{
            borderColor: "brand.500",
            transform: "translateY(-1px)",
        }}
        _focus={{
            borderColor: "brand.500",
            boxShadow: "0 0 0 2px rgba(206,255,0,0.25)",
            bg:
            colorMode === "light"
                ? "white"
                : "whiteAlpha.200",
        }}
        />
      </InputGroup>

      {results.length > 0 && (
        <Box
          position="absolute"
          top="55px"
          left="0"
          right="0"
          zIndex="1000"
          bg={colorMode === "light" ? "white" : "gray.800"}
          borderWidth="1px"
          borderColor={
            colorMode === "light"
              ? "gray.200"
              : "gray.600"
          }
          borderRadius="lg"
          overflow="hidden"
          shadow="xl"
        >
          <VStack spacing={0} align="stretch">
            {results.map((item) => (
              <Box
                key={item.key}
                px={4}
                py={3}
                cursor="pointer"
                transition="0.2s"
                _hover={{
                  bg:
                    colorMode === "light"
                      ? "gray.100"
                      : "gray.700",
                }}
                onClick={() => handleSelect(item)}
              >
                <Text fontSize={{ base: "15px", md: "22px" }} fontWeight="medium">
                  {item.name}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
}