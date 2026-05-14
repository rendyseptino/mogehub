"use client";
import Head from "next/head";
import {
  Box,
  Flex,
  Heading,
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
  IconButton,
  RadioGroup,
  Radio,
  Stack,
  Spinner,
  FormErrorMessage,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  EmailIcon,
  PhoneIcon,
  LockIcon,
  ViewIcon,
  ViewOffIcon,
} from "@chakra-ui/icons";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { CgUnavailable } from "react-icons/cg";
import { useState, useEffect } from "react";
import Link from "next/link";

import SwiperRegister from "@/components/SwiperRegister";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
import {
  getGuestLanguage,
  clearGuestLanguage,
  updateUserLanguage,
} from "../services/languageService";

import { mobileOnly, desktopOnly } from "../utils/responsive";
const translations = { en, id };


function CommonFields({
  t,
  inputText,
  placeholderColor,
  inputBorder,
  fieldErrors,
  setFieldErrors,
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  usernameStatus,
  emailStatus,
}) {
  return (
    <Stack spacing={4} w="full">
      <FormControl w="full" isInvalid={!!fieldErrors.fullName}>
        <FormLabel>{t.username}</FormLabel>

        <InputGroup>
          <Input
            w="full"
            placeholder={t.usernamePlaceholder}
            bg="transparent"
            color={inputText}
            value={fullName}
            onChange={(e) => {
              const val = e.target.value;

              setFullName(val);
              setFieldErrors((p) => ({ ...p, fullName: "" }));

              // reset status kalau kosong
              if (!val.trim()) {
                setUsernameStatus(null);
              }
            }}
            _placeholder={{ color: placeholderColor }}
            border="1px solid"
            borderColor={inputBorder}
            borderRadius="full"
            pr="2.5rem"
          />

          <InputRightElement>
            {usernameStatus === "checking" && <Spinner size="sm" />}

            {usernameStatus === "available" && (
              <Icon as={IoIosCheckmarkCircle} color="green.400" boxSize={5} />
            )}

            {usernameStatus === "taken" && (
              <Icon as={CgUnavailable} color="red.400" boxSize={5} />
            )}
          </InputRightElement>
        </InputGroup>

        {usernameStatus === "available" && (
          <Text fontSize="sm" color="green.400" mt={1}>
            {t.usernameAvailable}
          </Text>
        )}

        {usernameStatus === "taken" && (
          <Text fontSize="sm" color="red.400" mt={1}>
            {t.usernameNotAvailable}
          </Text>
        )}

        <FormErrorMessage>{fieldErrors.fullName}</FormErrorMessage>
      </FormControl>

      <FormControl w="full" isInvalid={!!fieldErrors.email}>
        <FormLabel>
        {t.email}
      </FormLabel>
        <InputGroup w="full">
          <InputLeftElement pointerEvents="none">
            <EmailIcon color="gray.400" />
          </InputLeftElement>

          <Input
            w="full"
            type="email"
            placeholder={t.emailPlaceholder}
            bg="transparent"
            color={inputText}
            value={email}
            onChange={(e) => {
              const val = e.target.value;
              setEmail(val);
              setFieldErrors((p) => ({ ...p, email: "" }));

              if (!val) {
                setEmailStatus(null);
              }
            }}
            _placeholder={{ color: placeholderColor }}
            border="1px solid"
            borderColor={inputBorder}
            borderRadius="full"
          />

          <InputRightElement>
            {emailStatus === "checking" && <Spinner size="sm" />}

            {emailStatus === "available" && (
              <Icon as={IoIosCheckmarkCircle} color="green.400" />
            )}

            {emailStatus === "taken" && (
              <Icon as={CgUnavailable} color="red.400" />
            )}
          </InputRightElement>
        </InputGroup>

        {emailStatus === "available" && (
          <Text fontSize="sm" color="green.400">
            {t.emailAvailable}
          </Text>
        )}

        {emailStatus === "taken" && (
          <Text fontSize="sm" color="red.400">
            {t.emailNotAvailable}
          </Text>
        )}
        <FormErrorMessage>{fieldErrors.email}</FormErrorMessage>
      </FormControl>

      <FormControl w="full" isInvalid={!!fieldErrors.phone}>
        <FormLabel>{t.phone}</FormLabel>
        <InputGroup w="full">
          <InputLeftElement pointerEvents="none">
            <PhoneIcon color="gray.400" />
          </InputLeftElement>
          <Input
            w="full"
            type="tel"
            placeholder={t.phonePlaceholder}
            bg="transparent"
            color={inputText}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setFieldErrors((p) => ({ ...p, phone: "" }));
            }}
            _placeholder={{ color: placeholderColor }}
            border="1px solid"
            borderColor={inputBorder}
            borderRadius="full"
          />
        </InputGroup>
        <FormErrorMessage>{fieldErrors.phone}</FormErrorMessage>
      </FormControl>

      <FormControl w="full" isInvalid={!!fieldErrors.password}>
        <FormLabel>{t.password}</FormLabel>
        <InputGroup w="full">
          <InputLeftElement pointerEvents="none">
            <LockIcon color="gray.400" />
          </InputLeftElement>
          <Input
            w="full"
            type={showPassword ? "text" : "password"}
            placeholder={t.passwordPlaceholder}
            bg="transparent"
            color={inputText}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((p) => ({ ...p, password: "" }));
            }}
            _placeholder={{ color: placeholderColor }}
            border="1px solid"
            borderColor={inputBorder}
            pr="3rem"
            borderRadius="full"
          />
          <InputRightElement>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label={t.togglePassword}
              icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
              onClick={() => setShowPassword((v) => !v)}
            />
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>{fieldErrors.password}</FormErrorMessage>
      </FormControl>
    </Stack>
  );
}

