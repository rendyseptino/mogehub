"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  Collapse,
  useToast,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";

import { SearchIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import { FaRegUser } from "react-icons/fa";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { MdOutlinePayments } from "react-icons/md";
import { isMobileCard } from "@/utils/responsiveCard";
import EmptyTransaction from "@/components/emptyTransaction";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

const backendUrl = process.env.NEXT_PUBLIC_API_URL;

// ================= AUTH =================
const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// ================= PAYMENT GROUP (SAMA ADMIN) =================
const getPaymentGroup = (method = "") => {
  const code = (method || "").toUpperCase();

  if (code.includes("QR")) return "QRIS";

  if (["DANA", "OVO", "SHOPEEPAY", "LINKAJA"].includes(code)) {
    return "WALLET";
  }

  if (["ALFAMART", "INDOMARET", "ALFAMIDI"].includes(code)) {
    return "RETAIL";
  }

  return "BANK";
};

// ================= PAYMENT LABEL (SAMA ADMIN) =================
const getPaymentLabel = (trx, t) => {
  switch (trx.paymentGroup) {
    case "BANK":
      return {
        label: t.transactions.payment.bank_label,
        codeLabel: t.transactions.payment.va_number,
        showCode: true,
        showQR: false,
        showRedirect: false,
      };

    case "WALLET":
      return {
        label: t.transactions.payment.wallet_label,
        showCode: false,
        showQR: false,
        showRedirect: true,
      };

    case "RETAIL":
      return {
        label: t.transactions.payment.retail_label,
        codeLabel: t.transactions.payment.payment_code,
        showCode: true,
        showQR: false,
        showRedirect: false,
      };

    case "QRIS":
      return {
        label: t.transactions.payment.qr_label,
        showCode: false,
        showQR: true,
        showRedirect: false,
      };

    default:
      return {
        label: t.transactions.payment.default_label,
        showCode: true,
        showQR: false,
        showRedirect: false,
      };
  }
};

// ================= FORMAT =================
const formatDate = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const day = d.getDate();
  const month = bulan[d.getMonth()];
  const year = d.getFullYear();

  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
};

