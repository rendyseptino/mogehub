"use client";

import {
  Box,
  Flex,
  Spacer,
  Button,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  Switch,
  Divider,
  useDisclosure,
  Tooltip,
} from "@chakra-ui/react";

import { CiMenuKebab } from "react-icons/ci";
import { FaFire, FaUser, FaCheck, FaBell } from "react-icons/fa";
import { IoLanguage, IoHelpBuoy } from "react-icons/io5";
import { MdDarkMode } from "react-icons/md";
import { GrLogin } from "react-icons/gr";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { GiFullMotorcycleHelmet } from "react-icons/gi";
import { TbBrandBlogger } from "react-icons/tb";
import { IoArrowBack } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";
import Image from "next/image";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";

import { mobileOnly, desktopOnly } from "../utils/responsive";
import { useLanguageContext } from "../context/LanguageContext";
import ActivityDrawer from "./ActivityDrawer";

import en from "../locales/en.json";
import id from "../locales/id.json";

import RegisterModal from "./RegisterModal";
import LoginModal from "./LoginModal";

const translations = { en, id };



export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  console.log("TOKEN:", user?.token);

  const [isActivityOpen, setIsActivityOpen] = useState(false); 
  const [unread, setUnread] = useState(0);
  

  const lastScrollY = useRef(0);
  const [showMobileNav, setShowMobileNav] = useState(true);

  const { language, setLanguage } = useLanguageContext();
  const t = translations[language] || translations.id;
  const freeAdLabel = user ? t?.postAd : (t?.freeAd || "Free AD");

  const { isOpen: isRegisterOpen, onOpen: onOpenRegister, onClose: onCloseRegister } = useDisclosure();
  const { isOpen: isLoginOpen, onOpen: onOpenLogin, onClose: onCloseLogin } = useDisclosure();

 

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } 
        catch { localStorage.removeItem("user"); setUser(null); }
      }
    }
  }, []);

  const handleBellClick = () => {
    if (!user) {
      router.push("/login"); // ❌ belum login
      return;
    }
    setIsActivityOpen(true); // ✅ buka drawer
  };


 useEffect(() => {
  if (typeof window === "undefined") return;

  const handleScroll = () => {
    const currentY = window.scrollY;

    // Kalo di AllAds, skip scroll logic, navbar stay di atas
    if (router.pathname === "/allads") {
      setShowMobileNav(true);
      return;
    }

    // Desktop biarin normal
    if (window.innerWidth >= 768) return;

    // scroll up/down logic
    if (currentY === 0) {
      setShowMobileNav(true);
    } else if (currentY > lastScrollY.current) {
      setShowMobileNav(false);
    } else if (currentY < lastScrollY.current) {
      setShowMobileNav(true);
    }

    lastScrollY.current = currentY;
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, [router.pathname]);

  if (!mounted) return null;

  const bgColor = { light: "white", dark: "gray.900" };
  const inputBg = colorMode === "light" ? "gray.100" : "gray.800";
  const inputText = colorMode === "light" ? "gray.800" : "white";
  const placeholderColor = colorMode === "light" ? "gray.500" : "gray.400";
  const logoSrc = colorMode === "light" ? "/mogehubmasterlight.png" : "/mogehubmasterdark.png";

  const handleChangeLanguage = async (lang) => {
  setLanguage(lang);

  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    const parsed = JSON.parse(storedUser);

    const updated = { ...parsed, language: lang };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/language`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsed.token}`
        },
        body: JSON.stringify({ language: lang })
      });
    } catch (err) {
      console.error("Failed update language:", err);
    }
  }
};

  const handleFreeAdClick = () => {
  if (user) {
    router.push("/seller/dashboard?tab=ads"); // langsung ke tab ads
  } else {
    router.push("/info-ad");
  }
};

  const handleFireClick = () => router.push("/subscription");
  const handleLoginClick = () => {
    if (user) router.push("/seller/dashboard");
    else if (router.pathname !== "/login") router.push("/login");
    else window.scrollTo(0, 0);
  };

  return (
    <>
     <Box
      bg={bgColor[colorMode]}
      px={4}
      py={2}
      w="100%"
      position={router.pathname === "/allads" ? "fixed" : "fixed"}
      top={router.pathname === "/allads" ? "0" : showMobileNav ? 0 : "-70px"}
      left={0}
      zIndex={1000}
      transition={router.pathname === "/allads" ? "none" : "top 0.3s ease"}
    >
        <Flex align="center" w="100%">
          {router.pathname === "/allads" && (
            <Box
              mr={2}
              cursor="pointer"
              onClick={() => router.back()}
              display="flex"
              alignItems="center"
              position="relative"
              top="-1px" // 🔥 naik dikit (biar sejajar logo)
              _hover={{ opacity: 0.7 }}
              _active={{ transform: "scale(0.9)" }}
              transition="all 0.2s"
            >
              <IoArrowBack
              size={26}
              color={colorMode === "light" ? "black" : "white"}
            />
            </Box>
          )}
          {/* LOGO */}
          <Link href="/">
        <Box cursor="pointer" lineHeight={0}>
          <Image
            src={logoSrc}
            alt="MogeHub Logo"
            width={140}
            height={50}
            priority
            quality={100}
            unoptimized
            style={{
              objectFit: "contain",
              display: "block",
            }}
          />
        </Box>
      </Link>

          


          {/* KEBAB + BELL ICON SETELAH LOGO */}
          <Flex display={desktopOnly} ml={2} mr={4} align="center" gap={2}>

            {/* KEBAB */}
            <Menu>
              <MenuButton as={Button} variant="ghost">
                <CiMenuKebab size={26} />
              </MenuButton>
              <MenuList color={inputText} minW="200px">
                <MenuItem onClick={() => router.push("/forum")} icon={<HiOutlineUserGroup size={20} />}>
                  Forum
                </MenuItem>

                <Divider my={2} />

                <MenuItem
                  icon={<GiFullMotorcycleHelmet size={18} />}
                  onClick={() => router.push("/about")}
                >
                  About MogeHub
                </MenuItem>

                <Divider my={2} />

                <MenuItem
                  icon={<TbBrandBlogger size={18} />}
                  onClick={() => router.push("/blog")}
                >
                  Blog MogeHub
                </MenuItem>
              </MenuList>
            </Menu>

            
            {/* 🔔 BELL */}
            <Tooltip
              label={
                user
                  ? "Lihat aktivitas"
                  : "Silahkan login untuk melihat aktivitas"
              }
              hasArrow
            >
              <Box cursor="pointer" position="relative" onClick={handleBellClick}>
                <FaBell size={20} color={colorMode==="light"?"black":"white"} />

                {/* 🔴 BADGE */}
                {unread > 0 && (
                  <Box
                    position="absolute"
                    top="-5px"
                    right="-5px"
                    bg="red.500"
                    color="white"
                    fontSize="10px"
                    px="5px"
                    borderRadius="full"
                  >
                    {unread}
                  </Box>
                )}
              </Box>
            </Tooltip>

          </Flex>

          <Box w="420px" display={{ base: "none", md: "block" }} />

          {/* Spacer buat dorong right group ke kanan */}
          <Spacer />


          {/* RIGHT DESKTOP */}
          <Flex display={desktopOnly} align="center" gap={3}>
            {/* 🔍 SEARCH ICON */}
            <Tooltip
              label="Browse all ads"
              fontSize="sm"
              bg="gray.700"
              color="white"
              borderRadius="md"
              hasArrow
              placement="bottom"
            >
              <Box
                cursor="pointer"
                onClick={() => router.push("/allads")}
                _hover={{ opacity: 0.7 }}
                _active={{ transform: "scale(0.9)" }}
                transition="all 0.2s"
              >
                <LuSearch size={22} color={colorMode==="light"?"black":inputText} />
              </Box>
            </Tooltip>

            {/* FIRE ICON WITH TOOLTIP */}
            <Tooltip
              label="See detail about your subscription package"
              fontSize="sm"
              bg="gray.700"
              color="white"
              borderRadius="md"
              hasArrow
              placement="bottom"
            >
              <Box cursor="pointer" onClick={handleFireClick}>
                <FaFire size={22} color={colorMode==="light"?"black":inputText} />
              </Box>
            </Tooltip>

            {!user && (
              <Link href="/register">
                <Button borderRadius="full" bg={colorMode === "light" ? "gray.300" : "gray.700"} color={inputText}
                  _hover={{ bg: colorMode === "light" ? "gray.400" : "gray.600" }}
                >
                  {t?.signup || "Sign Up"}
                </Button>
              </Link>
            )}

           <Button
            borderRadius="full"
            bg="brand.500"
            color="black"
            _hover={{ bg: "brand.600" }}
            onClick={handleFreeAdClick}
          >
            <FaPlus size={16} />
            {freeAdLabel}
          </Button>

            {/* USER MENU */}
            <Menu closeOnSelect={false}>
              <MenuButton as={Button} variant="ghost"><FaUser size={22} /></MenuButton>
              <MenuList color={inputText} minW="250px">
                {/* Language */}
                <MenuItem>
                  <Flex gap={2} mb={2} align="center">
                    <IoLanguage size={22}/>
                    {Object.keys(translations).map(lang => (
                      <Flex key={lang} align="center" gap={2} cursor="pointer" onClick={() => handleChangeLanguage(lang)}>
                        <Box
                          w="18px" h="18px"
                          borderRadius="full"
                          border="2px solid"
                          borderColor={language===lang?"brand.500":"gray.400"}
                          bg={language===lang?"brand.500":"transparent"}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {language===lang && <FaCheck size={12} color="black" />}
                        </Box>
                        <Box>{lang.toUpperCase()}</Box>
                      </Flex>
                    ))}
                  </Flex>
                </MenuItem>
                <Divider my={2}/>

                {/* Dark Theme */}
                <MenuItem>
                  <Flex justify="space-between" align="center" w="100%">
                    <Flex align="center" gap={2}><MdDarkMode size={22}/> Dark Theme</Flex>
                    <Box position="relative">
                      <Switch
                        isChecked={colorMode==="dark"}
                        onChange={toggleColorMode}
                        size="md"
                        sx={{
                          borderRadius:"999px",
                          border:"2px solid",
                          borderColor: colorMode==="dark"?"brand.500":"black",
                          "& .chakra-switch__track": { bg: colorMode==="dark"?"black":"gray.300" },
                          "& .chakra-switch__thumb": { bg: colorMode==="dark"?"brand.500":"white" }
                        }}
                      />
                      {colorMode==="dark" && (
                        <Box
                          position="absolute"
                          left="3px" top="50%"
                          transform="translateY(-50%)"
                          w="14px" h="14px"
                          display="flex" alignItems="center" justifyContent="center"
                          onClick={toggleColorMode}
                        >
                          <FaCheck size={12} color="brand.500"/>
                        </Box>
                      )}
                    </Box>
                  </Flex>
                </MenuItem>
                <Divider my={2}/>

                <Link href="/help" passHref>
                  <MenuItem icon={<IoHelpBuoy size={22}/>}>{t.helpCenter}</MenuItem>
                </Link>
                <Divider my={2}/>
                <MenuItem icon={<GrLogin size={22}/>} onClick={handleLoginClick}>{user?"Dashboard":"Login"}</MenuItem>
              </MenuList>
            </Menu>
          </Flex>

          {/* MOBILE BUTTONS */}
          <Flex display={mobileOnly} align="center" gap={2} ml="auto">
            <Button
              size="sm"
              borderRadius="full"
              bg={colorMode === "light" ? "gray.300" : "gray.700"}
              color={inputText}
              onClick={() => router.push("/subscription")}
              _active={{ bg: colorMode === "light" ? "gray.400" : "gray.600" }}
              px={3}
            >
              <FaFire size={20} />
            </Button>
            <Button
              size="sm"
              borderRadius="full"
              bg="brand.500"
              color="black"
              onClick={handleFreeAdClick}
              _active={{ bg: "brand.600" }}
            >
              <FaPlus size={16} />
              {freeAdLabel}
            </Button>
          </Flex>
        </Flex>
      </Box>

       {/* ✅ DRAWER */}
      <ActivityDrawer
        token={user?.token}
        isActive={isActivityOpen}
        setActive={setIsActivityOpen}
        setUnread={setUnread}
      />

      <RegisterModal isOpen={isRegisterOpen} onClose={onCloseRegister} onOpenLogin={onOpenLogin}/>
      <LoginModal isOpen={isLoginOpen} onClose={onCloseLogin} onOpenRegister={onOpenRegister}/>
    </>
  );
}