function RightSide({
  t,
  inputText,
  placeholderColor,
  inputBorder,
  fieldErrors,
  setFieldErrors,
  sellerType,
  setSellerType,
  dealerName,
  setDealerName,
  loading,
  isDisabled,
  disabledBtnBg,
  disabledBtnColor,
}) {
  return (
    <Stack spacing={4} w="full">
      <FormControl isInvalid={!!fieldErrors.dealerName}>
        <FormLabel>{t.registerAs}</FormLabel>
        <RadioGroup
          value={sellerType}
          onChange={(val) => {
            setSellerType(val);
            if (val !== "dealer") setDealerName("");
            setFieldErrors((p) => ({ ...p, dealerName: "" }));
          }}
        >
          <Stack direction="row" spacing={6}>
            <Radio value="individual" colorScheme="green">
              {t.individual}
            </Radio>
            <Radio value="dealer" colorScheme="green">
              {t.dealer}
            </Radio>
          </Stack>
        </RadioGroup>
      </FormControl>

      {sellerType === "dealer" && (
        <FormControl isInvalid={!!fieldErrors.dealerName}>
          <FormLabel>{t.dealerName}</FormLabel>
          <Input
            w="full"
            placeholder={t.dealerNamePlaceholder}
            bg="transparent"
            color={inputText}
            value={dealerName}
            onChange={(e) => {
              setDealerName(e.target.value);
              setFieldErrors((p) => ({ ...p, dealerName: "" }));
            }}
            _placeholder={{ color: placeholderColor }}
            border="1px solid"
            borderColor={inputBorder}
            borderRadius="full"
          />
          <FormErrorMessage>{fieldErrors.dealerName}</FormErrorMessage>
        </FormControl>
      )}

      {fieldErrors.form && (
        <Text color="red.500" textAlign="center">
          {fieldErrors.form}
        </Text>
      )}

      <Button
        w="full"
        type="submit"
        isLoading={loading}
        isDisabled={isDisabled}
        bg={isDisabled ? disabledBtnBg : "brand.500"}
        color={isDisabled ? disabledBtnColor : "black"}
        cursor={isDisabled ? "not-allowed" : "pointer"}
        _hover={isDisabled ? {} : { bg: "brand.600" }}
        borderRadius="full"
      >
        {t.register}
      </Button>
    </Stack>
  );
}

