"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  useColorMode,
  IconButton,
  VStack,
  HStack,
  Collapse,
  Switch,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { FiSettings } from "react-icons/fi";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FaRegQuestionCircle, FaFire } from "react-icons/fa";
import { IoLanguage, IoHelpBuoy } from "react-icons/io5";
import { FaCheck } from "react-icons/fa"; 
import Image from "next/image";
import Link from "next/link";

import { useLanguageContext } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";

import BottomNavbar from "./BottomNavbar";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

const translations = { en, id };

export default function NotSignedInPlaceholder() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [fadeInLogo, setFadeInLogo] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const { language, setLanguage } = useLanguageContext();
  const t = translations[language] || translations.id;

  useEffect(() => {
    setTimeout(() => setFadeInLogo(true), 50);
  }, []);

  const loginTextColor = colorMode === "light" ? "black" : "white";
  const signUpTextColor = "black";

  const handleChangeLanguage = (lang) => {
    setLanguage(lang);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const updated = { ...JSON.parse(storedUser), language: lang };
      localStorage.setItem("user", JSON.stringify(updated));
    }
  };

  return (
    <Box
      minH="100vh"
      w="100%"
      bg={colorMode === "light" ? "gray.50" : "gray.900"}
      position="relative"
    >
      {/* ===== LOGIN MODAL ===== */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onOpenRegister={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(true);
        }}
      />

      {/* ===== REGISTER MODAL ===== */}
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onOpenLogin={() => {
          setRegisterModalOpen(false);
          setLoginModalOpen(true);
        }}
      />

      {/* HEADER */}
      <Flex
        w="100%"
        borderBottom="1px solid"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        px={4}
        py={2}
        align="center"
        justify="flex-end"
        position="sticky"
        top={0}
        zIndex={1000}
        bg={colorMode === "light" ? "white" : "gray.900"}
      >
        <Flex align="center" mr={4}>
          <Text
            fontSize="md"
            mr={2}
            color={colorMode === "light" ? "black" : "white"}
          >
            Dark Theme
          </Text>
          <Box position="relative" w="50px" h="24px">
          <Switch
            isChecked={colorMode === "dark"}
            onChange={toggleColorMode}
            size="md"
            sx={{
              borderRadius: "999px",
              "& .chakra-switch__track": {
                bg: colorMode === "dark" ? "#90cdf4" : "gray.300", // biru pas ON
              },
              "& .chakra-switch__thumb": {
                bg: colorMode === "dark" ? "brand.500" : "white",
              },
            }}
          />

          {/* ICON CHECK pas Dark Mode */}
          {colorMode === "dark" && (
            <Box
              position="absolute"
              top="50%"
              left="50%"  // tengah
              transform="translate(-50%, -50%)"
              pointerEvents="none"
              zIndex={2}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FaCheck size={12} color="black" />
            </Box>
          )}
        </Box>
        </Flex>

        <IconButton
          aria-label="Settings"
          icon={<FiSettings />}
          onClick={() => setModalOpen(true)}
          bg="transparent"
          color={colorMode === "light" ? "gray.700" : "white"}
          fontSize="2xl"
        />
      </Flex>

      {/* MODAL MANUAL DARI BAWAH KE ATAS */}
      {modalOpen && (
        <>
          <Box
            position="fixed"
            top={0}
            left={0}
            w="100%"
            h="100%"
            bg="rgba(0,0,0,0.5)"
            zIndex={1090}
            onClick={() => setModalOpen(false)}
          />

          <Box
            position="fixed"
            bottom={0}
            left={0}
            w="100%"
            bg={colorMode === "light" ? "white" : "gray.800"}
            shadow="lg"
            borderTopRadius="lg"
            p={4}
            zIndex={1100}
            transform="translateY(100%)"
            animation="slideUp 0.2s forwards"
            style={{ animationTimingFunction: "ease-out" }}
          >
            <VStack align="start" spacing={4} w="full">

              {/* ===== LANGUAGE DROPDOWN ===== */}
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  leftIcon={<IoLanguage />}
                  rightIcon={<ChevronDownIcon />}
                  justifyContent="flex-start"
                  w="full"
                >
                  {t.notSignedIn.language || "Language"}
                </MenuButton>
                <MenuList
                  bg={colorMode === "light" ? "white" : "gray.700"}
                  color={colorMode === "light" ? "black" : "white"}
                >
                  {Object.keys(translations).map((langKey) => (
                    <MenuItem
                      key={langKey}
                      onClick={() => handleChangeLanguage(langKey)}
                      fontWeight={language === langKey ? "bold" : "normal"}
                    >
                      {langKey.toUpperCase()}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>

              <Button
                variant="ghost"
                leftIcon={<FaRegQuestionCircle />}
                rightIcon={<ChevronDownIcon />}
                onClick={() => setHelpOpen(!helpOpen)}
                justifyContent="flex-start"
                w="full"
              >
                {t.notSignedIn.helpLegal || "Help & Legal"}
              </Button>

              <Collapse in={helpOpen}>
                <VStack align="start" pl={4} spacing={2} w="full">
                  <Link href="/privacy">
                    <Button
                      variant="ghost"
                      w="full"
                      justifyContent="flex-start"
                    >
                      {t.notSignedIn.privacy || "Privacy"}
                    </Button>
                  </Link>

                  <Link href="/terms">
                    <Button
                      variant="ghost"
                      w="full"
                      justifyContent="flex-start"
                    >
                      {t.notSignedIn.terms || "Terms & Conditions"}
                    </Button>
                  </Link>
                </VStack>
              </Collapse>
              <Link href="/subscription">
              <Button
                variant="ghost"
                leftIcon={<FaFire />}
                w="full"
                justifyContent="flex-start"
              >
                {t.notSignedIn.subscriptions || "Subscriptions"}
              </Button>
              </Link>

              {/* ===== NEW HELP CENTER MENU ===== */}
              <Link href="/help">
                <Button
                  variant="ghost"
                  leftIcon={<IoHelpBuoy />}
                  w="full"
                  justifyContent="flex-start"
                >
                  {t.helpCenter || "Help Center"}
                </Button>
              </Link>
            </VStack>
          </Box>
        </>
      )}

      {/* CONTENT UTAMA */}
      <Flex
        direction="column"
        align="center"
        justify="flex-start"
        minH="85vh"
        pt={{ base: 20, md: 10 }}
        px={4}
      >
        <Box
          mb={6}
          opacity={fadeInLogo ? 1 : 0}
          transition="opacity 0.2s ease-in"
        >
          <Image
          src="/mogehublogocenter.png"
          alt="MogeHub Logo"
          width={125}
          height={125}
          priority
          loading="eager"
          unoptimized
          decoding="async"
          style={{
            maxWidth: "80vw",
            display: "block",
            transform: "translateZ(0)",
          }}
        />
        </Box>

        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          mb={2}
          textAlign="center"
          color={colorMode === "light" ? "gray.800" : "white"}
        >
          {t.notSignedIn.title}
        </Text>

        <Text
          fontSize="md"
          mb={6}
          textAlign="center"
          color={colorMode === "light" ? "gray.600" : "gray.300"}
        >
          {t.notSignedIn.subtitle}
        </Text>

        <HStack spacing={4}>
          <Button
            onClick={() => setLoginModalOpen(true)}
            bg={colorMode === "light" ? "gray.300" : "gray.700"}
            color={loginTextColor}
            borderRadius="full"
            px={6}
            py={4}
            fontSize="sm"
            fontWeight="bold"
            _hover={{
              bg: colorMode === "light" ? "gray.400" : "gray.600",
            }}
          >
            {t.notSignedIn.login}
          </Button>

          <Button
            onClick={() => setRegisterModalOpen(true)}
            bg="brand.500"
            color={signUpTextColor}
            borderRadius="full"
            px={6}
            py={4}
            fontSize="sm"
            fontWeight="bold"
            _hover={{ bg: "brand.600" }}
          >
            {t.notSignedIn.signup}
          </Button>
        </HStack>
      </Flex>

      <BottomNavbar />

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
}