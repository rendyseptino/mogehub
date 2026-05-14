"use client";
import Head from "next/head";
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  useColorMode,
  Text,
  Spinner,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
import Image from "next/image";
import { mobileOnly, desktopOnly } from "../utils/responsive";
import { Badge } from "@chakra-ui/react";
import { MdMarkEmailRead } from "react-icons/md";

export default function ForgotPassword() {
  const { colorMode } = useColorMode();
  const translations = { en, id };
   

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [sentEmail, setSentEmail] = useState("");



  const handleForgotPassword = async () => {
  setFieldError("");
  setSuccessMessage("");
  setSentEmail(""); // reset

  if (!email.trim()) {
    setFieldError(t.fillAllFields);
    return;
  }

  setLoading(true);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          lang: language
        }),
      }
    );
    const data = await res.json();

    if (res.ok) {
      setSuccessMessage(t.passwordResetSent); 
      setSentEmail(email); // simpan email user
      setEmail(""); // reset input
    } else {
      const msg = data.code ? t[data.code] : data.message || t.serverError;
      setFieldError(msg);
    }
  } catch (err) {
    console.error(err);
    setFieldError(t.serverError);
  } finally {
    setLoading(false);
  }
};
  const logoSrc =
    colorMode === "light"
      ? "/mogehubmasterlight.png"
      : "/mogehubmasterdark.png";

  const pageBg = colorMode === "light" ? "gray.50" : "gray.900";
  const cardBg = colorMode === "light" ? "white" : "gray.800";
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const inputBgDesktop =
    colorMode === "light" ? "gray.100" : "gray.700";
    const pageTitle =
  language === "en"
    ? "Forgot Password - MogeHub"
    : "Lupa Password - MogeHub";

  return (
    <Box minH="100vh" bg={pageBg}>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      {/* NAVBAR */}
      <Flex
        w="100%"
        px={{ base: 4, md: 12 }}
        py={4}
        align="center"
        justify="space-between"
        bg={colorMode === "light" ? "white" : "gray.800"}
        boxShadow="md"
      >
       <Box w="140px" h="50px" mb={4} position="relative">
        <Image
          src={logoSrc}
          alt="Logo"
          fill
          priority
          unoptimized
          loading="eager"
          style={{
            objectFit: "contain",
          }}
        />
      </Box>
        {/* DESKTOP LOGIN BUTTON */}
        <Flex display={desktopOnly} gap={3} align="center">
          <Link href="/login" passHref>
            <Button bg="brand.500" color="black" _hover={{ bg: "brand.600" }}>
              {t.login}
            </Button>
          </Link>
        </Flex>

        {/* MOBILE LOGIN BUTTON */}
        <Flex display={mobileOnly}>
          <Link href="/login" passHref>
            <Button bg="brand.500" color="black" _hover={{ bg: "brand.600" }}>
              {t.login}
            </Button>
          </Link>
        </Flex>
      </Flex>

      {/* CONTENT */}
      <Flex
        minH="calc(100vh - 80px)"
        justify="center"
        align="flex-start"
        pt={{ base: 14, lg: 32 }}
        px={{ base: 4, lg: 12 }}
      >
        <Box
          w={{ base: "100%", lg: "450px" }}
          bg={{ base: "transparent", lg: cardBg }}
          p={{ base: 0, lg: 8 }}
          borderRadius={{ base: "none", lg: "xl" }}
          boxShadow={{ base: "none", lg: "lg" }}
        >
          <Heading
            fontSize={{ base: "2xl", lg: "3xl" }}
            mb={2}
            color={colorMode === "light" ? "black" : "white"}
          >
            {t.forgotPassword}
          </Heading>

          <Text mb={4}>{t.forgotPasswordDesc}</Text>

          <FormControl isInvalid={!!fieldError} mb={6}>
            <FormLabel color={colorMode === "light" ? "black" : "white"}>
              {t.email}
            </FormLabel>

            <Input
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldError("");
              }}
              borderRadius="md"
              bg={{ base: "transparent", lg: inputBgDesktop }}
              _placeholder={{
                color: colorMode === "light" ? "gray.500" : "gray.300",
              }}
              _focus={{ borderColor: "brand.500" }}
            />

            <FormErrorMessage>{fieldError}</FormErrorMessage>
          </FormControl>

          
          <Flex gap={4}>
            <Link href="/login" passHref>
              <Button
                flex={1}
                bg="gray.400"
                color="white"
                _hover={{ bg: "gray.500" }}
              >
                {t.cancel}
              </Button>
            </Link>

            <Button
              flex={1}
              bg="brand.500"
              color="black"
              _hover={{ bg: "brand.600" }}
              onClick={handleForgotPassword}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : t.sendNewPassword}
            </Button>
          </Flex>

          {/* BADGE SUCCESS */}
          {successMessage && sentEmail && (
            <Flex justify="center" mt={4} w="100%">
            <Badge
              colorScheme="green"
              px={4}
              py={3}
              borderRadius="lg"
              shadow="sm"
              display="flex"
              flexDirection="column" // <-- icon di atas text
              alignItems="center"
              gap={2}
              maxW="100%"
              whiteSpace="normal"
              overflow="hidden"
              textAlign="center"
            >
              <MdMarkEmailRead size={32} /> {/* <-- ukuran icon lebih besar */}
              <Text fontSize={{ base: "sm", md: "md" }}>
                {t.passwordResetSentWithEmail.replace("{{email}}", sentEmail)}
              </Text>
            </Badge>
          </Flex>
          )}

        </Box>
      </Flex>
    </Box>
  );
}