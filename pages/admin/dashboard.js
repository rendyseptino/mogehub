
"use client";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";

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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
} from "@chakra-ui/react";

import { HamburgerIcon, MoonIcon, SunIcon, SettingsIcon } from "@chakra-ui/icons";
import { IoLanguage, IoSettingsOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";

// =================== IMPORT HALAMAN ===================
import VerificationPage from "./verification";
import AdminProfile from "./profile";
import AdsApproval from "./adsApproval";
import ThreadsPage from "./ThreadsPage";
import MainDashboard from "./mainDashboard";
import BlogPage from "./BlogPage";
import SuspendUserPage from "./suspendUser";
import UserRolePage from "./userRole"; // ✅ TAMBAHAN
import MaintenanceMode from "./maintenanceMode";
import ForMyTeamPage from "./for-my-team";
import MiniGamePage from "./miniGame";
import NotificationPage from "./notification"; 
import { PiGameControllerFill } from "react-icons/pi";
import AdminActivityDrawer from "../../components/AdminActivityDrawer";
import ChatDrawer from "../../components/ChatDrawer";
import MyChatDrawer from "../../components/myChatDrawer";
import { useSocket } from "@/context/SocketContext";
import { useNotification } from "@/context/NotificationContext";
import { playSound } from "@/utils/sound";
import AdReportPage from "./AdReport";
import TransactionUserPage from "./transactionUser";

// =================== IMPORT CONTEXT & LOCALES ===================
import { useLanguageContext } from "../../context/LanguageContext";
import en from "../../locales/en.json";
import id from "../../locales/id.json";

// =================== IMPORT RESPONSIVE UTILS ===================
import { mobileOnly, desktopOnly, mobileAndTabletPadding, isMobileOrTablet } from "../../utils/responsive";

const translations = { en, id };

const getAdsKey = (userId) => `admin_ads_request_count_${userId}`;

const getReportKey = (userId) =>
  `admin_report_listing_count_${userId}`;


const getVerificationKey = (userId) =>
  `admin_verification_request_count_${userId}`;

const getTransactionKey = (userId) =>
  `admin_transaction_count_${userId}`;

export default function AdminDashboard() {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const { language, setLanguage } = useLanguageContext();
  const t = translations[language] || translations.id;

  const socket = useSocket();
  const { enabled, selectedSound, volume } = useNotification();

  const [verificationRequestCount, setVerificationRequestCount] = useState(0);

  const [reportCount, setReportCount] = useState(0);

  const [transactionCount, setTransactionCount] = useState(0);

  const [user, setUser] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isChatOpen, onOpen: onChatOpen, onClose: onChatClose } = useDisclosure();
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  const openChatDrawer = () => {
  setIsChatDrawerOpen(true);
};

  // ✅ DRAWER CHAT ROOM (KEDUA)
  const [selectedRoom, setSelectedRoom] = useState(null);
  const {
    isOpen: isRoomOpen,
    onOpen: onRoomOpen,
    onClose: onRoomClose,
  } = useDisclosure();

  const authCheckedRef = useRef(false);

  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const [adminActivities, setAdminActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  
  const [adRequestCount, setAdRequestCount] = useState(0);

  // ================= HANDLE OPEN ROOM =================
const handleOpenRoom = async (data) => {
  try {
    if (!user?.id) {
      console.error("[DEBUG] userId belum ada");
      return;
    }

    const token = localStorage.getItem("token");

    // =============================
    // 🔹 KALAU SUDAH ROOM (GROUP / EXISTING)
    // =============================
    if (data?.id) {
      console.log("[DEBUG] OPEN EXISTING ROOM:", data);

      setSelectedRoom(data);
      onRoomOpen();
      return;
    }

    // =============================
    // 🔹 PRIVATE CHAT (KLIK ADMIN)
    // =============================
    if (data?.type === "private" && data?.targetUser?.id) {
      console.log("[DEBUG] PRIVATE TARGET:", data.targetUser);

      // 🔥 STEP 1: CEK ROOM YANG SUDAH ADA
      const roomsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const rooms = await roomsRes.json();

      if (Array.isArray(rooms)) {
        const existingRoom = rooms.find((room) => {
          if (room.type !== "private") return false;

          const participantIds = room.participants?.map((p) => p.userId || p.id);

          return (
            participantIds?.includes(user.id) &&
            participantIds?.includes(data.targetUser.id)
          );
        });

        // 🔥 KALAU SUDAH ADA → LANGSUNG PAKAI
        if (existingRoom) {
          console.log("[DEBUG] ROOM SUDAH ADA:", existingRoom);

          setSelectedRoom(existingRoom);
          onRoomOpen();
          return;
        }
      }

      // 🔥 STEP 2: KALAU BELUM ADA → CREATE
      console.log("[DEBUG] CREATE NEW ROOM");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: "private",
            participants: [user.id, data.targetUser.id],
          }),
        }
      );

      const room = await res.json();

      console.log("[DEBUG] NEW ROOM RESULT:", room);

      if (!room || room.error) {
        console.error("[ERROR] gagal create room", room);
        return;
      }

      setSelectedRoom(room);
      onRoomOpen();
      return;
    }

    // =============================
    // 🔹 FALLBACK ERROR
    // =============================
    console.error("[ERROR] FORMAT DATA GA VALID:", data);
  } catch (err) {
    console.error("[ERROR] handleOpenRoom:", err);
  }
};
  // =================== USER AUTH ===================
  useEffect(() => {
    if (authCheckedRef.current) return;
    authCheckedRef.current = true;

    const role = localStorage.getItem("role");
    const userStr = localStorage.getItem("user");

    

    if (role !== "admin") {
      router.replace("/admin/login");
      return;
    }

    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        localStorage.removeItem("user");
      }
    } else {
      setUser({ username: "Admin" });
    }
  }, [router]);


  useEffect(() => {
  if (!user?.id) return;

  const saved = localStorage.getItem(getReportKey(user.id));
  if (saved !== null) {
    setReportCount(Number(saved));
  }
}, [user?.id]);