export default function RegisterPage() {
  const { colorMode } = useColorMode();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  const pageTitle =
  language === "en"
    ? "Register Page - MogeHub"
    : "Halaman Daftar - MogeHub";

  const [showPassword, setShowPassword] = useState(false);
  const [sellerType, setSellerType] = useState("individual");
  const [dealerName, setDealerName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showWelcome, setShowWelcome] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);

  const pageBg = colorMode === "light" ? "gray.50" : "gray.900";
  const cardBg = colorMode === "light" ? "white" : "gray.800";

  const inputText = colorMode === "light" ? "gray.800" : "white";
  const placeholderColor = colorMode === "light" ? "gray.500" : "gray.400";
  const inputBorder = colorMode === "light" ? "gray.300" : "gray.600";

  const disabledBtnBg = colorMode === "light" ? "gray.300" : "gray.600";
  const disabledBtnColor = colorMode === "light" ? "gray.600" : "gray.300";

  const isDisabled =
    loading ||
    usernameStatus === "taken" ||
    emailStatus === "taken" ||
    !fullName.trim() ||
    !email.trim() ||
    !phone.trim() ||
    !password.trim() ||
    (sellerType === "dealer" && !dealerName.trim());

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  useEffect(() => {
  const delay = setTimeout(() => {
    if (fullName) checkUsername(fullName);
  }, 500);

  return () => clearTimeout(delay);
}, [fullName]);

