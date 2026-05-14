"use client";

import { useState, useEffect } from "react"; 

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
  FormControl,
  FormLabel,
  IconButton,
  Image,
  useColorMode,
} from "@chakra-ui/react";
import { EmailIcon, LockIcon, ViewIcon, ViewOffIcon, SunIcon, MoonIcon } from "@chakra-ui/icons";
import Link from "next/link";

const getAdsKey = (userId) => `admin_ads_request_count_${userId}`;

export default function LoginPage() {
  const { colorMode, setColorMode } = useColorMode();
  const [showPassword, setShowPassword] = useState(false);
  const [identity, setIdentity] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ================= PERSIST COLOR MODE =================
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("chakra-ui-color-mode");
      if (savedMode && savedMode !== colorMode) {
        setColorMode(savedMode);
      }
    }
  }, [colorMode, setColorMode]);

  const pageBg = colorMode === "light" ? "gray.50" : "gray.900";
  const cardBg = colorMode === "light" ? "white" : "gray.800";
  const inputBg = colorMode === "light" ? "gray.100" : "gray.700";
  const inputText = colorMode === "light" ? "gray.800" : "white";
  const placeholderColor = colorMode === "light" ? "gray.500" : "gray.400";

  const logoSrc =
    colorMode === "light"
      ? "/mogehubmasterlight.png"
      : "/mogehubmasterdark.png";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login gagal");
        return;
      }

      const user = data.user;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", data.token || "");

      if (user?.id) {
  const key = getAdsKey(user.id);
  const existing = localStorage.getItem(key);

  if (existing === null) {
    localStorage.setItem(key, "0");
  }
}

      const masterAdminEmail = "admin@mogehub.com";
      let role;
      if (
        user.email === masterAdminEmail ||
        ["admin","moderator","editor","staff_verifikasi","staff_iklan"].includes(user.type)
      ) {
        role = "admin";
      } else {
        role = "user";
      }
      localStorage.setItem("role", role);

      if (role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/seller/dashboard";
      }
    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg={pageBg}>
      <Flex minH="100vh" align="stretch">
        {/* LEFT BANNER (desktop) */}
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
<IconButton
    position="absolute"
    top="4"
    right="4"
    aria-label="Toggle color mode"
    icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
    onClick={() => setColorMode(colorMode === "light" ? "dark" : "light")}
  />

  <Image
    src={logoSrc}
    alt="Logo"
    width="140px"
    height="55px"
    position="absolute"
    top="4"
    left="4"
  />
  <Box w="full" maxW="400px" textAlign="center">
    <Text
      fontSize="2xl"
      fontWeight="bold"
      mb={4}
      color={colorMode === "light" ? "gray.700" : "gray.300"}
    >
      Welcome Admin MogeHub
    </Text>
    <Text color={colorMode === "light" ? "gray.700" : "gray.300"}>
      Login to start working.
    </Text>

    <Flex mt={8} justify="center"> {/* <-- flex container untuk centering */}
      <Image
        src="/adminlogin.png"
        alt="Illustration"
        width="100%"
        maxW="300px"
        borderRadius="8px"  
      />
    </Flex>
  </Box>
</Flex>
        {/* VERTICAL DIVIDER */}
        <Divider orientation="vertical" display={{ base: "none", lg: "block" }} />

        {/* RIGHT FORM */}
        <Flex
          flex={1}
          direction="column"
          justify={{ base: "flex-start", lg: "center" }}
          align="center"
          pt={{ base: 12, lg: 0 }}
          px={4}
        >
          {/* Mobile Logo + Welcome */}
          <Box display={{ base: "flex", lg: "none" }} flexDir="column" alignItems="center" mb={6}>
            <Image src={logoSrc} alt="Logo" w="180px" h="70px" mb={4} />
            <Text fontSize="2xl" fontWeight="bold" textAlign="center" color={colorMode === "light" ? "gray.800" : "brand.500"}>
              Welcome Admin MogeHub
            </Text>
          </Box>

          <Box
            w="full"
            maxW="420px"
            bg={cardBg}
            p={8}
            borderRadius="xl"
            boxShadow="xl"
          >
            <form onSubmit={handleLogin}>
              <FormControl mb={4}>
                <FormLabel>Email / Username</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <EmailIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="text"
                    placeholder="email atau username"
                    bg={inputBg}
                    color={inputText}
                    _placeholder={{ color: placeholderColor }}
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              <FormControl mb={6}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <LockIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="password"
                    bg={inputBg}
                    color={inputText}
                    _placeholder={{ color: placeholderColor }}
                    pr="3rem"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      aria-label="Toggle password"
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword((v) => !v)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Flex justify="flex-end" mb={6}>
                <Link href="/forgot-password">
                  <Text
                    cursor="pointer"
                    fontWeight="semibold"
                    px={3}
                    py={1}
                    borderRadius="md"
                    color={colorMode === "dark" ? "brand.500" : "black"}
                    _hover={{ textDecoration: "underline" }}
                  >
                    Lupa password?
                  </Text>
                </Link>
              </Flex>

              <Button
                type="submit"
                w="full"
                mb={4}
                bg="brand.500"
                color="black"
                isLoading={loading}
                _hover={{ bg: "gray.200" }}
                borderRadius="xl"
              >
                Login
              </Button>

              {message && (
                <Text mt={3} color="red.500" textAlign="center">
                  {message}
                </Text>
              )}
            </form>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}