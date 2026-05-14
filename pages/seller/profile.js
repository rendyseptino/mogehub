"use client";

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
  InputGroup,
  InputRightElement,
  Icon,
  useToast,
  Spinner,
  Divider,
  SimpleGrid,
  Stack,
  Select,
} from "@chakra-ui/react";
import { SmallCloseIcon, EditIcon } from "@chakra-ui/icons";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { CgUnavailable } from "react-icons/cg";
import { useState, useEffect, useRef } from "react";

// ==== IMPORT LOGIN INFO COMPONENT ====
import LoginInfo from "../../components/LoginInfo";
import VerifiedBadge from "../../components/VerifiedBadge";

// ================= IMPORT LANGUAGE CONTEXT =================
import { useLanguageContext } from "../../context/LanguageContext";

import { useUser } from "../../context/UserContext";
import en from "../../locales/en.json";
import id from "../../locales/id.json";
const translations = { en, id };

export default function Profile() {
  const { colorMode } = useColorMode();
  
  const toast = useToast();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  
  const { user: contextUser, login: updateUserContext } = useUser();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [updating, setUpdating] = useState(false);

  

  const [type, setType] = useState("");
  const [tempDealerName, setTempDealerName] = useState("");
  const [showDealerInput, setShowDealerInput] = useState(false);


  // ==================== LIVE CHECK USERNAME STATE ====================
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(null); // "checking", "available", "taken"
  const usernameInputRef = useRef(null);  // Ref ke input username
  const [hasEditedUsername, setHasEditedUsername] = useState(false); // Cek user udah mulai ketik

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
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

      // ===== SET STATE LOKAL =====
      setUser(data);
      setPhone(data.phone || "");
      setType(data.type || "individual");
      if (data.type === "dealer" && !data.dealerName) setShowDealerInput(true);
      if (typeof window !== "undefined") setAvatar(data.profilePhoto || null);

      // sync usernameInput
      if (data.username) setUsernameInput(data.username);

    } catch (err) {
      console.error("Error fetching user:", err);
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
}, [storedUser, toast, t, backendUrl]);



  // ===== VERIFICATION STATE =====
  const [verification, setVerification] = useState(null);
  useEffect(() => {
    if (!storedUser?.id) return;

    async function fetchVerification() {
      try {
        const res = await fetch(`${backendUrl}/seller/verification`, {
          headers: { "x-user-id": storedUser.id },
        });
        if (!res.ok) throw new Error("Failed to fetch verification");
        const data = await res.json();
        setVerification(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchVerification();
  }, [storedUser?.id]);

  // ===== HELPER AVATAR =====
  const getAvatarSrc = (avatar) => {
    if (!avatar) return undefined;
    if (avatar instanceof File && avatar.type.startsWith("image/")) {
      return URL.createObjectURL(avatar);
    }
    if (typeof avatar === "string" && avatar.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      return avatar;
    }
    return undefined;
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

  // ================= LIVE CHECK USERNAME =================
  useEffect(() => {
    if (!editingUsername || !usernameInput.trim()) {
      setUsernameStatus(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setUsernameStatus("checking");
      try {
        const res = await fetch(
          `${backendUrl}/seller/check-username?username=${encodeURIComponent(usernameInput.trim())}`
        );
        const data = await res.json();
        setUsernameStatus(data.available ? "available" : "taken");
      } catch {
        setUsernameStatus("taken");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [usernameInput, editingUsername, backendUrl]);

  // ================= HANDLE UPDATE =================
  const handleUpdate = async () => {
    if (!storedUser?.id) return;

    const hasPhoneChange = phone !== (user.phone || "");
    const hasPasswordChange = password.trim() !== "";
    const hasAvatarChange = avatar instanceof File;
    const hasTypeChange = type !== user.type;
    const hasDealerChange = showDealerInput && tempDealerName.trim() !== "";
    const hasUsernameChange =
      editingUsername && usernameStatus === "available" && usernameInput.trim() !== user.username;

    if (!hasPhoneChange && !hasPasswordChange && !hasAvatarChange && !hasTypeChange && !hasDealerChange && !hasUsernameChange) {
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
      formData.append("type", type);
      if (type === "dealer" && tempDealerName.trim() !== "") formData.append("dealerName", tempDealerName.trim());
      if (hasUsernameChange) formData.append("username", usernameInput.trim());

      if (avatar instanceof File) {
        const originalName = avatar.name.replace(/\.[^/.]+$/, "");
        let extension = avatar.name.split(".").pop();
        if (!extension.match(/(jpg|jpeg|png|heic|webp)/i)) extension = "jpg";
        const safeName = originalName.replace(/[^a-zA-Z0-9-_\.]/g, "_") + "." + extension;
        const safeFile = new File([avatar], safeName, { type: avatar.type });
        formData.append("photo", safeFile);
      }
      

      console.log("===== DEBUG FormData =====");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }
      console.log("==========================");

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

      if (updated.type === "dealer") {
        setShowDealerInput(true);
        setTempDealerName(updated.dealerName || "");
      } else {
        setShowDealerInput(false);
        setTempDealerName("");
      }

      if (typeof window !== "undefined") setAvatar(updated.profilePhoto || null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (updateUserContext) {
        updateUserContext({
          ...updated,
          profilePhoto: updated.profilePhoto
            ? `${process.env.NEXT_PUBLIC_API_URL}${updated.profilePhoto}?t=${Date.now()}`
            : null,
          initials: getInitials(updated.username),
          placeholderBg: getPlaceholderBg(),
        });
      }

      toast({
        title: t.success,
        description: t.profileUpdated,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setEditingUsername(false);
    } catch (err) {
      console.error("Update error:", err);
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

  // ================= HANDLE AVATAR CHANGE =================
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: t.error,
        description: "File harus berupa gambar (jpg/png).",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const originalName = file.name.replace(/\.[^/.]+$/, "");
    let extension = file.name.split(".").pop();
    if (!extension.match(/(jpg|jpeg|png|heic|webp)/i)) extension = "jpg";
    const safeName = originalName.replace(/[^a-zA-Z0-9-_\.]/g, "_") + "." + extension;
    const safeFile = new File([file], safeName, { type: file.type });

    setAvatar(safeFile);
  };

  // ================= HANDLE AVATAR REMOVE =================
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

      if (updateUserContext) {
        updateUserContext({
          ...updated,
          profilePhoto: null,
          initials: getInitials(updated.username),
          placeholderBg: getPlaceholderBg(),
        });
      }

      toast({
        title: t.success,
        description: t.photoRemoved,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Remove photo error:", err);
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

  const avatarSrc = getAvatarSrc(avatar);
  const cardBg = colorMode === "light" ? "white" : "gray.700";
  const borderColor = colorMode === "light" ? "gray.200" : "whiteAlpha.200";
  const labelColor = colorMode === "light" ? "gray.600" : "gray.400";

  return (
    <Box px={{ base: 4, md: 8 }} py={{ base: 4, md: 6 }} flex="1">
      <Box mb={6}>
        <LoginInfo />
      </Box>

      <Stack spacing={1} mb={8}>
        <Heading size="lg">{t.profileSettings}</Heading>
        <Text fontSize="sm" color={labelColor}>
          {t.manageProfileDesc}
        </Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="start">
        {/* LEFT CARD */}
        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded="2xl" p={8} shadow="sm">
          <VStack spacing={6}>
            <Avatar
              size="2xl"
              name={user.username || ""}
              src={avatarSrc}
              bg={!avatarSrc ? "brand.500" : undefined}
              color={!avatarSrc ? "black" : undefined}
            />

            <HStack spacing={2} justify="center">
              <Text fontWeight="semibold" fontSize="lg">
                {user.username}
              </Text>
              <VerifiedBadge show={verification?.status === "approved"} />
            </HStack>

            <Text fontSize="sm" color={labelColor}>
              {user.email}
            </Text>

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

              <input ref={fileInputRef} type="file" id="avatar-upload" style={{ display: "none" }} onChange={handleAvatarChange} />

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
                <Text fontSize="sm" fontWeight="bold" bgGradient="linear(to-r, #3182ce, #e53e3e)" bgClip="text">
                  {t.accountType}
                </Text>

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
                  <Text fontSize="sm" mb={1} color={labelColor}>
                    {t.dealerName}
                  </Text>
                  <Input value={tempDealerName} onChange={(e) => setTempDealerName(e.target.value)} placeholder={t.enterDealerName} />
                </Box>
              )}

              {!showDealerInput && type === "dealer" && user.dealerName && (
                <Flex justify="space-between">
                  <Text fontSize="sm" color={labelColor}>
                    {t.dealerName}
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {user.dealerName}
                  </Text>
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
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontSize="sm" color={labelColor}>
                    {t.username}
                  </Text>
                  <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    if (editingUsername) {
                      // 🔹 Kalau lagi editing, berarti ini Cancel
                      setUsernameInput(user.username || ""); // reset ke username asli
                      setUsernameStatus(null); // reset status live check
                      setHasEditedUsername(false); // reset flag live check
                    } else {
                      // 🔹 Kalau belum editing, ini Edit
                      setHasEditedUsername(false); // siap live check baru
                    }

                    setEditingUsername((v) => !v); // toggle edit mode

                    setTimeout(() => {
                      if (usernameInputRef.current) {
                        usernameInputRef.current.focus();
                        usernameInputRef.current.select(); // select text biar langsung ketik
                      }
                    }, 0);
                  }}
                >
                  {editingUsername ? t.cancel : t.edit}
                </Button>
                </Flex>

                <InputGroup>
                <Input
                  ref={usernameInputRef} // auto-focus
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    setHasEditedUsername(true); // user mulai edit
                  }}
                  isReadOnly={!editingUsername}
                  placeholder={editingUsername && !hasEditedUsername ? usernameInput : ""}
                  _focus={{ borderColor: "#90cdf4", boxShadow: "0 0 0 1px #90cdf4" }}
                />
                <InputRightElement>
                  {editingUsername && hasEditedUsername && usernameInput !== user.username && usernameStatus === "checking" && (
                    <Spinner size="sm" />
                  )}
                  {editingUsername && hasEditedUsername && usernameInput !== user.username && usernameStatus === "available" && (
                    <Icon as={IoIosCheckmarkCircle} color="green.400" />
                  )}
                  {editingUsername && hasEditedUsername && usernameInput !== user.username && usernameStatus === "taken" && (
                    <Icon as={CgUnavailable} color="red.400" />
                  )}
                </InputRightElement>
              </InputGroup>

              {/* Feedback text */}
              {editingUsername && hasEditedUsername && usernameInput !== user.username && usernameStatus === "available" && (
                <Text fontSize="sm" color="green.400" mt={1}>
                  {t.usernameAvailable}
                </Text>
              )}
              {editingUsername && hasEditedUsername && usernameInput !== user.username && usernameStatus === "taken" && (
                <Text fontSize="sm" color="red.400" mt={1}>
                  {t.usernameNotAvailable}
                </Text>
              )}
              {editingUsername && !hasEditedUsername && (
                <Text fontSize="sm" color="gray.400" mt={1}>
                  {t.currentUsername}
                </Text>
              )}
              </Box>

              <Box>
                <Text fontSize="sm" mb={1} color={labelColor}>
                  {t.email}
                </Text>
                <Input value={user.email || ""} isReadOnly _focus={{ borderColor: "#90cdf4", boxShadow: "0 0 0 1px #90cdf4" }} />
              </Box>
            </SimpleGrid>

            <Box>
              <Text fontSize="sm" mb={1} color={labelColor}>
                {t.phoneNumber}
              </Text>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
                _focus={{ borderColor: "#90cdf4", boxShadow: "0 0 0 1px #90cdf4" }}
              />
            </Box>

            <Box>
              <Text fontSize="sm" mb={1} color={labelColor}>
                {t.newPassword}
              </Text>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                type="password"
                _focus={{ borderColor: "#90cdf4", boxShadow: "0 0 0 1px #90cdf4" }}
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