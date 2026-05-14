// pages/seller/subscription.js
import Head from "next/head";
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
  useColorModeValue,
  Container,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useState, useEffect, useContext } from "react";

// ================= IMPORT LANGUAGE CONTEXT =================
import { useLanguageContext } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";
import SubscriptionCheckout from "../components/subscriptionCheckout";
import { isMobileCard, isTabletCard, isDesktopCard } from "../utils/responsiveCard";
import SubscriptionHistory from "../components/SubscriptionHistory";
import SubscriptionHelp from "@/components/subscriptionHelp";
import Marquee from "react-fast-marquee";
import { useUser } from "../context/UserContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DotLoader from "@/components/DotLoader";





const translations = { en, id };

const API = process.env.NEXT_PUBLIC_API_URL;

const PACKAGES = [
  { plan: "Basic", price: 0, duration: "Selamanya", productQuota: 1, bannerQuota: 1 },
  { plan: "Essential", price: 50000, duration: "1 Bulan", productQuota: 5, bannerQuota: 5 },
  { plan: "Deluxe", price: 250000, duration: "3 Bulan", productQuota: 10, bannerQuota: 10 },
  { plan: "Gold", price: 475000, duration: "6 Bulan", productQuota: 15, bannerQuota: 15 },
  { plan: "Ultimate", price: 1200000, duration: "1 Tahun", productQuota: "Unlimited", bannerQuota: "Unlimited" },
];

const PLAN_ORDER = {
  Basic: 0,
  Essential: 1,
  Deluxe: 2,
  Gold: 3,
  Ultimate: 4,
};

function MarqueeText({ user, activeSubscription, isLoggedIn }) {
  const { language } = useLanguageContext();

  const username =
  user?.username ||
  user?.name ||
  user?.fullName ||
  user?.email?.split("@")[0] ||
  "User";

  const plan = activeSubscription?.plan || "Basic";

  const text = isLoggedIn
    ? language === "en"
      ? `🔥 Hello ${username}, your current plan is ${plan}. You can choose another plan that fits your advertising needs.`
      : `🔥 Halo ${username}, paket kamu saat ini ${plan}. Kamu dapat memilih paket lain yang sesuai dengan kebutuhan iklan.`
    : language === "en"
    ? "🔥 Your free plan is active immediately after signup — upgrade anytime to unlock more visibility and sales power"
    : "🔥 Paket gratis kamu langsung aktif setelah daftar — upgrade kapan saja untuk membuka lebih banyak visibilitas dan penjualan";
  return (
   <Box
  w="100%"
  bg="brand.500"
  py={3}
  position="fixed"
  top="0"
  left="0"
  zIndex="999" // cukup di bawah drawer lo
>
      <Marquee speed={50} gradient={false} pauseOnHover>
        <Text
          fontWeight="bold"
          color="black"
          mx={10}
          letterSpacing="0.3px"
        >
          {text}
        </Text>
      </Marquee>
    </Box>
  );
}

