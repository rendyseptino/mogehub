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
import { Tooltip } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { Icon } from "@chakra-ui/react";
import { MdVerified } from "react-icons/md";

// ================= IMPORT LANGUAGE CONTEXT =================
import VerifiedBadge from "../../components/VerifiedBadge";
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

  // ================= HELPER IMAGE SRC =================
  const getImageSrc = (file) => {
    if (!file) return undefined;

    if (file instanceof File && file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }

    if (typeof file === "string") {
      return file;
    }

    return undefined;
  };

  // ================= INIT USER =================
  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
    }
  }, []);

  // ================= FETCH PROFILE & VERIFICATION =================
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

          if (verData?.youtubeLink) {
            setYoutubeLink(verData.youtubeLink);
          }

          setSupportFiles(
            Array.isArray(verData?.supportFiles)
              ? verData.supportFiles
              : []
          );
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
    if (supportInputRef.current) {
      supportInputRef.current.click();
    }
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

    if (!supportFiles || supportFiles.length === 0) {
      toast({
        title: t.wait || "Wait a minute",
        description: t.productRequired || "Contoh produk wajib di-upload",
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

      supportFiles.forEach((file) => {
        if (file instanceof File) {
          formData.append("supportFiles", file);
        }
      });

      const res = await fetch(`${backendUrl}/seller/verification`, {
        method: verification ? "PATCH" : "POST",
        headers: {
          "x-user-id": user.id,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));

        throw new Error(
          err.message || t.failedSubmit || "Gagal submit verifikasi"
        );
      }

      const updated = await res.json();

      setVerification(updated);

      setSupportFiles(
        Array.isArray(updated?.supportFiles)
          ? updated.supportFiles
          : []
      );

      toast({
        title: t.success || "Berhasil",
        description:
          t.verificationSent ||
          "Data verifikasi berhasil dikirim, silakan cek email secara berkala",
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
        return (
          <Badge colorScheme="gray">
            {t.notVerified || "Belum Verifikasi"}
          </Badge>
        );
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Heading size="lg" mb={4}>
        {t.accountVerification || "Verifikasi Akun"}
      </Heading>

      <Text
        mb={6}
        color={colorMode === "light" ? "gray.600" : "gray.300"}
      >
        {t.verificationDesc ||
          "Upload dokumen KTP / SIM, contoh produk yang ingin di iklankan, dan link YouTube (opsional)"}
      </Text>

      <SimpleGrid
        columns={{ base: 1, lg: 2 }}
        spacing={8}
        alignItems="start"
      >
        
{/* LEFT CARD - DESKTOP & MOBILE PROFILE FIX */}
<Box
  bg={colorMode === "light" ? "white" : "gray.700"}
  p={6}
  borderRadius="2xl"
  shadow="sm"
  borderWidth={colorMode === "light" ? "gray.200" : "whiteAlpha.200"}
  borderColor={colorMode === "light" ? "gray.200" : "whiteAlpha.200"}
  position="relative"
  overflow="hidden"
>
  {/* BACKGROUND ONE FULL-CARD VERIFIED ICON */}
  <Icon
    as={MdVerified}
    position="absolute"
    top="50%"
    left="50%"
    transform="translate(-50%, -50%)"
    w="120%"  // lebih besar dari card biar hampir nutup full
    h="120%"
    color="blue.400"
    opacity={0.1} // semi-transparent
    pointerEvents="none"
    zIndex={0}
  />

  {/* STATUS VERIFIKASI */}
  <VStack spacing={6} align="stretch" w="full" position="relative" zIndex={1}>
    <Box>
      <HStack justify="space-between" align="center">
        <Text fontWeight="medium" fontSize="md">
          {t.verificationStatus || "Status Verifikasi"}
        </Text>

        {/* BADGE STATUS VERIFIKASI */}
        {getStatusBadge(verification?.status) && (
          <Badge
            px={4}
            py={2}
            borderRadius="full"
            fontSize="sm"
            colorScheme={
              verification?.status === "approved"
                ? "green"
                : verification?.status === "pending"
                ? "yellow"
                : verification?.status === "rejected"
                ? "red"
                : "gray"
            }
          >
            {getStatusBadge(verification?.status).props.children}
          </Badge>
        )}
      </HStack>

      {verification?.status === "rejected" && verification?.reason && (
        <Alert status="error" borderRadius="md" mt={3}>
          <AlertIcon />
          {t.rejectionReason || "Alasan penolakan"}: {verification.reason}
        </Alert>
      )}
    </Box>

    

    {/* PROFILE USER */}
    <Box w="full" position="relative">
      {/* AVATAR - atas tengah card */}
      <Flex w="full" justify="center" mb={{ base: 4, lg: 0 }}>
        <Avatar
          size={{ base: "xl", lg: "2xl" }}
          name={user.username}
          src={user.profilePhoto || ""}
          borderWidth={2}
          borderColor={colorMode === "light" ? "gray.200" : "whiteAlpha.300"}
        />
      </Flex>

      {/* USERNAME & EMAIL - bawah profile picture desktop */}
      <Box
        mt={{ base: 2, lg: 4 }}
        w="full"
        textAlign={{ base: "center", lg: "center" }}
      >
        <VStack spacing={1}>
          {/* Username + Verified Icon */}
          <HStack spacing={2} justify="center">
            <Text
              fontWeight="bold"
              fontSize={{ base: "md", lg: "xl" }}
              color={colorMode === "light" ? "gray.800" : "white"}
            >
              {user.username}
            </Text>
            <VerifiedBadge show={verification?.status === "approved"} />
          </HStack>

          {/* Email */}
          <Text
            fontSize={{ base: "sm", lg: "md" }}
            color={colorMode === "light" ? "gray.600" : "gray.400"}
          >
            {user.email}
          </Text>
        </VStack>
      </Box>
    </Box>
  </VStack>
</Box>
        {/* RIGHT CARD */}
        <Box
          bg={colorMode === "light" ? "white" : "gray.700"}
          p={6}
          borderRadius="2xl"
          shadow="sm"
          borderWidth="1px"
          borderColor={
            colorMode === "light" ? "gray.200" : "whiteAlpha.200"
          }
          minH={{ lg: "500px" }}
        >
          <VStack spacing={5} align="stretch">
            {/* KTP */}
            <Box>
              <Text fontSize="sm" mb={1}>
                {t.ktpSim || "KTP / SIM *"}
              </Text>

              <Input
                type="file"
                ref={ktpInputRef}
                accept="image/*"
                onChange={handleKtpChange}
              />

              {ktpFile && (
                <HStack mt={2}>
                  <Text fontSize="sm">{ktpFile.name}</Text>

                  <IconButton
                    size="sm"
                    icon={<SmallCloseIcon />}
                    onClick={() => setKtpFile(null)}
                    aria-label="remove"
                    colorScheme="red"
                  />
                </HStack>
              )}
            </Box>

            {/* SUPPORT FILES */}
            <Box>
              <Text fontSize="sm" mb={1}>
                {t.productExample || "Contoh Produk Untuk Iklan"}
              </Text>

              <Input
                type="file"
                ref={supportInputRef}
                accept="image/*"
                multiple
                onChange={handleSupportChange}
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
                    borderColor={
                      colorMode === "light"
                        ? "gray.200"
                        : "whiteAlpha.300"
                    }
                  >
                    <Image
                      src={getImageSrc(file)}
                      alt={`support-${idx}`}
                      objectFit="cover"
                      w="full"
                      h="full"
                    />

                    <IconButton
                      size="xs"
                      icon={<SmallCloseIcon />}
                      position="absolute"
                      top={1}
                      right={1}
                      aria-label="remove"
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

            {/* SOCIAL LINK */}
            <Box>
              <Text fontSize="sm" mb={1}>
                {t.socialLink || "Link Sosial Media (Opsional)"}
              </Text>

              <Input
                placeholder={t.socialLinkPlaceholder}
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                focusBorderColor="#90cdf4"
              />
            </Box>

            <Tooltip
            label={verification?.status === "approved" ? "Already Verified" : ""}
            hasArrow
            placement="top"
            isDisabled={verification?.status !== "approved"} // tooltip cuma muncul kalo verified
          >
            <Button
              bg={verification?.status === "approved" ? "gray.300" : "brand.500"} // grey kalau disable
              color="black"
              _hover={{ bg: verification?.status === "approved" ? "gray.300" : "brand.600" }}
              onClick={handleSubmit}
              isLoading={submitting}
              isDisabled={verification?.status === "approved"} // disable tombol
              opacity={1} // tetap jelas
              cursor={verification?.status === "approved" ? "not-allowed" : "pointer"}
            >
              {t.submitVerification || "Submit Verifikasi"}
            </Button>
          </Tooltip>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}