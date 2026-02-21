// components/Navbar.js
import {
  Box,
  Flex,
  Spacer,
  Button,
  IconButton,
  useDisclosure,
  Input,
  useColorMode,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
} from "@chakra-ui/react";

import {
  HamburgerIcon,
  CloseIcon,
  MoonIcon,
  SunIcon,
  AddIcon,
  ChevronDownIcon,
} from "@chakra-ui/icons";

import { FiMapPin } from "react-icons/fi";
import Link from "next/link";
import { useEffect, useState } from "react";

// ===== Import LanguageContext =====
import { useLanguageContext } from "../context/LanguageContext";

// ===== Import locales JSON =====
import en from "../locales/en.json";
import id from "../locales/id.json";

const translations = { en, id };

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  const [mounted, setMounted] = useState(false);
  const [city, setCity] = useState("Kota");
  const [searchCategory, setSearchCategory] = useState("Semua");
  const [keyword, setKeyword] = useState("");
  const [user, setUser] = useState(null);

  const { language, setLanguage } = useLanguageContext();
  const t = translations[language] || translations.id;

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem("user");
          setUser(null);
        }
      }
    }
  }, []);

  if (!mounted) return null;

  const bgColor = { light: "white", dark: "gray.900" };
  const inputBg = colorMode === "light" ? "gray.100" : "gray.800";
  const inputText = colorMode === "light" ? "gray.800" : "white";
  const placeholderColor = colorMode === "light" ? "gray.500" : "gray.400";
  const menuTextColor = colorMode === "light" ? "gray.800" : "white";

  const logoSrc =
    colorMode === "light"
      ? "/mogehubmasterlight.png"
      : "/mogehubmasterdark.png";

  const cities = [
    "Kota",
    "Jakarta",
    "Surabaya",
    "Bandung",
    "Bekasi",
    "Depok",
    "Tangerang",
    "Bogor",
    "Medan",
    "Semarang",
    "Makassar",
  ];

  const searchCategories = ["Semua", "Motor", "Aksesoris", "Dealer"];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const handleChangeLanguage = async (lang) => {
    setLanguage(lang);

    // sync localStorage user
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const updated = { ...parsed, language: lang };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
    }
  };

  return (
    <Box
      bg={bgColor[colorMode]}
      px={4}
      py={2}
      w="100%"
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="md"
    >
      <Flex align="center">
        {/* LOGO */}
        <Link href="/">
          <Box
            as="img"
            src={logoSrc}
            alt="MogeHub Logo"
            height="50px"
            maxW="100%"
            objectFit="contain"
            cursor="pointer"
          />
        </Link>

        <Spacer />

        {/* DESKTOP */}
        <Flex display={{ base: "none", md: "flex" }} align="center" gap={4}>
          {/* City Selector */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              color={inputText}
              _hover={{ bg: "gray.200" }}
            >
              <HStack spacing={1}>
                <FiMapPin size={16} />
                <Text fontSize="sm">{city}</Text>
              </HStack>
            </MenuButton>
            <MenuList
              borderRadius="md"
              shadow="lg"
              bg={bgColor[colorMode]}
              color={menuTextColor}
            >
              {cities.map((c) => (
                <MenuItem key={c} onClick={() => setCity(c)}>
                  {c}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* LANGUAGE */}
          <Menu>
            <MenuButton
              as={Button}
              variant="outline"
              rightIcon={<ChevronDownIcon />}
              color={inputText}
            >
              {language.toUpperCase()}
            </MenuButton>
            <MenuList
              borderRadius="md"
              shadow="lg"
              bg={bgColor[colorMode]}
              color={menuTextColor}
            >
              {Object.keys(translations).map((lang) => (
                <MenuItem
                  key={lang}
                  onClick={() => handleChangeLanguage(lang)}
                  fontWeight={language === lang ? "bold" : "normal"}
                >
                  {lang.toUpperCase()}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* Search Bar */}
          <Flex
            w="420px"
            bg={inputBg}
            borderRadius="xl"
            align="center"
            border="1px solid"
            borderColor={colorMode === "light" ? "gray.300" : "whiteAlpha.400"}
            boxShadow="sm"
          >
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                color={inputText}
                borderRadius="0"
                px={3}
              >
                {searchCategory === "Semua" ? (
                  <Box
                    as="img"
                    src="/caticon.png"
                    alt="Kategori Semua"
                    h="30px"
                    w="45px"
                  />
                ) : (
                  searchCategory
                )}
              </MenuButton>
              <MenuList
                borderRadius="md"
                shadow="lg"
                bg={bgColor[colorMode]}
                color={menuTextColor}
              >
                {searchCategories.map((c) => (
                  <MenuItem key={c} onClick={() => setSearchCategory(c)}>
                    {c}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            <Box h="24px" w="1px" bg="gray.300" opacity={0.4} mx={2} />

            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t?.searchPlaceholder || ""}
              border="none"
              bg="transparent"
              color={inputText}
              _placeholder={{ color: placeholderColor }}
              _focus={{ boxShadow: "none" }}
            />
          </Flex>

          {/* User / Auth */}
          {user ? (
            <>
              <Link href="/seller/dashboard">
                <Button variant="outline" color={inputText} borderColor={inputText}>
                  {t?.dashboard}
                </Button>
              </Link>

              <Button variant="solid" colorScheme="red" onClick={handleLogout}>
                {t?.logout}
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" color={inputText} borderColor={inputText}>
                  {t?.login}
                </Button>
              </Link>

              <Link href="/register">
                <Button variant="outline" color={inputText} borderColor={inputText}>
                  {t?.register}
                </Button>
              </Link>
            </>
          )}

          <Link href="/jual">
            <Button leftIcon={<AddIcon />} bg="brand.500" color="black" _hover={{ bg: "yellow.300" }}>
              {t?.freeAd}
            </Button>
          </Link>

          <IconButton
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="outline"
            color={inputText}
            borderColor={inputText}
          />
        </Flex>

        {/* MOBILE HAMBURGER */}
        <IconButton
          display={{ base: "flex", md: "none" }}
          ml={2}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          onClick={onToggle}
          variant="outline"
          color={inputText}
          borderColor={inputText}
        />
      </Flex>
    </Box>
  );
}
