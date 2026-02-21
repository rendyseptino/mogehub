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
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import useLanguage from "../hooks/useLanguage";

export default function ResetPassword() {
  const { colorMode } = useColorMode();
  const { t } = useLanguage();
  const router = useRouter();
  const { token } = router.query; // ambil token dari query

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const logoSrc =
    colorMode === "light"
      ? "/mogehubmasterlight.png"
      : "/mogehubmasterdark.png";

  const handleReset = async () => {
    setFieldError("");
    setSuccessMessage("");

    if (!password.trim() || !confirmPassword.trim()) {
      setFieldError(t.fillAllFields);
      return;
    }

    if (password !== confirmPassword) {
      setFieldError(t.passwordsDoNotMatch);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(t.passwordResetSuccess);
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
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

  return (
    <Box minH="100vh" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
      {/* NAVBAR */}
      <Flex
        w="100%"
        px={{ base: 4, md: 12 }}
        py={4}
        align="center"
        justify="center"
        bg={colorMode === "light" ? "white" : "gray.800"}
        boxShadow="md"
      >
        <Image src={logoSrc} alt="Logo" h={{ base: "40px", md: "50px" }} objectFit="contain" />
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
            {t.resetPassword}
          </Heading>

          <Text mb={4}>{t.resetPasswordDesc}</Text>

          <FormControl isInvalid={!!fieldError} mb={4}>
            <FormLabel color={colorMode === "light" ? "black" : "white"}>
              {t.newPassword}
            </FormLabel>
            <Input
              placeholder={t.newPasswordPlaceholder}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldError("");
              }}
              borderRadius="md"
              bg={colorMode === "light" ? "gray.100" : "gray.700"}
              _placeholder={{ color: colorMode === "light" ? "gray.500" : "gray.300" }}
              _focus={{ borderColor: "brand.500" }}
              mb={4}
            />

            <FormLabel color={colorMode === "light" ? "black" : "white"}>
              {t.confirmPassword}
            </FormLabel>
            <Input
              placeholder={t.confirmPasswordPlaceholder}
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFieldError("");
              }}
              borderRadius="md"
              bg={colorMode === "light" ? "gray.100" : "gray.700"}
              _placeholder={{ color: colorMode === "light" ? "gray.500" : "gray.300" }}
              _focus={{ borderColor: "brand.500" }}
              mb={4}
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
              <Button flex={1} bg="gray.400" color="white" _hover={{ bg: "gray.500" }}>
                {t.cancel}
              </Button>
            </Link>

            <Button
              flex={1}
              bg="brand.500"
              color="black"
              _hover={{ bg: "brand.600" }}
              onClick={handleReset}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : t.resetPassword}
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