useEffect(() => {
  if (!user?.id) return;

  const saved = localStorage.getItem(getTransactionKey(user.id));
  if (saved !== null) {
    setTransactionCount(Number(saved));
  }
}, [user?.id]);


  useEffect(() => {
  if (!user?.id) return;

  const saved = localStorage.getItem(getVerificationKey(user.id));
  if (saved !== null) {
    setVerificationRequestCount(Number(saved));
  }
}, [user?.id]);

useEffect(() => {
  if (!user?.id) return;

  localStorage.setItem(
    getVerificationKey(user.id),
    verificationRequestCount
  );
}, [verificationRequestCount, user]);

  useEffect(() => {
  if (!user?.id) return;

  const saved = localStorage.getItem(getAdsKey(user.id));
  if (saved !== null) {
    setAdRequestCount(Number(saved));
  }
}, [user?.id]);


  useEffect(() => {
  if (!user?.id) return;

  localStorage.setItem(getAdsKey(user.id), adRequestCount);
}, [adRequestCount, user]);

useEffect(() => {
  if (!user?.id) return;

  localStorage.setItem(getReportKey(user.id), reportCount);
}, [reportCount, user]);

useEffect(() => {
  if (!user?.id) return;

  localStorage.setItem(getTransactionKey(user.id), transactionCount);
}, [transactionCount, user]);

useEffect(() => {
  if (!socket) return;

  const join = () => {
    console.log("🟢 JOIN ADMIN ROOM");
    socket.emit("joinAdmin");
  };

  if (socket.connected) {
    join();
  } else {
    socket.once("connect", join);
  }

  return () => {
    socket.off("connect", join);
  };
}, [socket]);



const seenAdsRef = useRef(new Set());
const seenVerificationRef = useRef(new Set());
const seenReportRef = useRef(new Set());
const seenTransactionRef = useRef(new Set());

