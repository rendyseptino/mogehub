"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Spinner,
  useToast,
  VStack,
  HStack,
  Badge,
  Grid,
  Select,
  useColorModeValue,
  useColorMode,
} from "@chakra-ui/react";

import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

import { mobileAndTabletPadding } from "../../utils/responsive";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const backendUrl = process.env.NEXT_PUBLIC_API_URL;

// ================= HELPERS =================
const safeArray = (val) => (Array.isArray(val) ? val : []);
const safeObject = (val) => (typeof val === "object" && val !== null ? val : {});

const formatNumber = (num) =>
  new Intl.NumberFormat("id-ID").format(num || 0);

const formatCurrency = (num) =>
  "Rp " + new Intl.NumberFormat("id-ID").format(num || 0);

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const getMonthName = (monthNumber) => monthNames[monthNumber - 1] || "-";

// ================= STAT CARD COMPONENT =================
const StatCard = ({ title, value, index }) => {
  const cardBg = useColorModeValue("white", "gray.800");

  const borderColors = ["#ceff00", "#90cdf4", "#E53E3E", "#D69E2E"];
  const borderColor = useColorModeValue(
    borderColors[index] || "gray.200",
    borderColors[index] || "gray.700"
  );

  return (
    <Box
      p={6}
      borderWidth="2px"
      borderColor={borderColor}
      borderRadius="2xl"
      bg={cardBg}
      shadow="lg"
      minH="100px"
    >
      <Text fontSize="sm" color="gray.500">
        {title}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" mt={2}>
        {value}
      </Text>
    </Box>
  );
};

