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
} from "@chakra-ui/react";
import { EmailIcon, PhoneIcon, LockIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { FcGoogle } from "react-icons/fc";
import { useState, useEffect } from "react";
import Link from "next/link";

import SwiperRegister from "@/components/SwiperRegister";
import useLanguage from "../hooks/useLanguage";
import {
  getGuestLanguage,
  clearGuestLanguage,
  updateUserLanguage,
} from "../services/languageService";

export default function RegisterPage() {
  const { colorMode } = useColorMode();
  const { t } = useLanguage();

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

  const pageBg = colorMode === "light" ? "gray.50" : "gray.900";
  const cardBg = colorMode === "light" ? "white" : "gray.800";
  const inputBg = colorMode === "light" ? "gray.100" : "gray.700";
  const inputText = colorMode === "light" ? "gray.800" : "white";
  const placeholderColor = colorMode === "light" ? "gray.500" : "gray.400";

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setDealerName("");
    setSellerType("individual");
    setFieldErrors({});
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
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
      });

      const data = await res.json();
      if (!res.ok) {
        setFieldErrors({ form: data.message || t.serverError });
      } else {
        setShowWelcome(true);
        resetForm();

        const guestLang = getGuestLanguage();
        if (guestLang && guestLang !== data.user?.language) {
          try {
            const ok = await updateUserLanguage(guestLang);
            if (ok) clearGuestLanguage();
          } catch (err) {
            console.error("Sync guest language error:", err);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setFieldErrors({ form: t.serverError });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
   window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <Box minH="100vh" bg={pageBg}>
      <Flex
        minH="100vh"
        align="flex-start"
        justify="center"
        px={4}
        pt={{ base: 12, md: 16 }}
        pb={{ base: 12, md: 16 }}
      >
        <Box w="full" maxW="900px" mx="auto" mb={8}>
          <SwiperRegister />

          {showWelcome && (
            <Box
              bg={colorMode === "light" ? "green.100" : "green.700"}
              borderRadius="md"
              p={4}
              mb={4}
              textAlign="center"
            >
              <Heading fontSize="xl" mb={2}>
                {t.loginBanner}
              </Heading>
              <Flex justify="center" align="center" gap={2}>
                <Spinner size="sm" />
                <Text>{t.redirectingToLogin}</Text>
              </Flex>
            </Box>
          )}

          <Box
            bg={cardBg}
            p={{ base: 4, md: 8 }}
            pb={{ base: 8, md: 12 }}
            borderRadius="xl"
            boxShadow={{ base: "none", md: "xl" }}
            overflowY={{ base: "auto", md: "visible" }}
          >
            <Flex direction={{ base: "column", md: "row" }} gap={6}>
              {/* LEFT */}
              <Box flex={1}>
                <Heading fontSize={{ base: "xl", md: "2xl" }} mb={2} textAlign="left">
                  {t.register}
                </Heading>

                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  color={colorMode === "dark" ? "white" : "gray.500"}
                  mb={4}
                  textAlign="left"
                >
                  {t.joinCommunity}
                </Text>

                <Button
                  w="full"
                  variant="outline"
                  mb={5}
                  leftIcon={<Icon as={FcGoogle} boxSize="20px" />}
                  _hover={{ bg: colorMode === "light" ? "gray.100" : "whiteAlpha.100" }}
                  onClick={handleGoogleRegister}
                >
                  {t.signUpGoogle}
                </Button>

                <HStack mb={5}>
                  <Divider />
                  <Box color="gray.500" fontSize="sm">{t.or}</Box>
                  <Divider />
                </HStack>

                <form onSubmit={handleRegister}>
                  <FormControl mb={4} isInvalid={!!fieldErrors.fullName}>
                    <FormLabel>{t.username}</FormLabel>
                    <Input
                      placeholder={t.usernamePlaceholder}
                      bg={inputBg}
                      color={inputText}
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                      }}
                      _placeholder={{ color: placeholderColor }}
                      border="1px solid"
                      borderColor={colorMode === "dark" ? "transparent" : "gray.300"}
                      _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                    />
                    <FormErrorMessage>{fieldErrors.fullName}</FormErrorMessage>
                  </FormControl>

                  <FormControl mb={4} isInvalid={!!fieldErrors.email}>
                    <FormLabel>{t.email}</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <EmailIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        placeholder={t.emailPlaceholder}
                        bg={inputBg}
                        color={inputText}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        _placeholder={{ color: placeholderColor }}
                        border="1px solid"
                        borderColor={colorMode === "dark" ? "transparent" : "gray.300"}
                        _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                      />
                    </InputGroup>
                    <FormErrorMessage>{fieldErrors.email}</FormErrorMessage>
                  </FormControl>

                  <FormControl mb={4} isInvalid={!!fieldErrors.phone}>
                    <FormLabel>{t.phone}</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <PhoneIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="tel"
                        placeholder={t.phonePlaceholder}
                        bg={inputBg}
                        color={inputText}
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, phone: "" }));
                        }}
                        _placeholder={{ color: placeholderColor }}
                        border="1px solid"
                        borderColor={colorMode === "dark" ? "transparent" : "gray.300"}
                        _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                      />
                    </InputGroup>
                    <FormErrorMessage>{fieldErrors.phone}</FormErrorMessage>
                  </FormControl>

                  <FormControl mb={4} isInvalid={!!fieldErrors.password}>
                    <FormLabel>{t.password}</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <LockIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={t.passwordPlaceholder}
                        bg={inputBg}
                        color={inputText}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, password: "" }));
                        }}
                        _placeholder={{ color: placeholderColor }}
                        border="1px solid"
                        borderColor={colorMode === "dark" ? "transparent" : "gray.300"}
                        pr="3rem"
                        _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
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

                  {fieldErrors.form && (
                    <Text color="red.500" textAlign="center" mb={2}>
                      {fieldErrors.form}
                    </Text>
                  )}
                </form>
              </Box>

              {/* RIGHT */}
              <Box flex={1} pt={{ base: 0, md: 38 }}>
                <FormControl mb={4} isInvalid={!!fieldErrors.dealerName}>
                  <FormLabel>{t.registerAs}</FormLabel>
                  <RadioGroup
                    value={sellerType}
                    onChange={(val) => {
                      setSellerType(val);
                      if (val !== "dealer") setDealerName("");
                      setFieldErrors((prev) => ({ ...prev, dealerName: "" }));
                    }}
                  >
                    <Stack direction="row" spacing={6}>
                      <Radio value="individual" colorScheme="green">{t.individual}</Radio>
                      <Radio value="dealer" colorScheme="green">{t.dealer}</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {sellerType === "dealer" && (
                  <FormControl mb={4} isInvalid={!!fieldErrors.dealerName}>
                    <FormLabel>{t.dealerName}</FormLabel>
                    <Input
                      placeholder={t.dealerNamePlaceholder}
                      bg={inputBg}
                      color={inputText}
                      value={dealerName}
                      onChange={(e) => {
                        setDealerName(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, dealerName: "" }));
                      }}
                      _placeholder={{ color: placeholderColor }}
                      border="1px solid"
                      borderColor={colorMode === "dark" ? "transparent" : "gray.300"}
                      _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                    />
                    <FormErrorMessage>{fieldErrors.dealerName}</FormErrorMessage>
                  </FormControl>
                )}

                <Button
                  w="full"
                  mt={4}
                  bg="brand.500"
                  color={colorMode === "light" ? "black" : "black"}
                  _hover={{ bg: "brand.500" }}
                  isLoading={loading}
                  onClick={handleRegister}
                >
                  {t.register}
                </Button>

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
                </Box>
              </Box>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
