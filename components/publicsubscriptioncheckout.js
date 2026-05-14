"use client";

import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Box,
  Text,
  VStack,
  Input,
  Button,
  Divider,
  useToast,
  Badge,
  useColorMode,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Flex,
  Switch,
  HStack,
  FormControl,
  FormLabel,
  Image as ChakraImage,
} from "@chakra-ui/react";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import useLanguage from "../hooks/useLanguage";

import {
  EmailIcon,
  LockIcon,
  PhoneIcon,
  AtSignIcon,
} from "@chakra-ui/icons";

import { FiShoppingCart } from "react-icons/fi";
import { FaLock } from "react-icons/fa";

import TripayPaymentMethods from "./TripayPaymentMethods";

const API = process.env.NEXT_PUBLIC_API_URL;

/* ================= SAFE FIX ================= */
const safeText = (v) => {
  if (!v) return "";
  if (typeof v === "string" || typeof v === "number") return v;
  if (typeof v === "object") return v?.en || v?.id || v?.name || "";
  return "";
};

const safePrice = (v) => {
  if (!v) return 0;

  if (typeof v === "number") return v;

  let raw = "";

  if (typeof v === "string") {
    raw = v;
  } else if (typeof v === "object") {
    raw = v?.price || v?.value || v?.amount || "";
  }

  // 🔥 ambil HANYA angka 1000 ke atas (filter noise kayak "3 bulan")
  const numbers = String(raw)
    .match(/\d{4,}/g); // <-- IMPORTANT FIX

  if (!numbers || numbers.length === 0) return 0;

  return Number(numbers[0]);
};