useEffect(() => {
  if (!socket) return;

  console.log("🔥 INIT LISTENER, connected:", socket.connected);

  const adHandler = (data) => {
    console.log("🔥 ADS EVENT MASUK:", data);

    if (!data?.eventId) return;

    if (seenAdsRef.current.has(data.eventId)) return;
    seenAdsRef.current.add(data.eventId);

    setAdRequestCount((prev) => {
      const next = prev + 1;

      if (user?.id) {
        localStorage.setItem(getAdsKey(user.id), next);
      }

      return next;
    });

    if (enabled && selectedSound) {
      try {
        playSound(selectedSound, volume);
      } catch {}
    }
  };

  const verificationHandler = (data) => {
    console.log("🔥 VERIFICATION EVENT MASUK:", data);

    if (!data?.eventId) return;

    if (seenVerificationRef.current.has(data.eventId)) return;
    seenVerificationRef.current.add(data.eventId);

    setVerificationRequestCount((prev) => {
      const next = prev + 1;

      if (user?.id) {
        localStorage.setItem(getVerificationKey(user.id), next);
      }

      return next;
    });

    if (enabled && selectedSound) {
      try {
        playSound(selectedSound, volume);
      } catch {}
    }
  };

  const reportHandler = (data) => {
  console.log("🔥 REPORT LISTING EVENT:", data);

  if (!data?.eventId) return;

  if (seenReportRef.current.has(data.eventId)) return;
  seenReportRef.current.add(data.eventId);

  setReportCount((prev) => {
    const next = prev + 1;

    if (user?.id) {
      localStorage.setItem(getReportKey(user.id), next);
    }

    return next;
  });

  if (enabled && selectedSound) {
    try {
      playSound(selectedSound, volume);
    } catch {}
  }
};

// 🔥 TRANSACTION HANDLER (TARUH DI SINI)
const transactionHandler = (data) => {
  console.log("🔥 TRANSACTION EVENT:", data);

  if (!data?.id) return;

  if (seenTransactionRef.current.has(data.id)) return;
  seenTransactionRef.current.add(data.id);

  setTransactionCount((prev) => {
    const next = prev + 1;

    if (user?.id) {
      localStorage.setItem(getTransactionKey(user.id), next);
    }

    return next;
  });

  if (enabled && selectedSound) {
    try {
      playSound(selectedSound, volume);
    } catch {}
  }
};

  const register = () => {
  socket.on("admin:new-ad-request", adHandler);
  socket.on("admin:new-verification-request", verificationHandler);
  socket.on("admin:new-report-listing", reportHandler);

  // 🔥 TAMBAH INI (TRANSACTION)
  socket.on("transaction:new", transactionHandler);
  socket.on("transaction:update", transactionHandler);
};

if (socket.connected) {
  register();
} else {
  socket.once("connect", register);
}

return () => {
  socket.off("admin:new-ad-request", adHandler);
  socket.off("admin:new-verification-request", verificationHandler);
  socket.off("admin:new-report-listing", reportHandler);

  // 🔥 CLEANUP TRANSACTION
  socket.off("transaction:new", transactionHandler);
  socket.off("transaction:update", transactionHandler);
};
}, [socket, user, enabled, selectedSound, volume]);


  // =================== TIME UPDATE ===================
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  

  // ================= DASHBOARD LOGOUT =================
    const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  
  // jangan hapus chakra-ui-color-mode
  router.push("/admin/login");

  
};

