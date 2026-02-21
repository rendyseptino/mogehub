// frontend/pages/login.js
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
} from "@chakra-ui/react";
import { EmailIcon, LockIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const { colorMode } = useColorMode();
  const [showPassword, setShowPassword] = useState(false);
  const [identity, setIdentity] = useState(""); // email atau username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const pageBg = colorMode === "light" ? "gray.50" : "gray.900";
  const cardBg = colorMode === "light" ? "white" : "gray.800";
  const inputBg = colorMode === "light" ? "gray.100" : "gray.700";
  const inputText = colorMode === "light" ? "gray.800" : "white";
  const placeholderColor = colorMode === "light" ? "gray.500" : "gray.400";

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
      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        setMessage(data.message || "Login gagal");
        return;
      }

      const user = data.user;

      // ✅ SIMPAN USER (INI YANG KEMARIN BELUM ADA)
      localStorage.setItem("user", JSON.stringify(user));

      // FIX ROLE berdasarkan email
      let role = user.role;
      if (!role) {
        if (user.email === "admin@mogehub.com") role = "admin";
        else role = "user";
      }

      // Simpan ke localStorage
      localStorage.setItem("role", role);
      localStorage.setItem("token", data.token || "");

      // Redirect sesuai role
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
      <Flex minH="100vh" align="center" justify="center" px={4}>
        <Box
          w="full"
          maxW="420px"
          bg={cardBg}
          p={8}
          borderRadius="xl"
          boxShadow="xl"
        >
          <Heading
            size="xl"
            color="brand.500"
            mb={6}
            textAlign="center"
          >
            MogeHub Login
          </Heading>

          <Button
            w="full"
            variant="outline"
            mb={5}
            leftIcon={<Icon as={FcGoogle} boxSize="20px" />}
          >
            Sign in with Google
          </Button>

          <HStack mb={5}>
            <Divider />
            <Text fontSize="sm" color="gray.500">
              atau
            </Text>
            <Divider />
          </HStack>

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

            <Button
              type="submit"
              w="full"
              bg="brand.500"
              color="white"
              _hover={{ bg: "brand.600" }}
              isLoading={loading}
            >
              Masuk
            </Button>

            {message && (
              <Text mt={3} color="red.500" textAlign="center">
                {message}
              </Text>
            )}
          </form>

          <Text
            mt={4}
            fontSize="sm"
            textAlign="center"
            color="gray.500"
          >
            Belum punya akun?{" "}
            <Link href="/register">
              <Text
                as="span"
                color="brand.500"
                fontWeight="semibold"
                cursor="pointer"
              >
                Daftar sekarang
              </Text>
            </Link>
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
