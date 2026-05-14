// File: src/pages/admin/VerificationPage.jsx
"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Select,
  Spinner,
  Badge,
  useColorMode,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Tooltip ,
  Input,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";

// ================= IMPORT UTILS RESPONSIVE =================
import { isMobileCard, isTabletCard, isDesktopCard } from "../../utils/responsiveCard";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };



const backendUrl = process.env.NEXT_PUBLIC_API_URL;

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export default function VerificationPage() {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  

  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const isAdminUser = currentUser?.type === "admin" || currentUser?.email === "admin@mogehub.com";
  const isModeratorUser = currentUser?.type === "moderator";

  const canApproveReject = (user) => {
  if (!user) return false;
  return ["admin", "editor", "staff_verifikasi"].includes(user.type);
};

const canEdit = canApproveReject(currentUser);

// ================= CEK STATUS UNTUK TOMBOL =================
const isActionAllowed = (status) => {
  // Hanya tampil / aktif kalau status pending atau rejected
  return ["pending", "rejected"].includes(status);
};


  const searchTimeoutRef = useRef(null);

  const isMobile = useBreakpointValue({ base: true, md: false });

  // ================= FETCH DATA =================
const fetchVerifications = async (search = searchTerm, pageNumber = page) => {
  // Spinner cuma di load pertama
  if (initialLoad) setLoading(true);

  try {
    const query = new URLSearchParams();
    if (filterStatus) query.append("status", filterStatus);
    if (search) query.append("search", search);
    query.append("page", pageNumber);

    const token = getAuthToken();

    if (!token) {
      toast({
        title: t.verification_session_expired,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const res = await fetch(
      `${backendUrl}/admin/verifications?${query.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // 🔥 HANDLE SESSION EXPIRED
    if (res.status === 401) {
      localStorage.removeItem("token");
      toast({
        title: t.verification_session_expired,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!res.ok) throw new Error("Gagal fetch data");

    const data = await res.json();

    setVerifications(data.data || []);
    setTotalPages(Math.ceil((data.total || 0) / (data.pageSize || 10)));
  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: t.verification_fetch_error,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    // Hanya matikan spinner full load pertama
    if (initialLoad) {
      setLoading(false);
      setInitialLoad(false);
    }
  }
};
  useEffect(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) setCurrentUser(JSON.parse(userStr));
}, []);

  // ================= HANDLE SEARCH DEBOUNCE =================
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchVerifications(searchTerm, 1);
    }, 500);
  }, [searchTerm, filterStatus]);

  // ================= FETCH ON PAGE CHANGE =================
  useEffect(() => {
    fetchVerifications(searchTerm, page);
  }, [page]);

  // ================= HANDLE APPROVE =================
const handleApprove = async (id) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    toast({
      title:  t.verification_session_expired,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  try {
    const res = await fetch(`${backendUrl}/admin/verifications/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🔥 WAJIB
      },
      body: JSON.stringify({ status: "approved", reason: null }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("token");
        toast({
          title:  t.verification_session_expired,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      throw new Error("Gagal update status");
    }

    fetchVerifications(searchTerm, page);

    toast({
      title: t.verification_success,
      description: t.verification_approved_success,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } catch (err) {
    console.error(err);
    toast({
      title: t.verification_update_failed,
      description: err.message || t.verification_update_failed,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};

  // ================= HANDLE REJECT =================
const openRejectModal = (id) => {
  setRejectingId(id);
  setRejectReason("");
  setIsRejectModalOpen(true);
};

const closeRejectModal = () => {
  setRejectingId(null);
  setRejectReason("");
  setIsRejectModalOpen(false);
};

const submitReject = async () => {
  if (!rejectReason.trim()) {
    toast({
      title: "Error",
      description: t.verification_reason_required,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    toast({
      title: t.verification_session_expired,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  try {
    const res = await fetch(
      `${backendUrl}/admin/verifications/${rejectingId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔥 WAJIB
        },
        body: JSON.stringify({
          status: "rejected",
          reason: rejectReason,
        }),
      }
    );

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("token");
        toast({
          title: t.verification_session_expired,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      throw new Error("Gagal update status");
    }

    fetchVerifications(searchTerm, page);

    toast({
      title: t.verification_success,
      description: t.verification_rejected_success,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    closeRejectModal();
  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: err.message || t.verification_update_failed,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};
  // ================= MODAL DOCUMENT =================
  const openDocModal = (docUrl) => {
    setSelectedDoc(docUrl);
    setIsDocModalOpen(true);
  };
  const closeDocModal = () => {
    setSelectedDoc(null);
    setIsDocModalOpen(false);
  };

  // ================= STATUS BADGE =================
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending": return <Badge colorScheme="yellow">{t.status_pending}</Badge>;
      case "approved": return <Badge colorScheme="green">{t.status_verified}</Badge>;
      case "rejected": return <Badge colorScheme="red">{t.status_rejected}</Badge>;
      default: return <Badge colorScheme="gray">{t.status_not_verified}</Badge>;
    }
  };

  // ================= RENDER VERIFICATION CARDS =================
  const renderVerifications = () => {
    if (isMobileCard()) {
      return (
        <VStack spacing={4} align="stretch">
          {verifications.map((v, idx) => (
            <Box key={v.id} borderWidth="1px" borderRadius="md" p={4} shadow="md">
              <Text fontWeight="bold">{idx + 1 + (page - 1) * 10}. {v.user.username}</Text>
              <Text>Email: {v.user.email}</Text>
              <Box mb={2}>{getStatusBadge(v.status)}</Box>

              <Box mb={2}>
                KTP/SIM: {v.documentUrl 
                  ? <Box
                    as="img"
                    src={v.documentUrl.startsWith("http") ? v.documentUrl : `${backendUrl}${v.documentUrl}`}
                    alt="KTP / SIM"
                    boxSize="60px"
                    objectFit="cover"
                    borderRadius="md"
                    cursor="pointer"
                    border="1px solid"
                    borderColor="gray.300"
                    _hover={{ opacity: 0.8, transform: "scale(1.05)" }}
                    transition="0.2s"
                    onClick={() => openDocModal(v.documentUrl)}
                  />
                  : "-"}
              </Box>

              <Box mb={2}>
                Selfie KTP/SIM: {v.supportFilesUrls && v.supportFilesUrls.length > 0
                  ? v.supportFilesUrls.map((file, i) => (
                      <Box
                    as="img"
                    key={i}
                    src={file.startsWith("http") ? file : `${backendUrl}${file}`}
                    alt={`Selfie ${i + 1}`}
                    boxSize="60px"
                    objectFit="cover"
                    borderRadius="md"
                    cursor="pointer"
                    border="1px solid"
                    borderColor="gray.300"
                    _hover={{ opacity: 0.8, transform: "scale(1.05)" }}
                    transition="0.2s"
                    onClick={() => openDocModal(file)}
                  />
                    ))
                  : "-"}
              </Box>

              <Box mb={2}>
                Social Media Link: {v.youtubeLink ? <Button size="sm" colorScheme="red" onClick={() => window.open(v.youtubeLink, "_blank")}>Lihat</Button> : "-"}
              </Box>

              {isActionAllowed(v.status) && (
                <HStack spacing={2}>
                  {/* Approve Button */}
                  <Tooltip label={!canEdit ? t.tooltip_role_only : ""} hasArrow>
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={() => handleApprove(v.id)}
                      isDisabled={!canEdit}
                    >
                     {t.action_approve}
                    </Button>
                  </Tooltip>

                  {/* Reject Button */}
                  <Tooltip label={!canEdit ? t.tooltip_role_only : ""} hasArrow>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => openRejectModal(v.id)}
                      isDisabled={!canEdit}
                    >
                     {t.action_reject}
                    </Button>
                  </Tooltip>
                </HStack>
              )}
            </Box>
          ))}
        </VStack>
      );
    }

    // DESKTOP / TABLE
    return (
      <Box overflowX="auto">
        <Box as="table" width="full" borderWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} borderRadius="md">
          <Box as="thead" bg={colorMode === "light" ? "gray.100" : "gray.700"}>
            <Box as="tr">
             <Box as="th" p={2} textAlign="left">{t.table_no}</Box>
              <Box as="th" p={2} textAlign="left">{t.table_username}</Box>
              <Box as="th" p={2} textAlign="left">{t.table_email}</Box>
              <Box as="th" p={2} textAlign="left">{t.table_status}</Box>
              <Box as="th" p={2} textAlign="left">{t.table_document}</Box>
              <Box as="th" p={2} textAlign="left">{t.table_selfie}</Box>
              <Box as="th" p={2} textAlign="left">{t.table_social}</Box>
              <Box as="th" p={2} textAlign="left">{t.table_action}</Box>
            </Box>
          </Box>
          <Box as="tbody">
            {verifications.map((v, idx) => (
              <Box as="tr" key={v.id} borderTop="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                <Box as="td" p={2}>{idx + 1 + (page - 1) * 10}</Box>
                <Box as="td" p={2}>{v.user.username}</Box>
                <Box as="td" p={2}>{v.user.email}</Box>
                <Box as="td" p={2}>{getStatusBadge(v.status)} {v.status === "rejected" && v.reason && <Text fontSize="sm" color="red.500">{v.reason}</Text>}</Box>
                <Box as="td" p={2}>{v.documentUrl ? <Box as="td" p={2}>
                  {v.documentUrl ? (
                    <Box
                      as="img"
                      src={v.documentUrl.startsWith("http") ? v.documentUrl : `${backendUrl}${v.documentUrl}`}
                      alt="KTP / SIM"
                      boxSize="60px"
                      objectFit="cover"
                      borderRadius="md"
                      cursor="pointer"
                      border="1px solid"
                      borderColor="gray.300"
                      _hover={{ opacity: 0.8, transform: "scale(1.05)" }}
                      transition="0.2s"
                      onClick={() => openDocModal(v.documentUrl)}
                    />
                  ) : "-"}
                </Box> : "-"}
                </Box>
                <Box as="td" p={2}>
                  {v.supportFilesUrls && v.supportFilesUrls.length > 0
                    ? v.supportFilesUrls.map((file, i) => (
                        <Box
                        as="img"
                        key={i}
                        src={file.startsWith("http") ? file : `${backendUrl}${file}`}
                        alt={`Selfie ${i + 1}`}
                        boxSize="60px"
                        objectFit="cover"
                        borderRadius="md"
                        cursor="pointer"
                        border="1px solid"
                        borderColor="gray.300"
                        _hover={{ opacity: 0.8, transform: "scale(1.05)" }}
                        transition="0.2s"
                        onClick={() => openDocModal(file)}
                      />
                      ))
                    : "-"}
                </Box>
                <Box as="td" p={2}>{v.youtubeLink ? <Button size="sm" colorScheme="red" onClick={() => window.open(v.youtubeLink, "_blank")}>Lihat</Button> : "-"}</Box>
                <Box as="td" p={2}>
                  {isActionAllowed(v.status) && (
                    <HStack spacing={2}>
                      <Tooltip label={!canEdit ? t.tooltip_role_only : ""} hasArrow>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => handleApprove(v.id)}
                          isDisabled={!canEdit}
                        >
                          {t.action_approve}
                        </Button>
                      </Tooltip>

                      <Tooltip label={!canEdit ? t.tooltip_role_only : ""} hasArrow>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => openRejectModal(v.id)}
                          isDisabled={!canEdit}
                        >
                         {t.action_reject}
                        </Button>
                      </Tooltip>
                    </HStack>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Heading size="lg" mb={4}>{t.verification_title}</Heading>

      {/* FILTER & SEARCH */}
      <Flex flexDirection={{ base: "column", md: "row" }} mb={4} gap={4} align={{ base: "stretch", md: "center" }}>
        <Select
          placeholder={t.verification_filter_placeholder}
          w={{ base: "full", md: "200px" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="pending">{t.status_pending}</option>
          <option value="approved">{t.status_verified}</option>
          <option value="rejected">{t.status_rejected}</option>
        </Select>

        <Input
          placeholder={t.verification_search_placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          w={{ base: "full", md: "300px" }}
        />
      </Flex>

      {loading && verifications.length === 0 ? (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        renderVerifications()
      )}

      {/* PAGINATION */}
      <HStack spacing={2} mt={4} justify="center">
        <Button size="sm" onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page===1}>{t.pagination_prev}</Button>
        <Text>{t.pagination_page}  {page} of {totalPages}</Text>
        <Button size="sm" onClick={() => setPage((p) => Math.min(totalPages, p+1))} disabled={page===totalPages}>{t.pagination_next}</Button>
      </HStack>

      {/* MODAL DOCUMENT */}
      <Modal isOpen={isDocModalOpen} onClose={closeDocModal} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t.modal_document_title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedDoc && (
              <img
                src={selectedDoc.startsWith("http") ? selectedDoc : `${backendUrl}${selectedDoc}`}
                alt="Document"
                style={{ width: "100%", borderRadius: 8 }}
              />
            )}
          </ModalBody>
          <ModalFooter><Button onClick={closeDocModal}>{t.modal_close}</Button></ModalFooter>
        </ModalContent>
      </Modal>

      {/* MODAL REJECT */}
      <Modal isOpen={isRejectModalOpen} onClose={closeRejectModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t.modal_reject_title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input placeholder={t.modal_reject_placeholder} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={submitReject}>{t.modal_reject_submit}</Button>
            <Button onClick={closeRejectModal}>{t.modal_cancel}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}