export default function SubscriptionPage() {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  const pageTitle =
  language === "en"
    ? "Subscription - MogeHub"
    : "Paket Berlangganan - MogeHub";
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const loaderBg = useColorModeValue("white", "gray.900");
  const loaderColor = useColorModeValue("black", "white");
  useEffect(() => {
  const reopen = localStorage.getItem("reopenCheckout");
  const savedPackage = localStorage.getItem("selectedPackage");
  

  

  

  if (reopen === "true" && savedPackage) {
    setSelectedPackage(JSON.parse(savedPackage)); 
    setCheckoutOpen(true);

    localStorage.removeItem("reopenCheckout");
    localStorage.removeItem("selectedPackage");
  }
}, []);
  const { user: ctxUser, token: ctxToken } = useUser();
  const [localAuth, setLocalAuth] = useState({
  user: null,
  token: null,
});
const user = localAuth.user || ctxUser;
const token = localAuth.token || ctxToken;
const isLoggedIn = !!user && !!token;
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const subscriptionBg = useColorModeValue(
  "url('/subscription-light.png')",
  "url('/subscription-dark.png')"
);

  useEffect(() => {
    const update = () => {
      setIsMobile(isMobileCard());
      setIsTablet(isTabletCard());
      setIsDesktop(isDesktopCard());
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
  const syncAuth = () => {
    const u = localStorage.getItem("user");
    const t = localStorage.getItem("token");

    setLocalAuth((prev) => {
      const parsedUser = u ? JSON.parse(u) : null;

      // 🔥 penting: cegah re-render kalau sama
      if (
        prev.user?.id === parsedUser?.id &&
        prev.token === t
      ) {
        return prev;
      }

      return {
        user: parsedUser,
        token: t || null,
      };
    });
  };

  syncAuth();

  window.addEventListener("storage", syncAuth);

  return () => {
    window.removeEventListener("storage", syncAuth);
  };
}, []);

  const fetchSubscription = async () => {
    if (!isLoggedIn) return;

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
  if (!user?.id || !token) return;

  fetchSubscription();
}, [user, token]);

  const openCheckout = (pkg) => {
  const currentPlan = activeSubscription?.plan;
  const currentRank = PLAN_ORDER[currentPlan] ?? -1;
  const targetRank = PLAN_ORDER[pkg.plan];

  const isUpgrade = targetRank > currentRank;
  const isDowngrade = targetRank < currentRank;
  const isSame = targetRank === currentRank;

  let action = "upgrade";
  if (targetRank < currentRank) action = "downgrade";
  if (targetRank === currentRank) action = "same";

  setSelectedPackage({ ...pkg, action });
  setCheckoutOpen(true);
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

  if (loading && isLoggedIn) {
  return (
    <Flex justify="center" py={16}>
      <Spinner size="xl" />
    </Flex>
  );
}

if (!mounted) {
  return (
    <Flex
      w="100%"
      h="100vh"
      bg={loaderBg}
      align="center"
      justify="center"
      position="fixed"
      top="0"
      left="0"
      zIndex="9999"
    >
      <DotLoader color={loaderColor} />
    </Flex>
  );
}
  
   
 return (
  <Box w="100%" minH="100vh">
     <Head>
        <title>{pageTitle}</title>
      </Head>

    {/* 🔥 MARQUEE PALING ATAS */}
    <MarqueeText
  user={user}
  activeSubscription={activeSubscription}
  isLoggedIn={isLoggedIn}
/>

    {/* 🔥 NAVBAR */}
    <Box sx={{ "& > div": { top: "40px !important" } }}>
  <Navbar />
</Box>

    {/* 🔥 MAIN BACKGROUND + CONTENT */}
    <Box
      py={12}
      mt={2}
      bgImage={subscriptionBg}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      bgAttachment="fixed"
    >
      <Container maxW="6xl" pt="90px">

        {/* HEADER + ALERT */}
        <Flex
          align="center"
          mb={4}
          mt={6}
          flexWrap={{ base: "wrap", md: "nowrap" }}
          justify="space-between"
        >
          <Heading size="lg">
            {t.subscriptionPackages || "Paket Berlangganan"}
          </Heading>

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
                <Text flex="1">
                  {t.activePackage || "Paket Aktif"}: <b>{activeSubscription.plan}</b>
                </Text>
                <Button size="sm" onClick={() => setOpenHistory(true)}>
                  {t.detail || "Detail"}
                </Button>
              </Flex>
            </Alert>
          )}
        </Flex>

  <Divider mb={8} borderColor={colorMode === "light" ? "gray.200" : "gray.600"} />

  {/* ========================= */}
  {/* 🔥 GRID SECTION (ANCHOR) */}
  {/* ========================= */}
  <SimpleGrid
    id="upgrade-section"
    columns={{ base: 1, md: 2, lg: 3 }}
    spacing={{ base: 6, md: 8, lg: 10 }}
    justifyItems="center"
  >
    {PACKAGES.map((pkg) => {
      const isGuestBasicActive = !isLoggedIn && pkg.plan === "Basic";
      const isActive =
        activeSubscription?.plan === pkg.plan || isGuestBasicActive;
      const isRecommended = pkg.plan === "Deluxe";
      const currentPlan = activeSubscription?.plan;
      const currentRank = PLAN_ORDER[currentPlan] ?? -1;
      const targetRank = PLAN_ORDER[pkg.plan] ?? -1;

      const isUpgrade = targetRank > currentRank;
      const isDowngrade = targetRank < currentRank;
      const isSame = targetRank === currentRank;

      const isBasic = pkg.plan === "Basic";
      const hasPaidPlan =
        activeSubscription &&
        activeSubscription.plan !== "Basic";

      return (
        <Box
          key={pkg.plan}
          position="relative"
          w="100%"
          maxW="320px"
          mx="auto"
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
            <Box position="absolute" top="12px" right="12px" zIndex={3}>
              <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                {t.active || "Aktif"}
              </Badge>
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
                color={
                  isRecommended
                    ? colorMode === "light"
                      ? "black"
                      : "brand.500"
                    : "gray.500"
                }
                fontWeight={isRecommended ? "bold" : "normal"}
              >
                {isRecommended ? t.bestChoice || "Best Choice" : t.packageInfo || "Paket berlangganan"}
              </Text>
            </Box>

            <Box>
              <Text fontSize="3xl" fontWeight="extrabold" lineHeight="1">
                {pkg.price === 0
                  ? t.free || "Gratis"
                  : `Rp ${pkg.price.toLocaleString("id-ID")}`}
              </Text>

              <Text fontSize="sm" color="gray.500">
                {isActive && activeSubscription
                  ? getDuration(activeSubscription.startDate, activeSubscription.endDate)
                  : pkg.duration}
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
                  <Text fontSize="xs" color="gray.500">
                    {t.reviewPriority || "Prioritas Review"}
                  </Text>
                  <Text fontWeight="bold" fontSize="sm">
                    {t.fasterDisplay || "Lebih cepat tampil"}
                  </Text>
                </Box>
              )}
            </VStack>

            {!(isBasic && hasPaidPlan) && !( !isLoggedIn && isBasic ) && (
              <Button
                w="full"
                mt="auto"
                bg="brand.500"
                color="black"
                _hover={{ bg: "brand.600" }}
                _active={{ bg: "brand.700" }}
                isLoading={upgradeLoading}
                onClick={() => openCheckout(pkg)}
                disabled={isActive}
                opacity={isActive ? 0.8 : 1}
              >
                {isActive
                  ? t.activePackage || "Paket Aktif"
                  : isUpgrade
                  ? t.upgradePackage || "Upgrade Paket"
                  : isDowngrade
                  ? t.downgradePackage || "Downgrade Paket"
                  : "Pilih Paket"}
              </Button>
            )}
          </VStack>
        </Box>
      );
    })}
  </SimpleGrid>