export default function MainDashboard() {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const [loading, setLoading] = useState(true);

  const [kpi, setKPI] = useState({});
  const [userGrowth, setUserGrowth] = useState([]);
  const [revenueOverTime, setRevenueOverTime] = useState([]);
  const [boostedPerformance, setBoostedPerformance] = useState([]);

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [topBlogPosts, setTopBlogPosts] = useState([]);
  const [topHelpArticles, setTopHelpArticles] = useState([]);

  const isDark = colorMode === "dark";

  // ================= FETCH =================
  const fetchDashboard = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const endpoints = [
        `kpi?month=${month}&year=${year}`,
        `user-growth?month=${month}&year=${year}`,
        `revenue?month=${month}&year=${year}`,
        `boosted-ads-performance`,
      ];

      const responses = await Promise.all(
        endpoints.map((ep) =>
          fetch(`${backendUrl}/admin/dashboard/${ep}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      const jsonData = await Promise.all(
        responses.map(async (res) => {
          try {
            return await res.json();
          } catch {
            return null;
          }
        })
      );

      const kpiData = safeObject(jsonData[0]);

      setKPI({
        ...kpiData,
        totalProductAds: kpiData.totalProductAds ?? kpiData.totalAds ?? 0,
        totalBannerAds: kpiData.totalBannerAds ?? kpiData.totalBanners ?? 0,
        monthlyUsers: kpiData.monthlyUsers ?? 0,
        totalHistoricalUsers: kpiData.totalHistoricalUsers ?? 0,

        totalActiveBoostPackages: kpiData.totalActiveBoostPackages ?? 0,
        totalExpiredBoostPackages: kpiData.totalExpiredBoostPackages ?? 0,
        
      });

      setTopBlogPosts(safeArray(kpiData.topBlogPosts));
      setTopHelpArticles(safeArray(kpiData.topHelpArticles));

      setUserGrowth(safeArray(jsonData[1]));
      setRevenueOverTime(safeArray(jsonData[2]));
      setBoostedPerformance(
        safeArray(jsonData[3]).map((b) => ({
          ...b,
          adTitle:
            b.adTitle ||
            (b.boostAd?.adTitle || b.boostAd?.ad?.title) ||
            `Ad #${b.adId || "-"}`,
          adId: b.adId || b.boostAd?.adId || b.boostAd?.ad?.id || "-",
          sellerName: b.user?.username || "-", // mapping sesuai backend baru
        }))
      );
    } catch (err) {
      toast({
        title: t.common_error,
        description: err.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [month, year]);

  // ================= CHART OPTIONS =================
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: isDark ? "#E2E8F0" : "#2D3748",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? "#CBD5E0" : "#4A5568",
        },
      },
      y: {
        ticks: {
          color: isDark ? "#CBD5E0" : "#4A5568",
        },
      },
    },
  };

  // ================= CHART DATA =================
  const userGrowthChart = {
    labels: userGrowth.map((d) => d.date || "-"),
    datasets: [
      {
        label: t.dashboard_user_growth,
        data: userGrowth.map((d) => Number(d.count) || 0),
        borderColor: "#4FD1C5",
        backgroundColor: "rgba(79, 209, 197, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const revenueChart = {
    labels: revenueOverTime.map((d) => d.date || "-"),
    datasets: [
      {
        label: t.revenueChart,
        data: revenueOverTime.map((d) => Number(d.total) || 0),
        borderColor: "#F6AD55",
        backgroundColor: "rgba(246, 173, 85, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const subscriptionPie = {
    labels: safeArray(kpi.subscriptionPackages).map((d) => d.plan),
    datasets: [
      {
        data: safeArray(kpi.subscriptionPackages).map((d) => d?._count?.id || 0),
        backgroundColor: ["#3182CE", "#805AD5", "#DD6B20", "#38A169"],
      },
    ],
  };

  const boostPie = {
    labels: safeArray(kpi.boostPackages).map((d) => d.tier),
    datasets: [
      {
        data: safeArray(kpi.boostPackages).map((d) => d?._count?.id || 0),
        backgroundColor: ["#E53E3E", "#D69E2E", "#319795", "#805AD5"],
      },
    ],
  };

  // ================= UI =================
  if (loading)
    return (
      <Flex justify="center" mt={10}>
        <Spinner size="xl" />
      </Flex>
    );

  return (
    <Box p={mobileAndTabletPadding}>
      <Heading size="lg" mb={6}>
        🚀 {t.dashboard_main_title}
      </Heading>

      {/* FILTER */}
      <HStack mb={6}>
        <Select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          maxW="150px"
        >
          {monthNames.map((name, i) => (
            <option key={i} value={i + 1}>
              {name}
            </option>
          ))}
        </Select>

        <Select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          maxW="150px"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </Select>
      </HStack>

      {/* KPI */}
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(4,1fr)" }}
        gap={4}
      >
        <StatCard
          title={t.dashboard_total_active_users}
          value={formatNumber(kpi.totalUsers)}
          index={0}
        />
        <StatCard
          title={t.dashboard_total_historical_users}
          value={formatNumber(kpi.totalHistoricalUsers)}
          index={1}
        />
        <StatCard
         title={t.dashboard_total_ads}
          value={formatNumber(kpi.totalAds)}
          index={2}
        />
        <StatCard title={t.dashboard_total_boost_ads} value={formatNumber(kpi.totalBoostedAds)} index={3} />
      </Grid>


     {/* ================= NEW KPI ================= */}
<Box mt={10}>
  <Heading size="sm" mb={3}>
    🔥 {t.dashboard_boost_overview}
  </Heading>

  <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={4}>
    <StatCard
      title={t.dashboard_active_boost_ads}
      value={formatNumber(kpi.totalActiveBoostPackages)}
      
    />
    <StatCard
      title={t.dashboard_expired_boost_ads}
      value={formatNumber(kpi.totalExpiredBoostPackages)}
      
    />
  </Grid>
</Box>

      {/* REVENUE SECTION */}
      <Box mt={10}>
        <Heading size="sm" mb={3}>
          💰 {t.dashboard_revenue_breakdown} ({getMonthName(month)} {year})
        </Heading>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }} gap={4}>
          <StatCard
            title={t.dashboard_revenue_subscription}
            value={formatCurrency(kpi.revenueSubscription)}
          />
          <StatCard
           title={t.dashboard_revenue_boost}
            value={formatCurrency(kpi.revenueBoost)}
          />
          <StatCard
            title={t.dashboard_total_revenue}
            value={formatCurrency(kpi.totalRevenue)}
          />
        </Grid>
      </Box>

      {/* ADS OVERVIEW */}
      <Box mt={10}>
        <Heading size="sm" mb={3}>
          📢{t.dashboard_ads_overview} ({getMonthName(month)} {year})
        </Heading>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={4}>
          <StatCard
            title={t.dashboard_ads_product}
            value={formatNumber(kpi.totalProductAds)}
          />
          <StatCard
           title={t.dashboard_ads_banner}
            value={formatNumber(kpi.totalBannerAds)}
          />
        </Grid>
      </Box>

      {/* USER GROWTH */}
      <Box mt={10}>
        <Heading size="sm" mb={3}>
          👤 {t.dashboard_user_growth} ({getMonthName(month)} {year})
        </Heading>

        <StatCard
          title={t.dashboard_monthly_users}
          value={formatNumber(kpi.monthlyUsers)}
        />
      </Box>

      {/* USER GROWTH CHART */}
      <Box mt={10}>
        <Heading size="sm" mb={3}>
         {t.dashboard_user_growth}
        </Heading>
        <Line data={userGrowthChart} options={chartOptions} />
      </Box>

      {/* REVENUE CHART */}
      <Box mt={10}>
        <Heading size="sm" mb={3}>
          {t.dashboard_revenue_trend}
        </Heading>
        <Line data={revenueChart} options={chartOptions} />
      </Box>

      {/* PIE CHART */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mt={10}>
        <Box>
          <Heading size="sm" mb={3}>
           {t.dashboard_subscription_packages}
          </Heading>
          <Pie data={subscriptionPie} />
        </Box>

        <Box>
          <Heading size="sm" mb={3}>
           {t.dashboard_boost_packages}
          </Heading>
          <Pie data={boostPie} />
        </Box>
      </Grid>

      {/* FORUM */}
      <Box mt={10}>
        <Heading size="sm">🔥 {t.dashboard_top_forum_threads}</Heading>
        <VStack align="stretch" mt={3}>
          {safeArray(kpi.topForumThreads).map((t) => (
            <Box
              key={t.id}
              p={3}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              bg={cardBg}
            >
              <Text fontWeight="bold">{t.title}</Text>
              <Text fontSize="sm">
                💬 {formatNumber(t?._count?.comments)} {t.dashboard_comments}
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* ================= BLOG POST ================= */}
<Box mt={10}>
  <Heading size="sm">💡 {t.dashboard_top_blog_posts}</Heading>

  <VStack align="stretch" mt={3}>
    {safeArray(topBlogPosts).map((post, i) => (
      <Box
        key={post.id}
        p={4}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        bg={cardBg}
      >
        {/* 🔥 TITLE + RANK */}
        <HStack justify="space-between">
          <Text fontWeight="bold">{post.title}</Text>
          <Text fontSize="xs" color="gray.400">
            #{i + 1}
          </Text>
        </HStack>

        {/* 🔥 BADGE (COMMENTS) */}
        <HStack mt={2} spacing={3}>
          <Badge colorScheme="blue">
            💬 {post?._count?.comments || 0}
          </Badge>
        </HStack>

        {/* 🔥 DATE */}
        <Text fontSize="sm" mt={2}>
          {t.dashboard_created_label}:{" "}
          {post.createdAt
            ? new Date(post.createdAt).toLocaleDateString()
            : "-"}
        </Text>
      </Box>
    ))}
  </VStack>
</Box>

{/* ================= HELP CENTER ================= */}
<Box mt={10}>
  <Heading size="sm">💡 {t.dashboard_top_help_articles}</Heading>

  <VStack align="stretch" mt={3}>
    {safeArray(topHelpArticles).map((article, i) => (
      <Box
        key={article.id}
        p={4}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        bg={cardBg}
      >
        {/* 🔥 TITLE + RANK */}
        <HStack justify="space-between">
          <Text fontWeight="bold">
            {article.translations?.[0]?.title || "-"}
          </Text>
          <Text fontSize="xs" color="gray.400">
            #{i + 1}
          </Text>
        </HStack>

        {/* 🔥 BADGES */}
        <HStack mt={2} spacing={3}>
          <Badge colorScheme="purple">
            {article.category?.name || "-"}
          </Badge>

          <Badge colorScheme="green">
            👍 {article?._count?.feedback || 0}
          </Badge>
        </HStack>

        {/* 🔥 DATE */}
        <Text fontSize="sm" mt={2}>
          {t.dashboard_created_label}:{" "}
          {article.createdAt
            ? new Date(article.createdAt).toLocaleDateString()
            : "-"}
        </Text>
      </Box>
    ))}
  </VStack>
</Box>

      {/* ================= BOOST PERFORMANCE ================= */}
      <Box mt={10}>
        <Heading size="sm">{t.dashboard_boosted_ads_performance}</Heading>
        <VStack align="stretch" mt={4} spacing={4}>
          {safeArray(boostedPerformance).map((b) => (
            <Box
              key={b.trackingId}
              p={6}
              borderWidth="1px"
              borderColor={isDark ? "#555" : "#ccc"}
              borderRadius="2xl"
              bg={cardBg}
              shadow="md"
            >
              {/* Judul Ad */}
              <Text fontWeight="bold" fontSize="lg" mb={2}>
                {b.adTitle ? b.adTitle : `Ad #${b.adId || "-"}`}
              </Text>

              {/* Badges: type, tier, price */}
              <HStack mt={1} spacing={3}>
                <Badge colorScheme="blue">{b.type}</Badge>
                <Badge>{b.tier || "-"}</Badge>
                <Badge colorScheme="green">
                  {b.price != null ? formatCurrency(b.price) : "-"}
                </Badge>
              </HStack>

              {/* Info user / IP / time */}
              <Text fontSize="sm" mt={2}>
                👤 {t.dashboard_user_label}: {b.userId || "-"} | 🌐 IP: {b.ip || "-"} | 🕒{" "}
                {b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}
              </Text>

              {/* Optional: Impression, Click, CTR */}
              <HStack mt={2} spacing={3} fontSize="sm">
                <Badge colorScheme="purple">{t.dashboard_impression}: {b.impression || 0}</Badge>
                <Badge colorScheme="orange">{t.dashboard_click}: {b.click || 0}</Badge>
                <Badge colorScheme="teal">CTR: {b.ctr || 0}%</Badge>
              </HStack>

              {/* Seller info */}
              <Text fontSize="sm" mt={2}>
                🏷️ {t.dashboard_seller_label}: {b.sellerName || "-"} | ID: {b.sellerId || "-"}
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}