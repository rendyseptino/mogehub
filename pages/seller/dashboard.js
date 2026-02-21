import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  Divider,
  Heading,
  useColorMode,
  IconButton,
  Spacer,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack as DrawerVStack,
  Link as ChakraLink,
  Spinner,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  ViewIcon,
  AtSignIcon,
  AttachmentIcon,
  CalendarIcon,
  CheckIcon,
  SettingsIcon,
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons";
import { FiLogOut } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import Profile from "./profile";
import Verification from "./verification";
import AdsPage from "./ads";
import AdsBannerPage from "./ads-banner";
import SubscriptionPage from "./subscription";

import UserTips from "../../components/UserTips";

// ================= IMPORT LANGUAGE CONTEXT =================
import { useLanguageContext } from "../../context/LanguageContext";
import en from "../../locales/en.json";
import id from "../../locales/id.json";

const translations = { en, id };

export default function SellerDashboard() {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();

  // ================= USE LANGUAGE CONTEXT =================
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [loadingUser, setLoadingUser] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const authCheckedRef = useRef(false);

  // ================= AUTH GUARD =================
  useEffect(() => {
    if (!router.isReady) return;
    if (authCheckedRef.current) return;

    authCheckedRef.current = true;

    const run = async () => {
      try {
        const rawToken = router.query.token;
        const tokenFromQuery = typeof rawToken === "string" ? rawToken : null;
        let token = tokenFromQuery || localStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        if (tokenFromQuery) localStorage.setItem("token", tokenFromQuery);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("unauthorized");

        const data = await res.json();
        localStorage.setItem("user", JSON.stringify(data.user));

        setUser(data.user);
        setProfilePhoto(data.user?.profilePhoto || null);

        if (tokenFromQuery) {
          router.replace("/seller/dashboard", undefined, { shallow: true });
        }
      } catch (err) {
        console.error("AUTH ERROR:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
      } finally {
        setLoadingUser(false);
      }
    };

    run();
  }, [router.isReady]);

  // ================= SYNC PROFILE PHOTO =================
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const raw = localStorage.getItem("user");
        if (!raw) return;

        const updatedUser = JSON.parse(raw);
        if (!updatedUser || !updatedUser.id) return;

        setUser(updatedUser);
        setProfilePhoto(updatedUser.profilePhoto || null);
      } catch {}
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    setProfilePhoto(updatedUser.profilePhoto || null);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  if (loadingUser) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user) return null;

  // ================= FIXED SIDEBAR KEYS =================
  const sidebarItems = [
    { name: t.dashboard, key: "dashboard", icon: <ViewIcon /> },
    { name: t.ads, key: "ads", icon: <AtSignIcon /> },
    { name: t.adsBanner, key: "adsBanner", icon: <AttachmentIcon /> },
    { name: t.subscription, key: "subscription", icon: <CalendarIcon /> },
    { name: t.verification, key: "verification", icon: <CheckIcon /> },
    { name: t.profileSettings, key: "profileSettings", icon: <SettingsIcon /> },
  ];

  // ================= RENDER CONTENT SESUAI LANGUAGE =================
  const renderContent = () => {
    const renderKey = `${selectedMenu}-${language}`;

    switch (selectedMenu) {
      case "profileSettings":
        return <Profile key={renderKey} onUserUpdate={handleUserUpdate} t={t} />;
      case "verification":
        return <Verification key={renderKey} t={t} />;
      case "ads":
        return <AdsPage key={renderKey} t={t} />;
      case "adsBanner":
        return <AdsBannerPage key={renderKey} t={t} />;
      case "subscription":
        return <SubscriptionPage key={renderKey} t={t} />;
      default:
        return (
          <Box key={renderKey}>
            <Box
              bg={colorMode === "light" ? "white" : "gray.700"}
              p={4}
              borderRadius="md"
              shadow="sm"
              mb={4}
            >
              <Text fontWeight="bold" mb={2}>
                {t.welcomeDashboard}
              </Text>
              <Text color={colorMode === "light" ? "gray.700" : "gray.200"}>
                {t.dashboardDesc}
              </Text>
            </Box>
            <Box
              bg={colorMode === "light" ? "white" : "gray.700"}
              p={4}
              borderRadius="md"
              shadow="sm"
            >
              <Text fontWeight="bold" mb={2}>
                {t.statsActivity}
              </Text>
              <Text color={colorMode === "light" ? "gray.700" : "gray.200"}>
                {t.statsPlaceholder}
              </Text>
            </Box>
          </Box>
        );
    }
  };

  const logoSrc =
    colorMode === "light"
      ? "/mogehubmasterlight.png"
      : "/mogehubmasterdark.png";

  const getAvatarUrl = (user) =>
    user?.profilePhoto
  ? `${process.env.NEXT_PUBLIC_API_URL}${user.profilePhoto}`
  : undefined;

  return (
    <Flex minH="100vh" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
      {/* SIDEBAR */}
      <Box
        display={{ base: "none", md: "block" }}
        w="240px"
        bg={colorMode === "light" ? "white" : "gray.800"}
        borderRight="1px solid"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        p={6}
      >
        <VStack align="stretch" spacing={3}>
          <ChakraLink as={Link} href="/" _hover={{ textDecoration: "none" }}>
            <Image
              src={logoSrc}
              alt="Logo"
              mb={4}
              cursor="pointer"
              width="160px"
              height="60px"
              objectFit="contain"
            />
          </ChakraLink>
          <Divider />
          {sidebarItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              justifyContent="flex-start"
              colorScheme="green"
              leftIcon={item.icon}
              onClick={() => setSelectedMenu(item.key)}
            >
              {item.name}
            </Button>
          ))}
        </VStack>
      </Box>

      {/* MOBILE SIDEBAR */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <ChakraLink as={Link} href="/" _hover={{ textDecoration: "none" }}>
              <Image
                src={logoSrc}
                alt="Logo"
                mb={2}
                cursor="pointer"
                width="160px"
                height="60px"
                objectFit="contain"
              />
            </ChakraLink>
            <Divider mt={2} />
          </DrawerHeader>
          <DrawerBody>
            <DrawerVStack align="stretch" spacing={3}>
              {sidebarItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  justifyContent="flex-start"
                  colorScheme="green"
                  leftIcon={item.icon}
                  onClick={() => {
                    setSelectedMenu(item.key);
                    onClose();
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </DrawerVStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* MAIN */}
      <Flex flex="1" direction="column">
        {/* TOPBAR */}
        <Flex
          bg={colorMode === "light" ? "white" : "gray.800"}
          p={4}
          align="center"
          borderBottom="1px solid"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          <IconButton
            icon={<HamburgerIcon />}
            display={{ base: "inline-flex", md: "none" }}
            onClick={onOpen}
            mr={4}
            aria-label={t.openMenu}
          />

          <Heading size="md">
            {t.hello}, {user.username}
          </Heading>

          <Spacer />

          <Menu>
            <MenuButton as={Button} rounded="full" variant="link" p={0}>
              <Avatar
                size="sm"
                name={user.username}
                src={getAvatarUrl(user)}
                bg={!profilePhoto ? "brand.500" : undefined}
                color={!profilePhoto ? "black" : undefined}
              />
            </MenuButton>
            <MenuList>
              <MenuItem
                icon={<SettingsIcon />}
                onClick={() => setSelectedMenu("profileSettings")}
              >
                {t.profileSettings}
              </MenuItem>

              <MenuItem
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
              >
                {colorMode === "light" ? t.darkMode : t.lightMode}
              </MenuItem>

              <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                {t.logout}
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        <Box p={{ base: 4, md: 6 }} flex="1" overflowY="auto">
          <VStack spacing={6} align="stretch">{renderContent()}</VStack>
        </Box>
      </Flex>

      {selectedMenu === "dashboard" && !loadingUser && user && <UserTips />}
    </Flex>
  );
}
