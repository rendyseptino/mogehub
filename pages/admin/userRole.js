"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  VStack,
  HStack,
  useToast,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Tooltip,
  useDisclosure,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import { FaRegUser } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

import { isMobileCard } from "../../utils/responsiveCard";
import { MdMarkEmailUnread } from "react-icons/md";
import DotLoader from "../../components/DotLoader"; 
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };


const ROLE_OPTIONS = [
  "user",
  "moderator",
  "admin",
  "editor",
  "staff_verifikasi",
  "staff_iklan",
];
const ITEMS_PER_PAGE = 8;

export default function UserRolePage() {
  const toast = useToast();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [loadingButton, setLoadingButton] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("user");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const isAdminUser = currentUser?.type === "admin" || currentUser?.email === "admin@mogehub.com";

  const getRoleOptionsByCurrentUser = () => {
  if (!currentUser) return [];

  const role = currentUser.type;

  if (currentUser.email === "admin@mogehub.com" || role === "admin") {
    return ["user", "moderator", "admin", "editor", "staff_verifikasi", "staff_iklan"];
  }

  if (role === "moderator") {
    return ["user", "moderator"];
  }

  if (role === "editor") {
    return ["user", "editor", "staff_verifikasi", "staff_iklan", "moderator"];
  }

  if (role === "staff_verifikasi") {
    return ["user", "moderator", "staff_verifikasi"];
  }

  if (role === "staff_iklan") {
    return ["user", "moderator", "staff_iklan"];
  }

  return ["user"];
};

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, []);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const fetchUsers = async () => {
    const token = getToken();
    if (!token) return (window.location.href = "/login");

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed fetch");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast({ title: t.toast_fetch_failed_users, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async () => {
  if (!email || !username || (!editingUser && !password)) {
    toast({ title: t.toast_required_fields, status: "warning" });
    return;
  }

  if (!ROLE_OPTIONS.includes(type)) {
    toast({ title: t.toast_invalid_role, status: "warning" });
    return;
  }

  const token = getToken();
  if (!token) return (window.location.href = "/login");

  const payload = {
    email,
    username,
    // 🔥 Force 'individual' untuk semua user biasa
    type: type === "user" ? "individual" : type,
  };

  if (!editingUser) payload.password = password;

  try {
    let res;

    if (editingUser) {
      res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/roles/${editingUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
    } else {
      res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/roles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
    }

    // 🔥 HANDLE 401 (ANTI SESSION DROP)
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    // 🔥 SAFE JSON PARSE (BIAR GA CRASH)
    let data;
    try {
      data = await res.json();
    } catch {
      data = { message: "Invalid server response" };
    }

    // 🔥 HANDLE ERROR RESPONSE
    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }

    // ✅ SUCCESS
    toast({
      title: editingUser ? t.toast_user_updated : t.toast_user_created,
      status: "success",
    });

    setEmail("");
    setUsername("");
    setPassword("");
    setType("user");
    setEditingUser(null);
    onClose();
    fetchUsers();
  } catch (err) {
    console.error("SUBMIT ERROR:", err);

    toast({
      title: err.message || "Something went wrong",
      status: "error",
    });
  }
};
  const handleDelete = async (id) => {
  if (!confirm("Are you sure to delete this user?")) return;

  const token = getToken();
  if (!token) return (window.location.href = "/login");

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/roles/hard/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // 🔥 HANDLE 401 (ANTI SESSION DROP)
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }

    // 🔥 SAFE JSON PARSE
    let data;
    try {
      data = await res.json();
    } catch {
      data = { message: "Invalid server response" };
    }

    // 🔥 HANDLE ERROR RESPONSE
    if (!res.ok) {
      throw new Error(data.message || "Delete failed");
    }

    // ✅ SUCCESS
    toast({
      title: t.toast_user_deleted,
      status: "success",
    });

    fetchUsers();
  } catch (err) {
    console.error("DELETE ERROR:", err);

    toast({
      title: err.message || "Something went wrong",
      status: "error",
    });
  }
};
  const openEditModal = (user) => {
    setEditingUser(user);
    setEmail(user.email);
    setUsername(user.username);
    setType(user.type === "individual" ? "user" : user.type);
    onOpen();
  };

  const filteredUsers = users.filter(
    (u) => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const bgTable = useColorModeValue("gray.100", "gray.700");
  const logoSrc = useColorModeValue("/mogehubmasterlight.png", "/mogehubmasterdark.png");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const buttonBg = useColorModeValue("#90cdf4", "brand.500"); 
  const buttonColor = "black"; 

  const renderUsers = () => {
    if (isMobileCard()) {
      return (
        <VStack spacing={4} align="stretch">
          {paginatedUsers.map((user, idx) => (
            <Box key={user.id} borderWidth="1px" borderRadius="md" p={4} shadow="sm">
              <Text fontWeight="bold">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}. {user.username}</Text>
              <Text>Email: {user.email}</Text>
              <Text>{t.table_role}: {user.type}</Text>
              <HStack spacing={2} mt={2}>
                <Tooltip label={!isAdminUser ? "Admin only" : ""} hasArrow>
                  <Button size="sm" colorScheme={isAdminUser ? "yellow" : "gray"} onClick={() => openEditModal(user)} isDisabled={!isAdminUser}>
                    Edit
                  </Button>
                </Tooltip>
                <Tooltip label={!isAdminUser ? "Admin only" : ""} hasArrow>
                  <Button size="sm" colorScheme={isAdminUser ? "red" : "gray"} onClick={() => handleDelete(user.id)} isDisabled={!isAdminUser}>
                    Delete
                  </Button>
                </Tooltip>
              </HStack>
            </Box>
          ))}

          {/* Pagination */}
          <Flex justify="center" mt={4} gap={2} flexWrap="wrap">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button key={i} size="sm" colorScheme={i + 1 === currentPage ? "blue" : "gray"} onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </Button>
            ))}
          </Flex>
        </VStack>
      );
    }

    return (
      <Box overflowX="auto">
        <Box as="table" width="full" borderWidth="1px" borderRadius="md">
          <Box as="thead" bg={bgTable}>
            <Box as="tr">
              <Box as="th" textAlign="left" p={2}>{t.table_no}</Box>
              <Box as="th" textAlign="left" p={2}>{t.table_username}</Box>
              <Box as="th" textAlign="left" p={2}>{t.table_email}</Box>
              <Box as="th" textAlign="left" p={2}>{t.table_role}</Box>
              <Box as="th" textAlign="left" p={2}>{t.table_actions}</Box>
            </Box>
          </Box>
          <Box as="tbody">
            {paginatedUsers.map((user, idx) => (
              <Box as="tr" key={user.id} borderTop="1px solid" borderColor="gray.200">
                <Box as="td" p={2}>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</Box>
                <Box as="td" p={2}>{user.username}</Box>
                <Box as="td" p={2}>{user.email}</Box>
                <Box as="td" p={2}>{user.type}</Box>
                <Box as="td" p={2}>
                  <HStack spacing={2}>
                    <Tooltip label={!isAdminUser ? "Admin only" : ""} hasArrow>
                      <Button size="sm" colorScheme={isAdminUser ? "yellow" : "gray"} onClick={() => openEditModal(user)} isDisabled={!isAdminUser}>
                        Edit
                      </Button>
                    </Tooltip>
                    <Tooltip label={!isAdminUser ? "Admin only" : ""} hasArrow>
                      <Button size="sm" colorScheme={isAdminUser ? "red" : "gray"} onClick={() => handleDelete(user.id)} isDisabled={!isAdminUser}>
                        Delete
                      </Button>
                    </Tooltip>
                  </HStack>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Pagination */}
        <Flex justify="center" mt={4} gap={2} flexWrap="wrap">
          {Array.from({ length: totalPages }, (_, i) => (
            <Button key={i} size="sm" colorScheme={i + 1 === currentPage ? "blue" : "gray"} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </Button>
          ))}
        </Flex>
      </Box>
    );
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={2} flexWrap="wrap" gap={2}>
        <Heading size="md">{t.user_role_title}</Heading>
        <Button
          leftIcon={<FaRegUser />}
          colorScheme="blue"
          h="40px"
          onClick={() => { setEditingUser(null); onOpen(); }}
        >
           {t.user_add_button}
        </Button>
      </Flex>

      {/* Search Bar */}
      <Box mb={4}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray" />
          </InputLeftElement>
          <Input
            placeholder={t.user_search_placeholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            size="md"
            width={isMobileCard() ? "100%" : "300px"}
            h="40px"
            fontSize={isMobileCard() ? "16px" : "sm"}
            autoComplete="off"
            inputMode="search"
          />
        </InputGroup>
      </Box>

      {loading ? <Flex justify="center" py={10}><Spinner size="xl" /></Flex> : renderUsers()}

      {/* MODAL ADD/EDIT */}
<Modal isOpen={isOpen} onClose={onClose} size="xl">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader display="flex" justifyContent="center" pb={2}>
      <Image src={logoSrc} alt="Logo" h="60px" />
    </ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <VStack spacing={4} align="stretch">
        <Box>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t.user_input_username_placeholder}
        />
        <Text fontSize="sm" color={textColor} mt={1}>
              {t.user_input_username_help}
        </Text>
        </Box>
        <Box>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.user_input_email_placeholder}
        />
        <Text fontSize="sm" color={textColor} mt={1}>
             {t.user_input_email_help}
        </Text>
        </Box>

        {!editingUser && (
          <Box>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.user_input_password_placeholder}
            />
            <Text fontSize="sm" color={textColor} mt={1}>
             {t.user_input_password_help}
            </Text>
          </Box>
        )}

        {/* Dropdown Role dengan label */}
        <Box>
          <Text fontWeight="semibold" mb={1}>
            {t.user_type_label}
          </Text>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {getRoleOptionsByCurrentUser().map((r) => (
              <option key={r} value={r}>
                {r === "user"
                  ? "User"
                  : r === "staff_verifikasi"
                  ? "Staff Verifikasi"
                  : r === "staff_iklan"
                  ? "Staff Iklan"
                  : r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </Select>

          {/* Deskripsi dinamis */}
          {type === "user" && (
            <Text fontSize="sm" color={textColor} mt={1}>
              {t.role_desc_user}
            </Text>
          )}
          {type === "moderator" && (
            <Text fontSize="sm" color={textColor} mt={1}>
              {t.role_desc_moderator}
            </Text>
          )}
          {type === "editor" && (
          <Text fontSize="sm" color={textColor} mt={1}>
            {t.role_desc_editor}
          </Text>
        )}

        {type === "staff_verifikasi" && (
          <Text fontSize="sm" color={textColor} mt={1}>
            {t.role_desc_staff_verification}
          </Text>
        )}

        {type === "staff_iklan" && (
          <Text fontSize="sm" color={textColor} mt={1}>
            {t.role_desc_staff_ads}
          </Text>
        )}
        </Box>
      </VStack>
    </ModalBody>

        <ModalFooter>
        <Button
          leftIcon={<MdMarkEmailUnread />}
          bg={buttonBg}
          color={buttonColor}
          _hover={{ bg: buttonBg }} // supaya hover tetap sama
          mr={3}
          onClick={async () => {
            setLoadingButton(true); // start dot loader
            try {
              await handleSubmit();
            } finally {
              setLoadingButton(false); // stop dot loader
            }
          }}
        >
          {loadingButton ? <DotLoader size={18} /> : editingUser ? t.button_update : t.button_give_access}
        </Button>

        <Button variant="ghost" onClick={onClose}>
          {t.button_cancel}
        </Button>
      </ModalFooter>
  </ModalContent>
</Modal>
    </Box>
  );
}