useEffect(() => {
  const delay = setTimeout(() => {
    if (email) checkEmail(email);
  }, 500);

  return () => clearTimeout(delay);
}, [email]);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setDealerName("");
    setSellerType("individual");
    setFieldErrors({});
  };

  const checkUsername = async (username) => {
  const value = username.trim();

  // kalau input kosong → hilangkan icon
  if (!value) {
    setUsernameStatus(null);
    return;
  }

  // kalau kurang dari 3 karakter → jangan check
  if (value.length < 3) {
    setUsernameStatus(null);
    return;
  }

  setUsernameStatus("checking");

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/check-username?username=${value}`
    );

    const data = await res.json();

    if (data.available) {
      setUsernameStatus("available");
    } else {
      setUsernameStatus("taken");
    }
  } catch {
    setUsernameStatus(null);
  }
};

const checkEmail = async (email) => {
  const value = email.trim();

  // kalau kosong → hilangkan icon
  if (!value) {
    setEmailStatus(null);
    return;
  }

  // kalau belum ada @ atau terlalu pendek → jangan check
  if (!value.includes("@") || value.length < 5) {
    setEmailStatus(null);
    return;
  }

  setEmailStatus("checking");

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/check-email?email=${value}`
    );

    const data = await res.json();

    if (data.available) {
      setEmailStatus("available");
    } else {
      setEmailStatus("taken");
    }
  } catch {
    setEmailStatus(null);
  }
};

  const validateFields = () => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = t.fillAllFields;
    if (!email.trim()) errors.email = t.fillAllFields;
    if (!phone.trim()) errors.phone = t.fillAllFields;
    if (!password.trim()) errors.password = t.fillAllFields;
    if (sellerType === "dealer" && !dealerName.trim())
      errors.dealerName = t.fillAllFields;
    return errors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            username: fullName,
            password,
            phone,
            dealerName: sellerType === "dealer" ? dealerName : null,
            type: sellerType,
          }),
        }
      );

      let data;
      try {
        data = await res.json();
      } catch {
        setFieldErrors({ form: t.serverError });
        setLoading(false);
        return;
      }

      if (!res.ok) {
      switch (data.code) {
        case "emailExists":
          setFieldErrors({ email: t.emailExists });
          break;

        case "usernameExists":
          setFieldErrors({ fullName: t.usernameExists });
          break;

        default:
          setFieldErrors({ form: data.message || t.serverError });
      }
    } else {
      setShowWelcome(true);
      resetForm();

        const guestLang = getGuestLanguage();
        if (guestLang && guestLang !== data.user?.language) {
          try {
            const ok = await updateUserLanguage(guestLang);
            if (ok) clearGuestLanguage();
          } catch {}
        }
      }
    } catch {
      setFieldErrors({ form: t.serverError });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const handleFacebookRegister = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;

  window.location.href = `${url}/auth/facebook?redirect=dashboard`;
};

  const fbBg = colorMode === "light" ? "#1877F2" : "#4267B2";
  const fbColor = colorMode === "light" ? "white" : "white";

  return (
    <Box minH="100vh" bg={pageBg}>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Flex minH="100vh" justify="center" px={4} pt={12} pb={12}>
        <Box w="full" maxW="900px" mx="auto">
          <Box mb={{ base: 6, lg: 0 }}>
            <SwiperRegister />
          </Box>

          <Box
            bg={{ base: "transparent", lg: cardBg }}
            p={{ base: 0, lg: 8 }}
            borderRadius="xl"
            boxShadow={{ base: "none", lg: "xl" }}
          >
            <Heading fontSize={{ base: "xl", lg: "2xl" }} mb={2}>
              {t.register}
            </Heading>

            <Text
              fontSize={{ base: "md", lg: "lg" }}
              color={colorMode === "dark" ? "white" : "gray.500"}
              mb={4}
            >
              {t.joinCommunity}
            </Text>

            {showWelcome && (
              <Box
                bg={colorMode === "light" ? "green.100" : "green.700"}
                borderRadius="md"
                p={4}
                mb={4}
                textAlign="center"
              >
                <Heading fontSize="md" mb={2}>
                  {t.loginBanner}
                </Heading>
                <Flex justify="center" align="center" gap={2}>
                  <Spinner size="sm" />
                  <Text>{t.redirectingToLogin}</Text>
                </Flex>
              </Box>
            )}

            {/* DESKTOP: TWO BUTTONS SIDE BY SIDE */}
            <SimpleGrid display={desktopOnly} columns={2} spacing={4} mb={6}>
              <Button
                w="full"
                leftIcon={<FcGoogle size={20} />}
                borderRadius="full"
                bg={colorMode === "light" ? "white" : "gray.700"}
                color={colorMode === "light" ? "gray.800" : "white"}
                border="1px solid"
                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                _hover={{
                  bg: colorMode === "light" ? "gray.100" : "gray.600",
                }}
                onClick={handleGoogleRegister}
              >
                {t.signUpGoogle}
              </Button>

              <Button
                w="full"
                variant="outline"
                leftIcon={<Icon as={FaFacebook} boxSize="20px" color="#1877F2" />}
                borderRadius="full"
                bg={colorMode === "light" ? "white" : "gray.700"}
                color={colorMode === "light" ? "gray.800" : "white"}
                border="1px solid"
                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                _hover={{
                  bg: colorMode === "light" ? "gray.100" : "gray.600",
                }}
              onClick={handleFacebookRegister}
            >
              {t.signUpFacebook}
              </Button>
            </SimpleGrid>

            {/* MOBILE: STACKED BUTTONS */}
            <Stack display={mobileOnly} spacing={4} mb={6}>
              <Button
                w="full"
                leftIcon={<FcGoogle size={20} />}
                borderRadius="full"
                bg={colorMode === "light" ? "white" : "gray.700"}
                color={colorMode === "light" ? "gray.800" : "white"}
                border="1px solid"
                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                _hover={{
                  bg: colorMode === "light" ? "gray.100" : "gray.600",
                }}
                onClick={handleGoogleRegister}
              >
                {t.signUpGoogle}
              </Button>

              <Button
                w="full"
                variant="outline"
                leftIcon={<Icon as={FaFacebook} boxSize="20px" color="#1877F2" />}
                borderRadius="full"
                bg={colorMode === "light" ? "white" : "gray.700"}
                color={colorMode === "light" ? "gray.800" : "white"}
                border="1px solid"
                borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
                _hover={{
                  bg: colorMode === "light" ? "gray.100" : "gray.600",
                }}
              onClick={handleFacebookRegister}
            >
              {t.signUpFacebook}
            </Button>
            </Stack>

            <HStack mb={6}>
              <Divider />
              <Text fontSize="sm" color="gray.500">
                {t.or}
              </Text>
              <Divider />
            </HStack>

            <form onSubmit={handleRegister}>
              {/* DESKTOP */}
              <Box display={desktopOnly} w="full">
                <SimpleGrid columns={2} spacing={8} w="full">
                  <CommonFields
                    t={t}
                    inputText={inputText}
                    placeholderColor={placeholderColor}
                    inputBorder={inputBorder}
                    fieldErrors={fieldErrors}
                    setFieldErrors={setFieldErrors}
                    fullName={fullName}
                    setFullName={setFullName}
                    email={email}
                    setEmail={setEmail}
                    phone={phone}
                    setPhone={setPhone}
                    password={password}
                    setPassword={setPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    usernameStatus={usernameStatus}
                    emailStatus={emailStatus}
                  />

                  <RightSide
                    t={t}
                    inputText={inputText}
                    placeholderColor={placeholderColor}
                    inputBorder={inputBorder}
                    fieldErrors={fieldErrors}
                    setFieldErrors={setFieldErrors}
                    sellerType={sellerType}
                    setSellerType={setSellerType}
                    dealerName={dealerName}
                    setDealerName={setDealerName}
                    loading={loading}
                    isDisabled={isDisabled}
                    disabledBtnBg={disabledBtnBg}
                    disabledBtnColor={disabledBtnColor}
                  />
                </SimpleGrid>
              </Box>

              {/* MOBILE + IPAD */}
              <Box display={mobileOnly} w="full" flexDir="column">
                <Stack spacing={6} w="full">
                  <CommonFields
                    t={t}
                    inputText={inputText}
                    placeholderColor={placeholderColor}
                    inputBorder={inputBorder}
                    fieldErrors={fieldErrors}
                    setFieldErrors={setFieldErrors}
                    fullName={fullName}
                    setFullName={setFullName}
                    email={email}
                    setEmail={setEmail}
                    phone={phone}
                    setPhone={setPhone}
                    password={password}
                    setPassword={setPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    usernameStatus={usernameStatus}
                    emailStatus={emailStatus}
                  />

                  <RightSide
                    t={t}
                    inputText={inputText}
                    placeholderColor={placeholderColor}
                    inputBorder={inputBorder}
                    fieldErrors={fieldErrors}
                    setFieldErrors={setFieldErrors}
                    sellerType={sellerType}
                    setSellerType={setSellerType}
                    dealerName={dealerName}
                    setDealerName={setDealerName}
                    loading={loading}
                    isDisabled={isDisabled}
                    disabledBtnBg={disabledBtnBg}
                    disabledBtnColor={disabledBtnColor}
                  />
                </Stack>
              </Box>
            </form>

            <Box mt={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">
                {t.alreadyHaveAccount}{" "}
                <Link href="/login">
                  <Text
                    as="span"
                    color={colorMode === "light" ? "gray.800" : "brand.500"}
                    fontWeight="semibold"
                    cursor="pointer"
                  >
                    {t.login}
                  </Text>
                </Link>
              </Text>
              {/* DIVIDER */}
  <Divider
    my={5}
    borderColor={colorMode === "light" ? "gray.200" : "whiteAlpha.200"}
  />

  {/* TERMS & PRIVACY */}
  <Text
    fontSize="sm"
    textAlign="center"
    color={colorMode === "light" ? "gray.500" : "gray.400"}
    lineHeight="1.8"
    px={{ base: 2, md: 8 }}
  >
    {t.agreementText}{" "}

    <Text
      as="span"
      color={colorMode === "light" ? "gray.800" : "#90cdf4"}
      fontWeight="semibold"
      cursor="pointer"
      onClick={() => window.location.href = "/terms"}
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
      onClick={() => window.location.href = "/privacy"}
      _hover={{ opacity: 0.8 }}
    >
      {t.privacyLabel}
    </Text>{" "}

    MogeHub.
  </Text>
            </Box>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}