export default function SubscriptionCheckoutDrawer({
  isOpen,
  onClose,
  selectedPackage,
  user,
  onSuccess,
}) {
  const toast = useToast();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const { language } = useLanguage();

  const [mounted, setMounted] = useState(false);

  const safe = (v) => {
  if (!v) return "";
  if (typeof v === "string" || typeof v === "number") return v;
  if (typeof v === "object") return v?.en || v?.id || v?.name || v?.price || "";
  return "";
};

  const [authUser, setAuthUser] = useState(null);
  const [token, setToken] = useState(null);

  const [mode, setMode] = useState("guest");
  const [authTab, setAuthTab] = useState("login");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    email: "",
    username: "",
    phone: "",
    password: "",
  });

  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    setMounted(true);

    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");

    setToken(t);
    setAuthUser(u ? JSON.parse(u) : null);
  }, []);

  const isLoggedIn = useMemo(() => {
    return !!(authUser?.id || user?.id || token);
  }, [authUser, user, token]);

  useEffect(() => {
    if (!isOpen || !mounted) return;

    if (isLoggedIn) {
      setMode("logged");
      setPhone(authUser?.phone || user?.phone || "");
      setPaymentMethod("");
    } else {
      setMode("guest");
    }
  }, [isOpen, isLoggedIn, mounted]);

  const toastErr = (msg) =>
    toast({ title: msg, status: "error", duration: 2500 });

  const toastOk = (msg) =>
    toast({ title: msg, status: "success", duration: 2000 });

  /* LOGIN */
  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity: loginForm.identifier,
          password: loginForm.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) return toastErr(data.message || "Login gagal");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setAuthUser(data.user);

      toastOk("Login berhasil");
      setMode("logged");
      onSuccess?.(data.user);
    } catch {
      toastErr("Login error");
    } finally {
      setLoading(false);
    }
  };

  /* REGISTER */
  const handleRegister = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();
      if (!res.ok) return toastErr(data.message || "Register gagal");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setAuthUser(data.user);

      toastOk("Register berhasil");
      setMode("logged");
      onSuccess?.(data.user);
    } catch {
      toastErr("Register error");
    } finally {
      setLoading(false);
    }
  };

  /* CHECKOUT */
  const handleCheckout = async () => {
  // 🔥 VALIDASI PHONE WAJIB
  if (!phone || phone.trim() === "") {
    return toastErr("Nomor telepon wajib diisi");
  }

  // 🔥 VALIDASI FORMAT NOMOR INDONESIA
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;

  if (!phoneRegex.test(phone)) {
    return toast({
      title: "Format nomor tidak valid",
      description: "Contoh: 08123456789 atau +628123456789",
      status: "error",
      duration: 3000,
    });
  }

  // 🔥 VALIDASI PAYMENT
  if (!paymentMethod) {
    return toastErr("Pilih payment method");
  }

  try {
    setLoading(true);

    const res = await fetch(`${API}/api/checkout/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
      },
      body: JSON.stringify({
        userId: authUser?.id || user?.id,
        amount: safePrice(selectedPackage?.price),
        method: paymentMethod,
        type: "SUBSCRIPTION",
        phone,
        items: [
          {
            name: safeText(selectedPackage?.name),
            price: safePrice(selectedPackage?.price),
            quantity: 1,
          },
        ],
      }),
    });

    const data = await res.json();
    if (!res.ok) return toastErr(data.message || "Checkout gagal");

// 🔥 DIRECT INTERNAL FLOW (BYPASS TRIPAY REDIRECT)
if (!data?.data?.reference) {
  throw new Error("Reference tidak ditemukan");
}

router.push(`/payment/${data.data.reference}`);
  } catch {
    toastErr("Checkout error");
  } finally {
    setLoading(false);
  }
};

  if (!mounted || !selectedPackage) return null;

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent bg={colorMode === "light" ? "white" : "gray.900"}>
        <DrawerCloseButton />

        {/* HEADER FIXED LOGO ALWAYS SHOW */}
        <DrawerHeader borderBottomWidth="1px">
          <VStack align="flex-start" spacing={2}>

            <ChakraImage
              src={
                colorMode === "light"
                  ? "/mogehubmasterlight.png"
                  : "/mogehubmasterdark.png"
              }
              h="40px"
              objectFit="contain"
            />

            <Text fontWeight="bold">
              Subscription Checkout
            </Text>

          </VStack>
        </DrawerHeader>

        <DrawerBody>
          <VStack spacing={5} align="stretch">

            {/* PACKAGE FIXED */}
            <Box>
             <Text fontWeight="bold">
              {safeText(selectedPackage?.name?.[language] || selectedPackage?.name)}
            </Text>

            <Text fontSize="xl">
              {selectedPackage?.price === 0
                ? "Free"
                : `Rp ${selectedPackage?.price.toLocaleString("id-ID")}`}
            </Text>
              </Box>

            <Divider />

            {/* GUEST */}
            {mode === "guest" && (
              <Flex justify="center" gap={3}>
                <Text>Login</Text>
                <Switch
                  isChecked={authTab === "register"}
                  onChange={() =>
                    setAuthTab(authTab === "login" ? "register" : "login")
                  }
                />
                <Text>Register</Text>
              </Flex>
            )}

            {/* LOGIN */}
            {mode === "guest" && authTab === "login" && (
              <VStack mt={4} spacing={3}>
                <InputGroup>
                  <InputLeftElement><AtSignIcon /></InputLeftElement>
                  <Input
                    placeholder="Email / Username"
                    value={loginForm.identifier}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, identifier: e.target.value })
                    }
                  />
                </InputGroup>

                <InputGroup>
                  <InputLeftElement><LockIcon /></InputLeftElement>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                  />
                </InputGroup>

                <Button w="full" bg="brand.500" color="black" onClick={handleLogin}>
                  Login & Continue
                </Button>
              </VStack>
            )}

            {/* REGISTER */}
            {mode === "guest" && authTab === "register" && (
              <VStack mt={4} spacing={3}>
                <Input placeholder="Email" value={registerForm.email}
                  onChange={(e)=>setRegisterForm({...registerForm,email:e.target.value})}/>
                <Input placeholder="Username" value={registerForm.username}
                  onChange={(e)=>setRegisterForm({...registerForm,username:e.target.value})}/>
                <Input placeholder="Phone" value={registerForm.phone}
                  onChange={(e)=>setRegisterForm({...registerForm,phone:e.target.value})}/>
                <Input type="password" placeholder="Password" value={registerForm.password}
                  onChange={(e)=>setRegisterForm({...registerForm,password:e.target.value})}/>

                <Button w="full" bg="brand.500" onClick={handleRegister}>
                  Register & Continue
                </Button>
              </VStack>
            )}

            {/* LOGGED FIX ALIGN LEFT */}
            {mode === "logged" && (
              <VStack spacing={4} align="stretch">

                {/* USER INFO */}
                <Box textAlign="left">
                  <Text fontSize="sm" fontWeight="bold" mb={1}>
                    Your Details
                  </Text>

                  <Badge mb={1}>
                    Username: {authUser?.username || user?.username}
                  </Badge>

                  <Text fontSize="sm">
                    Email: {authUser?.email || user?.email}
                  </Text>
                </Box>

                {/* PHONE */}
                <Box textAlign="left">
                  <Text fontSize="sm" fontWeight="bold" mb={1}>
                    Phone
                  </Text>

                  <Input
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Box>

                <Divider />

                <Box textAlign="left">
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Choose Payment & Continue
                  </Text>
                </Box>

                <TripayPaymentMethods
                  selected={paymentMethod}
                  onSelect={setPaymentMethod}
                />

                <Divider />
                <Box textAlign="center">
                            <HStack
                              justify="center"
                              spacing={2}
                              bg={colorMode === "light" ? "green.50" : "green.900"}
                              px={4}
                              py={2}
                              borderRadius="full"
                              display="inline-flex"
                              mx="auto"
                            >
                              <Box
                                color="green.400"
                                fontSize="22px"
                              >
                                <FaLock />
                              </Box>
                
                              <Text fontSize="md" fontWeight="bold" color="green.500">
                                Secure SSL Encrypted
                              </Text>
                            </HStack>
                
                           <Text
                            fontSize="sm"
                            mt={2}
                            color={useColorModeValue("gray.500", "gray.300")}
                          >
                            Your payment information is protected & encrypted
                          </Text>
                          </Box>
                <Divider />
                

                <Button
                  w="full"
                  bg="brand.500"
                  color="black"
                  onClick={handleCheckout}
                  isLoading={loading}
                >
                  Confirm Purchase
                </Button>
              </VStack>
            )}

            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>

          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}