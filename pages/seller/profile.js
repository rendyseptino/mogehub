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
  Select,
} from "@chakra-ui/react";
import { SmallCloseIcon, EditIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef } from "react";

// ==== IMPORT LOGIN INFO COMPONENT ====
import LoginInfo from "../../components/LoginInfo";

// ================= IMPORT LANGUAGE CONTEXT =================
import { useLanguageContext } from "../../context/LanguageContext";
import en from "../../locales/en.json";
import id from "../../locales/id.json";
const translations = { en, id };

export default function Profile({ onUserUpdate }) {
  const { colorMode } = useColorMode();
  const toast = useToast();

  // ================= USE LANGUAGE CONTEXT =================
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [type, setType] = useState(""); 
  const [tempDealerName, setTempDealerName] = useState(""); 
  const [showDealerInput, setShowDealerInput] = useState(false); 

  const backendUrl = process.env.NEXT_PUBLIC_API_URL; // backend local
  const s3BucketUrl = "https://mogehub-uploads.s3.ap-southeast-1.amazonaws.com"; // S3 public URL
  const [storedUser, setStoredUser] = useState(null);
  const fileInputRef = useRef(null);

  // ================= INIT LOCAL STORAGE =================
  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("user");
      setStoredUser(u ? JSON.parse(u) : null);
    }
  }, []);

  // ================= FETCH USER =================
  useEffect(() => {
    if (!storedUser?.id) return;

    async function fetchUser() {
      try {
        const res = await fetch(`${backendUrl}/seller/profile`, {
          headers: { "x-user-id": storedUser.id },
        });

        if (!res.ok) throw new Error(t.error);
        const data = await res.json();

        setUser(data);
        setPhone(data.phone || "");
        setType(data.type || "individual");

        if (data.type === "dealer" && !data.dealerName) setShowDealerInput(true);

        // 🔹 Sesuaikan avatar untuk S3
        if (data.profilePhoto) {
          if (data.profilePhoto.startsWith("s3://")) {
            const path = data.profilePhoto.replace(/^s3:\/\/[^/]+/, "");
            setAvatar(`${s3BucketUrl}${path}`);
          } else if (data.profilePhoto.startsWith("/uploads")) {
            setAvatar(`${backendUrl}${data.profilePhoto}`);
          } else {
            setAvatar(data.profilePhoto);
          }
        } else {
          setAvatar(null);
        }

      } catch (err) {
        console.error(err);
        toast({
          title: t.error,
          description: t.userDataNotFound,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [storedUser, toast, t]);

  // ===== HELPER AVATAR =====
  const getAvatarSrc = (user, avatar) => {
    if (!user) return undefined;
    if (avatar instanceof File) return URL.createObjectURL(avatar);
    return avatar || undefined; 
  };

  const getInitials = (username) => {
    if (!username) return "?";
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getPlaceholderBg = () => "brand.500";

  // ================= HANDLE UPDATE =================
  const handleUpdate = async () => {
    if (!storedUser?.id) return;

    const hasPhoneChange = phone !== (user.phone || "");
    const hasPasswordChange = password.trim() !== "";
    const hasAvatarChange = avatar instanceof File;
    const hasTypeChange = type !== user.type;
    const hasDealerChange = showDealerInput && tempDealerName.trim() !== "";

    if (
      !hasPhoneChange &&
      !hasPasswordChange &&
      !hasAvatarChange &&
      !hasTypeChange &&
      !hasDealerChange
    ) {
      toast({
        title: t.info,
        description: t.noChanges,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (type === "dealer" && showDealerInput && tempDealerName.trim() === "") {
      toast({
        title: t.error,
        description: t.dealerNameRequired,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUpdating(true);

    try {
      const formData = new FormData();
      if (hasPhoneChange) formData.append("phone", phone || "");
      if (hasPasswordChange) formData.append("password", password);
      if (hasAvatarChange) formData.append("photo", avatar);
      if (hasTypeChange) formData.append("type", type);
      if (hasDealerChange) formData.append("dealerName", tempDealerName);

      const res = await fetch(`${backendUrl}/seller/profile`, {
        method: "PATCH",
        headers: { "x-user-id": storedUser.id },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t.error);
      }

      const updated = await res.json();
      setUser(updated);
      setPhone(updated.phone || "");
      setPassword("");
      setType(updated.type || "individual");
      setTempDealerName("");
      setShowDealerInput(false);

      // 🔹 Update avatar sesuai S3
      if (updated.profilePhoto) {
        if (updated.profilePhoto.startsWith("s3://")) {
          const path = updated.profilePhoto.replace(/^s3:\/\/[^/]+/, "");
          setAvatar(`${s3BucketUrl}${path}`);
        } else if (updated.profilePhoto.startsWith("/uploads")) {
          setAvatar(`${backendUrl}${updated.profilePhoto}`);
        } else {
          setAvatar(updated.profilePhoto);
        }
      } else {
        setAvatar(null);
      }

      if (fileInputRef.current) fileInputRef.current.value = "";

      if (onUserUpdate) {
        onUserUpdate({
          ...updated,
          profilePhoto: avatar || null,
          initials: getInitials(updated.username),
          placeholderBg: getPlaceholderBg(),
        });
      }
      localStorage.setItem("user", JSON.stringify(updated));

      toast({
        title: t.success,
        description: t.profileUpdated,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: t.error,
        description: err.message || t.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
  };

  const handleAvatarRemove = async () => {
    if (!storedUser?.id) return;

    setUpdating(true);

    try {
      const formData = new FormData();
      formData.append("removePhoto", "true");

      const res = await fetch(`${backendUrl}/seller/profile`, {
        method: "PATCH",
        headers: { "x-user-id": storedUser.id },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t.error);
      }

      const updated = await res.json();
      setUser(updated);
      setAvatar(null);

      if (fileInputRef.current) fileInputRef.current.value = "";

      if (onUserUpdate) {
        onUserUpdate({
          ...updated,
          profilePhoto: null,
          initials: getInitials(updated.username),
          placeholderBg: getPlaceholderBg(),
        });
      }
      localStorage.setItem("user", JSON.stringify(updated));

      toast({
        title: t.success,
        description: t.photoRemoved,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: t.error,
        description: err.message || t.error,
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
      <Flex minH="240px" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Box p={6}>
        <Text>{t.userDataNotFound}</Text>
      </Box>
    );
  }

  const avatarSrc = getAvatarSrc(user, avatar);

  const cardBg = colorMode === "light" ? "white" : "gray.900";
  const borderColor = colorMode === "light" ? "gray.200" : "whiteAlpha.200";
  const labelColor = colorMode === "light" ? "gray.600" : "gray.400";

  return (
    <Box px={{ base: 4, md: 8 }} py={{ base: 4, md: 6 }} flex="1">
      <Box mb={6}>
        <LoginInfo />
      </Box>

      <Stack spacing={1} mb={8}>
        <Heading size="lg">{t.profileSettings}</Heading>
        <Text fontSize="sm" color={labelColor}>{t.manageProfileDesc}</Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="start">
        {/* LEFT CARD */}
        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded="2xl" p={8} shadow="sm">
          <VStack spacing={6}>
            {/* AVATAR */}
            <Avatar
              size="2xl"
              name={user.username || ""}
              src={avatarSrc}
              bg={!avatarSrc ? "brand.500" : undefined}
              color={!avatarSrc ? "black" : undefined}
            />

            <Stack spacing={1} textAlign="center">
              <Text fontWeight="semibold" fontSize="lg">{user.username}</Text>
              <Text fontSize="sm" color={labelColor}>{user.email}</Text>
            </Stack>

            <HStack>
              <Button
                as="label"
                htmlFor="avatar-upload"
                size="sm"
                variant="outline"
                borderColor="brand.500"
                _hover={{ bg: "brand.50" }}
                leftIcon={<EditIcon />}
                isDisabled={updating}
              >
                {t.changePhoto}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                id="avatar-upload"
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
                  aria-label={t.removePhoto}
                  isLoading={updating}
                />
              )}
            </HStack>

            <Divider />

            <VStack spacing={3} w="full" align="stretch">
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color={labelColor}>{t.accountType}</Text>

                <Select
                  value={type}
                  size="sm"
                  w="32"
                  onChange={(e) => {
                    const val = e.target.value;
                    setType(val);
                    if (val === "dealer" && (!user.dealerName || user.dealerName === "")) setShowDealerInput(true);
                    else setShowDealerInput(false);
                  }}
                  isDisabled={updating}
                >
                  <option value="individual">{t.individual}</option>
                  <option value="dealer">{t.dealer}</option>
                </Select>
              </Flex>

              {showDealerInput && (
                <Box>
                  <Text fontSize="sm" mb={1} color={labelColor}>{t.dealerName}</Text>
                  <Input
                    value={tempDealerName}
                    onChange={(e) => setTempDealerName(e.target.value)}
                    placeholder={t.enterDealerName}
                  />
                </Box>
              )}

              {!showDealerInput && type === "dealer" && user.dealerName && (
                <Flex justify="space-between">
                  <Text fontSize="sm" color={labelColor}>{t.dealerName}</Text>
                  <Text fontSize="sm" fontWeight="medium">{user.dealerName}</Text>
                </Flex>
              )}
            </VStack>
          </VStack>
        </Box>

        {/* RIGHT CARD */}
        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded="2xl" p={{ base: 6, md: 8 }} shadow="sm">
          <Stack spacing={6}>
            <Heading size="md">{t.accountInfo}</Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              <Box>
                <Text fontSize="sm" mb={1} color={labelColor}>{t.username}</Text>
                <Input
                  value={user.username || ""}
                  isReadOnly
                  _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                />
              </Box>

              <Box>
                <Text fontSize="sm" mb={1} color={labelColor}>{t.email}</Text>
                <Input
                  value={user.email || ""}
                  isReadOnly
                  _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
                />
              </Box>
            </SimpleGrid>

            <Box>
              <Text fontSize="sm" mb={1} color={labelColor}>{t.phoneNumber}</Text>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
                _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
              />
            </Box>

            <Box>
              <Text fontSize="sm" mb={1} color={labelColor}>{t.newPassword}</Text>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                type="password"
                _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
              />
            </Box>

            <Flex justify="flex-end" pt={2}>
              <Button
                bg="brand.500"
                color="black"
                _hover={{ bg: "brand.600" }}
                _active={{ bg: "brand.600" }}
                px={8}
                onClick={handleUpdate}
                isLoading={updating}
              >
                {t.saveChanges}
              </Button>
            </Flex>
          </Stack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
