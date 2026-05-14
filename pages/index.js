"use client";

import { Box, Flex } from "@chakra-ui/react";
import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import {
  isMobileCard,
  isTabletCard,
  isLargeTabletCard,
  isDesktopCard,
} from "../utils/responsiveCard";
// Navbar & Footer
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BottomNavbar from "../components/BottomNavbar";

// Hero Banner
import HeroBanner from "../components/HeroBanner";

// Category Section
import CategorySection from "../components/CategorySection";

// Produk
import ProductSection from "../components/ProductSection";

// Forum
import ForumSection from "../components/ForumSection";

// Most Viewed
import MostViewedSection from "../components/MostViewedSection";

// Ads Section (Banner)
import AdBannerSection from "../components/AdBannerSection";

// Loading Spinner
import LoadingSpinner from "../components/LoadingSpinner";

import BoostedSection from "../components/BoostedSection";

import InfoMogehubSection from "../components/infoMogehubSection";

import MogehubSplash from "@/components/mogehubSplash";

// Context & Localization
import { useLanguageContext } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";

export default function Home() {
  const { language } = useLanguageContext();
  const t = language === "en" ? en : id;

  const pageTitle =
    language === "en"
      ? "MogeHub - Big Bike Platform"
      : "MogeHub - Platform Komunitas Moge Indonesia";

  // 🔹 State untuk data backend
  const [premiumAds, setPremiumAds] = useState([]);
  const [freeAds, setFreeAds] = useState([]);
  const [premiumBanners, setPremiumBanners] = useState([]);
  const [freeBanners, setFreeBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [forumThreads, setForumThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boostAds, setBoostAds] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isLargeTablet, setIsLargeTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // 🔹 AbortController untuk cancel fetch lama
  const controllerRef = useRef(null);

  // 🔹 Fetch Home Data Function (reusable)
  const fetchHomeData = async () => {
    if (!navigator.onLine) {
      console.log("⚡ Offline mode, skip fetch");
      return;
    }

    // cancel fetch lama kalau ada
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    setLoading(true);
    try {
      const res = await fetch("https://api.mogehub.com/api/home", { cache: "no-store", signal });
      const data = await res.json();

      console.log("🔥 Home fetch data:", data);

      // 🔹 Merge boostAds ke premiumAds & freeAds
      const mergedPremiumAds = (data.premiumAds || []).map(ad => {
        const boosted = (data.boostAds || []).find(b => b.id === ad.id);
        return boosted ? { ...ad, isBoosted: true } : ad;
      });

      const mergedFreeAds = (data.freeAds || []).map(ad => {
        const boosted = (data.boostAds || []).find(b => b.id === ad.id);
        return boosted ? { ...ad, isBoosted: true } : ad;
      });

      const mergedMostViewed = (data.mostViewed || []).map(ad => {
        const boosted = (data.boostAds || []).find(b => b.id === ad.id);
        return boosted ? { ...ad, isBoosted: true } : ad;
      });

      // 🔹 Set state final
      setPremiumAds(
        mergedPremiumAds.map(ad => ({
          ...ad,
          seller: { verified: ad.verified ?? false },
        }))
      );

      setFreeAds(
        mergedFreeAds.map(ad => ({
          ...ad,
          seller: { verified: ad.verified ?? false },
        }))
      );

      setBoostAds(
        (data.boostAds || []).map(ad => ({
          ...ad,
          seller: { verified: ad.verified ?? false },
        }))
      );

      setMostViewed(
        mergedMostViewed.map(ad => ({
          ...ad,
          seller: { verified: ad.verified ?? false },
        }))
      );

      setPremiumBanners(data.premiumBanners || []);
      setFreeBanners(data.freeBanners || []);
      setCategories(data.categories || []);

      // 🔹 Set forum threads dari backend
      setForumThreads(
        (data.forumThreads || []).map(thread => ({
          id: thread.id,
          title: thread.title,
          content: thread.content,
          author: thread.author?.username ?? "Unknown",
          profilePhoto: thread.author?.profilePhoto ?? null,
          verified: thread.author?.verified ?? false,
          category: thread.category ? thread.category.name : null,
          commentCount: thread.commentCount ?? 0,
          likeCount: thread.likeCount ?? 0,
          tags: thread.tags?.map(tag => tag.name) || [],
          timestamp: new Date(thread.createdAt).toLocaleDateString(),
        }))
      );
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Failed to fetch home data:", error);
      setPremiumAds([]);
      setFreeAds([]);
      setPremiumBanners([]);
      setFreeBanners([]);
      setCategories([]);
      setForumThreads([]);
      setBoostAds([]);
      setMostViewed([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  setMounted(true);
}, []);

  // 🔹 Fetch pertama kali load halaman
  useEffect(() => {
    fetchHomeData();
  }, []);

  // 🔹 Listen networkReconnect & online event untuk refetch otomatis
  useEffect(() => {
    const handleReconnect = () => {
      console.log("🔌 Network reconnected, refetching Home data...");
      fetchHomeData();
    };

    window.addEventListener("networkReconnect", handleReconnect);
    window.addEventListener("online", handleReconnect);

    return () => {
      window.removeEventListener("networkReconnect", handleReconnect);
      window.removeEventListener("online", handleReconnect);
    };
  }, []);

  useEffect(() => {
  const checkDevice = () => {
    setIsMobile(isMobileCard());
    setIsTablet(isTabletCard());
    setIsLargeTablet(isLargeTabletCard());
    setIsDesktop(isDesktopCard());
  };

  checkDevice();

  window.addEventListener("resize", checkDevice);

  return () => window.removeEventListener("resize", checkDevice);
}, []);

  if (loading) {
  return <MogehubSplash />;
}

return (
  <>
    <Flex
  minH="100vh"
  direction="column"
  pb={isMobile || isTablet || isLargeTablet ? "64px" : "0px"}
>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Navbar />

      <Box flex="1">
        {/* ================= HERO BANNER ================= */}
        {premiumBanners.length > 0 ? (
          <HeroBanner ads={premiumBanners} loading={loading} />
        ) : (
          <Box mt={6} mb={10} maxW="1200px" mx="auto">
            <LoadingSpinner />
          </Box>
        )}

        {/* ================= CATEGORY ================= */}
        <CategorySection categories={categories} />

        {/* ================= BOOSTED ADS ================= */}
        <BoostedSection items={boostAds} />

        {/* ================= PRODUK PREMIUM ================= */}
        <ProductSection premiumProducts={premiumAds} freeProducts={[]} />

        {/* ================= MOST VIEWED ================= */}
        <MostViewedSection items={mostViewed.slice(0, 10)} />

        {/* ================= BANNER GRATIS ================= */}
        <AdBannerSection
          categories={[]}
          premiumAds={[]}
          freeAds={freeBanners}
        />

        {/* ================= PRODUK GRATIS ================= */}
        <ProductSection
          premiumProducts={[]}
          freeProducts={freeAds}
        />

        {/* ================= FORUM ================= */}
        <ForumSection threads={forumThreads} />
      </Box>

      <InfoMogehubSection />

      <Footer />
      <BottomNavbar />
    </Flex>
  </>
);
}