export default function MyTransaction() {
  const toast = useToast();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const cardBg = useColorModeValue("white", "gray.800");
  const sectionBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const labelColor = useColorModeValue("gray.700", "whiteAlpha.900");

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded, setExpanded] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const check = () => {
    setIsMobile(isMobileCard());
  };

  check(); // initial
  window.addEventListener("resize", check);

  return () => window.removeEventListener("resize", check);
}, []);

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const token = getAuthToken();

      const res = await fetch(`${backendUrl}/api/user/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      const data = Array.isArray(json) ? json : [];

      setTransactions(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  
// ================= SOCKET =================
useEffect(() => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const socket = io(backendUrl, {
    transports: ["websocket"],
    auth: {
      tokenUserId: user?.id,
    },
  });

  // 🔥 JOIN ROOM KHUSUS TRANSAKSI
  socket.emit("join:transaction", {
    userId: user?.id,
  });

  socket.on("transaction:update", () => {
  fetchData();
});

  return () => socket.disconnect();
}, []);


  useEffect(() => {
    fetchData();
  }, []);

  const safe = Array.isArray(transactions) ? transactions : [];

  const filtered = safe.filter((trx) => {
    const q = search.toLowerCase();

    return (
      trx?.reference?.toLowerCase().includes(q) &&
      (statusFilter ? trx.status === statusFilter : true)
    );
  });

  const totalPages = Math.ceil(filtered.length / limit);

  const paginated = filtered.slice(
    (page - 1) * limit,
    page * limit
  );

  const getStatusColor = (status) => {
  switch (status) {
    case "PAID":
    case "SUCCESS":
      return "green";
    case "PENDING":
      return "yellow";
    case "EXPIRED":
      return "red";
    default:
      return "gray";
  }
};

  const getStatusText = (status, t) => {
  switch (status) {
    case "PAID":
    case "SUCCESS":
      return t.transactions.status.paid;
    case "PENDING":
      return t.transactions.status.pending;
    case "EXPIRED":
      return t.transactions.status.expired;
    default:
      return status;
  }
};
  // ================= UI =================
  return (
    <Box p={6}>
      <Heading mb={6}>{t.transactions.title}</Heading>

      
       {/* FILTER */}
<Flex
  gap={3}
  mb={6}
  direction={isMobile ? "column" : "row"}
>
  {/* LEFT - SEARCH */}
  <Box flex="1" w="100%">
    <InputGroup>
      <InputLeftElement>
        <SearchIcon />
      </InputLeftElement>
      <Input
        placeholder={t.transactions.search_placeholder}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
    </InputGroup>
  </Box>

  {/* RIGHT - FILTER */}
  <Box w={isMobile ? "100%" : "220px"}>
    <Select
      value={statusFilter}
      onChange={(e) => {
        setStatusFilter(e.target.value);
        setPage(1);
      }}
    >
      <option value="">{t.transactions.filter_all}</option>
      <option value="PENDING">{t.transactions.filter_pending}</option>
      <option value="PAID">{t.transactions.filter_paid}</option>
      <option value="EXPIRED">{t.transactions.filter_expired}</option>
    </Select>
  </Box>
</Flex>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyTransaction />
      ) : (
        <VStack spacing={4} align="stretch">

          {paginated.map((trx) => {
            const meta = getPaymentLabel(trx, t);
            const isPaid = trx.status === "PAID" || trx.status === "SUCCESS";

            return (
              <Box
                key={trx.id}
                p={5}
                borderWidth="1px"
                borderRadius="xl"
                bg={cardBg}
                borderColor={borderColor}
              >
                {/* HEADER */}
                <Flex justify="space-between">
                  <Box>
                {/* REFERENCE */}
                <Text fontSize="sm" color={labelColor} opacity={0.7}>
                  {t.transactions.reference_label}
                </Text>
                <Text fontWeight="bold" mb={1}>
                  {trx.reference}
                </Text>

                {/* CREATED AT */}
                <Text fontSize="sm" color={labelColor} opacity={0.7}>
                  {t.transactions.created_at_label}
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  {formatDate(trx.createdAt)}
                </Text>
              </Box>

                  <Box textAlign="right">
                    <Badge colorScheme={getStatusColor(trx.status)}>
                    {getStatusText(trx.status, t)}
                  </Badge>
                    <Text fontWeight="bold">
                      Rp {trx.amount?.toLocaleString()}
                    </Text>
                  </Box>
                </Flex>

                <Text
                  mt={3}
                  fontSize="sm"
                  color="blue.400"
                  cursor="pointer"
                  onClick={() =>
                    setExpanded(expanded === trx.id ? null : trx.id)
                  }
                >
                  {expanded === trx.id ? t.transactions.hide_detail : t.transactions.view_detail}
                </Text>

                {/* DETAIL */}
                <Collapse in={expanded === trx.id}>
                  <VStack mt={4} spacing={4} align="stretch">

                    {/* PAYMENT SECTION 🔥 FIX UTAMA */}
                    <Box p={4} bg={sectionBg} borderRadius="lg">
                      <HStack mb={2}>
                        <MdOutlinePayments />
                        <Text fontWeight="bold">{meta.label}</Text>
                      </HStack>

                      <Text>{t.transactions.payment_method}: {trx.paymentName || trx.paymentMethod}</Text>

                      {meta.showCode && (
                        <Text>
                          {meta.codeLabel}: {trx.payCode || "-"}
                        </Text>
                      )}

                      {meta.showRedirect && trx.checkoutUrl && (
                        <Button
                          mt={2}
                          bg="brand.500"
                          color="black"
                          onClick={() =>
                            window.open(trx.checkoutUrl, "_blank")
                          }
                        >
                          Open Payment App
                        </Button>
                      )}

                      {meta.showQR && trx.qr && (
                        <Box mt={3}>
                          <Image src={trx.qr} maxW="200px" mx="auto" />
                        </Box>
                      )}

                      
                    </Box>

                    {/* ITEMS */}
                    <Box p={4} bg={sectionBg} borderRadius="lg">
                      <HStack mb={2}>
                        <AiOutlineShoppingCart />
                        <Text fontWeight="bold">{t.transactions.items}</Text>
                      </HStack>

                      {trx.items?.length ? (
                        trx.items.map((item, i) => (
                          <Text key={i}>
                            {item.name} x{item.quantity}
                          </Text>
                        ))
                      ) : (
                        <Text>-</Text>
                      )}
                    </Box>

                    {/* CUSTOMER */}
                    <Box p={4} bg={sectionBg} borderRadius="lg">
                      <HStack mb={2}>
                        <FaRegUser />
                        <Text fontWeight="bold">{t.transactions.customer}</Text>
                      </HStack>

                      <Text>{trx.customer?.name}</Text>
                      <Text fontSize="sm">{trx.customer?.email}</Text>
                    </Box>

                  </VStack>
                </Collapse>
              </Box>
            );
          })}
        </VStack>
      )}

      
      {/* PAGINATION */}
      {filtered.length > limit && (
        <Flex mt={6} justify="center" gap={2}>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              size="sm"
              colorScheme={page === i + 1 ? "blue" : "gray"}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </Flex>
      )}
    </Box>
  );
}