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

export default function AdminProfile() {
  const { colorMode } = useColorMode();
  const toast = useToast();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [updating, setUpdating] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  const [storedAdmin, setStoredAdmin] = useState(null);

  const fileInputRef = useRef(null);

  // ================= INIT LOCAL STORAGE =================
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 🔴 FIX UTAMA → samakan dengan AdminDashboard
      const u = localStorage.getItem("user");
      setStoredAdmin(u ? JSON.parse(u) : null);
    }
  }, []);

  // ================= FETCH ADMIN =================
  useEffect(() => {
    if (!storedAdmin?.id) {
      // 🔴 supaya spinner tidak muter selamanya
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

        if (data.profilePhoto) {
          setAvatar(`${backendUrl}${data.profilePhoto}`);
        } else {
          setAvatar(null);
        }
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
        title: "Info",
        description: "Tidak ada perubahan",
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
        throw new Error(err.message || "Gagal update profile");
      }

      const updated = await res.json();

      setAdmin(updated);
      setPassword("");

      if (updated.profilePhoto) {
        setAvatar(`${backendUrl}${updated.profilePhoto}`);
      } else {
        setAvatar(null);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Berhasil",
        description: "Profile admin berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Gagal update profile",
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
    setAvatar(file);
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
        throw new Error(err.message || "Gagal hapus foto");
      }

      const updated = await res.json();

      setAdmin(updated);
      setAvatar(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Berhasil",
        description: "Foto profil berhasil dihapus",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Gagal hapus foto",
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
        <Text>Data admin tidak ditemukan.</Text>
      </Box>
    );
  }

  const avatarSrc =
    avatar instanceof File
      ? URL.createObjectURL(avatar)
      : avatar || undefined;

  const cardBg = colorMode === "light" ? "white" : "gray.900";
  const borderColor = colorMode === "light" ? "gray.200" : "whiteAlpha.200";
  const labelColor = colorMode === "light" ? "gray.600" : "gray.400";

  return (
    <Box px={{ base: 4, md: 8 }} py={{ base: 4, md: 6 }} flex="1">
      <Stack spacing={1} mb={8}>
        <Heading size="lg">Profil Admin</Heading>
        <Text fontSize="sm" color={labelColor}>
          Kelola keamanan akun administrator
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
              name={admin.email || ""}
              src={avatarSrc}
            />

            <Stack spacing={1} textAlign="center">
              <Text fontWeight="semibold" fontSize="lg">
                Administrator
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
                Ganti foto
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
                  aria-label="remove avatar"
                  isLoading={updating}
                />
              )}
            </HStack>

            <Divider />

            <VStack spacing={3} w="full" align="stretch">
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color={labelColor}>
                  Role
                </Text>

                <Badge
                  px={3}
                  py={1}
                  rounded="full"
                  bg="brand.50"
                  color="brand.500"
                  fontWeight="semibold"
                >
                  ADMIN
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
            <Heading size="md">Keamanan Akun</Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              <Box>
                <Text fontSize="sm" mb={1} color={labelColor}>
                  Email
                </Text>
                <Input value={admin.email || ""} isReadOnly />
              </Box>
            </SimpleGrid>

            <Box>
              <Text fontSize="sm" mb={1} color={labelColor}>
                Password baru
              </Text>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password baru"
                type="password"
              />
            </Box>

            <Flex justify="flex-end" pt={2}>
              <Button
                leftIcon={<LockIcon />}
                bg="brand.500"
                color="white"
                _hover={{ bg: "brand.600" }}
                _active={{ bg: "brand.600" }}
                px={8}
                onClick={handleUpdate}
                isLoading={updating}
              >
                Simpan perubahan
              </Button>
            </Flex>
          </Stack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
