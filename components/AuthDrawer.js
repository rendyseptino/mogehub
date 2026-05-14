import {
  Box,
  Flex,
  Text,
  Button,
  Divider,
  HStack,
  Icon,
  useColorMode,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Image,
  IconButton,
  RadioGroup,
  Radio,
  Stack,
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
import { Spinner } from "@chakra-ui/react"; 
import { useState, useEffect, useRef, useCallback } from "react";

import useLanguage from "../hooks/useLanguage";
import {
  getGuestLanguage,
  clearGuestLanguage,
  updateUserLanguage,
} from "../services/languageService";

export default function AuthDrawer({
  isOpen,
  onClose,
  defaultTab = "login",
  onSuccessLogin,
}) {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState(defaultTab);

  // ===================== LOGIN STATE =====================
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const loginIdentityRef = useRef(null);
  const loginPasswordRef = useRef(null);

  // ===================== REGISTER STATE =====================
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [sellerType, setSellerType] = useState("individual");
  const [dealerName, setDealerName] = useState("");
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regFieldErrors, setRegFieldErrors] = useState({});
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);

  const regFullNameRef = useRef(null);
  const regEmailRef = useRef(null);
  const regPhoneRef = useRef(null);
  const regPasswordRef = useRef(null);
  const regDealerNameRef = useRef(null);

  const popupRef = useRef(null);
  const openingRef = useRef(false); // Safari safe

  const [isMobile, setIsMobile] = useState(false);

  // ===================== RESET TAB WHEN OPEN =====================
useEffect(() => {
  if (isOpen) {
    setActiveTab(defaultTab);
  }
}, [isOpen, defaultTab]);

useEffect(() => {
  if (isOpen) {
    setTimeout(() => {
      loginIdentityRef.current?.focus();
    }, 200);
  }
}, [isOpen]);

useEffect(() => {
  const delay = setTimeout(() => {
    checkUsername(fullName);
  }, 500);

  return () => clearTimeout(delay);
}, [fullName]);

useEffect(() => {
  const delay = setTimeout(() => {
    checkEmail(regEmail);
  }, 500);

  return () => clearTimeout(delay);
}, [regEmail]);

useEffect(() => {
  if (typeof window === "undefined") return;

  const update = () => setIsMobile(window.innerWidth < 768);
  update();

  window.addEventListener("resize", update);
  return () => window.removeEventListener("resize", update);
}, []);

