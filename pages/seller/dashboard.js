
"use client";
import Head from "next/head";

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
  Badge,
  MenuList,
  MenuItem,
  Avatar,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  MoonIcon,
  SunIcon,
  SettingsIcon,
} from "@chakra-ui/icons";
import { FiLogOut } from "react-icons/fi";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaMotorcycle, FaFire } from "react-icons/fa6";
import { GrAnnounce } from "react-icons/gr";
import { MdVerified } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { IoLanguage, IoSettingsOutline } from "react-icons/io5";
import { IoIosWarning } from "react-icons/io";
import { IoEyeSharp } from "react-icons/io5";
import { FaRegClock } from "react-icons/fa";
import { GiClick } from "react-icons/gi";
import { FcStatistics } from "react-icons/fc";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { FaRegHeart } from "react-icons/fa";
import { MdOutlinePayments } from "react-icons/md";

import Profile from "./profile";
import Verification from "./verification";
import AdsPage from "./ads";
import AdsBannerPage from "./ads-banner";
import SubscriptionPage from "./subscription";
import DeleteAccountPage from "./deleteAccount";
import WishlistAdPage from "./wishlistAd";
import MyTransaction from "./myTransaction";
import SupportTicketPage from "./supportTicket";


import {
  mobileOnly,
  desktopOnly,
  mobileAndTabletPadding,
} from "../../utils/responsive";
import DashboardTourModal from "@/components/tourModal";
import SearchBarDashboardUser from "@/components/searchBarDashboardUser";
import { useLanguageContext } from "../../context/LanguageContext";
import { useUser } from "../../context/UserContext";
import en from "../../locales/en.json";
import id from "../../locales/id.json";

const translations = { en, id };

