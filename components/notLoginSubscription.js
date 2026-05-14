"use client";

import {
  Box,
  Text,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Divider,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useColorModeValue,
  HStack,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { EmailIcon, LockIcon } from "@chakra-ui/icons";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useBreakpointValue } from "@chakra-ui/react";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
import { isDesktopCard } from "../utils/responsiveCard";
import { BiLogIn } from "react-icons/bi";

const translations = { en, id };

import { useUser } from "../context/UserContext";
import { handleFacebookLogin } from "../utils/facebookLogin";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function NotLoginSubscription({ onLoginSuccess }) {
  const toast = useToast();
  const { login } = useUser();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  const [isDesktop, setIsDesktop] = useState(false);

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const mutedTextColor = useColorModeValue("gray.500", "gray.300");
  const linkColor = useColorModeValue("blue.500", "brand.500");

   useEffect(() => {
    const check = () => {
      setIsDesktop(isDesktopCard());
    };

    check(); // initial run

    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);


 useEffect(() => {
  // =========================
  // 1. DESKTOP POPUP FLOW
  // =========================
  const messageHandler = (event) => {
    if (event.data?.type === "facebook-auth-success") {
      const { token, user } = event.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      login(user, token);
      onLoginSuccess?.();
    }
  };

  window.addEventListener("message", messageHandler);

  // =========================
  // 2. MOBILE REDIRECT FLOW
  // =========================
  const url = new URL(window.location.href);
  const auth = url.searchParams.get("auth");
  const token = url.searchParams.get("token");

  if (auth === "facebook_success" && token) {
    // 🔥 anti double execution (WAJIB)
    const key = "fb_done_" + token;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const run = async () => {
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok && data.user) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(data.user));

          login(data.user, token);

          // =========================
          // STABILISASI ROUTE
          // =========================
          window.history.replaceState({}, "", "/subscription");

          // kasih delay kecil biar React sync
          setTimeout(() => {
            onLoginSuccess?.();
          }, 50);
        }
      } catch (err) {
        console.error("FB mobile fallback error", err);
      }
    };

    run();
  }

  return () => {
    window.removeEventListener("message", messageHandler);
  };
}, []);

  const validate = () => {
    const err = {};
    if (!identity.trim()) err.identity = t.errorRequired;
    if (!password.trim()) err.password = t.errorRequired;
    return err;
  };

  const handleLogin = async () => {
    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identity,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
  const code = String(data?.code || "").toLowerCase();
  const msg = String(data?.message || "").toLowerCase();

  let message = data?.message || t.loginFailed;

  // akun tidak ditemukan
  if (
    msg.includes("not found") ||
    msg.includes("user") && msg.includes("exist") ||
    code.includes("not")
  ) {
    message =
      t.accountNotFoundStay;
  }

  // password salah
  else if (
    msg.includes("password") ||
    code.includes("wrong")
  ) {
    message = t.wrongPassword;
  }

  setErrors({ form: message });
  return;
}
      // simpan ke localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // update context
      login(data.user, data.token);

      toast({
        title: t.loginSuccess,
        status: "success",
        duration: 2000,
      });

      // 🔥 trigger parent biar drawer switch ke checkout
      if (onLoginSuccess) onLoginSuccess();

    } catch (err) {
      console.error(err);
      setErrors({ form: "Server error" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    // 🔥 penting: pake popup mode (redirect stay)
    window.open(
      `${API}/auth/google?redirect=stay&origin=${window.location.origin}`,
      "googleLogin",
      "width=500,height=600"
    );

    // listen hasil login dari backend (postMessage)
    window.addEventListener("message", (event) => {
      if (event.data?.type === "google-auth-success") {
        const { token, user } = event.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        login(user);

        if (onLoginSuccess) onLoginSuccess();

        toast({
          title: "Login Google berhasil",
          status: "success",
        });
      }
    });
  };

  const handleFacebook = () => {
    handleFacebookLogin(); 
    // NOTE: facebook lo masih redirect full page
    // nanti bisa kita upgrade kayak google (popup)
  };

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        {t.checkoutLoginTitle}
      </Text>

      <VStack spacing={4} align="stretch">

        {/* GOOGLE */}
        <Button
          variant="outline"
          leftIcon={<Icon as={FcGoogle} />}
          borderRadius="full"
          onClick={handleGoogle}
        >
          {t.loginGoogle}
        </Button>

        {/* FACEBOOK */}
        {isDesktop && (
  <Button
    variant="outline"
    leftIcon={<Icon as={FaFacebook} color="#1877F2" />}
    borderRadius="full"
    onClick={handleFacebook}
  >
    {t.loginFacebook}
  </Button>
)}
        <HStack>
          <Divider />
          <Text fontSize="sm">{t.or}</Text>
          <Divider />
        </HStack>

        {/* EMAIL */}
        <FormControl isInvalid={errors.identity}>
        <FormLabel>{t.emailLabel}</FormLabel>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <EmailIcon color="gray.400" />
          </InputLeftElement>

          <Input
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            placeholder={t.emailPlaceholder}
          />
        </InputGroup>

        <FormErrorMessage>{errors.identity}</FormErrorMessage>
      </FormControl>

        {/* PASSWORD */}
        <FormControl isInvalid={errors.password}>
        <FormLabel>{t.passwordLabel}</FormLabel>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <LockIcon color="gray.400" />
          </InputLeftElement>

          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
          />
        </InputGroup>

        <FormErrorMessage>{errors.password}</FormErrorMessage>
      </FormControl>
        {errors.form && (
          <Text color="red.500" fontSize="sm" textAlign="center">
            {errors.form}
          </Text>
        )}

        <Button
        mt={3}
        onClick={handleLogin}
        isLoading={loading}
        bg="brand.500"
        color="black"
        borderRadius="xl"
        leftIcon={<Icon as={BiLogIn} boxSize={5} />}
        fontSize="md"
        fontWeight="bold"
      >
        {t.loginButton}
      </Button>
      <Text
  fontSize="sm"
  textAlign="center"
  color={mutedTextColor}
  mt={2}
>
  {t.agreementText}{" "}
  <Text
    as="span"
    color={linkColor}
    fontWeight="semibold"
    cursor="pointer"
    onClick={() => window.location.href = "/terms"}
  >
    {t.termsLabel}
  </Text>{" "}
  {t.and}{" "}
  <Text
    as="span"
    color={linkColor}
    fontWeight="semibold"
    cursor="pointer"
    onClick={() => window.location.href = "/privacy"}
  >
    {t.privacyLabel}
  </Text>{" "}
  MogeHub.
</Text>
      </VStack>
    </Box>
  );
}