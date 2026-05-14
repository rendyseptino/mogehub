"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  HStack,
  Badge,
  Spinner,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Select,
  useToast,
  useColorMode,
  VStack,
  Tooltip,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { mobileAndTabletPadding } from "../../utils/responsive";
import { useLanguageContext } from "../../context/LanguageContext";
import en from "../../locales/en.json";
import id from "../../locales/id.json";

import {
  isMobileCard,
  isTabletCard,
  isDesktopCard,
} from "../../utils/responsiveCard";

const translations = { en, id };
const backendUrl = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export default function AdReportPage() {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const router = useRouter();

  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 8;
  const MAX_PAGE_BUTTON = 7;

  const [selectedImage, setSelectedImage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ================= FETCH =================
  const fetchReports = async () => {
    setLoading(true);

    const token = getToken();
    if (!token) return router.push("/login");

    try {
      const res = await fetch(`${backendUrl}/admin/reports?type=${type}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed fetch reports");

      const data = await res.json();

      // ================= FIX TYPE =================
      const normalized = (data.reports || []).map((r) => ({
        ...r,
        targetType:
          r.targetType ||
          (r.target?.adId || r.adId ? "ad" : r.adBannerId ? "banner" : "unknown"),
      }));

      setReports(normalized);
    } catch (err) {
      toast({
        title: t.toast_error_title,
        description: err.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [type]);

  // ================= ACTION =================
  const updateStatus = async (id, status) => {
    const token = getToken();

    try {
      const res = await fetch(`${backendUrl}/admin/reports/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error(t.toast_failed_update_report);

      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );

      toast({ title: t.toast_report_updated, status: "success" });
    } catch (err) {
      toast({
        title: t.toast_error_title,
        description: err.message,
        status: "error",
      });
    }
  };

  // ================= FILTER =================
  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();

    return (
      (r.reason || "").toLowerCase().includes(q) ||
      (r.reporter?.username || "").toLowerCase().includes(q) ||
      (r.target?.title || "").toLowerCase().includes(q)
    );
  });

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const start = Math.max(
    1,
    Math.min(page - Math.floor(MAX_PAGE_BUTTON / 2), totalPages - MAX_PAGE_BUTTON + 1)
  );

  const end = Math.min(start + MAX_PAGE_BUTTON - 1, totalPages);

  const visiblePages = Array.from(
    { length: end - start + 1 },
    (_, i) => start + i
  );

  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const getBadge = (status) => {
    switch (status) {
      case "pending":
         return <Badge colorScheme="yellow">{t.ad_reports_status_pending}</Badge>;
      case "resolved":
        return <Badge colorScheme="green">{t.ad_reports_status_resolved}</Badge>;
      case "ignored":
         return <Badge colorScheme="gray">{t.ad_reports_status_ignored}</Badge>;
      default:
        return <Badge>{t.ad_reports_status_unknown}</Badge>;
    }
  };

  // ================= MOBILE CARD =================
  const renderMobile = () => (
    <VStack spacing={3}>
      {paginated.map((r, i) => (
        <Box
          key={r.id}
          w="full"
          p={4}
          borderWidth="1px"
          borderRadius="md"
        >
          <Flex justify="space-between" mb={2}>
            <Text fontWeight="bold">
              {(page - 1) * ITEMS_PER_PAGE + i + 1}. {r.target?.title || "-"}
            </Text>
            {getBadge(r.status)}
          </Flex>

          <Text><b>{t.ad_reports_label_type}:</b> {r.targetType === "ad" ? "AD" : r.targetType === "banner" ? "BANNER" : "-"}</Text>
          <Text><b>{t.ad_reports_label_user}:</b> {r.reporter?.username || "-"}</Text>
          <Text><b>{t.ad_reports_label_reason}:</b> {r.reason || "-"}</Text>
          <Text><b>{t.ad_reports_label_detail}:</b> {r.description || "-"}</Text>

          {r.evidence?.url && (
            <Image
              src={r.evidence.url}
              boxSize="70px"
              mt={2}
              borderRadius="md"
              cursor="pointer"
              onClick={() => {
                setSelectedImage(r.evidence.url);
                onOpen();
              }}
            />
          )}

          <HStack mt={3}>
            <Button size="sm" colorScheme="green" onClick={() => updateStatus(r.id, "resolved")}>
             {t.button_resolve}
            </Button>
            <Button size="sm" colorScheme="gray" onClick={() => updateStatus(r.id, "ignored")}>
             {t.button_ignore}
            </Button>
          </HStack>
        </Box>
      ))}
    </VStack>
  );

  // ================= TABLE =================
  const renderTable = () => (
    <Box overflowX="auto">
      <Box as="table" w="full" borderWidth="1px">
        <Box as="thead">
          <Box as="tr">
            {[ t.table_no,
              t.table_type,
              t.table_user,
              t.table_target,
              t.table_reason,
              t.table_detail,
              t.table_evidence,
              t.table_status,
              t.table_action,].map((h) => (
              <Box key={h} as="th" p={2} textAlign="left">{h}</Box>
            ))}
          </Box>
        </Box>

        <Box as="tbody">
          {paginated.map((r, i) => (
            <Box as="tr" key={r.id}>
              <Box as="td" p={2}>{(page - 1) * ITEMS_PER_PAGE + i + 1}</Box>
              <Box as="td" p={2}>
                <Badge colorScheme={r.targetType === "ad" ? "blue" : "purple"}>
                  {r.targetType === "ad" ? "AD" : r.targetType === "banner" ? "BANNER" : "-"}
                </Badge>
              </Box>
              <Box as="td" p={2}>{r.reporter?.username}</Box>
              <Box as="td" p={2}>{r.target?.title}</Box>
              <Box as="td" p={2}>{r.reason}</Box>
              <Box as="td" p={2}>{r.description || "-"}</Box>
              <Box as="td" p={2}>
                {r.evidence?.url ? (
                  <Image
                    src={r.evidence.url}
                    boxSize="50px"
                    cursor="pointer"
                    onClick={() => {
                      setSelectedImage(r.evidence.url);
                      onOpen();
                    }}
                  />
                ) : "-"}
              </Box>
              <Box as="td" p={2}>{getBadge(r.status)}</Box>
              <Box as="td" p={2}>
                <HStack>
                  <Button size="sm" colorScheme="green" onClick={() => updateStatus(r.id, "resolved")}>{t.button_resolve}</Button>
                  <Button size="sm" colorScheme="gray" onClick={() => updateStatus(r.id, "ignored")}>{t.button_ignore}</Button>
                </HStack>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box p={mobileAndTabletPadding}>
      <Heading mb={4}>{t.ad_reports_title}</Heading>

      <Flex gap={3} mb={4}>
        <Input placeholder={t.ad_reports_search_placeholder} value={search} onChange={(e) => setSearch(e.target.value)} />

        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">{t.ad_reports_filter_all}</option>
          <option value="ad">{t.ad_reports_filter_ads}</option>
          <option value="banner">{t.ad_reports_filter_banner}</option>
        </Select>
      </Flex>

      {loading ? <Spinner /> : (
        isMobileCard() ? renderMobile() : renderTable()
      )}

      <HStack mt={4} justify="center">
        {visiblePages.map((p) => (
          <Button
            key={p}
            size="sm"
            colorScheme={p === page ? "blue" : "gray"}
            onClick={() => setPage(p)}
          >
            {p}
          </Button>
        ))}
      </HStack>

      {/* MODAL */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <Image src={selectedImage} w="100%" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}