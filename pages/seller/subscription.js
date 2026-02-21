// pages/seller/subscription.js
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Divider,
  Spinner,
  useToast,
  useColorMode,
  Container,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

// ================= IMPORT LANGUAGE CONTEXT =================
import { useLanguageContext } from "../../context/LanguageContext";
import en from "../../locales/en.json";
import id from "../../locales/id.json";

const translations = { en, id };

const API = process.env.NEXT_PUBLIC_API_URL;

const PACKAGES = [
  { plan: "Basic", price: 0, duration: "Selamanya", productQuota: 1, bannerQuota: 1 },
  { plan: "Essential", price: 50000, duration: "1 Bulan", productQuota: 5, bannerQuota: 5 },
  { plan: "Deluxe", price: 250000, duration: "3 Bulan", productQuota: 10, bannerQuota: 10 },
  { plan: "Gold", price: 475000, duration: "6 Bulan", productQuota: 15, bannerQuota: 15 },
  { plan: "Ultimate", price: 1200000, duration: "1 Tahun", productQuota: "Unlimited", bannerQuota: "Unlimited" },
];

export default function SubscriptionPage() {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("user");
      const tkn = localStorage.getItem("token");
      if (u) setUser(JSON.parse(u));
      if (tkn) setToken(tkn);
    }
  }, []);

  const fetchSubscription = async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API}/subscription/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setActiveSubscription(data.subscription);
        setAllSubscriptions(data.all || []);
      } else {
        toast({ title: data.error || t.failedFetch || "Gagal fetch subscription", status: "error" });
      }
    } catch (e) {
      toast({ title: e.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) fetchSubscription();
  }, [user, token]);

  const handleUpgrade = async (pkg) => {
    if (!user || !token) return toast({ title: t.loginFirst || "Login dulu", status: "error" });
    if (activeSubscription?.plan === pkg.plan) return;

    setUpgradeLoading(true);

    try {
      const res = await fetch(`${API}/subscription/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, plan: pkg.plan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.failedUpgrade || "Gagal upgrade paket");

      toast({ title: `${t.upgradedTo || "Berhasil upgrade ke"} ${pkg.plan}`, status: "success", duration: 2000 });
      await fetchSubscription();
    } catch (err) {
      toast({ title: err.message, status: "error" });
    } finally {
      setUpgradeLoading(false);
    }
  };

  const formatDateID = (dateStr) => {
    if (!dateStr) return t.forever || "Selamanya";
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("id-ID", options);
  };

  const getDuration = (start, end) => {
    if (!end) return t.forever || "Selamanya";
    return `${formatDateID(start)} - ${formatDateID(end)}`;
  };

  if (loading) {
    return (
      <Flex justify="center" py={16}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box py={12} position="relative">
      <Container maxW="6xl">
        {/* HEADER + ALERT */}
        <Flex
          align="center"
          mb={4}
          flexWrap={{ base: "wrap", md: "nowrap" }}
          justify="space-between"
        >
          <Heading size="lg">{t.subscriptionPackages || "Paket Berlangganan"}</Heading>

          {activeSubscription && (
            <Alert
              status="info"
              variant="left-accent"
              borderRadius="md"
              fontSize="sm"
              display="flex"
              alignItems="center"
              p={3}
              w={{ base: "100%", md: "auto" }}
              mt={{ base: 2, md: 0 }}
            >
              <AlertIcon />
              <Flex align="center" justify="space-between" w="full" gap={2}>
                <Text flex="1">{t.activePackage || "Paket Aktif"}: <b>{activeSubscription.plan}</b></Text>
                <Button size="sm" onClick={() => setOpenHistory(true)}>{t.detail || "Detail"}</Button>
              </Flex>
            </Alert>
          )}
        </Flex>

        <Divider mb={8} borderColor={colorMode === "light" ? "gray.200" : "gray.600"} />

        {/* GRID PAKET */}
        <SimpleGrid minChildWidth="260px" spacing={10} justifyItems="center">
          {PACKAGES.map((pkg) => {
            const isActive = activeSubscription?.plan === pkg.plan;
            const isRecommended = pkg.plan === "Deluxe";

            return (
              <Box
                key={pkg.plan}
                position="relative"
                w="100%"
                maxW="280px"
                borderRadius="2xl"
                overflow="hidden"
                bg={colorMode === "light" ? "white" : "gray.800"}
                borderWidth="1px"
                borderColor={
                  isActive
                    ? "brand.500"
                    : isRecommended
                    ? "brand.400"
                    : colorMode === "light"
                    ? "gray.200"
                    : "gray.700"
                }
                boxShadow={isRecommended ? "2xl" : "lg"}
                transition="all .25s ease"
                _hover={{ transform: "translateY(-8px)", boxShadow: "2xl" }}
              >
                {isRecommended && (
                  <Box
                    position="absolute"
                    top="16px"
                    right="-52px"
                    w="180px"
                    textAlign="center"
                    transform="rotate(45deg)"
                    bg="brand.500"
                    color="black"
                    py="4px"
                    fontSize="xs"
                    fontWeight="bold"
                    letterSpacing="0.08em"
                    boxShadow="lg"
                    zIndex={2}
                  >
                    {t.topPick || "Top Pick"}
                  </Box>
                )}

                {isActive && (
                  <Box position="absolute" top="12px" left="12px" zIndex={3}>
                    <Badge colorScheme="green" borderRadius="full" px={3} py={1}>{t.active || "Aktif"}</Badge>
                  </Box>
                )}

                <Box
                  h="6px"
                  bgGradient={
                    isActive || isRecommended
                      ? "linear(to-r, brand.400, brand.600)"
                      : colorMode === "light"
                      ? "linear(to-r, gray.200, gray.300)"
                      : "linear(to-r, gray.600, gray.700)"
                  }
                />

                <VStack align="stretch" spacing={5} p={6} minH="460px" position="relative" zIndex={1}>
                  <Box mt={isActive ? 6 : 0}>
                    <Heading size="md">{pkg.plan}</Heading>
                    <Text
                      fontSize="xs"
                      mt={1}
                      color={isRecommended ? (colorMode === "light" ? "black" : "brand.500") : "gray.500"}
                      fontWeight={isRecommended ? "bold" : "normal"}
                    >
                      {isRecommended ? t.bestChoice || "Best Choice" : t.packageInfo || "Paket berlangganan"}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="3xl" fontWeight="extrabold" lineHeight="1">
                      {pkg.price === 0 ? t.free || "Gratis" : `Rp ${pkg.price.toLocaleString("id-ID")}`}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {isActive && activeSubscription ? getDuration(activeSubscription.startDate, activeSubscription.endDate) : pkg.duration}
                    </Text>
                  </Box>

                  <Divider />

                  <VStack align="stretch" spacing={3} flex="1">
                    <Box p={3} borderRadius="lg" bg={colorMode === "light" ? "gray.100" : "gray.700"}>
                      <Text fontSize="xs" color="gray.500">{t.productQuota || "Kuota Iklan Produk"}</Text>
                      <Text fontWeight="bold" fontSize="sm">{pkg.productQuota}</Text>
                    </Box>
                    <Box p={3} borderRadius="lg" bg={colorMode === "light" ? "gray.100" : "gray.700"}>
                      <Text fontSize="xs" color="gray.500">{t.bannerQuota || "Kuota Iklan Banner"}</Text>
                      <Text fontWeight="bold" fontSize="sm">{pkg.bannerQuota}</Text>
                    </Box>
                    {pkg.plan !== "Basic" && (
                      <Box p={3} borderRadius="lg" bg={colorMode === "light" ? "gray.100" : "gray.700"}>
                        <Text fontSize="xs" color="gray.500">{t.reviewPriority || "Prioritas Review"}</Text>
                        <Text fontWeight="bold" fontSize="sm">{t.fasterDisplay || "Lebih cepat tampil"}</Text>
                      </Box>
                    )}
                  </VStack>

                  <Button
                    w="full"
                    mt="auto"
                    bg="brand.500"
                    color="black"
                    _hover={{ bg: "brand.600" }}
                    _active={{ bg: "brand.700" }}
                    isLoading={upgradeLoading}
                    onClick={() => handleUpgrade(pkg)}
                    disabled={isActive}
                    opacity={isActive ? 0.8 : 1}
                  >
                    {isActive ? t.activePackage || "Paket Aktif" : t.upgradePackage || "Upgrade Paket"}
                  </Button>
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      </Container>

      {/* HISTORY MODAL */}
      <Box
        position="fixed"
        top={0}
        right={openHistory ? 0 : "-100%"}
        h="100vh"
        w={{ base: "80%", md: "400px" }}
        bg={colorMode === "light" ? "white" : "gray.800"}
        boxShadow="xl"
        zIndex={9998}
        transition="right 0.3s ease-in-out"
        overflowY="auto"
        p={6}
      >
        <Flex justify="space-between" mb={4}>
          <Heading size="md">{t.subscriptionHistory || "History Subscription"}</Heading>
          <Button size="sm" onClick={() => setOpenHistory(false)}>{t.close || "Close"}</Button>
        </Flex>
        <VStack spacing={4} align="stretch">
          {allSubscriptions.map((sub) => (
            <Box
              key={sub.id}
              p={4}
              borderRadius="md"
              bg={colorMode === "light" ? "gray.100" : "gray.700"}
            >
              <Flex justify="space-between">
                <Text fontWeight="bold">{sub.plan}</Text>
                <Badge colorScheme={sub.status === "active" ? "green" : "gray"}>{sub.status}</Badge>
              </Flex>
              <Text fontSize="sm">
                {formatDateID(sub.startDate)} - {sub.endDate ? formatDateID(sub.endDate) : t.forever || "Selamanya"}
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}
