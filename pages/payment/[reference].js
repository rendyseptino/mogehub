import { useRouter } from "next/router";
import { useEffect, useState, useMemo  } from "react";
import {
  Box,
  Text,
  VStack,
  Button,
  HStack,
  Divider,
  Badge,
  Image,
  Flex,
  Grid,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import io from "socket.io-client";
import { FaExpeditedssl } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_URL;

const APP_REDIRECT_METHODS = new Set([
  "DANA",
  "OVO",
  "SHOPEEPAY",
]);

export default function PaymentPage() {
  const router = useRouter();
  const { reference } = router.query;

  const [trx, setTrx] = useState(null);

  

  

const isRetailPayment = ["ALFAMART", "INDOMARET", "ALFAMIDI"].includes(
  trx?.paymentMethod
);

    // ✅ SAFE GUARD METHOD (taruh setelah trx state)
const isAppRedirectMethod =
  trx?.paymentMethod &&
  APP_REDIRECT_METHODS.has(trx.paymentMethod);

  const APP_BUTTON_COLOR = {
  OVO: "purple.500",
  SHOPEEPAY: "orange.400",
  DANA: "blue.500",
};

const appButtonColor = useMemo(() => {
  const method = trx?.paymentMethod;
  return APP_BUTTON_COLOR[method] || "green.500";
}, [trx?.paymentMethod]);

// ============================
// 🔥 DEEPLINK (AMAN SSR FIX)
// ============================
const deeplink = (() => {
  if (!trx) return null;

  return (
    trx?.deeplink ||
    trx?.payment_url ||
    trx?.checkout_url ||
    trx?.mobile_url ||
    trx?.payload?.deeplink ||
    trx?.payload?.payment_url ||
    trx?.payload?.checkout_url ||
    null
  );
})();

// ============================
// 🔥 VALIDASI DEEPLINK
// ============================
const isValidDeeplink =
  !!deeplink &&
  typeof deeplink === "string" &&
  (
    deeplink.startsWith("http") ||
    deeplink.startsWith("https") ||
    deeplink.startsWith("dana") ||
    deeplink.startsWith("ovo") ||
    deeplink.startsWith("shopee") ||
    deeplink.startsWith("gojek")
  );

  const [channels, setChannels] = useState([]);
  const [timeLeft, setTimeLeft] = useState("");

  const finalStatuses = [
    "PAID",
    "SUCCESS",
    "SETTLEMENT",
    "FAILED",
    "REJECTED",
    "EXPIRED",
  ];

  const [copied, setCopied] = useState({
    va: false,
    ref: false,
    amount: false,
  });

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const muted = useColorModeValue("gray.600", "gray.400");

  const appHintBg = useColorModeValue(
  `${appButtonColor.split(".")[0]}.50`,
  "whiteAlpha.100"
);

const appHintBorder = useColorModeValue(
  `${appButtonColor.split(".")[0]}.100`,
  "whiteAlpha.200"
);

const appHintText = useColorModeValue(
  "gray.800",
  "whiteAlpha.900"
);

  const logo = useColorModeValue(
    "/mogehubmasterlight.png",
    "/mogehubmasterdark.png"
  );

  const iconBg = useColorModeValue("transparent", "white");

  // FETCH TRX
  useEffect(() => {
    if (!reference) return;
    fetch(`${API}/api/checkout/${reference}`)
      .then((res) => res.json())
      .then(setTrx);
  }, [reference]);

  // AUTO REDIRECT FIX (SOCKET + POLLING SAFE)
useEffect(() => {
  if (!reference) return;

  const socket = io(API);

  socket.emit("joinPayment", reference);

  socket.on("payment-success", (data) => {
    if (data?.reference === reference) {
      router.push(`/thank-you?ref=${reference}`);
    }
  });

  socket.on("payment-failed", (data) => {
    if (data?.reference === reference) {
      router.push(`/thank-you?ref=${reference}`);
    }
  });

  return () => socket.disconnect();
}, [reference]);

useEffect(() => {
  if (!reference) return;

  const interval = setInterval(async () => {
    const res = await fetch(`${API}/api/checkout/${reference}`);
    const data = await res.json();

    setTrx(data);

    const finalStatuses = [
      "PAID",
      "SUCCESS",
      "SETTLEMENT",
      "FAILED",
      "REJECTED",
      "EXPIRED",
    ];

    if (finalStatuses.includes(data?.status)) {
      clearInterval(interval);
      router.push(`/thank-you?ref=${reference}`);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [reference]);

  // FETCH CHANNEL (INI WAJIB BIAR ICON MUNCUL)
  useEffect(() => {
    fetch(`${API}/api/checkout/payment-channels`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setChannels(data);
        else if (Array.isArray(data?.data)) setChannels(data.data);
      });
  }, []);

  // TIMER
  useEffect(() => {
    if (!trx?.expiredTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const exp = new Date(trx.expiredTime).getTime();
      const diff = exp - now;

      if (diff <= 0) {
        setTimeLeft("EXPIRED");
        clearInterval(interval);
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setTimeLeft(`${h}j ${m}m ${s}d`);
    }, 1000);

    return () => clearInterval(interval);
  }, [trx]);

  if (!trx) return <Text p={6}>Loading...</Text>;

  const payload = trx.payload || {};
  const items = payload.order_items || [];

  const paymentChannel = channels.find(
    (c) => c.code === trx.paymentMethod
  );

  const paymentIcon = paymentChannel?.icon_url;

  const qr =
  trx?.qr_url ||
  trx?.qr_image ||
  trx?.qr ||
  trx?.qrString ||
  trx?.payload?.qr ||
  trx?.payload?.qr_url ||
  trx?.payload?.qr_image ||
  trx?.payload?.qr_code;

  const downloadQR = () => {
  const link = document.createElement("a");
  link.href = qr;
  link.download = `QR-${reference}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied((p) => ({ ...p, [key]: true }));

    setTimeout(() => {
      setCopied((p) => ({ ...p, [key]: false }));
    }, 2000);
  };

  const content = (
     <>
   <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>

  {/* ================= LEFT ================= */}
  <VStack align="stretch" spacing={6}>

    {/* LOGO */}
    <Box>
      <Image
        src={logo}
        h="40px"
        w="auto"
        maxW="180px"
        objectFit="contain"
      />
    </Box>

    {/* PAYMENT STATUS */}
    <Box>
      <Text fontSize="2xl" fontWeight="bold">
        Payment Status
      </Text>
      <Badge mt={2} colorScheme="yellow">
        {trx.status}
      </Badge>
    </Box>

    {/* PAYMENT METHOD */}
    <Box
      p={5}
      bg={cardBg}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      position="relative"
    >
      {paymentIcon && (
        <Box
          position="absolute"
          top="4"
          right="4"
          bg={iconBg}
          p="6px"
          borderRadius="lg"
        >
          <Image src={paymentIcon} maxH="32px" objectFit="contain" />
        </Box>
      )}

      <Text fontSize="sm" color={muted}>Payment Method</Text>
      <Text fontWeight="bold">{trx.paymentName}</Text>
      <Text fontSize="sm" color={muted}>{trx.paymentMethod}</Text>
    </Box>

    {/* TIMER */}
    <Box>
      <Text color={muted}>Expired in</Text>
      <Text fontWeight="bold" color="red.400">
        {timeLeft}
      </Text>
    </Box>

    {isAppRedirectMethod && isValidDeeplink && (
      <Button
        bg={appButtonColor}
        color="white"
        _hover={{ opacity: 0.85 }}
        onClick={() => {
          window.location.href = deeplink;
        }}
      >
        Open Payment App
      </Button>
    )}

    {/* PAYMENT DETAILS */}
    <Box p={5} bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderColor}>
      <Text fontWeight="bold" mb={3}>Payment Details</Text>

      {trx.payCode && (
        <>
          <Text fontSize="sm" color={muted}>
            {isRetailPayment ? "Kode Bayar" : "Virtual Account"}
          </Text>

          <HStack justify="space-between">
            <Text fontWeight="bold">{trx.payCode}</Text>
            <Button size="sm" onClick={() => handleCopy(trx.payCode, "va")}>
              {copied.va ? "Copied" : "Copy"}
            </Button>
          </HStack>

          <Divider my={3} />
        </>
      )}

      <Text fontSize="sm" color={muted}>Reference</Text>
      <HStack justify="space-between">
        <Text fontSize="sm">{trx.reference}</Text>
        <Button size="xs" onClick={() => handleCopy(trx.reference, "ref")}>
          {copied.ref ? "Copied" : "Copy"}
        </Button>
      </HStack>

      <Divider my={3} />

      <Text fontSize="sm" color={muted}>Total</Text>
      <HStack justify="space-between">
        <Text fontWeight="bold">
          Rp {trx.amount?.toLocaleString("id-ID")}
        </Text>
        <Button size="xs" onClick={() => handleCopy(trx.amount.toString(), "amount")}>
          {copied.amount ? "Copied" : "Copy"}
        </Button>
      </HStack>
    </Box>

    {/* QR CODE + DOWNLOAD */}
    {qr && (
      <Box
        p={5}
        bg={cardBg}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
      >
        <Text fontWeight="bold" mb={3}>Scan QR</Text>

        <Image
          src={qr}
          mx="auto"
          maxW="220px"
          fallbackSrc="/qr-placeholder.png"
        />

        <Button
          mt={4}
          size="sm"
          onClick={downloadQR}
          colorScheme="blue"
          w="full"
        >
          Download QR
        </Button>
      </Box>
    )}


    {/* INSTRUCTION */}
    {payload.instructions?.length > 0 && (
      <Box p={5} bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderColor}>
        <Text fontWeight="bold" mb={3}>Cara Pembayaran</Text>

        <Accordion allowToggle reduceMotion={false}>
  {payload.instructions.map((group, i) => (
    <AccordionItem
      key={i}
      border="none"
      _expanded={{ bg: "transparent" }}
    >
      <AccordionButton>
        <Box flex="1" textAlign="left">
          {group.title}
        </Box>
        <AccordionIcon />
      </AccordionButton>

      <AccordionPanel
        pb={4}
        px={0}
        overflow="hidden"
        transition="height 0.25s ease, opacity 0.2s ease"
      >
        <VStack align="start" spacing={2} w="full">

          {isAppRedirectMethod && (
            <Box
              w="full"
              p={3}
              borderRadius="md"
              bg={appHintBg}
              border="1px solid"
              borderColor={appHintBorder}
            >
              <Text fontSize="sm" fontWeight="bold" color={appHintText}>
                Klik Open Payment App untuk melanjutkan pembayaran
              </Text>
            </Box>
          )}

          {group.steps.map((step, j) => (
            <Text key={j} fontSize="sm" lineHeight="1.6">
              {j + 1}. {step.replace(/<[^>]+>/g, "")}
            </Text>
          ))}

        </VStack>
      </AccordionPanel>
    </AccordionItem>
  ))}
</Accordion>
      </Box>
    )}

  </VStack>

  {/* ================= RIGHT ================= */}
  <VStack align="stretch" spacing={6}>

    {/* BUYER INFO */}
    <Box p={5} bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderColor}>
      <Text fontWeight="bold" mb={3}>Buyer Information</Text>
      <VStack align="start">
        <Text>{payload.customer_name}</Text>
        <Text>{payload.customer_email}</Text>
        <Text>{payload.customer_phone}</Text>
      </VStack>
    </Box>

    {/* ORDER DETAILS */}
    <Box p={5} bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderColor}>
      <Text fontWeight="bold" mb={3}>Order Details</Text>

      {items.map((item, i) => (
        <Flex key={i} justify="space-between">
          <Box>
            <Text fontWeight="bold">{item.name}</Text>
            <Text fontSize="sm" color={muted}>Qty: {item.quantity}</Text>
          </Box>

          <Text fontWeight="bold">
            Rp {(item.price * item.quantity).toLocaleString("id-ID")}
          </Text>
        </Flex>
      ))}
    </Box>

    {/* CHECK STATUS */}
    <Button
      bg="brand.500"
      color="black"
      _hover={{ bg: "brand.400" }}
      onClick={() => router.push(`/thank-you?ref=${reference}`)}
    >
      Check Status
    </Button>

  </VStack>

</Grid>

    {/* ================= SECURE FOOTER ================= */}
<Box mt={10} textAlign="center">
  <Flex
    justify="center"
    align="center"
    gap={2}
  >
    {/* ICON BADGE */}
    <Box
      bg={useColorModeValue("brand.500", "brand.400")}
      w="32px"
      h="32px"
      borderRadius="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    >
      <Box fontSize="16px" color="black">
        <FaExpeditedssl />
      </Box>
    </Box>

    {/* TEXT (TRUE SIDE-BY-SIDE) */}
    <Text
      fontWeight="medium"
      fontSize="sm"
      color={muted}
      lineHeight="1"
      whiteSpace="nowrap"
    >
      Secure transaction protected with SSL encryption
    </Text>
  </Flex>

  <Text fontSize="xs" color={muted} mt={2}>
    Your payment information is encrypted and safe with industry-grade security
  </Text>
</Box>
  </>
);



  return (
    <Box minH="100vh" bg={pageBg} p={6}>
      {isDesktop ? (
        <Modal isOpen isCentered size="6xl">
          <ModalOverlay bg="blackAlpha.700" />
          <ModalContent bg={cardBg} borderRadius="2xl" maxW="1100px">
            <ModalBody p={8}>{content}</ModalBody>
          </ModalContent>
        </Modal>
      ) : (
        content
      )}
    </Box>
  );
}