</Container>
</Box>

{/* ========================= */}
{/* 🔥 BUTTON SECTION (SEPARATE) */}
{/* ========================= */}

<Box
  w="100%"
  mt={0}   // 🔥 HAPUS GAP KOSONG
  py={16}
  px={6}
  bgGradient={
    colorMode === "light"
      ? "linear(to-r, rgba(255,140,0,0.18), rgba(0,123,255,0.14), rgba(255,255,255,0))"
      : "linear(to-r, rgba(255,140,0,0.22), rgba(0,123,255,0.18), rgba(0,0,0,0))"
  }
  position="relative"
  overflow="hidden"
>

  <Box
    position="absolute"
    top="-60px"
    left="50%"
    transform="translateX(-50%)"
    w="420px"
    h="420px"
    bg="brand.500"
    opacity="0.12"
    filter="blur(90px)"
  />

  <Flex justify="center" position="relative" zIndex={2}>
    <Button
      bg="brand.500"
      color="black"
      size="lg"
      rounded="full"
      px={10}
      py={6}
      fontWeight="bold"
      onClick={() => {
        const el = document.getElementById("upgrade-section");
        if (el) {
          const yOffset = -100;
          const y =
            el.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;

          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }}
    >
      {t.choosePackage}
    </Button>
  </Flex>
</Box>

{/* 🔥 FOOTER PALING BAWAH */}
<Footer />

{/* MODALS */}
<SubscriptionHistory
  isOpen={openHistory}
  onClose={() => setOpenHistory(false)}
  data={allSubscriptions}
/>

<SubscriptionCheckout
  isOpen={checkoutOpen}
  onClose={() => setCheckoutOpen(false)}
  selectedPackage={selectedPackage}
  user={user}
  token={token}
  onSuccess={fetchSubscription}
/>

<SubscriptionHelp />

</Box>
);
}