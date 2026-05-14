"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
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
  Image,
} from "@chakra-ui/react";

import {
  EmailIcon,
  LockIcon,
  ViewIcon,
  ViewOffIcon,
} from "@chakra-ui/icons";

import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/router";

// ===== hook bahasa =====
import { useLanguageContext } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";

export default function LoginModal({
  isOpen,
  onClose,
  onOpenRegister,
}) {
  const { colorMode } = useColorMode();
  const router = useRouter();
  const { language } = useLanguageContext();
  const translations = { en, id };
  const t = translations[language] || translations.id;
  const emailInputRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        emailInputRef.current?.focus();
      });
    }
  }, [isOpen]);

  const inputText = colorMode === "light" ? "gray.800" : "white";
  const placeholderColor =
    colorMode === "light" ? "gray.500" : "gray.400";

  const logoSrc =
    colorMode === "light"
      ? "/mogehubmasterlight.png"
      : "/mogehubmasterdark.png";

  const registerLinkColor =
    colorMode === "light" ? "gray.800" : "brand.500";

  const isLoginDisabled = useMemo(() => {
    return !identity.trim() || !password.trim() || loading;
  }, [identity, password, loading]);

  const baseInputBorder =
    colorMode === "dark" ? "gray.600" : "gray.300";

  const validateFields = () => {
    const errors = {};
    if (!identity.trim()) errors.identity = t.fillAllFields;
    if (!password.trim()) errors.password = t.fillAllFields;
    return errors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      requestAnimationFrame(() => {
        emailInputRef.current?.focus();
      });
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
  let errors = {};

  // mapping backend code ke field frontend
  if (data.code === "accountNotFound") {
    errors.identity = t.accountNotFound; // username/email
  } else if (data.code === "wrongPassword") {
    errors.password = t.wrongPassword; // password
  } else {
    errors.form = data.message || t.loginFailed; // general error
  }

  setFieldErrors(errors);

  requestAnimationFrame(() => {
    emailInputRef.current?.focus();
  });

  return;
}

      if (data.token) localStorage.setItem("token", data.token);
      if (data.user)
        localStorage.setItem("user", JSON.stringify(data.user));

      onClose?.();
      router.replace("/seller/dashboard");
    } catch (err) {
      console.error(err);
      setFieldErrors({ form: t.serverError });
      requestAnimationFrame(() => {
        emailInputRef.current?.focus();
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (loading) return;
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    if (loading) return;
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`;
  };

  const handleOpenRegister = () => {
    onClose?.();
    requestAnimationFrame(() => {
      onOpenRegister?.();
    });
  };

  const loginButtonBg = isLoginDisabled
    ? colorMode === "light"
      ? "gray.300"
      : "gray.700"
    : "brand.500";

  const loginButtonColor = isLoginDisabled
    ? colorMode === "light"
      ? "gray.500"
      : "gray.400"
    : "black";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="md"
      initialFocusRef={emailInputRef}
      scrollBehavior="inside"
    >
      <ModalOverlay />

      <ModalContent
        borderRadius="xl"
        overflow="hidden"
        maxH="90vh"
        position="relative"
      >
        <ModalHeader
          borderBottom="1px solid"
          borderColor={
            colorMode === "light" ? "gray.200" : "whiteAlpha.200"
          }
          py={3}
        >
          <Flex align="center" justify="center">
            <Image
              src={logoSrc}
              alt="MogeHub"
              h="34px"
              objectFit="contain"
            />
          </Flex>
        </ModalHeader>

        <ModalCloseButton zIndex={2} />

        <ModalBody py={6}>
          <Box as="form" onSubmit={handleLogin} noValidate>

            {/* Email / Username */}
            <FormControl mb={4} isInvalid={!!fieldErrors.identity}>
              <FormLabel>{t.emailOrUsername}</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <EmailIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  ref={emailInputRef}
                  type="text"
                  placeholder={t.emailPlaceholder}
                  color={inputText}
                  _placeholder={{ color: placeholderColor }}
                  value={identity}
                  onChange={(e) => {
                    setIdentity(e.target.value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      identity: "",
                      form: "",
                    }));
                  }}
                  bg="transparent"
                  border="1px solid"
                  borderColor={baseInputBorder}
                  _focus={{
                    borderColor: "brand.500",
                    boxShadow:
                      "0 0 0 1px var(--chakra-colors-brand-500)",
                  }}
                />
              </InputGroup>
              <FormErrorMessage>
                {fieldErrors.identity}
              </FormErrorMessage>
            </FormControl>

            {/* Password */}
            <FormControl mb={2} isInvalid={!!fieldErrors.password}>
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: "",
                      form: "",
                    }));
                  }}
                  bg="transparent"
                  border="1px solid"
                  borderColor={baseInputBorder}
                  pr="3rem"
                  _focus={{
                    borderColor: "brand.500",
                    boxShadow:
                      "0 0 0 1px var(--chakra-colors-brand-500)",
                  }}
                />
                <InputRightElement>
                  <IconButton
                    type="button"
                    size="sm"
                    variant="ghost"
                    aria-label={t.togglePassword}
                    icon={
                      showPassword ? <ViewOffIcon /> : <ViewIcon />
                    }
                    onClick={() => setShowPassword((v) => !v)}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {fieldErrors.password}
              </FormErrorMessage>
            </FormControl>

            {/* Forgotten password */}
            <Flex justify="flex-start" mb={4}>
              <ChakraLink
                as={Link}
                href="/forgot-password"
                fontSize="sm"
                color={
                  colorMode === "light" ? "gray.800" : "brand.500"
                }
                _hover={{ textDecoration: "underline" }}
              >
                {t.forgotPassword}
              </ChakraLink>
            </Flex>

            <Box minH="20px" mb={3}>
              {fieldErrors.form && (
                <Text
                  color="red.500"
                  textAlign="center"
                  fontSize="sm"
                >
                  {fieldErrors.form}
                </Text>
              )}
            </Box>

            {/* LOGIN BUTTON */}
            <Button
              type="submit"
              w="full"
              h="44px"
              borderRadius="full"
              bg={loginButtonBg}
              color={loginButtonColor}
              _hover={
                isLoginDisabled
                  ? {}
                  : {
                      bg: "brand.600",
                    }
              }
              _disabled={{
                bg: "gray.300",          
                color: "gray.600",
                cursor: "not-allowed",
                opacity: 1,
                _hover: {
                  bg: "gray.300",
                },
              }}
              mb={4}
              isLoading={loading}
              isDisabled={isLoginDisabled}
            >
              {t.login}
            </Button>

            {/* OR */}
            <HStack mb={4}>
              <Divider />
              <Text fontSize="sm" color="gray.500">
                {t.or}
              </Text>
              <Divider />
            </HStack>

            {/* Google login */}
            <Button
              type="button"
              w="full"
              h="44px"
              size="md"
              variant="outline"
              borderRadius="full"
              leftIcon={<Icon as={FcGoogle} boxSize="18px" />}
              onClick={handleGoogleLogin}
              isDisabled={loading}
              mb={3}
            >
              {t.signInGoogle}
            </Button>

            {/* Facebook login */}
            <Button
              type="button"
              w="full"
              h="44px"
              size="md"
              variant="outline"
              borderRadius="full"
              leftIcon={<Icon as={FaFacebook} boxSize="18px" color="#1877F2" />}
              onClick={handleFacebookLogin}
              isDisabled={loading}
              mb={4}
            >
              {t.signInFacebook}
            </Button>

            {/* Register link */}
            <Text
              fontSize="sm"
              textAlign="center"
              color="gray.500"
            >
              {t.noAccount}{" "}
              <Text
                as="span"
                cursor="pointer"
                fontWeight="medium"
                color={registerLinkColor}
                onClick={handleOpenRegister}
                _hover={{ textDecoration: "underline" }}
              >
                {t.registerNow}
              </Text>
            </Text>

          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}