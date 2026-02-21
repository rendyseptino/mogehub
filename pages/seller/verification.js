// components/verification.js
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
  Divider,
  Badge,
  useColorMode,
  useToast,
  Spinner,
  SimpleGrid,
  IconButton,
  Image,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { SmallCloseIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef } from "react";

// ================= IMPORT LANGUAGE CONTEXT =================
import { useLanguageContext } from "../../context/LanguageContext";
import en from "../../locales/en.json";
import id from "../../locales/id.json";

const translations = { en, id };

export default function Verification() {
  const { colorMode } = useColorMode();
  const toast = useToast();

  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [user, setUser] = useState(null);
  const [verification, setVerification] = useState(null);
  const [ktpFile, setKtpFile] = useState(null);
  const [supportFiles, setSupportFiles] = useState([]);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  const ktpInputRef = useRef(null);
  const supportInputRef = useRef(null);

  // ================= INIT USER =================
  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
    }
  }, []);

  // ================= FETCH LATEST PROFILE & VERIFICATION =================
  useEffect(() => {
    if (!user?.id) return;

    async function fetchData() {
      try {
        const profileRes = await fetch(`${backendUrl}/seller/profile`, {
          headers: { "x-user-id": user.id },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData);
          localStorage.setItem("user", JSON.stringify(profileData));
        }

        const verRes = await fetch(`${backendUrl}/seller/verification`, {
          headers: { "x-user-id": user.id },
        });
        if (verRes.ok) {
          const verData = await verRes.json();
          setVerification(verData || null);
          if (verData?.youtubeLink) setYoutubeLink(verData.youtubeLink);
          setSupportFiles(Array.isArray(verData?.supportFiles) ? verData.supportFiles : []);
        }
      } catch (err) {
        console.error(err);
        toast({
          title: t.error || "Error",
          description: err.message || t.failedLoadData || "Gagal load data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user?.id, toast, t]);

  // ================= HANDLE FILES =================
  const handleKtpChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setKtpFile(file);
  };

  const handleSupportChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSupportFiles((prev) => [...prev, ...files]);
  };

  const removeSupportFile = (index) => {
    setSupportFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerSupportInput = () => {
    if (supportInputRef.current) supportInputRef.current.click();
  };

  // ================= SUBMIT VERIFICATION =================
  const handleSubmit = async () => {
    if (!user?.id) return;

    if (!ktpFile) {
      toast({
        title: t.wait || "Wait a minute",
        description: t.ktpRequired || "KTP / SIM wajib di-upload",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("document", ktpFile);
      formData.append("youtubeLink", youtubeLink || "");
      supportFiles.forEach((file) => formData.append("supportFiles", file));

      const res = await fetch(`${backendUrl}/seller/verification`, {
        method: verification ? "PATCH" : "POST",
        headers: { "x-user-id": user.id },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t.failedSubmit || "Gagal submit verifikasi");
      }

      const updated = await res.json();
      setVerification(updated);
      setSupportFiles(Array.isArray(updated?.supportFiles) ? updated.supportFiles : []);

      toast({
        title: t.success || "Berhasil",
        description: t.verificationSent || "Data verifikasi berhasil dikirim, silakan cek email secara berkala",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setKtpFile(null);
      if (ktpInputRef.current) ktpInputRef.current.value = "";
      if (supportInputRef.current) supportInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast({
        title: t.error || "Error",
        description: err.message || t.failedSubmit || "Gagal submit verifikasi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Flex minH="240px" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge colorScheme="yellow">{t.pending || "Pending"}</Badge>;
      case "approved":
        return <Badge colorScheme="green">{t.verified || "Verified"}</Badge>;
      case "rejected":
        return <Badge colorScheme="red">{t.rejected || "Ditolak"}</Badge>;
      default:
        return <Badge colorScheme="gray">{t.notVerified || "Belum Verifikasi"}</Badge>;
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Heading size="lg" mb={4}>{t.accountVerification || "Verifikasi Akun"}</Heading>

      <Text mb={6} color={colorMode === "light" ? "gray.600" : "gray.300"}>
        {t.verificationDesc || "Upload dokumen KTP / SIM, contoh produk yang ingin di iklankan, dan link YouTube (opsional)"}
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        {/* LEFT CARD */}
        <Box
          bg={colorMode === "light" ? "white" : "gray.900"}
          p={6}
          borderRadius="2xl"
          shadow="sm"
          borderWidth="1px"
          borderColor={colorMode === "light" ? "gray.200" : "whiteAlpha.200"}
        >
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="medium">{t.verificationStatus || "Status Verifikasi"}</Text>
              {getStatusBadge(verification?.status)}
            </HStack>

            {verification?.status === "rejected" && verification?.reason && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {t.rejectionReason || "Alasan penolakan"}: {verification.reason}
              </Alert>
            )}

            <Divider />

            <HStack>
              <Avatar
                size="xl"
                name={user.username}
                src={user.profilePhoto ? `${process.env.NEXT_PUBLIC_API_URL}${user.profilePhoto}` : ""}
              />
              <VStack align="start" spacing={0}>
                <Text fontWeight="semibold">{user.username}</Text>
                <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>{user.email}</Text>
                <Badge colorScheme="blue" px={2} py={1} rounded="full">{user.type || "-"}</Badge>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        {/* RIGHT CARD */}
        <Box
          bg={colorMode === "light" ? "white" : "gray.900"}
          p={6}
          borderRadius="2xl"
          shadow="sm"
          borderWidth="1px"
          borderColor={colorMode === "light" ? "gray.200" : "whiteAlpha.200"}
        >
          <VStack spacing={5} align="stretch">
            <Box>
              <Text fontSize="sm" mb={1}>{t.ktpSim || "KTP / SIM *"}</Text>
              <Input
                type="file"
                ref={ktpInputRef}
                accept="image/*"
                onChange={handleKtpChange}
                _focus={{
                  borderColor: "brand.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                }}
              />
              {ktpFile && (
                <HStack mt={2} spacing={2}>
                  <Text fontSize="sm">{ktpFile.name}</Text>
                  <IconButton
                    size="sm"
                    icon={<SmallCloseIcon />}
                    onClick={() => setKtpFile(null)}
                    aria-label={t.removeFile || "remove file"}
                    colorScheme="red"
                  />
                </HStack>
              )}
            </Box>

            <Box>
              <Text fontSize="sm" mb={1}>{t.productExample || "Contoh Produk Untuk Iklan"}</Text>
              <Input
                type="file"
                ref={supportInputRef}
                accept="image/*"
                multiple
                onChange={handleSupportChange}
                _focus={{
                  borderColor: "brand.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                }}
              />
              <HStack mt={2} spacing={2} wrap="wrap">
                {(supportFiles || []).map((file, idx) => (
                  <Box
                    key={idx}
                    position="relative"
                    w="80px"
                    h="80px"
                    borderRadius="md"
                    overflow="hidden"
                    border="1px solid"
                    borderColor={colorMode === "light" ? "gray.200" : "whiteAlpha.300"}
                  >
                    <Image
                      src={file instanceof File ? URL.createObjectURL(file) : file}
                      alt={`support-${idx}`}
                      objectFit="cover"
                      w="full"
                      h="full"
                    />
                    <IconButton
                      size="xs"
                      icon={<SmallCloseIcon />}
                      position="absolute"
                      top="1"
                      right="1"
                      aria-label={t.removeFile || "remove"}
                      onClick={() => removeSupportFile(idx)}
                      colorScheme="red"
                    />
                  </Box>
                ))}
                <Button size="sm" onClick={triggerSupportInput}>
                  {t.addFile || "+ Add File"}
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" mb={1}>{t.socialLink || "Link Sosial Media (Opsional)"}</Text>
              <Input
                placeholder="https://instagram.com/bisniskamu"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                _focus={{
                  borderColor: "brand.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                }}
              />
            </Box>

            <Button
              colorScheme="brand"
              bg="brand.500"
              color="black"
              _hover={{ bg: "brand.600" }}
              _active={{ bg: "brand.600" }}
              mt={2}
              onClick={handleSubmit}
              isLoading={submitting}
            >
              {t.submitVerification || "Submit Verifikasi"}
            </Button>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
