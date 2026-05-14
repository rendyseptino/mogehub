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
  Button,
  InputGroup,
  InputLeftElement,
  Select,
  useToast,
  useColorModeValue,
  Collapse,
} from "@chakra-ui/react";

import { SearchIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Image } from "@chakra-ui/react";

import { FaRegUser, FaMoneyBillWave } from "react-icons/fa";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { MdOutlinePayments } from "react-icons/md";

import { mobileAndTabletPadding } from "../../utils/responsive";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

const backendUrl = process.env.NEXT_PUBLIC_API_URL;

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};


const getPaymentLabel = (trx, t) => {
  switch (trx.paymentGroup) {
    case "BANK":
      return {
        label: "Virtual Account",
        codeLabel: "VA Number",
        showCode: true,
        showQR: false,
        showRedirect: false,
      };

    case "WALLET":
      return {
        label: "E-Wallet",
        showCode: false,
        showQR: false,
        showRedirect: true,
      };

    case "RETAIL":
      return {
        label: "Retail Payment",
        codeLabel: t.transaction_payment_code,
        showCode: true,
        showQR: false,
        showRedirect: false,
      };

    case "QRIS":
      return {
        label: "QR Payment",
        showCode: false,
        showQR: true,
        showRedirect: false,
      };

    default:
      return {
        label: "Payment",
        codeLabel: "Code",
        showCode: true,
        showQR: false,
        showRedirect: false,
      };
  }
};
// ================= NORMALIZER =================
const normalizeTransaction = (trx) => {
  const payload = trx.payload || trx.raw?.payload || {};
  const callback = trx.callbackPayload || trx.raw?.callback || {};

  return {
  id: trx.id,
  merchantRef: trx.merchantRef,
  reference: trx.reference,
  status: trx.status,
  amount: trx.amount,

  amountReceived:
    trx.amountReceived ||
    callback.amount_received ||
    trx.raw?.callback?.amount_received,

  paymentMethod: trx.paymentMethod,
  paymentName: trx.paymentName,
  payCode: trx.payCode,

  // 🔥 FIX PENTING
  paymentGroup: trx.paymentGroup || getPaymentGroup(trx.paymentMethod),
  qr:
  trx.qr ||
  trx.raw?.payload?.qr ||
  trx.raw?.payload?.qr_url ||
  trx.raw?.payload?.qr_image ||
  trx.raw?.payload?.qr_image_url ||
  trx.raw?.payload?.qrcode ||
  trx.raw?.callback?.qr ||
  trx.raw?.callback?.qr_url ||
  null,

  checkoutUrl:
    trx.checkoutUrl ||
    trx.raw?.payload?.checkout_url ||
    trx.raw?.payload?.payment_url ||
    null,

  fee: {
    merchant:
      trx.fee?.merchant ||
      trx.feeMerchant ||
      callback.fee_merchant,

    customer:
      trx.fee?.customer ||
      trx.feeCustomer ||
      callback.fee_customer,

    total:
      trx.fee?.total ||
      trx.totalFee ||
      callback.total_fee,
  },

  createdAt: trx.createdAt,
  expiredTime: trx.expiredTime,

  customer: {
    name: trx.customer?.name || trx.user?.username,
    email: trx.customer?.email || trx.user?.email,
    phone: trx.customer?.phone || trx.user?.phone,
  },

  items: trx.items || payload?.order_items || [],

  raw: { payload, callback },
};
};

const formatIDDateTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TransactionUser() {
  const toast = useToast();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const cardBg = useColorModeValue("white", "gray.800");
  const sectionBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  // ================= FETCH =================
  const fetchTransactions = async () => {
    const token = getAuthToken();

    try {
      const res = await fetch(`${backendUrl}/admin/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setTransactions(data.map(normalizeTransaction));
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

  // ================= REALTIME SOCKET =================
  useEffect(() => {
    const socket = io(backendUrl, {
      transports: ["websocket"], // 🔥 penting biar stabil
      auth: { tokenUserId: "admin" },
    });

    socket.emit("joinAdmin");

    // 🔥 NEW TRANSACTION
    socket.on("transaction:new", (trx) => {
      const normalized = normalizeTransaction(trx);

      setTransactions((prev) => {
        if (prev.some((t) => t.id === normalized.id)) return prev;
        return [normalized, ...prev];
      });
    });

    // 🔥 UPDATE TRANSACTION
    socket.on("transaction:update", (trx) => {
      const normalized = normalizeTransaction(trx);

      setTransactions((prev) =>
        prev.map((t) => {
          if (t.id !== normalized.id) return t;
          if (t.status === normalized.status) return t;
          return normalized;
        })
      );
    });

    // 🔥 SUPPORT PAYMENT PAGE EVENTS
    socket.on("payment-success", (trx) => {
      const normalized = normalizeTransaction(trx);

      setTransactions((prev) =>
        prev.map((t) =>
          t.reference === normalized.reference ? normalized : t
        )
      );
    });

    socket.on("payment-failed", (trx) => {
      const normalized = normalizeTransaction(trx);

      setTransactions((prev) =>
        prev.map((t) =>
          t.reference === normalized.reference ? normalized : t
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  // ================= POLLING BACKUP =================
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTransactions();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
  setPage(1);
}, [search, statusFilter]);

  // ================= FILTER =================
  const filtered = transactions.filter((trx) => {
    const q = search.toLowerCase();

    return (
      trx.reference?.toLowerCase().includes(q) ||
      trx.customer?.name?.toLowerCase().includes(q)
    ) && (statusFilter ? trx.status === statusFilter : true);
  });

  const totalPages = Math.ceil(filtered.length / limit);

const paginatedData = filtered.slice(
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

  // ================= UI =================
  return (
    <Box p={mobileAndTabletPadding}>
      <Heading mb={6}>{t.transaction_title}</Heading>

      {/* FILTER */}
      <Flex gap={2} mb={6} wrap="wrap">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon />
          </InputLeftElement>
          <Input
            placeholder={t.transaction_search_placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <Select
          w="200px"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">{t.transaction_filter_all}</option>
          <option value="PENDING">{t.transaction_filter_pending}</option>
          <option value="PAID">{t.transaction_filter_paid}</option>
          <option value="EXPIRED">{t.transaction_filter_expired}</option>
        </Select>
      </Flex>

      {loading ? (
        <Spinner />
      ) : (
        <VStack spacing={4} align="stretch">
  {paginatedData.map((trx) => {
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
        shadow="sm"
        _hover={{ shadow: "md" }}
      >
        {/* HEADER */}
        <Flex justify="space-between">
          <Box>
          {/* REFERENSI */}
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "flex-start", md: "center" }}
            gap={1}
          >
            <Text fontSize="sm" opacity={0.7}>
             {t.transaction_label_reference}:
            </Text>

            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
              {trx.reference}
            </Text>
          </Flex>

          {/* PEMBELI */}
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "flex-start", md: "center" }}
            gap={1}
            mt={1}
          >
            <Text fontSize="sm" opacity={0.7}>
               {t.transaction_label_buyer}:
            </Text>

            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
              {trx.customer?.name}
            </Text>
          </Flex>

          {/* CREATED + EXPIRED */}
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={1}
            mt={2}
            fontSize="sm"
            opacity={0.6}
          >
            {trx.status === "EXPIRED" ? (
            <Text>
              {t.transaction_label_expired}: {formatIDDateTime(trx.expiredTime)}
            </Text>
          ) : (
            <Text>
              {t.transaction_label_created}: {formatIDDateTime(trx.createdAt)}
            </Text>
          )}
          </Flex>
        </Box>

          <Box textAlign="right">
            <Badge colorScheme={getStatusColor(trx.status)}>
              {trx.status === "PAID" || trx.status === "SUCCESS"
                ? t.transaction_status_paid
                : trx.status === "PENDING"
                ? t.transaction_status_pending
                : trx.status === "EXPIRED"
                ? t.transaction_status_expired
                : trx.status}
            </Badge>
            <Text fontWeight="bold">
              Rp {trx.amount?.toLocaleString()}
            </Text>
          </Box>
        </Flex>

        {/* TOGGLE */}
        <Text
          mt={3}
          cursor="pointer"
          color="blue.400"
          fontSize="sm"
          onClick={() =>
            setExpanded(expanded === trx.id ? null : trx.id)
          }
        >
          {expanded === trx.id ? t.transaction_toggle_hide_detail : t.transaction_toggle_view_detail}
        </Text>

        {/* DETAIL */}
        <Collapse in={expanded === trx.id}>
          <VStack mt={4} spacing={4} align="stretch">

            {/* PAYMENT */}
            <Box p={4} bg={sectionBg} borderRadius="lg">
            <HStack mb={2}>
              <MdOutlinePayments />
              <Text fontWeight="bold">{meta.label}</Text>
            </HStack>

            <Text>{t.transaction_payment_method}: {trx.paymentName}</Text>

            {/* 🔥 BANK + RETAIL (show code) */}
            {meta.showCode && (
              <Text>
                {meta.codeLabel || "Code"}: {trx.payCode || "-"}
              </Text>
            )}

            {/* 🔥 WALLET (redirect button) */}
            {meta.showRedirect && trx.checkoutUrl && (
            <Button
            mt={2}
            bg="brand.500"
            color="black"
            _hover={{ bg: "brand.600" }}
            _active={{ bg: "brand.700" }}
            onClick={() => window.open(trx.checkoutUrl, "_blank")}
          >
            Open Payment App
          </Button>
          )}

            {/* 🔥 QRIS */}
            {meta.showQR && trx.qr && (
              <Box mt={3}>
                <Image
                  src={trx.qr}
                  maxW="200px"
                  mx="auto"
                />
              </Box>
            )}

            <Text mt={2}>
              {t.transaction_amount_received}:{" "}
              {isPaid
                ? `Rp ${trx.amountReceived?.toLocaleString()}`
                : "-"}
            </Text>
          </Box>

            {/* FEE */}
            <Box p={4} bg={sectionBg} borderRadius="lg">
              <HStack mb={2}>
                <FaMoneyBillWave />
                <Text fontWeight="bold"> {t.transaction_fee_title}</Text>
              </HStack>
              <Text> {t.transaction_fee_merchant}: {isPaid ? trx.fee?.merchant : "-"}</Text>
              <Text>{t.transaction_fee_customer}: {isPaid ? trx.fee?.customer : "-"}</Text>
              <Text> {t.transaction_fee_total}: {isPaid ? trx.fee?.total : "-"}</Text>
            </Box>

            {/* ITEMS */}
            <Box p={4} bg={sectionBg} borderRadius="lg">
              <HStack mb={2}>
                <AiOutlineShoppingCart />
                <Text fontWeight="bold">{t.transaction_items}</Text>
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
                <Text fontWeight="bold">{t.transaction_customer}</Text>
              </HStack>
              <Text>{trx.customer?.email}</Text>
              <Text>{trx.customer?.phone}</Text>
            </Box>

          </VStack>
        </Collapse>
      </Box>
    );
  })}

  {/* PAGINATION (tetap di luar map) */}
  <HStack justify="center" mt={4}>
    <Text
      cursor={page === 1 ? "not-allowed" : "pointer"}
      opacity={page === 1 ? 0.5 : 1}
      onClick={() => page > 1 && setPage(page - 1)}
    >
       {t.pagination_prev}
    </Text>

    <Text>
      {page} / {totalPages || 1}
    </Text>

    <Text
      cursor={page === totalPages ? "not-allowed" : "pointer"}
      opacity={page === totalPages ? 0.5 : 1}
      onClick={() => page < totalPages && setPage(page + 1)}
    >
       {t.pagination_next}
    </Text>
  </HStack>
</VStack>
      )}
    </Box>
  );
}