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
  Image,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import useLanguage from "../hooks/useLanguage";

export default function ForgotPassword() {
  const { colorMode } = useColorMode();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleForgotPassword = async () => {
    setFieldError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setFieldError(t.fillAllFields);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/email/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(t.passwordResetSent);
        setEmail("");
      } else {
        setFieldError(data.message || t.serverError);
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

  return (
    <Box minH="100vh" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
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
        <Image
          src={logoSrc}
          alt="Logo"
          h={{ base: "40px", md: "50px" }}
          objectFit="contain"
        />

        {/* DESKTOP LOGIN FORM */}
        <Flex display={{ base: "none", md: "flex" }} gap={3} align="center">
          <Link href="/login" passHref>
            <Button bg="brand.500" color="black" _hover={{ bg: "brand.600" }}>
              {t.login}
            </Button>
          </Link>
        </Flex>

        {/* MOBILE LOGIN BUTTON */}
        <Flex display={{ base: "flex", md: "none" }}>
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
        pt={{ base: 14, md: 32 }}
        px={{ base: 4, md: 12 }}
      >
        <Box
          w={{ base: "100%", md: "450px" }}
          bg={colorMode === "light" ? "white" : "gray.800"}
          p={8}
          borderRadius="xl"
          shadow="lg"
        >
          <Heading
            fontSize={{ base: "2xl", md: "3xl" }}
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
              bg={colorMode === "light" ? "gray.100" : "gray.700"}
              _placeholder={{
                color: colorMode === "light" ? "gray.500" : "gray.300",
              }}
              _focus={{ borderColor: "brand.500" }}
            />
            <FormErrorMessage>{fieldError}</FormErrorMessage>
          </FormControl>

          {successMessage && (
            <Text color="green.500" mb={4} textAlign="center">
              {successMessage}
            </Text>
          )}

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
        </Box>
      </Flex>
    </Box>
  );
}
