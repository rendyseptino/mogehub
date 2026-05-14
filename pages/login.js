"use client";
import Head from "next/head";
import {
  Box,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  Divider,
  HStack,
  Icon,
  useColorMode,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Link as ChakraLink,
  IconButton,
  Stack,
} from "@chakra-ui/react";
import {
  EmailIcon,
  LockIcon,
  ViewIcon,
  ViewOffIcon,
  SunIcon,
  MoonIcon,
} from "@chakra-ui/icons";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import Image from "next/image";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
import { useUser } from "../context/UserContext";
import { processGoogleCallback } from "../utils/googleHandler";
import { handleFacebookLogin } from "../utils/facebookLogin";
const translations = { en, id };

export default function LoginPage() {
  const { colorMode, setColorMode } = useColorMode();
  const router = useRouter();
  const { user, login } = useUser();

  const [showPassword, setShowPassword] = useState(false);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  const pageTitle =
  language === "en"
    ? "Login Page - MogeHub"
    : "Halaman Login - MogeHub";
  


  const pageBg = colorMode === "light" ? "gray.50" : "gray.900";
  const cardBg = colorMode === "light" ? "white" : "gray.800";

  const inputText = colorMode === "light" ? "gray.800" : "white";
  const placeholderColor =
    colorMode === "light" ? "gray.500" : "gray.400";
  const inputBorder =
    colorMode === "light" ? "gray.300" : "gray.600";

  const disabledBtnBg =
    colorMode === "light" ? "gray.300" : "gray.600";
  const disabledBtnColor =
    colorMode === "light" ? "gray.600" : "gray.300";

  const isDisabled = !identity.trim() || !password.trim() || loading;

  const logoSrc =
    colorMode === "light"
      ? "/mogehubmasterlight.png"
      : "/mogehubmasterdark.png";

  const linkColor =
    colorMode === "light" ? "gray.800" : "brand.500";

  // ================= GOOGLE CALLBACK =================
  useEffect(() => {
    if (!router.isReady) return;
    processGoogleCallback(
      router.query,
      (user) => {
        if (user?.token)
          localStorage.setItem("token", user.token);
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          login(user);
          router.replace("/seller/dashboard");
        }
      },
      router
    );
  }, [router.isReady, router.query, login, router]);

  // ================= FACEBOOK CALLBACK =================
  useEffect(() => {
    const token = router.query.token;
    if (!token) return;

    const fetchFacebookUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (res.ok && data.user) {
          login(data.user);
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(data.user));
          router.replace("/seller/dashboard");
        }
      } catch (err) {
        console.error("Facebook login error:", err);
      }
    };

    fetchFacebookUser();
  }, [router.query, login, router]);

  // ================= VALIDATION =================
  const validateFields = () => {
    const errors = {};
    if (!identity.trim()) errors.identity = t.fillAllFields;
    if (!password.trim()) errors.password = t.fillAllFields;
    return errors;
  };

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();

    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identity, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.code ? t[data.code] : data.message || t.loginFailed;
        setFieldErrors({ form: msg });
        return;
      }

      if (data.token)
        localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        login(data.user);
      }

      router.replace("/seller/dashboard");
    } catch (err) {
      console.error(err);
      setFieldErrors({ form: t.serverError });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const handleFacebook = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook?redirect=dashboard`;
};

  return (
    <Box minH="100vh" bg={pageBg}>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Flex minH="100vh" align="stretch">
        
        {/* ================= LEFT (SAMA ADMIN) ================= */}
        <Flex
          flex={1}
          direction="column"
          justify="center"
          align="center"
          bg={colorMode === "light" ? "blue.50" : "gray.800"}
          position="relative"
          p={8}
          display={{ base: "none", lg: "flex" }}
        >
          {/* TOGGLE */}
          <IconButton
            position="absolute"
            top="4"
            right="4"
            aria-label="Toggle color mode"
            icon={
              colorMode === "light" ? <MoonIcon /> : <SunIcon />
            }
            onClick={() =>
              setColorMode(
                colorMode === "light" ? "dark" : "light"
              )
            }
          />

          <Link href="/">
          <Box position="absolute" top="4" left="4" cursor="pointer" lineHeight={0}>
            <Image
              src={logoSrc}
              alt="Logo"
              width={140}
              height={50}
              priority
              unoptimized
              loading="eager"
              decoding="async"
              style={{
                display: "block",
                objectFit: "contain",
              }}
            />
          </Box>
        </Link>
          <Box w="full" maxW="400px" textAlign="center">
            <Text
              fontSize="2xl"
              fontWeight="bold"
              mb={4}
              color={
                colorMode === "light" ? "gray.700" : "gray.300"
              }
            >
              {t.loginBanner}
            </Text>

            <Text
              color={
                colorMode === "light" ? "gray.700" : "gray.300"
              }
            >
              Login to start exploring MogeHub.
            </Text>

            <Flex mt={8} justify="center">
              <Box
              maxW="300px"
              w="100%"
              borderRadius="8px"
              overflow="hidden"
            >
              <Image
                src="/userlogin.png"
                alt="Illustration"
                width={300}
                height={300}
                priority
                unoptimized
                loading="eager"
                decoding="async"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </Box>
            </Flex>
          </Box>
        </Flex>

        <Divider
          orientation="vertical"
          display={{ base: "none", lg: "block" }}
        />

        {/* ================= RIGHT FORM ================= */}
        <Flex
          flex={1}
          direction="column"
          justify={{ base: "flex-start", lg: "center" }}
          align="center"
          px={4}
          pt={{ base: 12, lg: 0 }}
        >

          {/* ================= MOBILE HEADER ================= */}
          <Box
            display={{ base: "flex", lg: "none" }}
            flexDir="column"
            alignItems="center"
            mb={6}
          >
            <Link href="/">
              <Image
              src={logoSrc}
              alt="Logo"
              width={140}
              height={50}
              priority
              unoptimized
              loading="eager"
              decoding="async"
              style={{
                display: "block",
                objectFit: "contain",
              }}
            />
            </Link>

            <Text
              fontSize="2xl"
              fontWeight="bold"
              textAlign="center"
              color={colorMode === "light" ? "gray.800" : "brand.500"}
            >
              {t.loginBanner}
            </Text>
          </Box>
          <Box
            w="full"
            maxW="420px"
            bg={{ base: "transparent", lg: cardBg }}
            p={{ base: 0, lg: 8 }}
            borderRadius={{ base: "none", lg: "xl" }}
            boxShadow={{ base: "none", lg: "xl" }}
          >
            {/* SOCIAL */}
            <Stack direction="column" spacing={4} mb={5}>
              <Button
                variant="outline"
                leftIcon={<Icon as={FcGoogle} />}
                borderRadius="full"
                onClick={handleGoogle}
              >
                {t.signInGoogle}
              </Button>

              <Button
                variant="outline"
                leftIcon={
                  <Icon as={FaFacebook} color="#1877F2" />
                }
                borderRadius="full"
                onClick={handleFacebook}
              >
                {t.signInFacebook}
              </Button>
            </Stack>

            <HStack mb={5}>
              <Divider />
              <Text fontSize="sm" color="gray.500">
                {t.or}
              </Text>
              <Divider />
            </HStack>

            <form onSubmit={handleLogin}>
              {/* EMAIL */}
              <FormControl
                mb={4}
                isInvalid={!!fieldErrors.identity}
              >
                <FormLabel>{t.emailOrUsername}</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <EmailIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder={t.emailPlaceholder}
                    color={inputText}
                    _placeholder={{ color: placeholderColor }}
                    border="1px solid"
                    borderColor={inputBorder}
                    borderRadius="full"
                    value={identity}
                    onChange={(e) => {
                      setIdentity(e.target.value);
                      setFieldErrors((prev) => ({
                        ...prev,
                        identity: "",
                      }));
                    }}
                  />
                </InputGroup>
                <FormErrorMessage>
                  {fieldErrors.identity}
                </FormErrorMessage>
              </FormControl>

              {/* PASSWORD */}
              <FormControl
                mb={3}
                isInvalid={!!fieldErrors.password}
              >
                <FormLabel>{t.password}</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <LockIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t.passwordPlaceholder}
                    color={inputText}
                    _placeholder={{ color: placeholderColor }}
                    border="1px solid"
                    borderColor={inputBorder}
                    borderRadius="full"
                    pr="3rem"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((prev) => ({
                        ...prev,
                        password: "",
                      }));
                    }}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={
                        showPassword
                          ? <ViewOffIcon />
                          : <ViewIcon />
                      }
                      onClick={() =>
                        setShowPassword((v) => !v)
                      }
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>
                  {fieldErrors.password}
                </FormErrorMessage>
              </FormControl>

              {fieldErrors.form && (
                <Text
                  color="red.500"
                  textAlign="center"
                  mb={3}
                >
                  {fieldErrors.form}
                </Text>
              )}

              {/* FORGOT PASSWORD */}
              <Flex justify="flex-end" mb={6}>
                <ChakraLink
                  as={Link}
                  href="/forgot-password"
                  fontSize="sm"
                  color={linkColor}
                >
                  {t.forgotPassword}
                </ChakraLink>
              </Flex>

              <Button
                type="submit"
                w="full"
                mb={4}
                isLoading={loading}
                isDisabled={isDisabled}
                bg={
                  isDisabled
                    ? disabledBtnBg
                    : "brand.500"
                }
                color={
                  isDisabled
                    ? disabledBtnColor
                    : "black"
                }
                borderRadius="xl"
              >
                {t.login}
              </Button>
              <Text fontSize="sm" textAlign="center" color="gray.500">
              {t.noAccount}{" "}
              <ChakraLink
                as={Link}
                href="/register"
                color={linkColor}
                fontWeight="semibold"
                _hover={{ textDecoration: "underline" }}
              >
                {t.registerNow}
              </ChakraLink>
            </Text>
            {/* DIVIDER */}
  <Divider
    my={5}
    borderColor={
      colorMode === "light"
        ? "gray.200"
        : "whiteAlpha.200"
    }
  />

  {/* AGREEMENT */}
  <Text
    fontSize="sm"
    textAlign="center"
    color={
      colorMode === "light"
        ? "gray.500"
        : "gray.400"
    }
    lineHeight="1.8"
    px={{ base: 2, md: 6 }}
  >
    {t.agreementText}{" "}

    <Text
      as="span"
       color={colorMode === "light" ? "gray.800" : "#90cdf4"}
      fontWeight="semibold"
      cursor="pointer"
      onClick={() => router.push("/terms")}
      _hover={{ opacity: 0.8 }}
    >
      {t.termsLabel}
    </Text>{" "}

    {t.and}{" "}

    <Text
      as="span"
      color={colorMode === "light" ? "gray.800" : "#90cdf4"}
      fontWeight="semibold"
      cursor="pointer"
      onClick={() => router.push("/privacy")}
      _hover={{ opacity: 0.8 }}
    >
      {t.privacyLabel}
    </Text>{" "}

    MogeHub.
  </Text>
            </form>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}