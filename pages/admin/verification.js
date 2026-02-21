// File: src/pages/admin/VerificationPage.jsx
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
  Input,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";

const backendUrl = process.env.NEXT_PUBLIC_API_URL;

export default function VerificationPage() {
  const { colorMode } = useColorMode();
  const toast = useToast();

  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  const searchTimeoutRef = useRef(null);

  // ================= FETCH DATA =================
  const fetchVerifications = async (search = searchTerm, pageNumber = page) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterStatus) query.append("status", filterStatus);
      if (search) query.append("search", search);
      query.append("page", pageNumber);

      const res = await fetch(`${backendUrl}/admin/verifications?${query.toString()}`);
      const data = await res.json();

      setVerifications(data.data || []);
      setTotalPages(Math.ceil((data.total || 0) / (data.pageSize || 10)));
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Gagal fetch data verifikasi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE SEARCH DEBOUNCE =================
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchVerifications(searchTerm, 1);
    }, 500);
  }, [searchTerm, filterStatus]);

  // ================= FETCH ON PAGE OR FILTER CHANGE =================
  useEffect(() => {
    fetchVerifications(searchTerm, page);
  }, [page, filterStatus]);

  // ================= HANDLE APPROVE =================
  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/admin/verifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved", reason: null }),
      });
      if (!res.ok) throw new Error("Gagal update status");

      fetchVerifications(searchTerm, page);
      toast({
        title: "Berhasil",
        description: `Status berhasil diubah menjadi approved`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Gagal update status",
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
        description: "Alasan penolakan wajib diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/admin/verifications/${rejectingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", reason: rejectReason }),
      });
      if (!res.ok) throw new Error("Gagal update status");

      fetchVerifications(searchTerm, page);
      toast({
        title: "Berhasil",
        description: "Status berhasil diubah menjadi rejected",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      closeRejectModal();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Gagal update status",
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
      case "pending": return <Badge colorScheme="yellow">Pending</Badge>;
      case "approved": return <Badge colorScheme="green">Verified</Badge>;
      case "rejected": return <Badge colorScheme="red">Ditolak</Badge>;
      default: return <Badge colorScheme="gray">Belum Verifikasi</Badge>;
    }
  };

  // ================= RENDER =================
  return (
    <Box>
      <Heading size="lg" mb={4}>Verification Requests</Heading>

      {/* FILTER & SEARCH */}
      <Flex flexDirection={{ base: "column", md: "row" }} mb={4} gap={4} align={{ base: "stretch", md: "center" }}>
        <Select
          placeholder="Filter Status"
          w={{ base: "full", md: "200px" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Verified</option>
          <option value="rejected">Ditolak</option>
        </Select>

        <Input
          placeholder="Search Username / Email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          w={{ base: "full", md: "300px" }}
        />
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" minH="200px"><Spinner size="xl" /></Flex>
      ) : (
        <Box overflowX="auto">
          <Box as="table" width="full" borderWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} borderRadius="md">
            <Box as="thead" bg={colorMode === "light" ? "gray.100" : "gray.700"}>
              <Box as="tr">
                <Box as="th" p={2}>No</Box>
                <Box as="th" p={2}>Username</Box>
                <Box as="th" p={2}>Email</Box>
                <Box as="th" p={2}>Status</Box>
                <Box as="th" p={2}>KTP / SIM</Box>
                <Box as="th" p={2}>Support Files</Box>
                <Box as="th" p={2}>YouTube Link</Box>
                <Box as="th" p={2}>Action</Box>
              </Box>
            </Box>
            <Box as="tbody">
              {verifications.map((v, idx) => (
                <Box as="tr" key={v.id} borderTop="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                  <Box as="td" p={2}>{idx + 1 + (page - 1) * 10}</Box>
                  <Box as="td" p={2}>{v.user.username}</Box>
                  <Box as="td" p={2}>{v.user.email}</Box>
                  <Box as="td" p={2}>
                    {getStatusBadge(v.status)}
                    {v.status === "rejected" && v.reason && <Text fontSize="sm" color="red.500">{v.reason}</Text>}
                  </Box>

                  <Box as="td" p={2}>
                    {v.documentUrl ? <Button size="sm" colorScheme="blue" onClick={() => openDocModal(v.documentUrl)}>Lihat</Button> : "-"}
                  </Box>

                  <Box as="td" p={2}>
                    {v.supportFilesUrls && v.supportFilesUrls.length > 0
                      ? v.supportFilesUrls.map((file, i) => (
                          <Button key={i} size="sm" colorScheme="cyan" mr={1} mb={1} onClick={() => openDocModal(file)}>
                            File {i + 1}
                          </Button>
                        ))
                      : "-"}
                  </Box>

                  <Box as="td" p={2}>
                    {v.youtubeLink ? <Button size="sm" colorScheme="red" onClick={() => window.open(v.youtubeLink, "_blank")}>Lihat</Button> : "-"}
                  </Box>

                  <Box as="td" p={2}>
                    {v.status === "pending" && (
                      <HStack spacing={1}>
                        <Button size="sm" colorScheme="green" onClick={() => handleApprove(v.id)}>Approve</Button>
                        <Button size="sm" colorScheme="red" onClick={() => openRejectModal(v.id)}>Reject</Button>
                      </HStack>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <HStack spacing={2} mt={4} justify="center">
            <Button size="sm" onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page===1}>Prev</Button>
            <Text>Page {page} of {totalPages}</Text>
            <Button size="sm" onClick={() => setPage((p) => Math.min(totalPages, p+1))} disabled={page===totalPages}>Next</Button>
          </HStack>
        </Box>
      )}

      {/* MODAL DOCUMENT */}
      <Modal isOpen={isDocModalOpen} onClose={closeDocModal} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Dokumen / File</ModalHeader>
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
          <ModalFooter><Button onClick={closeDocModal}>Close</Button></ModalFooter>
        </ModalContent>
      </Modal>

      {/* MODAL REJECT */}
      <Modal isOpen={isRejectModalOpen} onClose={closeRejectModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Alasan Penolakan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input placeholder="Masukkan alasan penolakan" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={submitReject}>Submit Reject</Button>
            <Button onClick={closeRejectModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
