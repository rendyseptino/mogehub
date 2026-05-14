"use client";

import {
  Box,
  Container,
  Text,
  VStack,
  Heading,
  Badge,
  Spinner,
  Button,
  Flex,
  SimpleGrid,
  Icon,
  Card,
  CardBody,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ThankYouPage() {
  const router = useRouter();
  const { ref } = router.query;

  const [trx, setTrx] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🎨 THEME
  const bgPage = useColorModeValue(
    "url('/thankyou-light.png')",
    "url('/thankyou-dark.png')"
  );

  const cardBg = useColorModeValue("white", "whiteAlpha.100");
  const textColor = useColorModeValue("black", "white");
  const muted = useColorModeValue("gray.600", "gray.400");

  const logo = useColorModeValue(
    "/mogehubmasterlight.png",
    "/mogehubmasterdark.png"
  );

  // STATUS CONFIG
  const statusConfig = {
    PAID: {
      title: "Payment Successful",
      iconColor: "green.400",
      icon: CheckCircleIcon,
      desc: "Your transaction has been completed successfully.\n\nPlease click the 'Go to Dashboard' button below to view your purchased package and start creating product ads or banners.",
      badge: "green",
    },
    PENDING: {
      title: "Waiting for Payment",
      iconColor: "yellow.400",
      icon: WarningIcon,
      desc: "Please complete your payment.\n\nPlease Click Continue Payment to proceed.",
      badge: "yellow",
    },
    EXPIRED: {
      title: "Payment Expired",
      iconColor: "red.400",
      icon: WarningIcon,
      desc: "This transaction has expired.\n\nPlease go to your dashboard to make a new purchase.",
      badge: "red",
    },
    FAILED: {
      title: "Payment Failed",
      iconColor: "red.400",
      icon: WarningIcon,
      desc: "Payment was rejected.\n\nPlease go to your dashboard to try the purchase again.",
      badge: "red",
    },
  };

  // =========================
  // FETCH (ANTI FLICKER STABLE)
  // =========================
  const fetchTransaction = async (refId) => {
    if (!refId) return;

    try {
      const res = await fetch(`${API}/api/checkout/${refId}`);
      const data = await res.json();

      setTrx((prev) => {
        if (!data) return prev;

        // 🔒 LOCK STATUS PAID (ANTI FALLBACK PENDING)
        if (prev?.status === "PAID") return prev;

        // 🔥 update only if changed
        if (!prev || prev.status !== data.status) {
          return data;
        }

        return prev;
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (!router.isReady || !ref) return;

  let interval;

  const run = async () => {
    await fetchTransaction(ref);

    interval = setInterval(async () => {
      const res = await fetch(`${API}/api/checkout/${ref}`);
      const data = await res.json();

      setTrx((prev) => {
        if (prev?.status === "PAID") return prev;
        return data;
      });

      if (data.status === "PAID") {
        clearInterval(interval); // 🔥 STOP
      }
    }, 3000);
  };

  run();

  return () => clearInterval(interval);
}, [router.isReady, ref]);

  const formatPrice = (num) =>
    new Intl.NumberFormat("id-ID").format(num || 0);

  const payload = trx?.payload || {};

  const status = statusConfig[trx?.status];
  const StatusIcon = status?.icon || WarningIcon;

  const payment = {
    name: trx?.paymentName || payload.payment_name,
    code: trx?.paymentMethod || payload.payment_method,
    icon: trx?.payload?.payment_icon || trx?.payload?.icon_url,
  };

  const isPending = trx?.status === "PENDING";

  const paymentRef =
  trx?.reference ||
  trx?.merchantRef ||
  ref;

  // =========================
  // FIXED LOADING (CLEAN SPINNER)
  // =========================
  if (loading || !router.isReady || !trx?.status || !status) {
    return (
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bg="transparent"
      >
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box
      minH="100vh"
      bgImage={bgPage}
      bgSize="cover"
      bgPos="center"
      color={textColor}
      py={16}
    >
      <Container maxW="850px">

        {/* LOGO */}
        <Flex justify="center" mb={6}>
        <Image
          src={logo}
          alt="Mogehub"
          h="45px"
          cursor="pointer"
          onClick={() => router.push("/")}
        />
      </Flex>

        {/* STATUS */}
        <VStack spacing={3} textAlign="center" mb={10}>
          <Icon as={StatusIcon} w={12} h={12} color={status.iconColor} />
          <Heading size="lg">{status.title}</Heading>
          <Text color={muted}>{status.desc}</Text>
        </VStack>

        <VStack spacing={6}>

          {/* TRANSACTION */}
          <Card w="full" bg={cardBg} borderRadius="2xl">
            <CardBody>
              <Flex justify="space-between">
                <Text fontSize="sm" color={muted}>INVOICE</Text>
                <Badge colorScheme={status.badge}>{trx.status}</Badge>
              </Flex>

              <Text fontWeight="bold" mt={1}>
                {trx.merchantRef || trx.reference}
              </Text>

              <Text fontSize="sm" color={muted} mt={2}>
                Amount: Rp {formatPrice(trx.amount)}
              </Text>
            </CardBody>
          </Card>

          {/* PAYMENT */}
          <Card w="full" bg={cardBg} borderRadius="2xl">
            <CardBody>
              <Text fontWeight="bold" mb={4}>Payment Method</Text>

              <Flex align="center" gap={4}>
                {payment.icon && (
                  <Image src={payment.icon} boxSize="42px" />
                )}

                <Box>
                  <Text fontWeight="bold">{payment.name || "-"}</Text>
                  <Text fontSize="sm" color={muted}>{payment.code}</Text>
                </Box>
              </Flex>
            </CardBody>
          </Card>

          {/* BUYER INFO (KEEP YOUR ORIGINAL LOGIC) */}
            <Card w="full" bg={cardBg} borderRadius="2xl">
              <CardBody>
                <Text fontWeight="bold" mb={4}>
                  Buyer Information
                </Text>

                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="xs" color={muted}>Name</Text>
                    <Text>{trx.customer_name || payload.customer_name || "-"}</Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" color={muted}>Email</Text>
                    <Text>{trx.customer_email || payload.customer_email || "-"}</Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" color={muted}>Phone</Text>
                    <Text>{trx.customer_phone || payload.customer_phone || "-"}</Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" color={muted}>Amount</Text>
                    <Text fontWeight="bold">
                      Rp {formatPrice(trx.amount)}
                    </Text>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>

          {/* ORDER */}
          <Card w="full" bg={cardBg} borderRadius="2xl">
            <CardBody>
              <Text fontWeight="bold" mb={4}>Order Items</Text>

              <VStack align="stretch" spacing={3}>
                {(payload.order_items || []).map((item, i) => (
                  <Flex key={i} justify="space-between" p={3}>
                    <Box>
                      <Text fontWeight="bold">{item.name}</Text>
                      <Text fontSize="sm" color={muted}>
                        Qty: {item.quantity}
                      </Text>
                    </Box>

                    <Text>
                      Rp {formatPrice(item.price * item.quantity)}
                    </Text>
                  </Flex>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* BUTTON */}
          <Button
          size="lg"
          w="full"
          bg="brand.500"
          color="black"
          _hover={{ bg: "brand.600" }}
          onClick={() => {
            if (isPending) {
              router.push(`/payment/${paymentRef}`);
            } else {
              router.push({
                pathname: "/seller/dashboard",
                query: { tab: "subscription" },
              });
            }
          }}
        >
          {isPending ? "Continue Payment" : "Go to Dashboard"}
        </Button>

        </VStack>
      </Container>
    </Box>
  );
}