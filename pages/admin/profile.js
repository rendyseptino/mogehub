import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Avatar,
  IconButton,
  useColorMode,
  useToast,
  Spinner,
  Divider,
  SimpleGrid,
  Stack,
  Badge,
} from "@chakra-ui/react";
import { SmallCloseIcon, EditIcon, LockIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef } from "react";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

export default function AdminProfile() {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  const [storedAdmin, setStoredAdmin] = useState(null);

  const fileInputRef = useRef(null);

  // ================= INIT LOCAL STORAGE =================
  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("user");
      setStoredAdmin(u ? JSON.parse(u) : null);
    }
  }, []);

  // ================= FETCH ADMIN =================
  useEffect(() => {
    if (!storedAdmin?.id) {
      setLoading(false);
      return;
    }

    const fetchAdmin = async () => {
      try {
        const res = await fetch(`${backendUrl}/admin/profile`, {
          headers: {
            "x-admin-id": storedAdmin.id,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch admin");

        const data = await res.json();

        setAdmin(data);
        setAvatar(data.profilePhoto || null);
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Gagal load profile admin",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [storedAdmin, toast]);

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (!storedAdmin?.id) return;

    if (!password && !(avatar instanceof File)) {
      toast({
        title: t.common_info,
        description: t.admin_profile_no_changes,
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setUpdating(true);

    try {
      const formData = new FormData();

      if (password && password.trim() !== "") {
        formData.append("password", password);
      }

      if (avatar instanceof File) {
        formData.append("photo", avatar);
      }

      const res = await fetch(`${backendUrl}/admin/profile`, {
        method: "PATCH",
        headers: {
          "x-admin-id": storedAdmin.id,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t.admin_profile_failed_update);
      }

      const updated = await res.json();
      setAdmin(updated);
      setPassword("");

      setAvatar(updated.profilePhoto || null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: t.common_success,
        description: t.admin_profile_updated,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || t.admin_profile_failed_update,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  // ================= AVATAR CHANGE =================
  const handleAvatarChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    // bersihin input biar user bisa pilih ulang
    if (fileInputRef.current) fileInputRef.current.value = "";

    // panggil toast
    toast({
      title: t.admin_profile_invalid_format,
      description: t.admin_profile_invalid_format_desc,
      status: "warning",
      duration: 3000,
      isClosable: true,
    });

    return; // stop eksekusi
  }

  // revoke URL lama biar nggak memory leak
  if (avatarPreview) URL.revokeObjectURL(avatarPreview);

  setAvatar(file); // untuk save nanti
  setAvatarPreview(URL.createObjectURL(file)); // untuk preview tanpa kedip
};

  // ================= REMOVE AVATAR =================
  const handleAvatarRemove = async () => {
    if (!storedAdmin?.id) return;

    setUpdating(true);

    try {
      const formData = new FormData();
      formData.append("removePhoto", "true");

      const res = await fetch(`${backendUrl}/admin/profile`, {
        method: "PATCH",
        headers: {
          "x-admin-id": storedAdmin.id,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t.admin_profile_failed_remove_photo);
      }

      const updated = await res.json();

      setAdmin(updated);
      setAvatar(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: t.common_success,
        description: t.admin_profile_photo_removed,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: t.common_error,
        description: err.message ||  t.admin_profile_failed_remove_photo,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Flex minH="260px" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!admin) {
    return (
      <Box p={6}>
        <Text>{t.admin_profile_not_found}</Text>
      </Box>
    );
  }

  const avatarSrc = avatarPreview || (avatar instanceof File ? URL.createObjectURL(avatar) : avatar) || undefined;

  const ROLE_LABELS = {
    individual: "User",
    moderator: "Moderator",
    admin: "Admin",
    editor: "Editor",
    staff_verifikasi: "Staff Verifikasi",
    staff_iklan: "Staff Iklan",
  };

  const cardBg = colorMode === "light" ? "white" : "gray.900";
  const borderColor = colorMode === "light" ? "gray.200" : "whiteAlpha.200";
  const labelColor = colorMode === "light" ? "gray.600" : "gray.400";

  return (
    <Box px={{ base: 4, md: 8 }} py={{ base: 4, md: 6 }} flex="1">
      <Stack spacing={1} mb={8}>
        <Heading size="lg">{t.admin_profile_title}</Heading>
        <Text fontSize="sm" color={labelColor}>
          {t.admin_profile_subtitle}
        </Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="start">
        {/* LEFT CARD */}
        <Box
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          rounded="2xl"
          p={8}
          shadow="sm"
        >
          <VStack spacing={6}>
            <Avatar
              size="2xl"
              name={admin.username || admin.email || "A"}
              src={avatarSrc}
            />

            <Stack spacing={1} textAlign="center">
              <Text fontWeight="semibold" fontSize="lg">
                {admin.username || "Administrator"}
              </Text>
              <Text fontSize="sm" color={labelColor}>
                {admin.email}
              </Text>
            </Stack>

            <HStack>
              <Button
                as="label"
                htmlFor="admin-avatar-upload"
                size="sm"
                variant="outline"
                borderColor="brand.500"
                _hover={{ bg: "brand.50" }}
                leftIcon={<EditIcon />}
                isDisabled={updating}
              >
                {t.admin_profile_change_photo}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                id="admin-avatar-upload"
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleAvatarChange}
              />

              {avatar && (
                <IconButton
                  icon={<SmallCloseIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={handleAvatarRemove}
                  aria-label={t.admin_profile_remove_avatar}
                  isLoading={updating}
                />
              )}
            </HStack>

            <Divider />

            <VStack spacing={3} w="full" align="stretch">
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color={labelColor}>
                 {t.admin_profile_role}
                </Text>

                <Badge
                  px={3}
                  py={1}
                  rounded="full"
                  bg="brand.500"
                  color="black"
                  fontWeight="semibold"
                >
                  {ROLE_LABELS[admin.type] || t.common_unknown}
                </Badge>
              </Flex>
            </VStack>
          </VStack>
        </Box>

        {/* RIGHT CARD */}
        <Box
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          rounded="2xl"
          p={{ base: 6, md: 8 }}
          shadow="sm"
        >
          <Stack spacing={6}>
            <Heading size="md">{t.admin_profile_account_security}</Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              <Box>
                <Text fontSize="sm" mb={1} color={labelColor}>
                  {t.common_email}
                </Text>
                <Input value={admin.email || ""} isReadOnly />
              </Box>
            </SimpleGrid>

            <Box>
              <Text fontSize="sm" mb={1} color={labelColor}>
               {t.admin_profile_new_password}
              </Text>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.admin_profile_new_password_placeholder}
                type="password"
              />
            </Box>

            <Flex justify="flex-end" pt={2}>
              <Button
                leftIcon={<LockIcon />}
                bg="brand.500"
                color="black"
                _hover={{ bg: "brand.600" }}
                _active={{ bg: "brand.600" }}
                px={8}
                onClick={handleUpdate}
                isLoading={updating}
              >
               {t.common_save}
              </Button>
            </Flex>
          </Stack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

