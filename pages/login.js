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
  Image,
} from "@chakra-ui/react";
import { EmailIcon, LockIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

// ===== Import hook bahasa =====
import useLanguage from "../hooks/useLanguage";

export default function LoginPage() {
  const { colorMode } = useColorMode();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { t } = useLanguage(); // ===== gunakan hook bahasa =====

  const pageBg = colorMode === "light" ? "gray.50" : "gray.900";
  const cardBg = colorMode === "light" ? "white" : "gray.800";
  const inputBg = colorMode === "light" ? "gray.100" : "gray.700";
  const inputText = colorMode === "light" ? "gray.800" : "white";
  const placeholderColor = colorMode === "light" ? "gray.500" : "gray.400";

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  const validateFields = () => {
    const errors = {};
    if (!identity.trim()) errors.identity = t.fillAllFields;
    if (!password.trim()) errors.password = t.fillAllFields;
    return errors;
  };

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFieldErrors({ form: data.message || t.loginFailed });
        return;
      }

      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      router.replace("/seller/dashboard");
    } catch (err) {
      console.error(err);
      setFieldErrors({ form: t.serverError });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const logoSrc =
    colorMode === "light"
      ? "/mogehubmasterlight.png"
      : "/mogehubmasterdark.png";

  return (
    <Box minH="100vh" bg={pageBg}>
      <Flex
        minH="100vh"
        align={{ base: "flex-start", md: "center" }}
        justify="center"
        px={4}
        pt={{ base: 12, md: 0 }}
      >
        <Box
          w="full"
          maxW="900px"
          display="flex"
          flexDir={{ base: "column", md: "row" }}
          gap={{ base: 6, md: 12 }}
        >
          {/* Left side banner */}
          <Flex
            direction="column"
            justify="flex-start"
            pt={{ base: 0, md: 16 }}
            flex={1}
            px={{ base: 4, md: 0 }}
            display={{ base: "none", md: "flex" }}
          >
            <Image src={logoSrc} alt="Logo" w="300px" h="100px" mb={4} />
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={colorMode === "light" ? "gray.700" : "gray.300"}
            >
              {t.loginBanner}
            </Text>
          </Flex>

          {/* Form */}
          <Flex flex={1} justify="center" w="full" direction="column">
            <Box display={{ base: "block", md: "none" }} mb={4} textAlign="center">
              <Image src={logoSrc} alt="Logo" w="200px" h="70px" mx="auto" mb={2} />
              <Text
                fontSize="lg"
                fontWeight="bold"
                color={colorMode === "light" ? "gray.700" : "gray.300"}
              >
                {t.loginBanner}
              </Text>
            </Box>

            <Box
              w={{ base: "full", md: "420px" }}
              mx="auto"
              bg={cardBg}
              p={8}
              borderRadius="xl"
              boxShadow={{ base: "none", md: "xl" }}
            >
              <Button
                w="full"
                variant="outline"
                mb={5}
                leftIcon={<Icon as={FcGoogle} boxSize="20px" />}
                _hover={{
                  bg: colorMode === "light" ? "gray.100" : "whiteAlpha.100",
                }}
                onClick={handleGoogleLogin}
              >
                {t.signInGoogle}
              </Button>

              <HStack mb={5}>
                <Divider />
                <Text fontSize="sm" color="gray.500">{t.or}</Text>
                <Divider />
              </HStack>

              <form onSubmit={handleLogin}>
                <FormControl mb={4} isInvalid={!!fieldErrors.identity}>
                  <FormLabel>{t.emailOrUsername}</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <EmailIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="text"
                      placeholder={t.emailPlaceholder}
                      bg={inputBg}
                      color={inputText}
                      _placeholder={{ color: placeholderColor }}
                      value={identity}
                      onChange={(e) => {
                        setIdentity(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, identity: "" }));
                      }}
                      border="1px solid"
                      borderColor="transparent"
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
                    />
                  </InputGroup>
                  <FormErrorMessage>{fieldErrors.identity}</FormErrorMessage>
                </FormControl>

                <FormControl mb={3} isInvalid={!!fieldErrors.password}>
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
                      _placeholder={{ color: placeholderColor }}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      border="1px solid"
                      borderColor="transparent"
                      pr="3rem"
                      _focus={{
                        borderColor: "brand.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                      }}
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
                  <Text color="red.500" textAlign="center" mb={3}>
                    {fieldErrors.form}
                  </Text>
                )}

                <Flex justify="flex-end" mb={6}>
                  <ChakraLink as={Link} href="/forgot-password" fontSize="sm" color="brand.500">
                    {t.forgotPassword}
                  </ChakraLink>
                </Flex>

                <Button type="submit" w="full" bg="brand.500" color="black" _hover={{ bg: "brand.600" }} mb={4} isLoading={loading}>
                  {t.login}
                </Button>

                <Text fontSize="sm" textAlign="center" color="gray.500">
                  {t.noAccount}{" "}
                  <ChakraLink as={Link} href="/register" color="brand.500" fontWeight="semibold">
                    {t.registerNow}
                  </ChakraLink>
                </Text>
              </form>
            </Box>

            <Box mt={4} textAlign="center">
              <ChakraLink as={Link} href="/" color="brand.500" fontSize="sm">
                &larr; {t.backToHome}
              </ChakraLink>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
