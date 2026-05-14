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
  Spinner,
  useColorMode,
  FormControl,
  FormLabel,
  FormErrorMessage,
  IconButton,
  Image,
  Switch,
  Collapse,
} from "@chakra-ui/react";

import {
  EmailIcon,
  LockIcon,
  ViewIcon,
  ViewOffIcon,
  PhoneIcon,
} from "@chakra-ui/icons";

import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { CgUnavailable } from "react-icons/cg";

import { useState, useMemo, useRef, useEffect } from "react";

import { useLanguageContext } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";

export default function RegisterModal({
  isOpen,
  onClose,
  onOpenLogin,
}) {
  const { colorMode } = useColorMode();
  const { language } = useLanguageContext();
  const translations = { en, id };
  const t = translations[language] || translations.id;

  const firstInputRef = useRef(null);
  const bodyRef = useRef(null);
  const bottomRef = useRef(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);

  const [sellerType, setSellerType] = useState("individual");
  const [dealerName, setDealerName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        firstInputRef.current?.focus();
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (sellerType === "dealer") {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      });
    }
  }, [sellerType]);

  useEffect(() => {
  const delay = setTimeout(() => {
    checkUsername(fullName);
  }, 500);

  return () => clearTimeout(delay);
}, [fullName]);

useEffect(() => {
  const delay = setTimeout(() => {
    checkEmail(email);
  }, 500);

  return () => clearTimeout(delay);
}, [email]);

  const inputText = colorMode === "light" ? "gray.800" : "white";
  const placeholderColor =
    colorMode === "light" ? "gray.500" : "gray.400";

  const logoSrc =
    colorMode === "light"
      ? "/mogehubmasterlight.png"
      : "/mogehubmasterdark.png";

  const baseInputBorder =
    colorMode === "dark" ? "gray.600" : "gray.300";

  const isRegisterDisabled = useMemo(() => {
  if (
    !fullName.trim() ||
    !email.trim() ||
    !phone.trim() ||
    !password.trim()
  )
    return true;
    if (fullName.trim().length < 3) return true;

  if (sellerType === "dealer" && !dealerName.trim()) return true;

  if (
    usernameStatus === "taken" ||
    usernameStatus === "checking" ||
    emailStatus === "taken" ||
    emailStatus === "checking"
  )
    return true;

  return loading;
}, [
  fullName,
  email,
  phone,
  password,
  sellerType,
  dealerName,
  usernameStatus,
  emailStatus,
  loading,
]);

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

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setDealerName("");
    setSellerType("individual");
    setShowPassword(false);
    setFieldErrors({});
  };

  const checkUsername = async (username) => {
  const value = username.trim();

  if (!value || value.length < 3) {
    setUsernameStatus(null);
    return;
  }

  setUsernameStatus("checking");

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/check-username?username=${value}`
    );

    const data = await res.json();

    setUsernameStatus(data.available ? "available" : "taken");
  } catch {
    setUsernameStatus(null);
  }
};

const checkEmail = async (email) => {
  const value = email.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!value || !emailRegex.test(value)) {
    setEmailStatus(null);
    return;
  }

  setEmailStatus("checking");

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/check-email?email=${value}`
    );

    const data = await res.json();

    setEmailStatus(data.available ? "available" : "taken");
  } catch {
    setEmailStatus(null);
  }
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
            dealerName:
              sellerType === "dealer" ? dealerName : null,
            type: sellerType,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setFieldErrors({
          form: data?.message || t.registerFailed,
        });
        return;
      }

      resetForm();

      onClose?.();
      requestAnimationFrame(() => {
        onOpenLogin?.();
      });

    } catch (err) {
      console.error(err);
      setFieldErrors({ form: t.serverError });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    if (loading) return;
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const handleFacebookRegister = () => {
    if (loading) return;
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`;
  };

  const handleOpenLogin = () => {
    onClose?.();
    requestAnimationFrame(() => {
      onOpenLogin?.();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="md"
      scrollBehavior="inside"
      initialFocusRef={firstInputRef}
    >
      <ModalOverlay />

      <ModalContent
        borderRadius="xl"
        maxH="90vh"
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        <ModalHeader
          borderBottom="1px solid"
          borderColor={
            colorMode === "light"
              ? "gray.200"
              : "whiteAlpha.200"
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

        <ModalBody
          ref={bodyRef}
          py={6}
          overflowY="auto"
          flex="1"
        >
          <Box as="form" onSubmit={handleRegister} noValidate>

            {/* FORM FIELD TETAP SAMA — TIDAK DIUBAH */}

            {/* Username */}
            <FormControl mb={4} isInvalid={!!fieldErrors.fullName}>
            <FormLabel>{t.username || t.fullName}</FormLabel>

            <InputGroup>
              <Input
                ref={firstInputRef}
                placeholder={t.fullNamePlaceholder}
                value={fullName}
                pr="40px"
                onChange={(e) => {
                  const val = e.target.value;
                  setFullName(val);
                }}
              />

              <InputRightElement>
                {usernameStatus === "checking" && <Spinner size="sm" />}

                {usernameStatus === "available" && (
                  <Icon as={IoIosCheckmarkCircle} color="green.400" />
                )}

                {usernameStatus === "taken" && (
                  <Icon as={CgUnavailable} color="red.400" />
                )}
              </InputRightElement>
            </InputGroup>

            {/* TEXT STATUS */}
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

            <FormErrorMessage>
              {fieldErrors.fullName}
            </FormErrorMessage>
          </FormControl>

            {/* Email */}
          <FormControl mb={4} isInvalid={!!fieldErrors.email}>
            <FormLabel>{t.email}</FormLabel>

            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <EmailIcon color="gray.400" />
              </InputLeftElement>

              <Input
                type="email"
                placeholder={t.emailPlaceholder}
                color={inputText}
                _placeholder={{ color: placeholderColor }}
                value={email}
                pr="40px"
                onChange={(e) => {
                  const val = e.target.value;

                  setEmail(val);

                  setFieldErrors((p) => ({
                    ...p,
                    email: "",
                    form: "",
                  }));

                  if (!val.trim()) {
                    setEmailStatus(null);
                  }
                }}
                bg="transparent"
                border="1px solid"
                borderColor={baseInputBorder}
                _focus={{
                  borderColor: "brand.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                }}
              />

              <InputRightElement>
                {emailStatus === "checking" && <Spinner size="sm" />}

                {emailStatus === "available" && (
                  <Icon as={IoIosCheckmarkCircle} boxSize={5} color="green.400" />
                )}

                {emailStatus === "taken" && (
                  <Icon as={CgUnavailable} boxSize={5} color="red.400" />
                )}
              </InputRightElement>
            </InputGroup>

            {/* STATUS TEXT */}
            {emailStatus === "available" && (
              <Text fontSize="sm" color="green.400" mt={1}>
                {t.emailAvailable}
              </Text>
            )}

            {emailStatus === "taken" && (
              <Text fontSize="sm" color="red.400" mt={1}>
                {t.emailNotAvailable}
              </Text>
            )}

            <FormErrorMessage>
              {fieldErrors.email}
            </FormErrorMessage>
          </FormControl>
            {/* Phone */}
            <FormControl mb={4} isInvalid={!!fieldErrors.phone}>
              <FormLabel>{t.phone}</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <PhoneIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  type="tel"
                  placeholder={t.phonePlaceholder}
                  color={inputText}
                  _placeholder={{ color: placeholderColor }}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setFieldErrors((p) => ({
                      ...p,
                      phone: "",
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
                {fieldErrors.phone}
              </FormErrorMessage>
            </FormControl>

            {/* Password */}
            <FormControl mb={4} isInvalid={!!fieldErrors.password}>
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
                    setFieldErrors((p) => ({
                      ...p,
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
                    icon={
                      showPassword ? (
                        <ViewOffIcon />
                      ) : (
                        <ViewIcon />
                      )
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

            {/* REGISTER BUTTON TIDAK DISENTUH */}

            <Button
              type="submit"
              w="full"
              h="44px"
              borderRadius="full"
              bg="brand.500"
              color="black"
              _hover={{ bg: "brand.600" }}
              _disabled={{
                bg: "gray.300",
                color: "gray.600",
                cursor: "not-allowed",
                _hover: { bg: "gray.300" },
              }}
              mb={4}
              isLoading={loading}
              isDisabled={isRegisterDisabled}
            >
              {t.register}
            </Button>

            <HStack mb={4}>
              <Divider />
              <Text fontSize="sm" color="gray.500">
                {t.or}
              </Text>
              <Divider />
            </HStack>

            <Button
              type="button"
              w="full"
              h="44px"
              variant="outline"
              borderRadius="full"
              leftIcon={<Icon as={FcGoogle} boxSize="18px" />}
              onClick={handleGoogleRegister}
              isDisabled={loading}
              mb={3}
            >
              {t.signUpGoogle}
            </Button>

            {/* FACEBOOK BUTTON */}
            <Button
              type="button"
              w="full"
              h="44px"
              variant="outline"
              borderRadius="full"
              leftIcon={<Icon as={FaFacebook} boxSize="18px" color="#1877F2" />}
              onClick={handleFacebookRegister}
              isDisabled={loading}
              mb={4}
            >
              {t.signUpFacebook}
            </Button>

            <Text
              fontSize="sm"
              textAlign="center"
              color="gray.500"
            >
              {t.alreadyHaveAccount}{" "}
              <Text
                as="span"
                fontWeight="semibold"
                cursor="pointer"
                color={
                  colorMode === "light"
                    ? "gray.800"
                    : "brand.500"
                }
                onClick={handleOpenLogin}
              >
                {t.login}
              </Text>
            </Text>

            <Box ref={bottomRef} h="1px" />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}