const handleMenuClick = (key) => {
  setSelectedMenu(key);

  if (key === "ads request") {
    setAdRequestCount(0);
    if (user?.id) {
      localStorage.setItem(getAdsKey(user.id), "0");
    }
  }

  if (key === "report listing") {
  setReportCount(0);
  if (user?.id) {
    localStorage.setItem(getReportKey(user.id), "0");
  }
}

  if (key === "verification") {
    setVerificationRequestCount(0);
    if (user?.id) {
      localStorage.setItem(getVerificationKey(user.id), "0");
    }
  }

if (key === "transactions") {
  setTransactionCount(0);
  if (user?.id) {
    localStorage.setItem(getTransactionKey(user.id), "0");
  }
}

};


  const handleChangeLanguage = async (lang) => {
  setLanguage(lang);
  
  if (!user) return;

  const updatedUser = { ...user, language: lang };
  setUser(updatedUser);
  localStorage.setItem("user", JSON.stringify(updatedUser));

  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/language`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${updatedUser.token}`,
      },
      body: JSON.stringify({ language: lang }),
    });
  } catch (err) {
    console.error("Failed to update admin language:", err);
  }
};

  if (!user)
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );

  // =================== SIDEBAR MENU ===================
  const sidebarItems = [
    { name: t.dashboard, key: "dashboard" },
    { name: t.totalUsers, key: "users" },
    { name: "Add User", key: "userRole" }, // ✅ GANTI TOTAL ADS
    { name: t.verificationRequest, key: "verification" },
    { name: t.adsRequest, key: "ads request" },
    { name: "Transactions", key: "transactions" },
    { name: "Report Listing", key: "report listing" },
    { name: t.threadsUser, key: "threads user" },
    { name: t.accountSettings, key: "settings" },
    { name: t.blog, key: "blog" },
    { name: t.forMyTeam, key: "forMyTeam" },
    { name: "Have Fun", key: "miniGame", icon: <PiGameControllerFill /> }, 
    { name: "Notification", key: "notification" },
  ];

  const maintenanceItem = { name: "Maintenance", key: "maintenance" };

  // =================== RENDER CONTENT ===================
  const renderContent = () => {
    switch (selectedMenu) {
      case "dashboard":
        return <MainDashboard />;

      case "users":
        return (
          <Box
            bg={colorMode === "light" ? "white" : "gray.700"}
            p={mobileAndTabletPadding}
            borderRadius="md"
            shadow="sm"
          >
            <Text fontSize="lg" fontWeight="bold">
              {t.totalUsers}
            </Text>

            <Box mt={4}>
              <SuspendUserPage />
            </Box>
          </Box>
        );

      case "userRole": // ✅ TAMBAHAN
        return <UserRolePage />;

      case "verification":
        return <VerificationPage />;

      case "ads request":
        return <AdsApproval />;

        case "transactions":
      return <TransactionUserPage />;

      case "threads user":
        return <ThreadsPage />;

      case "blog":
        return <BlogPage />;

      case "settings":
        return <AdminProfile />;

        case "maintenance":
        return <MaintenanceMode />;

        case "forMyTeam":
       return <ForMyTeamPage />;

       case "miniGame":
      return <MiniGamePage />;

      case "notification":
  return <NotificationPage />;

  case "report listing":
  return <AdReportPage />;

      default:
        return (
          <Box p={4}>
            <Text>{t.welcomeAdmin}</Text>
          </Box>
        );
    }
  };

  const logoSrc = colorMode === "light" ? "/mogehubmasterlight.png" : "/mogehubmasterdark.png";

  return (
    <>
      <Head>
        <title>MogeHub Admin | Dashboard</title>
      </Head>

      <Flex minH="100vh" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
        {/* SIDEBAR DESKTOP */}
        <Box
          display={desktopOnly}
          w="240px"
          bg={colorMode === "light" ? "white" : "gray.800"}
          borderRight="1px solid"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          p={mobileAndTabletPadding}
        >
          <VStack align="stretch" spacing={mobileAndTabletPadding}>
            <ChakraLink as={Link} href="https://mogehub.com" _hover={{ textDecoration: "none" }} isExternal>
              <Image
                src={logoSrc}
                alt="MogeHub Logo"
                width={{ base: "120px", lg: "140px" }}
                height={{ base: "45px", lg: "55px" }}
                mb={mobileAndTabletPadding}
                objectFit="contain"
                cursor="pointer"
              />
            </ChakraLink>
            <Divider />
            {sidebarItems.map((item) => {
  if (item.key === "miniGame" && isMobileOrTablet()) return null;

  return (
    <Button
      key={item.key}
      variant="ghost"
      justifyContent="space-between"
      fontWeight="medium"
      width="100%"
      bg={selectedMenu === item.key ? "blue.200" : "transparent"}
      color={selectedMenu === item.key ? "black" : "inherit"}
      _hover={{
        bg:
          selectedMenu === item.key
            ? "blue.300"
            : colorMode === "light"
            ? "blue.50"
            : "gray.700",
      }}
      _active={{
        bg:
          selectedMenu === item.key
            ? "blue.300"
            : colorMode === "light"
            ? "blue.100"
            : "gray.600",
      }}
     onClick={() => handleMenuClick(item.key)}
    >
      {/* 🔹 LEFT SIDE */}
      <Flex align="center" gap={2}>
        {item.icon ? item.icon : null}
        <Text>{item.name}</Text>
      </Flex>

      {/* 🔥 BADGE KHUSUS ADS REQUEST */}
      {item.key === "ads request" && adRequestCount > 0 && (
        <Box
          bg="brand.500"
          color="black"
          fontSize="xs"
          fontWeight="bold"
          px={2}
          py={1}
          borderRadius="full"
          minW="20px"
          textAlign="center"
        >
          {adRequestCount}
        </Box>
      )}

      {/* 🔥 BADGE KHUSUS TRANSACTION */}

    {item.key === "transactions" && transactionCount > 0 && (
  <Box
    bg="brand.500"
    color="black"
    fontSize="xs"
    fontWeight="bold"
    px={2}
    py={1}
    borderRadius="full"
    minW="20px"
    textAlign="center"
  >
    {transactionCount}
  </Box>
)}

      {/* 🔥 BADGE KHUSUS VERIFICATION REQUEST */}
{item.key === "verification" && verificationRequestCount > 0 && (
  <Box
    bg="brand.500"
    color="black"
    fontSize="xs"
    fontWeight="bold"
    px={2}
    py={1}
    borderRadius="full"
    minW="20px"
    textAlign="center"
    ml={2}
  >
    {verificationRequestCount}
  </Box>
)}

{item.key === "report listing" && reportCount > 0 && (
  <Box
    bg="brand.500"
    color="black"
    fontSize="xs"
    fontWeight="bold"
    px={2}
    py={1}
    borderRadius="full"
    minW="20px"
    textAlign="center"
  >
    {reportCount}
  </Box>
)}
    </Button>
  );
})}

              {/* 🔹 TAMBAHAN: Menu Maintenance di bawah */}
              <Divider mt={4} />
              <Button
                variant="ghost"
                justifyContent="flex-start"
                fontWeight="medium"
                width="100%"
                bg={selectedMenu === "maintenance" ? "blue.200" : "transparent"}
                color={selectedMenu === "maintenance" ? "black" : "inherit"}
                _hover={{
                  bg:
                    selectedMenu === "maintenance"
                      ? "blue.300"
                      : colorMode === "light"
                      ? "blue.50"
                      : "gray.700",
                }}
                _active={{
                  bg:
                    selectedMenu === "maintenance"
                      ? "blue.300"
                      : colorMode === "light"
                      ? "blue.100"
                      : "gray.600",
                }}
                onClick={() => setSelectedMenu("maintenance")}
              >
                Maintenance
              </Button>

          </VStack>
        </Box>

        {/* SIDEBAR MOBILE */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>
              <ChakraLink as={Link} href="https://mogehub.com" _hover={{ textDecoration: "none" }} isExternal>
                <Image
                  src={logoSrc}
                  alt="MogeHub Logo"
                  width={{ base: "120px", lg: "140px" }}
                  height={{ base: "45px", lg: "55px" }}
                  mb={mobileAndTabletPadding}
                  objectFit="contain"
                  cursor="pointer"
                />
              </ChakraLink>
              <Divider mt={mobileAndTabletPadding} />
            </DrawerHeader>
            <DrawerBody>
              <DrawerVStack align="stretch" spacing={mobileAndTabletPadding}>
                {sidebarItems.map((item) => {
  if (item.key === "miniGame" && isMobileOrTablet()) return null;

  return (
    <Button
      key={item.key}
      variant="ghost"
      justifyContent="space-between"
      fontWeight="medium"
      width="100%"
      bg={selectedMenu === item.key ? "blue.200" : "transparent"}
      color={selectedMenu === item.key ? "black" : "inherit"}
      _hover={{
        bg:
          selectedMenu === item.key
            ? "blue.300"
            : colorMode === "light"
            ? "blue.50"
            : "gray.700",
      }}
      _active={{
        bg:
          selectedMenu === item.key
            ? "blue.300"
            : colorMode === "light"
            ? "blue.100"
            : "gray.600",
      }}
      onClick={() => {
  handleMenuClick(item.key);
  onClose();
}}
    >
      {/* 🔹 LEFT */}
      <Flex align="center" gap={2}>
        {item.icon ? item.icon : null}
        <Text>{item.name}</Text>
      </Flex>

      {/* 🔥 BADGE */}
      {item.key === "ads request" && adRequestCount > 0 && (
        <Box
          bg="brand.500"
          color="black"
          fontSize="xs"
          fontWeight="bold"
          px={2}
          py={1}
          borderRadius="full"
          minW="20px"
          textAlign="center"
        >
          {adRequestCount}
        </Box>
      )}

      {/* 🔥 BADGE TRANSACTION */}

      {item.key === "transactions" && transactionCount > 0 && (
  <Box
    bg="brand.500"
    color="black"
    fontSize="xs"
    fontWeight="bold"
    px={2}
    py={1}
    borderRadius="full"
    minW="20px"
    textAlign="center"
  >
    {transactionCount}
  </Box>
)}

      {/* 🔥 BADGE VERIFICATION REQUEST */}
{item.key === "verification" && verificationRequestCount > 0 && (
  <Box
    bg="brand.500"
    color="black"
    fontSize="xs"
    fontWeight="bold"
    px={2}
    py={1}
    borderRadius="full"
    minW="20px"
    textAlign="center"
    ml={2}
  >
    {verificationRequestCount}
  </Box>
)}
    </Button>
  );
})}

                {/* 🔹 TAMBAHAN: Menu Maintenance di bawah */}
                <Divider mt={4} />
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  fontWeight="medium"
                  width="100%"
                  bg={selectedMenu === "maintenance" ? "blue.200" : "transparent"}
                  color={selectedMenu === "maintenance" ? "black" : "inherit"}
                  _hover={{
                    bg:
                      selectedMenu === "maintenance"
                        ? "blue.300"
                        : colorMode === "light"
                        ? "blue.50"
                        : "gray.700",
                  }}
                  _active={{
                    bg:
                      selectedMenu === "maintenance"
                        ? "blue.300"
                        : colorMode === "light"
                        ? "blue.100"
                        : "gray.600",
                  }}
                  onClick={() => setSelectedMenu("maintenance")}
                >
                  Maintenance
                </Button>


              </DrawerVStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* MAIN CONTENT */}
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

            <Heading size="md">
              {t.hello}, {user.username}
            </Heading>

            {/* 🔹 PASANG LONCENG ADMIN DISINI */}
           <AdminActivityDrawer />
            <Spacer />


            <Menu>
              <MenuButton
                as={IconButton}
                icon={<IoSettingsOutline size={24} />}
                variant="ghost"
                aria-label="Settings"
              />
              <MenuList>
                <>
                  <Text px={3} py={2} fontSize="sm" fontWeight="bold">
                    {t.language}
                  </Text>
                  {Object.keys(translations).map((lang) => (
                    <MenuItem
                      key={lang}
                      icon={<IoLanguage size={18} />}
                      onClick={() => handleChangeLanguage(lang)}
                    >
                      {lang.toUpperCase()}
                    </MenuItem>
                  ))}
                  <Divider my={2} />
                  <MenuItem icon={<SettingsIcon />} onClick={() => setSelectedMenu("settings")}>
                    {t.accountSettings}
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
                </>
              </MenuList>
            </Menu>
          </Flex>

          {/* CONTENT */}
          <Box p={mobileAndTabletPadding} flex="1" overflowY="auto">
            {/* 🔹 FLOATING CHAT BUBBLE */}
              <Box
                position="fixed"
                bottom="20px"
                right="20px"
                zIndex="overlay"
              >
                <Button
                  colorScheme="blue"
                  borderRadius="full"
                  width="60px"
                  height="60px"
                  onClick={onChatOpen}
                  boxShadow="md"
                >
                  💬
                </Button>
              </Box>

              {/* 🔹 CHAT DRAWER */}
              <ChatDrawer
                isOpen={isChatOpen}
                onClose={onChatClose}
                userId={user?.id || 0}
                token={localStorage.getItem("token")}
                onOpenRoom={handleOpenRoom}
              />

              <MyChatDrawer
                isOpen={isRoomOpen}
                onClose={() => {
                  onRoomClose();   // tutup MyChatDrawer
                  onChatOpen();    // buka ChatDrawer utama lagi
                }}
                room={selectedRoom}
                userId={user?.id || 0}
                openChatDrawer={onChatOpen} 
              />
            <VStack spacing={mobileAndTabletPadding} align="stretch">
              {renderContent()}
            </VStack>
          </Box>
        </Flex>
      </Flex>
    </>
  );
}