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
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// =================== IMPORT HALAMAN ===================
import VerificationPage from "./verification"; // /pages/admin/verification.js
import AdminProfile from "./profile"; // /pages/admin/profile.js
import AdsApproval from "./adsApproval"; // <=== halaman approve/reject iklan

export default function AdminDashboard() {
  const { colorMode } = useColorMode();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ================= USER AUTH =================
  useEffect(() => {
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

  // ================= TIME UPDATE =================
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/admin/login");
  };

  if (!user) return <Spinner size="xl" />;

  // ================= SIDEBAR MENU =================
  const sidebarItems = [
    { name: "Dashboard", key: "dashboard" },
    { name: "Total Users", key: "users" },
    { name: "Total Iklan", key: "ads" },
    { name: "Verification Request", key: "verification" },
    { name: "Ads Request", key: "ads request" },
    { name: "Report Users", key: "report" },
    { name: "Account Settings", key: "settings" },
  ];

  // ================= RENDER CONTENT SESUAI MENU =================
  const renderContent = () => {
    switch (selectedMenu) {
      case "dashboard":
        return (
          <Box p={4}>
            <Text>Selamat datang di Admin Panel</Text>
          </Box>
        );

      case "users":
      case "ads":
      case "report":
        return (
          <Box p={4}>
            <Text>Konten untuk {selectedMenu}</Text>
          </Box>
        );

      case "verification":
        return <VerificationPage />;

      case "ads request":
        return <AdsApproval />; // <=== TAMBAH INI

      case "settings":
        return <AdminProfile />; // <=== PROFILE ADMIN DI SINI

      default:
        return (
          <Box p={4}>
            <Text>Selamat datang di Admin Panel</Text>
          </Box>
        );
    }
  };

  return (
    <Flex minH="100vh" bg={colorMode === "light" ? "gray.50" : "gray.900"}>
      {/* ================= SIDEBAR ================= */}
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
            <Heading size="md" mb={2}>
              AdminPanel
            </Heading>
          </ChakraLink>
          <Divider />
          {sidebarItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              justifyContent="flex-start"
              colorScheme="green"
              fontWeight="medium"
              _hover={{
                bg: colorMode === "light" ? "green.50" : "green.700",
              }}
              _active={{
                bg: colorMode === "light" ? "green.100" : "green.600",
              }}
              onClick={() => setSelectedMenu(item.key)}
            >
              {item.name}
            </Button>
          ))}
        </VStack>
      </Box>

      {/* ================= MOBILE SIDEBAR ================= */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <ChakraLink as={Link} href="/" _hover={{ textDecoration: "none" }}>
              AdminPanel
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
                  fontWeight="medium"
                  _hover={{
                    bg: colorMode === "light" ? "green.50" : "green.700",
                  }}
                  _active={{
                    bg: colorMode === "light" ? "green.100" : "green.600",
                  }}
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

      {/* ================= MAIN CONTENT ================= */}
      <Flex flex="1" direction="column">
        {/* ================= TOPBAR ================= */}
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
          />
          <Heading size="md">Halo, {user.username}</Heading>
          <Spacer />
          <Text
            mr={4}
            fontSize="sm"
            color={colorMode === "light" ? "gray.600" : "gray.300"}
          >
            {currentTime.toLocaleString()}
          </Text>
          <Button colorScheme="red" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </Flex>

        {/* ================= CONTENT ================= */}
        <Box p={{ base: 4, md: 6 }} flex="1" overflowY="auto">
          <VStack spacing={6} align="stretch">
            {renderContent()}
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
}