export default function SellerDashboard() {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const sectionTitleColor = colorMode === "light" ? "black" : "white";
  const sectionSubtitleColor = colorMode === "light" ? "black" : "white";
  const { language, setLanguage } = useLanguageContext();
  const t = translations[language] || translations.id;

  const { user, login, logout, loading: loadingContextUser } = useUser();
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || null);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  useEffect(() => {
    if (!router.isReady) return;

    const tab = router.query.tab;

    if (tab) {
      setSelectedMenu(tab);
    }
  }, [router.isReady, router.query.tab]);

  const [loadingUser, setLoadingUser] = useState(true);
  const [boostStats, setBoostStats] = useState([]);
  const [showTour, setShowTour] = useState(false);
  const [loadingBoostStats, setLoadingBoostStats] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [wishlistCount, setWishlistCount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [lastSeenTransaction, setLastSeenTransaction] = useState(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("lastSeenTransaction") || null;
  }
  return null;
});
  
  

  const { isOpen, onOpen, onClose } = useDisclosure();
  const authCheckedRef = useRef(false);
  

  const handleUserUpdate = (updatedUser) => {
    login(updatedUser);
    setProfilePhoto(updatedUser.profilePhoto || null);
  };

  const handleChangeLanguage = async (lang) => {
    setLanguage(lang);

    if (!user) return;

    const updatedUser = { ...user, language: lang };
    login(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/language`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${updatedUser.token}`,
        },
        body: JSON.stringify({ language: lang }),
      });
    } catch (err) {
      console.error("Failed to update language:", err);
    }
  };

  const fetchBoostStats = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No token found");
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/dashboard/boosted-ads-performance`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // 🔥 INI KUNCI NYA
        },
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();

    setBoostStats(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Fetch boost stats error:", err);
    setBoostStats([]); // fallback biar ga crash UI
  } finally {
    setLoadingBoostStats(false);
  }
};

const fetchTransactionCount = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/transactions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    const unseen = data.filter((trx) => {
  if (!lastSeenTransaction) return true;
  return new Date(trx.createdAt) > new Date(lastSeenTransaction);
});

setTransactionCount(unseen.length);
  } catch (err) {
    console.error("Transaction count error:", err);
  }
};

const fetchWishlistCount = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "https://api.mogehub.com/api/ad/user/favorites",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setWishlistCount(data.favorites?.length || 0);
  } catch (err) {
    console.error("Wishlist count error:", err);
  }
};



useEffect(() => {
  if (!user) return;

  const socket = window.socket;
  if (!socket) return;

  // clear dulu biar ga dobel
  socket.off("wishlist:add");
  socket.off("wishlist:remove");

  socket.on("wishlist:add", () => {
    setWishlistCount((prev) => prev + 1);
  });

  socket.on("wishlist:remove", () => {
    setWishlistCount((prev) => Math.max(prev - 1, 0));
  });

  return () => {
    socket.off("wishlist:add");
    socket.off("wishlist:remove");
  };
}, [user]);

useEffect(() => {
  if (!user) return;

  const key = `dashboardTourSeen_${user.id}`;
  const hasSeenTour = localStorage.getItem(key);

  if (!hasSeenTour) {
    setShowTour(true);
  }
}, [user]);

  useEffect(() => {
  if (!router.isReady || authCheckedRef.current) return;

  authCheckedRef.current = true;

  const runAuth = async () => {
    try {
      const tokenFromQuery = router.query.token;
      let token = tokenFromQuery || localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      if (tokenFromQuery) {
        localStorage.setItem("token", tokenFromQuery);
        token = tokenFromQuery;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // ❌ Jangan throw error lagi
        console.warn("Silent auth fetch failed", res.status);
        return;
      }

      const data = await res.json();
      login(data.user); // ✅ update user context
      setProfilePhoto(data.user?.profilePhoto || null);

      if (tokenFromQuery) {
        const { token, ...rest } = router.query;
        router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
      }
    } catch (err) {
      // ❌ Jangan logout user kalau error
      console.warn("Silent auth error:", err);
    } finally {
      setLoadingUser(false);
    }
  };

  runAuth();
}, [router.isReady]);

useEffect(() => {
  if (user) {
    fetchBoostStats();
    fetchWishlistCount();
    fetchTransactionCount();
  }
}, [user, lastSeenTransaction]);

useEffect(() => {
  if (!user) return;

  const socket = window.socket;
  if (!socket) return;

  socket.off("transactionUpdate");

  socket.on("transactionUpdate", () => {
  fetchTransactionCount(); 
});

  return () => {
    socket.off("transactionUpdate");
  };
}, [user]);

useEffect(() => {
  if (selectedMenu === "myTransaction" && user) {
    fetchTransactionCount();
  }
}, [selectedMenu, user]);

  

  if (loadingUser || loadingContextUser) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user) return null;

  const sidebarItems = [
    { name: t.dashboard, key: "dashboard", icon: <LuLayoutDashboard size={20} /> },
    { name: t.ads, key: "ads", icon: <FaMotorcycle size={18} /> },
    { name: t.adsBanner, key: "adsBanner", icon: <GrAnnounce size={18} /> },
    { name: "Wishlist", key: "wishlist", icon: <FaRegHeart size={18} /> },
    { name: t.subscription, key: "subscription", icon: <FaFire size={18} /> },
    { name: t.verification, key: "verification", icon: <MdVerified size={20} /> },
    { name: t.mytransactions, key: "myTransaction", icon: <MdOutlinePayments size={18} /> },
    { name: "Support Ticket", key: "supportTicket", icon: <IoMdSettings size={20} /> 
  },

  { type: "section", labelKey: "accountSettings", subtitleKey: "accountSettingsDesc" },
    { name: t.profileSettings, key: "profileSettings", icon: <IoMdSettings size={20} /> },
    { name: "Privacy", key: "privacy", icon: <IoIosWarning size={20} /> },
  ];

  const renderContent = () => {
    const renderKey = `${selectedMenu}-${language}`;

    const totalImpression = boostStats.reduce((acc, i) => acc + i.impression, 0);
const totalClick = boostStats.reduce((acc, i) => acc + i.click, 0);
const avgCTR = totalImpression
  ? ((totalClick / totalImpression) * 100).toFixed(2)
  : 0;

  const totalPages = Math.ceil(boostStats.length / itemsPerPage);

const paginatedData = boostStats.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

    switch (selectedMenu) {
      case "profileSettings":
        return <Profile key={renderKey} onUserUpdate={handleUserUpdate} t={t} />;
      case "verification":
        return <Verification key={renderKey} t={t} />;
      case "ads":
        return <AdsPage key={renderKey} t={t} />;
      case "adsBanner":
        return <AdsBannerPage key={renderKey} t={t} />;
        case "wishlist":
      return <WishlistAdPage key={renderKey} />;
      case "myTransaction":
    return <MyTransaction key={renderKey} />;
    case "supportTicket":
    return <SupportTicketPage key={renderKey} />;
      case "subscription":
    return <SubscriptionPage key={renderKey} t={t} />;
      case "privacy":
        return <DeleteAccountPage key={renderKey} t={t} />; // <-- render menu baru
      default:
        return (
          <Box key={renderKey}>
  {/* WELCOME */}
  <Box
    bg={colorMode === "light" ? "white" : "gray.700"}
    p={mobileAndTabletPadding}
    borderRadius="md"
    shadow="sm"
    mb={mobileAndTabletPadding}
  >
    <Text fontWeight="bold" mb={mobileAndTabletPadding} fontSize="lg">
      {t.welcomeDashboard}
    </Text>
    <Text
      color={colorMode === "light" ? "gray.700" : "gray.200"}
      fontSize="md"
    >
      {t.dashboardDesc}
    </Text>
  </Box>

  {/* BOOST ADS PERFORMANCE */}
  <Box
    bg={colorMode === "light" ? "white" : "gray.700"}
    p={mobileAndTabletPadding}
    borderRadius="md"
    shadow="sm"
  >
    <Text fontWeight="bold" mb={4} fontSize="lg">
      🚀 Boost Ads Performance
    </Text>

    {loadingBoostStats ? (
      <Flex justify="center" align="center" py={10}>
        <Spinner />
      </Flex>
    ) : boostStats.length === 0 ? (
      // EMPTY STATE
      <Box textAlign="center" py={10}>
        <Text fontSize="md" color="gray.500">
          Belum ada iklan yang di-boost 🚀
        </Text>
        <Text fontSize="sm" color="gray.400">
          Silakan boost iklan kamu untuk melihat performa di sini.
        </Text>
      </Box>
    ) : (
      <>
        {/* 🔥 KPI SUMMARY */}
        <Flex gap={6} mb={6} flexWrap="wrap">
          <Box>
            <Text fontSize="xs" color="gray.400">
              Total Impression
            </Text>
            <Text fontWeight="bold">
              {boostStats
                .reduce((acc, i) => acc + (i.impression || 0), 0)
                .toLocaleString()}
            </Text>
          </Box>

          <Box>
            <Text fontSize="xs" color="gray.400">
              Total Click
            </Text>
            <Text fontWeight="bold">
              {boostStats
                .reduce((acc, i) => acc + (i.click || 0), 0)
                .toLocaleString()}
            </Text>
          </Box>

          <Box>
            <Text fontSize="xs" color="gray.400">
              Avg CTR
            </Text>
            <Text fontWeight="bold">
              {(() => {
                const totalImpression = boostStats.reduce(
                  (acc, i) => acc + (i.impression || 0),
                  0
                );
                const totalClick = boostStats.reduce(
                  (acc, i) => acc + (i.click || 0),
                  0
                );
                return totalImpression
                  ? ((totalClick / totalImpression) * 100).toFixed(2)
                  : 0;
              })()}
              %
            </Text>
          </Box>
        </Flex>

        {/* 🔥 LIST ADS */}
        {/* 🔥 LIST ADS */}
<VStack spacing={4} align="stretch">
  {paginatedData.map((item) => {
    const isExpired =
      item.endDate
        ? new Date(item.endDate) < new Date()
        : false;

    const formatDate = (date) => {
  if (!date) return "-";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

    return (
      <Box
        key={item.trackingId || item.boostAdId}
        p={4}
        borderWidth="1px"
        borderRadius="md"
        _hover={{
          shadow: "md",
          transform: "translateY(-2px)",
        }}
        transition="0.2s"
      >
        {/* TITLE */}
        <Text fontWeight="bold" mb={1}>
          {item.adTitle || "Untitled Ads"}
        </Text>

        {/* 🔥 STATUS BADGE */}
        <Flex mt={1} mb={2}>
          <Badge colorScheme={isExpired ? "red" : "green"}>
            {isExpired ? "Expired" : "Active"}
          </Badge>
        </Flex>

        {/* 🔥 STATS */}
       <Flex mt={2} gap={4} flexWrap="wrap" align="center">

        <Flex align="center" gap={1}>
          <FaFire />
          <Text fontSize="sm">{item.tier || "-"}</Text>
        </Flex>

        <Flex align="center" gap={1}>
          <IoEyeSharp />
          <Text fontSize="sm">
            {(item.impression || 0).toLocaleString()}
          </Text>
        </Flex>

        <Flex align="center" gap={1}>
          <GiClick />
          <Text fontSize="sm">
            {(item.click || 0).toLocaleString()}
          </Text>
        </Flex>

        <Flex align="center" gap={1}>
          <FcStatistics />
          <Text
            fontSize="sm"
            color={
              item.ctr >= 5
                ? "green.400"
                : item.ctr >= 2
                ? "yellow.400"
                : "red.400"
            }
          >
            {item.ctr || 0}%
          </Text>
        </Flex>

        <Flex align="center" gap={1}>
          <FaRegClock />
          <Text fontSize="xs" color="gray.500">
            {formatDate(item.createdAt)}
          </Text>
        </Flex>

      </Flex>
            </Box>
          );
        })}
      </VStack>

{totalPages > 1 && (
  <Flex mt={4} justify="center" gap={2}>
    <Button
      size="sm"
      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      isDisabled={currentPage === 1}
    >
      Prev
    </Button>

    {[...Array(totalPages)].map((_, i) => (
      <Button
        key={i}
        size="sm"
        variant={currentPage === i + 1 ? "solid" : "outline"}
        onClick={() => setCurrentPage(i + 1)}
      >
        {i + 1}
      </Button>
    ))}

    <Button
      size="sm"
      onClick={() =>
        setCurrentPage((p) => Math.min(p + 1, totalPages))
      }
      isDisabled={currentPage === totalPages}
    >
      Next
    </Button>
  </Flex>
)}
      </>
    )}
  </Box>
</Box>
         
        );
    }
  };

  const logoSrc = colorMode === "light" ? "/mogehubmasterlight.png" : "/mogehubmasterdark.png";

  return (

    <>
    <Head>
      <title>MogeHub | Dashboard</title>
    </Head>

    
    
    <Flex minH="100vh" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
      {/* SIDEBAR DESKTOP */}
      
{/* SIDEBAR DESKTOP */}
<Box
  display={desktopOnly}
  w={{ base: "full", lg: "340px" }}
  bg={colorMode === "light" ? "white" : "gray.800"}
  borderRight="1px solid"
  borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
  p={mobileAndTabletPadding}
  overflow="hidden"
>

  {/* WRAPPER SIDEBAR CONTENT */}
  <Box>

    {/* LOGO */}
    <ChakraLink as={Link} href="/" _hover={{ textDecoration: "none" }}>
      <Image
        src={logoSrc}
        alt="Logo"
        width={{ base: "120px", lg: "140px" }}
        height={{ base: "45px", lg: "55px" }}
        objectFit="contain"
        cursor="pointer"
      />
    </ChakraLink>

    

    {/* DIVIDER FULL WIDTH */}
   <Box w="340px" ml="-24px" mt="4" mb={4}>
    <Divider borderColor={colorMode === "light" ? "gray.200" : "gray.600"} />
  </Box>

  <Box
  mb={6}
  display="flex"
  justifyContent="center"
>
  <Box
    w="calc(100% - 14px)"
    ml="-25px"
  >
    <SearchBarDashboardUser
      sidebarItems={sidebarItems}
      setSelectedMenu={setSelectedMenu}
    />
  </Box>
</Box>


    {/* MENU */}
    <VStack align="stretch" spacing={mobileAndTabletPadding}>

      {sidebarItems.map((item) => {

  // SECTION HEADER
  if (item.type === "section") {
  return (
    <Box key={item.label} px={2} pt={4} pb={1}>
      {/* TITLE */}
      <Text fontSize="18px" fontWeight="bold" color={sectionTitleColor}>
        {t[item.labelKey]}
      </Text>

      {/* SUBTITLE */}
      <Text fontSize="17px" color={sectionSubtitleColor}>
        {t[item.subtitleKey]}
      </Text>

      <Divider mt={2} />
    </Box>
  );
}
  // MENU NORMAL
  return (
    <Button
      key={item.key}
      variant="ghost"
      justifyContent="flex-start"
      onClick={() => {
        setSelectedMenu(item.key);

        if (item.key === "myTransaction") {
          const now = new Date().toISOString();
          localStorage.setItem("lastSeenTransaction", now);
          setLastSeenTransaction(now);
          setTransactionCount(0);
        }
      }}
      fontSize="18px"
      width="100%"
      textAlign="left"
      borderRadius="md"
      py={3}
      px={4}
      whiteSpace="normal"
      bg={selectedMenu === item.key ? "blue.200" : "transparent"}
      color={selectedMenu === item.key ? "black" : "inherit"}
      _hover={{
        bg:
          selectedMenu === item.key
            ? "blue.300"
            : colorMode === "light"
            ? "blue.50"
            : "gray.700",
        color: "black",
      }}
    >
      <Flex w="100%" align="center" justify="space-between">
        <Flex align="center" gap={2}>
          {item.icon}
          <Text>{item.name}</Text>
        </Flex>

        {item.key === "wishlist" && wishlistCount > 0 && (
          <Badge
           bg="brand.500"
            color="black"
            borderRadius="full"
            minW="22px"
            h="22px"
            px="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="10px"
            fontWeight="bold"
            boxShadow="0 0 10px rgba(59,130,246,0.35)"
        >
          {wishlistCount}
        </Badge>
        )}

        {item.key === "myTransaction" && transactionCount > 0 && (
          <Badge
            bg="brand.500"
            color="black"
            borderRadius="full"
            minW="22px"
            h="22px"
            px="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="10px"
            fontWeight="bold"
            boxShadow="0 0 10px rgba(59,130,246,0.35)"
          >
            {transactionCount}
          </Badge>
        )}
      </Flex>
    </Button>
  );
})}

    </VStack>

  </Box>
</Box>

      {/* SIDEBAR MOBILE */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <ChakraLink as={Link} href="/" _hover={{ textDecoration: "none" }}>
              <Image
                src={logoSrc}
                alt="Logo"
                width={{ base: "120px", lg: "140px" }}
                height={{ base: "45px", lg: "55px" }}
                mb={mobileAndTabletPadding}
                objectFit="contain"
                cursor="pointer"
              />
            </ChakraLink>
            <Box w="300px" ml="-24px" mt="4" mb={4}>
    <Divider borderColor={colorMode === "light" ? "gray.200" : "gray.600"} />
  </Box>
            <Box
  mb={6}
  display="flex"
  justifyContent="center"
>
  <Box
    w="calc(100%)"
    ml="-16px"
  >
    <SearchBarDashboardUser
      sidebarItems={sidebarItems}
      setSelectedMenu={setSelectedMenu}
       onSelect={onClose}
    />
  </Box>
</Box>
          </DrawerHeader>
          <DrawerBody>
            <DrawerVStack align="stretch" spacing={mobileAndTabletPadding}>
              {sidebarItems.map((item) => {

            // SECTION HEADER (MOBILE JUGA)
            if (item.type === "section") {
              return (
                <Box key={item.label} px={2} pt={4} pb={1}>

                  <Text
                    fontSize="18px"
                    fontWeight="bold"
                    color={sectionTitleColor}
                  >
                     {t[item.labelKey]}
                  </Text>

                  <Text
                  fontSize="15px"
                  color={sectionSubtitleColor}
                  whiteSpace="normal"
                  wordBreak="break-word"
                  overflowWrap="anywhere"
                  w="100%"
                  display="block"
                  lineHeight="1.4"
                >
                  {t[item.subtitleKey]}
                </Text>

                  <Divider mt={2} />
                </Box>
              );
            }

            // NORMAL MENU MOBILE
            return (
              <Button
                key={item.key}
                variant="ghost"
                justifyContent="flex-start"
                onClick={() => {
                  setSelectedMenu(item.key);
                  onClose();
                }}
                fontSize="md"
                width="100%"
                textAlign="left"
                borderRadius="md"
                py={3}
                px={4}
                whiteSpace="normal"
                bg={selectedMenu === item.key ? "blue.200" : "transparent"}
                color={selectedMenu === item.key ? "black" : "inherit"}
              >
                <Flex w="100%" align="center" justify="space-between">
                  <Flex align="center" gap={2}>
                    {item.icon}
                    <Text>{item.name}</Text>
                  </Flex>

                  {item.key === "wishlist" && wishlistCount > 0 && (
                    <Badge
                      bg="brand.500"
                        color="black"
                        borderRadius="full"
                        minW="22px"
                        h="22px"
                        px="0"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="10px"
                        fontWeight="bold"
                        boxShadow="0 0 10px rgba(59,130,246,0.35)"
                    >
                      {wishlistCount}
                    </Badge>
                    )}

                  {item.key === "myTransaction" && transactionCount > 0 && (
                    <Badge
                      bg="brand.500"
                      color="black"
                      borderRadius="full"
                      minW="22px"
                      h="22px"
                      px="0"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="10px"
                      fontWeight="bold"
                    >
                      {transactionCount}
                    </Badge>
                  )}
                </Flex>
              </Button>
            );
          })}
            </DrawerVStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* MAIN */}
      <Flex flex="1" direction="column">
        {/* TOPBAR */}
        <Flex
          bg={colorMode === "light" ? "white" : "gray.800"}
          p={mobileAndTabletPadding}
          align="center"
          borderBottom="1px solid"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          <IconButton
            icon={<HamburgerIcon />}
            display={mobileOnly}
            onClick={onOpen}
            mr={mobileAndTabletPadding}
            aria-label={t.openMenu}
          />

          <Heading fontSize="lg">
            {t.hello}, {user.username}
          </Heading>

          <Spacer />

          <Menu>
            <MenuButton as={IconButton} icon={<IoSettingsOutline size={24} />} variant="ghost" aria-label="Settings" />
            <MenuList>
              <Box px={3} py={2}>
                <Text fontSize="sm" fontWeight="bold" mb={1}>Language</Text>
                {Object.keys(translations).map((lang) => (
                  <MenuItem key={lang} icon={<IoLanguage size={18} />} onClick={() => handleChangeLanguage(lang)}>
                    {lang.toUpperCase()}
                  </MenuItem>
                ))}
              </Box>
              <Divider my={2} />
              <MenuItem icon={<SettingsIcon />} onClick={() => setSelectedMenu("profileSettings")}>{t.profileSettings}</MenuItem>
              <MenuItem icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />} onClick={toggleColorMode}>
                {colorMode === "light" ? t.darkMode : t.lightMode}
              </MenuItem>
              <MenuItem icon={<FiLogOut />} onClick={() => { logout(); router.replace("/login"); }}>{t.logout}</MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        <Box p={mobileAndTabletPadding} flex="1" overflowY="auto">
          <VStack spacing={mobileAndTabletPadding} align="stretch">{renderContent()}</VStack>
        </Box>
        <DashboardTourModal
  isOpen={showTour}
  onClose={() => {
    setShowTour(false);
    localStorage.setItem(`dashboardTourSeen_${user.id}`, "true");
  }}
/>
      </Flex>

      
    </Flex>
    </>
  );
}