"use client";

import {
  Box,
  Flex,
  Heading,
  Button,
  HStack,
  Badge,
  useColorMode,
  useToast,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useDisclosure,
  Tooltip,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { mobileAndTabletPadding } from "../../utils/responsive";
import { isMobileCard, isTabletCard, isDesktopCard } from "../../utils/responsiveCard";
import { useLanguageContext } from "../../context/LanguageContext";
import en from "../../locales/en.json";
import id from "../../locales/id.json";

import AdminSuspendDrawer from "../../components/AdminSuspendDrawer";

const translations = { en, id };
const backendUrl = process.env.NEXT_PUBLIC_API_URL;

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export default function SellerUsers() {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const router = useRouter();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { isOpen: drawerOpen, onOpen: openDrawer, onClose: closeDrawer } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const isAdminUser = currentUser?.type === "admin" || currentUser?.email === "admin@mogehub.com";

  const fetchUsers = async () => {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      toast({ title: "Session berakhir, login dulu bro!", status: "error" });
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          toast({ title: "Session berakhir, login dulu bro!", status: "error" });
          router.push("/login");
        }
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
    } catch (err) {
      toast({ title: t.error || "Error", description: err.message, status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setCurrentUser(JSON.parse(userStr));
    fetchUsers();
  }, []);

  const isOnline = (lastLoginAt) => {
    if (!lastLoginAt) return false;
    const diff = Date.now() - new Date(lastLoginAt).getTime();
    return diff < 5 * 60 * 1000;
  };

  const toggleSuspend = async (userId, suspend) => {
    const token = getAuthToken();
    if (!token) {
      toast({ title: "Session berakhir, login dulu bro!", status: "error" });
      router.push("/login");
      return;
    }

    if (suspend) {
      const user = users.find(u => u.id === userId);
      setSelectedUser(user);
      openDrawer();
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/admin/users/${userId}/suspend`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          toast({ title: "Session berakhir, login dulu bro!", status: "error" });
          router.push("/login");
        }
        throw new Error("Failed to unsuspend user");
      }

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isSuspended: false } : u));
      toast({ title: t.success || "Success", description: t.userUnsuspended || "User unsuspended", status: "success" });
    } catch (err) {
      toast({ title: t.error || "Error", description: err.message, status: "error" });
    }
  };

  const handleUserSuspended = (updatedUser) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
  };

  const getStatusBadge = (isSuspended) => (
    isSuspended ? <Badge colorScheme="red">{t.suspended || "Suspended"}</Badge>
                : <Badge colorScheme="green">{t.active || "Active"}</Badge>
  );

  const getOnlineBadge = (lastLoginAt) => (
    isOnline(lastLoginAt) ? <Badge colorScheme="green">{t.online || "Online"}</Badge>
                           : <Badge colorScheme="gray">{t.offline || "Offline"}</Badge>
  );

  const filterUsers = (items) => items.filter(u => {
    const q = searchQuery.toLowerCase();
    const username = (u.username || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const status = u.isSuspended ? "suspended" : "active";
    return (username.includes(q) || email.includes(q)) && (statusFilter ? status === statusFilter : true);
  });

  const paginateUsers = (items) => {
    const filtered = filterUsers(items);
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return { paginated: filtered.slice(start, start + ITEMS_PER_PAGE), totalPages };
  };

  const { paginated, totalPages } = paginateUsers(users);
  const totalActive = users.filter(u => !u.isSuspended).length;
  const totalSuspended = users.filter(u => u.isSuspended).length;

  const renderDesktopTable = () => (
    <Box overflowX="auto" w="100%">
      <Box as="table" minWidth="900px" width="100%" borderWidth="1px" borderColor={colorMode === "light" ? "gray.300" : "gray.600"} borderRadius="md" sx={{ borderCollapse: "collapse" }}>
        <Box as="thead" display="table-header-group" bg={colorMode === "light" ? "gray.100" : "gray.700"}>
          <Box as="tr" display="table-row">
            <Box as="th" p={3} textAlign="left">No</Box>
            <Box as="th" p={3} textAlign="left">{t.username || "Username"}</Box>
            <Box as="th" p={3} textAlign="left">{t.email || "Email"}</Box>
            <Box as="th" p={3} textAlign="left">{t.tableLogin || "Login"}</Box>
            <Box as="th" p={3} textAlign="left">{t.lastLogin || "Last Login"}</Box>
            <Box as="th" p={3} textAlign="left">{t.online || "Online"}</Box>
            <Box as="th" p={3} textAlign="left">{t.status || "Status"}</Box>
            <Box as="th" p={3} textAlign="left">{t.action || "Action"}</Box>
          </Box>
        </Box>
        <Box as="tbody" display="table-row-group">
          {paginated.map((user, idx) => (
            <Box as="tr" key={user.id} borderTop="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.600"} _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.800" }}>
              <Box as="td" p={3}>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</Box>
              <Box as="td" p={3}>{user.username}</Box>
              <Box as="td" p={3}>{user.email}</Box>
              <Box as="td" p={3}><Badge colorScheme="purple">{user.loginMethod || "Manual"}</Badge></Box>
              <Box as="td" p={3}>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "-"}</Box>
              <Box as="td" p={3}>{getOnlineBadge(user.lastLoginAt)}</Box>
              <Box as="td" p={3}>{getStatusBadge(user.isSuspended)}</Box>
              <Box as="td" p={3}>
                <Tooltip label={!isAdminUser ? "Admin only" : ""} hasArrow>
                  <Button size="sm" colorScheme={isAdminUser ? (user.isSuspended ? "green" : "red") : "gray"} onClick={() => toggleSuspend(user.id, !user.isSuspended)} isDisabled={!isAdminUser}>
                    {user.isSuspended ? (t.unsuspend || "Unsuspend") : (t.suspend || "Suspend")}
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );

  const renderMobileCards = () => (
    <Box display="flex" flexDirection="column" gap={4}>
      {paginated.map((user, idx) => (
        <Box key={user.id} p={isMobileCard() ? 4 : isTabletCard() ? 5 : 6} borderWidth="1px" borderRadius="md" shadow={isMobileCard() ? "md" : "sm"}>
          <Flex justify="space-between" mb={2} align="center">
            <Text fontWeight="bold" fontSize={isMobileCard() ? "md" : "lg"}>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}. {user.username}</Text>
            <Box>{getStatusBadge(user.isSuspended)}</Box>
          </Flex>
          <Text mb={1}><b>Email:</b> {user.email}</Text>
          <Text mb={1}><b>Login:</b> {user.loginMethod || "Manual"}</Text>
          <Text mb={1}><b>Last Login:</b> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "-"}</Text>
          <Text mb={2}><b>Online:</b> {getOnlineBadge(user.lastLoginAt)}</Text>
          <Tooltip label={!isAdminUser ? "Admin only" : ""} hasArrow>
            <Button size="sm" w="full" colorScheme={isAdminUser ? (user.isSuspended ? "green" : "red") : "gray"} onClick={() => toggleSuspend(user.id, !user.isSuspended)} isDisabled={!isAdminUser}>
              {user.isSuspended ? (t.unsuspend || "Unsuspend") : (t.suspend || "Suspend")}
            </Button>
          </Tooltip>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box p={mobileAndTabletPadding}>
      <Flex justify="space-between" align="center" mb={4} wrap="wrap">
        <Heading size="lg">{t.adminUsers || "User MogeHub"}</Heading>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontSize="sm" color="gray.500">{t.totalUsers || "Total Users"}</Text>
          <Text fontSize="xl" fontWeight="bold">{totalUsers}</Text>
        </Box>
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontSize="sm" color="gray.500">{t.totalActive || "Total Active"}</Text>
          <Text fontSize="xl" fontWeight="bold">{totalActive}</Text>
        </Box>
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Text fontSize="sm" color="gray.500">{t.totalSuspended || "Total Suspended"}</Text>
          <Text fontSize="xl" fontWeight="bold">{totalSuspended}</Text>
        </Box>
      </SimpleGrid>

      <Flex mb={4} gap={2} wrap="wrap">
        <InputGroup flex="1">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input placeholder={t.searchUser || "Search user..."} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
        </InputGroup>

        <Select w={{ base: "150px", md: "200px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">{t.all || "All"}</option>
          <option value="active">{t.active || "Active"}</option>
          <option value="suspended">{t.suspended || "Suspended"}</option>
        </Select>
      </Flex>

      {loading ? <Spinner /> : (
        <>
          {isDesktopCard() ? renderDesktopTable() : renderMobileCards()}

          <HStack mt={4} spacing={2} justify="center">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i} size="sm" colorScheme={i + 1 === currentPage ? "green" : "gray"} onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
            ))}
          </HStack>
        </>
      )}

      <AdminSuspendDrawer isOpen={drawerOpen} onClose={closeDrawer} user={selectedUser} onSuspended={handleUserSuspended} />
    </Box>
  );
}