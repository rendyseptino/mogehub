"use client";

import { useRef, useState } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Image,
  Flex,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { IoSearch, IoClose } from "react-icons/io5";

import { useLanguageContext } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";

export default function StickySearchBar({
  searchQuery,
  setSearchQuery,
  searchResults,
  showAutocomplete,
  setShowAutocomplete,
  setSelectedAutocompleteAd,
  setIsFilterOpen,
  onClear,
  onSearchSubmit,
  onHardResetSearch,
}) {
  const cardBg = useColorModeValue("white", "gray.700");
  const hoverBg = useColorModeValue("gray.100", "gray.600");
  const iconColor = useColorModeValue("gray.400", "whiteAlpha.800");

  const { language } = useLanguageContext();
  const translations = { en, id };
  const t = translations[language] || translations.id;

  const inputRef = useRef(null);
  const isClickingAutocomplete = useRef(false);
  const shouldKeepFocus = useRef(false);
  const [isSelected, setIsSelected] = useState(false);

  const handleChange = (e) => {
  const value = e.target.value;

  setSearchQuery(value);
  setIsSelected(false);

  // 🔥 KALO KOSONG → PAKAI HARD RESET ENGINE
  if (!value.trim()) {
    shouldKeepFocus.current = true;

    setSelectedAutocompleteAd(null);

    // 🔥 pusat reset (INI YANG PENTING)
    onHardResetSearch?.();

    setShowAutocomplete(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return;
  }

  // 🔥 kalau ada isi → normal autocomplete mode
  setShowAutocomplete(true);
};

  const handleBlur = () => {
    setTimeout(() => {
      if (shouldKeepFocus.current) {
        shouldKeepFocus.current = false;
        inputRef.current?.focus();
        return;
      }

      if (!isClickingAutocomplete.current) {
        setShowAutocomplete(false);
      }

      isClickingAutocomplete.current = false;
    }, 100);
  };

  return (
    <Box
      display={{ base: "block", lg: "none" }}
      position="fixed"
      top="55px"
      zIndex={999}
      bg={cardBg}
      px={4}
      py={3}
      w="100%"
    >
      <Box maxW="100%" position="relative">
        <InputGroup size="lg">
          <InputLeftElement pointerEvents="none" color={iconColor}>
            <IoSearch size={18} />
          </InputLeftElement>

          <Input
            ref={inputRef}
            placeholder={t?.searchProducts || "Search products..."}
            value={searchQuery}
            pl="45px"
            borderRadius="full"
            onChange={handleChange}
            onFocus={() => {
              if (searchQuery.trim() !== "" && !isSelected) {
                setShowAutocomplete(true);
              }
            }}
            onBlur={handleBlur}
            onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();

              setSelectedAutocompleteAd(null);
              setShowAutocomplete(false);
              setIsSelected(false);

              onSearchSubmit?.(searchQuery.trim());

              setTimeout(() => {
                inputRef.current?.focus();
              }, 0);
            }
          }}
          />

          {searchQuery && (
          <InputRightElement>
            <IconButton
              aria-label={t?.clearSearch || "Clear search"}
              icon={<IoClose />}
              size="sm"
              variant="ghost"
              onMouseDown={() => {
                shouldKeepFocus.current = true;
              }}
              onClick={() => {
                setIsSelected(false);
                onHardResetSearch?.({ refetch: true });

                setTimeout(() => {
                  inputRef.current?.focus();
                }, 0);
              }}
            />
          </InputRightElement>
        )}
        </InputGroup>

        {showAutocomplete && !isSelected && searchQuery.trim() !== "" && (
          <Box
            position="absolute"
            top="55px"
            left="0"
            right="0"
            bg={cardBg}
            borderRadius="md"
            shadow="lg"
            zIndex={1000}
            maxH="250px"
            overflowY="auto"
          >
            {searchResults.length > 0 ? (
              searchResults.map((ad) => (
                <Flex
                  key={ad.id}
                  align="center"
                  p={3}
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                  onMouseDown={() => {
                    isClickingAutocomplete.current = true;
                    shouldKeepFocus.current = true;
                  }}
                  onClick={() => {
                    setSelectedAutocompleteAd(ad);
                    setSearchQuery(ad.title);
                    setShowAutocomplete(false);
                    setIsSelected(true);
                    setIsFilterOpen(false);

                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 0);
                  }}
                >
                  <Image
                    src={ad.media?.[0]?.url || "/placeholder.png"}
                    boxSize="45px"
                    objectFit="cover"
                    borderRadius="md"
                    mr={3}
                  />
                  <Text noOfLines={1} fontSize="sm">
                    {ad.title}
                  </Text>
                </Flex>
              ))
            ) : (
              <Flex align="center" justify="center" p={4} direction="column">
                <Text fontSize="sm" fontWeight="medium">
                  {t?.adsNotFound || "Iklan tidak ditemukan"}
                </Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {t?.tryAnotherKeyword || "Coba kata kunci lain"}
                </Text>
              </Flex>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}