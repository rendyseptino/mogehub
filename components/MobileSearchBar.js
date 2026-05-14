"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  Button,
  Flex,
  Text,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { IoSearch } from "react-icons/io5";

export default function MobileSearchBar({
  searchQuery,
  setSearchQuery,
  setSelectedAutocompleteAd,
  onEmptySearch,
}) {
  const [searchResults, setSearchResults] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isFixedTop, setIsFixedTop] = useState(false);
  const searchBarRef = useRef(null);
  const debounceTimeout = useRef(null);

  const cardBg = useColorModeValue("white", "gray.700");
  const iconColor = useColorModeValue("gray.400", "gray.300");

  // 🔥 AUTOCOMPLETE LOGIC
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setShowAutocomplete(false);
      setSelectedAutocompleteAd(null);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mogehub.com/api/ads?search=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();

        const fixedAds = (data.ads || [])
          .filter((ad) =>
            ad.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((ad) => ({
            ...ad,
            isPremium: ad.seller?.subscription?.[0]?.productQuota > 1,
            seller: {
              ...ad.seller,
              verified: ad.seller?.verification?.status === "approved",
            },
          }));

        setSearchResults(fixedAds);
        setShowAutocomplete(true);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
        setShowAutocomplete(true);
      }
    }, 250);

    return () => clearTimeout(debounceTimeout.current);
  }, [searchQuery, setSelectedAutocompleteAd]);

  const handleChange = (value) => {
    setSearchQuery(value);
    setSelectedAutocompleteAd(null);
    if (value === "") {
      setSearchResults([]);
      setShowAutocomplete(false);
      if (onEmptySearch) onEmptySearch();
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedAutocompleteAd(null);
    setSearchResults([]);
    setShowAutocomplete(false);
    if (onEmptySearch) onEmptySearch();
  };

  // 🔥 SCROLL EFFECT UNTUK FIXED SEARCHBAR
  useEffect(() => {
    if (!searchBarRef.current) return;

    const navbarHeight = 50; // sesuai Navbar height
    const searchBarOffsetTop = searchBarRef.current.offsetTop;

    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Kalau scrollY sudah melewati posisi awal searchbar
      if (scrollY >= searchBarOffsetTop - 0) {
        setIsFixedTop(true); // naik ke top
      } else {
        setIsFixedTop(false); // balik ke posisi awal bawah navbar
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box
      ref={searchBarRef}
      mb={3}
      position={isFixedTop ? "fixed" : "relative"}
      top={isFixedTop ? "50px" : "auto"}
      left={0}
      right={0}
      zIndex={1000}
      px={4}
      py={2}
      bg={cardBg}
      shadow={isFixedTop ? "md" : "none"}
      transition="top 0.2s ease"
    >
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <IoSearch size={18} color={iconColor} />
        </InputLeftElement>

        <Input
          placeholder="Search products..."
          value={searchQuery}
          pl="40px"
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowAutocomplete(true)}
          onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
        />

        {searchQuery && (
          <InputRightElement>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              ✕
            </Button>
          </InputRightElement>
        )}
      </InputGroup>

      {showAutocomplete && (
        <Box
        position="absolute"
        bg={cardBg}
        w="100%"
        mt={1} // bisa juga ganti mt={isFixedTop ? 0 : 1} supaya lebih rapi
        borderRadius="md"
        shadow="md"
        zIndex={1001} // pastikan lebih tinggi dari searchbar
        maxH="200px"
        overflowY="auto"
        top="100%" // penting! supaya selalu di bawah searchbar
        left={0}
      >
          {searchResults.length > 0 ? (
            searchResults.map((ad) => (
              <Flex
                key={ad.id}
                align="center"
                p={2}
                cursor="pointer"
                _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
                onMouseDown={() => {
                  setSelectedAutocompleteAd(ad);
                  setSearchQuery(ad.title);
                  setShowAutocomplete(false);
                }}
              >
                <Image
                  src={ad.media?.[0]?.url || "/placeholder.png"}
                  boxSize="40px"
                  objectFit="cover"
                  borderRadius="md"
                  mr={2}
                />
                <Text noOfLines={1} fontSize="sm">
                  {ad.title}
                </Text>
              </Flex>
            ))
          ) : (
            <Box p={2}>
              <Text fontSize="sm" color="gray.500">
                Iklan tidak ditemukan
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}