// ===================== FINISH LOGIN (SINGLE EXIT) =====================
const finishLogin = useCallback(
  (type) => {
    if (!isOpen) return; // <<< PENTING

    try {
      onSuccessLogin?.(type);
    } catch (e) {}

    requestAnimationFrame(() => {
      onClose?.();
    });
  },
  [onSuccessLogin, onClose, isOpen]
);
  // ======================================================
  // GOOGLE LOGIN RESULT LISTENER
  // ======================================================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event) => {
      let allowedOrigin;

      try {
        allowedOrigin = new URL(
          process.env.NEXT_PUBLIC_API_URL
        ).origin;
      } catch (e) {
        return;
      }

      if (event.origin !== allowedOrigin) return;

      const data = event.data;
      if (
        !data ||
        (data.type !== "google-auth-success" &&
          data.type !== "facebook-auth-success")
      )
        return;

      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      try {
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
        }
      } catch (e) {}

      popupRef.current = null;
      openingRef.current = false;

      finishLogin("google");
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [finishLogin]);

  const cardBg = colorMode === "light" ? "white" : "gray.800";
  const inputText = colorMode === "light" ? "gray.800" : "white";
  const placeholderColor = colorMode === "light" ? "gray.500" : "gray.400";
  const logoSrc =
    colorMode === "light" ? "/mogehublogo.png" : "/mogehublogo.png";

  // ===================== LOGIN =====================

  const validateFields = () => {
  const errors = {};
  const value = identity.trim();

  if (!value) {
    errors.identity = t.fillAllFields;
  } 
  else if (
    !/^[a-zA-Z0-9_]{3,20}$/.test(value) &&
    !/^\S+@\S+\.\S+$/.test(value)
  ) {
    errors.identity = t.invalidEmailOrUsername;
  }

  if (!password.trim()) {
    errors.password = t.fillAllFields;
  } 
  else if (password.length < 6) {
    errors.password = t.passwordTooShort;
  }

  return errors;
};

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      if (errors.identity) {
        loginIdentityRef.current?.focus();
      } else if (errors.password) {
        loginPasswordRef.current?.focus();
      }

      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          identity: identity.trim(),
          password: password.trim(),
        }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        let errors = {};

        if (data.code === "accountNotFound") {
          errors.identity = t.accountNotFound;
        } 
        else if (data.code === "wrongPassword") {
          errors.password = t.wrongPassword;
        } 
        else if (data.message) {
          errors.form = data.message;
        } 
        else if (data.error) {
          errors.form = data.error;
        } 
        else {
          errors.form = t.loginFailed;
        }

        setFieldErrors(errors);

        if (errors.identity) {
          loginIdentityRef.current?.focus();
        } else if (errors.password) {
          loginPasswordRef.current?.focus();
        }

        return;
      }

      if (data.token) localStorage.setItem("token", data.token);
      if (data.user)
        localStorage.setItem("user", JSON.stringify(data.user));

      setIdentity("");
      setPassword("");
      setFieldErrors({});

      finishLogin("email");
    } catch (err) {
      console.error(err);
      setFieldErrors({ form: t.serverError });
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // GOOGLE LOGIN / REGISTER (Safari safe)
  // ======================================================
  const handleGoogleLogin = () => {
    if (typeof window === "undefined") return;

    if (popupRef.current && !popupRef.current.closed) {
      try {
        popupRef.current.focus();
      } catch (e) {}
      return;
    }

    if (openingRef.current) return;
    openingRef.current = true;

    const origin = window.location.origin;

    const googleUrl = `${
      process.env.NEXT_PUBLIC_API_URL
    }/auth/google?redirect=stay&origin=${encodeURIComponent(origin)}`;

    const width = 520;
    const height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const windowName = `google-auth-${Date.now()}`;

    const popup = window.open(
      googleUrl,
      windowName,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    popupRef.current = popup || null;

    if (!popup) {
      openingRef.current = false;
      toast({
        title: "Popup blocked",
        description: "Please allow popup for this site.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const timer = setInterval(() => {
      if (!popupRef.current) {
        clearInterval(timer);
        return;
      }

      if (popupRef.current.closed) {
        popupRef.current = null;
        openingRef.current = false;
        clearInterval(timer);
      }
    }, 500);
  };

  const handleFacebookLogin = () => {
  if (typeof window === "undefined") return;

  if (popupRef.current && !popupRef.current.closed) {
    try {
      popupRef.current.focus();
    } catch (e) {}
    return;
  }

  if (openingRef.current) return;
  openingRef.current = true;

  const origin = window.location.origin;

  const facebookUrl = `${
    process.env.NEXT_PUBLIC_API_URL
  }/auth/facebook?redirect=stay&origin=${encodeURIComponent(origin)}`;

  const width = 520;
  const height = 640;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const windowName = `facebook-auth-${Date.now()}`;

  const popup = window.open(
    facebookUrl,
    windowName,
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
  );

  popupRef.current = popup || null;

  if (!popup) {
    openingRef.current = false;
    toast({
      title: "Popup blocked",
      description: "Please allow popup for this site.",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  const timer = setInterval(() => {
    if (!popupRef.current) {
      clearInterval(timer);
      return;
    }

    if (popupRef.current.closed) {
      popupRef.current = null;
      openingRef.current = false;
      clearInterval(timer);
    }
  }, 500);
};

  // ===================== REGISTER =====================

  const resetRegisterForm = () => {
    setFullName("");
    setRegEmail("");
    setPhone("");
    setRegPassword("");
    setDealerName("");
    setSellerType("individual");
    setRegFieldErrors({});
  };

  const validateRegisterFields = () => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = t.fillAllFields;
    if (!regEmail.trim()) errors.email = t.fillAllFields;
    if (!phone.trim()) errors.phone = t.fillAllFields;
    if (!regPassword.trim()) errors.password = t.fillAllFields;
    if (sellerType === "dealer" && !dealerName.trim())
      errors.dealerName = t.fillAllFields;
    return errors;
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


const isRegisterDisabled =
  !fullName.trim() ||
  !regEmail.trim() ||
  !phone.trim() ||
  !regPassword.trim() ||
  (sellerType === "dealer" && !dealerName.trim()) ||
  usernameStatus === "taken" ||
  usernameStatus === "checking" ||
  emailStatus === "taken" ||
  emailStatus === "checking" ||
  regLoading;


  const handleRegister = async (e) => {
    e.preventDefault();
    if (regLoading) return;

    const errors = validateRegisterFields();
    if (Object.keys(errors).length > 0) {
      setRegFieldErrors(errors);

      if (errors.fullName) regFullNameRef.current?.focus();
      else if (errors.email) regEmailRef.current?.focus();
      else if (errors.phone) regPhoneRef.current?.focus();
      else if (errors.password) regPasswordRef.current?.focus();
      else if (errors.dealerName) regDealerNameRef.current?.focus();

      return;
    }

    setRegFieldErrors({});
    setRegLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: regEmail,
            username: fullName,
            password: regPassword,
            phone,
            dealerName: sellerType === "dealer" ? dealerName : null,
            type: sellerType,
          }),
        }
      );

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("Failed to parse JSON:", jsonErr);
        setRegFieldErrors({ form: t.serverError });
        return;
      }

      if (!res.ok) {
        setRegFieldErrors({ form: data.message || t.serverError });
        return;
      }

      const guestLang = getGuestLanguage();
      if (guestLang && guestLang !== data.user?.language) {
        try {
          const ok = await updateUserLanguage(guestLang);
          if (ok) clearGuestLanguage();
        } catch (err) {
          console.error("Sync guest language error:", err);
        }
      }

      toast({
        title: t.register || "Register",
        description: t.loginBanner,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      resetRegisterForm();
      setActiveTab("login");
    } catch (err) {
      console.error("Network or fetch error:", err);
      setRegFieldErrors({ form: t.serverError });
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <Drawer
  isOpen={isOpen}
  placement={isMobile ? "bottom" : "right"}
  onClose={onClose}
  size={isMobile ? "full" : "md"}
  trapFocus={false}
  returnFocusOnClose={false}
>
      <DrawerOverlay />

      <DrawerContent
        bg={cardBg}
        borderRadius={isMobile ? "2xl 2xl 0 0" : "0"}
        maxH="100dvh"
        display="flex"
        flexDirection="column"
      >
        <DrawerCloseButton top="14px" right="14px" zIndex={20} />

        {/* ================= HEADER ================= */}
        <Box
          flexShrink={0}
          bg={cardBg}
          pt={6}
          pb={4}
          borderBottom="1px solid"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          <Box px={6}>
            <Flex direction="column" align="flex-start">
              <Image
                src={logoSrc}
                alt="Mogehub Logo"
                w={isMobile ? "140px" : "170px"}
                mb={2}
                display="block"
                ml="-8px"
              />

              <Text fontSize="lg" fontWeight="bold">
                {t.loginBanner}
              </Text>
            </Flex>
          </Box>
        </Box>

        {/* ================= BODY ================= */}
        <Box
          flex="1"
          overflowY="auto"
          px={6}
          pb={10}
          pt={isMobile ? 12 : 6}
        >
          {isMobile && <Box h="48px" />}

          <Tabs
            variant="enclosed"
            index={activeTab === "login" ? 0 : 1}
            onChange={(idx) =>
              setActiveTab(idx === 0 ? "login" : "register")
            }
          >
            <TabList mb={4}>
              <Tab>{t.login}</Tab>
              <Tab>{t.register}</Tab>
            </TabList>

            <TabPanels>
              {/* ================= LOGIN PANEL ================= */}
              <TabPanel px={0}>
                <Button
                  w="full"
                  variant="outline"
                  mb={4}
                  leftIcon={<Icon as={FcGoogle} boxSize={5} />}
                  onClick={handleGoogleLogin}
                  type="button"
                >
                  {t.signInGoogle}
                </Button>

                <Button
                  w="full"
                  variant="outline"
                  mb={4}
                  leftIcon={<Icon as={FaFacebook} boxSize={5} color="#1877F2" />}
                  onClick={handleFacebookLogin}
                  type="button"
                >
                  {t.signInFacebook || "Continue with Facebook"}
                </Button>

                <HStack mb={4}>
                  <Divider />
                  <Text fontSize="sm" color="gray.500">
                    {t.or}
                  </Text>
                  <Divider />
                </HStack>

                <form onSubmit={handleLogin}>
                  <FormControl mb={3} isInvalid={!!fieldErrors.identity}>
                    <FormLabel>{t.emailOrUsername}</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <EmailIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        ref={loginIdentityRef}
                        autoComplete="username"
                        placeholder={t.emailPlaceholder}
                        bg="transparent"
                        color={inputText}
                        _placeholder={{ color: placeholderColor }}
                        _focus={{ bg: "transparent" }}
                        value={identity}
                        onChange={(e) => {
                          setIdentity(e.target.value);
                          setFieldErrors((p) => ({
                            ...p,
                            identity: "",
                            form: "",
                          }));
                        }}
                      />
                    </InputGroup>
                    <FormErrorMessage>
                      {fieldErrors.identity}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl mb={4} isInvalid={!!fieldErrors.password}>
                    <FormLabel>{t.password}</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <LockIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        ref={loginPasswordRef}
                        autoComplete="current-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t.passwordPlaceholder}
                        bg="transparent"
                        color={inputText}
                        _placeholder={{ color: placeholderColor }}
                        _focus={{ bg: "transparent" }}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setFieldErrors((p) => ({
                            ...p,
                            password: "",
                            form: "",
                          }));
                        }}
                        pr="3rem"
                      />
                      <InputRightElement>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          aria-label={t.togglePassword}
                          icon={
                            showPassword ? <ViewOffIcon /> : <ViewIcon />
                          }
                          onClick={() => setShowPassword((v) => !v)}
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>
                      {fieldErrors.password}
                    </FormErrorMessage>
                  </FormControl>

                  {fieldErrors.form && (
                    <Text color="red.500" textAlign="center" mb={3}>
                      {fieldErrors.form}
                    </Text>
                  )}

                  <Button
                type="submit"
                w="full"
                bg="brand.500"
                color="black"
                _hover={{ bg: "brand.600" }}
                isLoading={loading}
                mt={4}
                mb={6}
                isDisabled={!identity || !password}
              >
                {t.login}
              </Button>
                </form>
              </TabPanel>

              {/* ================= REGISTER PANEL ================= */}
              <TabPanel px={0}>
                <Button
                  w="full"
                  variant="outline"
                  mb={4}
                  leftIcon={<Icon as={FcGoogle} boxSize={5} />}
                  onClick={handleGoogleLogin}
                  type="button"
                >
                  {t.signUpGoogle || t.signInGoogle}
                </Button>

                <Button
                  w="full"
                  variant="outline"
                  mb={4}
                  leftIcon={<Icon as={FaFacebook} boxSize={5} color="#1877F2" />}
                  onClick={handleFacebookLogin}
                  type="button"
                >
                  {t.signUpFacebook || "Continue with Facebook"}
                </Button>

                <HStack mb={4}>
                  <Divider />
                  <Text fontSize="sm" color="gray.500">
                    {t.or}
                  </Text>
                  <Divider />
                </HStack>

                <form onSubmit={handleRegister}>
                  <FormControl mb={3} isInvalid={!!regFieldErrors.fullName}>
                    <FormLabel>{t.username}</FormLabel>
                    <InputGroup>
                    <Input
                      ref={regFullNameRef}
                      placeholder={t.usernamePlaceholder}
                      bg="transparent"
                      color={inputText}
                      _placeholder={{ color: placeholderColor }}
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setRegFieldErrors((p) => ({ ...p, fullName: "", form: "" }));
                      }}
                    />

                    <InputRightElement>
                      {usernameStatus === "checking" && <Spinner size="sm" />}
                      {usernameStatus === "available" && <Icon as={IoIosCheckmarkCircle} color="green.400" />}
                      {usernameStatus === "taken" && <Icon as={CgUnavailable} color="red.400" />}
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

                    <FormErrorMessage>
                      {regFieldErrors.fullName}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl mb={3} isInvalid={!!regFieldErrors.email}>
                    <FormLabel>{t.email}</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <EmailIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        ref={regEmailRef}
                        type="email"
                        placeholder={t.emailPlaceholder}
                        bg="transparent"
                        color={inputText}
                        _placeholder={{ color: placeholderColor }}
                        _focus={{ bg: "transparent" }}
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          setRegFieldErrors((p) => ({
                            ...p,
                            email: "",
                            form: "",
                          }));
                        }}
                      />
                      <InputRightElement>
                      {emailStatus === "checking" && <Spinner size="sm" />}
                      {emailStatus === "available" && <Icon as={IoIosCheckmarkCircle} color="green.400" />}
                      {emailStatus === "taken" && <Icon as={CgUnavailable} color="red.400" />}
                    </InputRightElement>
                    </InputGroup>
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
                      {regFieldErrors.email}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl mb={3} isInvalid={!!regFieldErrors.phone}>
                    <FormLabel>{t.phone}</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <PhoneIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        ref={regPhoneRef}
                        type="tel"
                        placeholder={t.phonePlaceholder}
                        bg="transparent"
                        color={inputText}
                        _placeholder={{ color: placeholderColor }}
                        _focus={{ bg: "transparent" }}
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setRegFieldErrors((p) => ({
                            ...p,
                            phone: "",
                            form: "",
                          }));
                        }}
                      />
                    </InputGroup>
                    <FormErrorMessage>
                      {regFieldErrors.phone}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl mb={3} isInvalid={!!regFieldErrors.password}>
                    <FormLabel>{t.password}</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <LockIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        ref={regPasswordRef}
                        type={regShowPassword ? "text" : "password"}
                        placeholder={t.passwordPlaceholder}
                        bg="transparent"
                        color={inputText}
                        _placeholder={{ color: placeholderColor }}
                        _focus={{ bg: "transparent" }}
                        value={regPassword}
                        onChange={(e) => {
                          setRegPassword(e.target.value);
                          setRegFieldErrors((p) => ({
                            ...p,
                            password: "",
                            form: "",
                          }));
                        }}
                        pr="3rem"
                      />
                      <InputRightElement>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          aria-label={t.togglePassword}
                          icon={
                            regShowPassword ? (
                              <ViewOffIcon />
                            ) : (
                              <ViewIcon />
                            )
                          }
                          onClick={() =>
                            setRegShowPassword((v) => !v)
                          }
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>
                      {regFieldErrors.password}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    mb={3}
                    isInvalid={!!regFieldErrors.dealerName}
                  >
                    <FormLabel>{t.registerAs}</FormLabel>
                    <RadioGroup
                      value={sellerType}
                      onChange={(val) => {
                        setSellerType(val);
                        if (val !== "dealer") setDealerName("");
                        setRegFieldErrors((p) => ({
                          ...p,
                          dealerName: "",
                          form: "",
                        }));
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
                    <FormControl
                      mb={3}
                      isInvalid={!!regFieldErrors.dealerName}
                    >
                      <FormLabel>{t.dealerName}</FormLabel>
                      <Input
                        ref={regDealerNameRef}
                        placeholder={t.dealerNamePlaceholder}
                        bg="transparent"
                        color={inputText}
                        _placeholder={{ color: placeholderColor }}
                        _focus={{ bg: "transparent" }}
                        value={dealerName}
                        onChange={(e) => {
                          setDealerName(e.target.value);
                          setRegFieldErrors((p) => ({
                            ...p,
                            dealerName: "",
                            form: "",
                          }));
                        }}
                      />
                      <FormErrorMessage>
                        {regFieldErrors.dealerName}
                      </FormErrorMessage>
                    </FormControl>
                  )}

                  {regFieldErrors.form && (
                    <Text color="red.500" textAlign="center" mb={3}>
                      {regFieldErrors.form}
                    </Text>
                  )}

                  <Button
                  type="submit"
                  w="full"
                  bg="brand.500"
                  color="black"
                  _hover={{ bg: "brand.600" }}
                  isLoading={regLoading}
                  isDisabled={isRegisterDisabled}
                  mt={4}
                  mb={6}
                >
                  {t.register}
                </Button>
                </form>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </DrawerContent>
    </Drawer>
  );
}