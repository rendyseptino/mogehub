"use client";

import { Box, IconButton } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import AdCard from "./AdCard";
import SectionTitle from "./SectionTitle";
import LoadingSpinner from "./LoadingSpinner"; // ✅ import spinner
import { Swiper, SwiperSlide } from "swiper/react";
import { useRef, useState, useEffect } from "react";
import "swiper/css";
import { isMobileCard } from "../utils/responsiveCard";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

const translations = { en, id };

export default function MostViewedSection({ items }) {
  const visibleCount = 8;
  const swiperRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [trackedViews, setTrackedViews] = useState({});
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  // detect mobile untuk card
  useEffect(() => {
    const checkWidth = () => setIsMobile(isMobileCard());
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
  const trackViews = async () => {
    if (!items) return;

    // 🔥 SAMA PERSIS KAYA BOOSTED SECTION
    const itemsToTrack = items
      .slice(0, visibleCount)
      .filter(
        ad => ad.isBoosted && ad.boostId && !trackedViews[ad.boostId]
      );

    if (itemsToTrack.length === 0) return;

    try {
      await Promise.all(
        itemsToTrack.map(ad =>
          fetch("https://api.mogehub.com/api/boost-tracking/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              boostAdId: ad.boostId,
              type: "view", // 🔥 INI YANG LU MAU
            }),
          })
        )
      );

      const newTracked = { ...trackedViews };
      itemsToTrack.forEach(ad => {
        newTracked[ad.boostId] = true;
      });

      setTrackedViews(newTracked);

    } catch (err) {
      console.error("Error tracking boosted views (MostViewed):", err);
    }
  };

  trackViews();
}, [items, trackedViews]);

  // ✅ kalau data belum ada tampilkan spinner
  if (!items) {
    return <LoadingSpinner />;
  }

  const itemsToShow = items.slice(0, visibleCount);

  return (
    <Box my={{ base: 10, lg: 16 }} maxW="1200px" mx="auto" px={{ base: 3, lg: 0 }}>
      <SectionTitle title={t.mostViewed} />

      {/* ================= HORIZONTAL SWIPER DESKTOP + TABLET >=768px ================= */}
      {!isMobile && itemsToShow.length > 0 && (
        <Box position="relative">
          <Swiper
            slidesPerView="auto"
            spaceBetween={12}
            loop={itemsToShow.length >= 5}
            centeredSlides={false}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
          >
            {itemsToShow.map((item) => {
              // 🔥 Tweak: pastikan price & currency default
              const adData = {
                ...item,
                boostId: item.boostId, 
                isBoosted: item.isBoosted, 
                price: item.price ?? 0,
                currency: item.currency ?? "Rp",
              };

              return (
                <SwiperSlide
                  key={item.id}
                  style={{ width: "220px", flexShrink: 0 }}
                >
                  <AdCard ad={adData} />
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Arrow desktop */}
          {itemsToShow.length > 1 && (
            <>
              <IconButton
                aria-label="prev"
                icon={<ChevronLeftIcon />}
                position="absolute"
                left="-20px"
                top="40%"
                zIndex="10"
                borderRadius="full"
                onClick={() => swiperRef.current?.slidePrev()}
              />
              <IconButton
                aria-label="next"
                icon={<ChevronRightIcon />}
                position="absolute"
                right="-20px"
                top="40%"
                zIndex="10"
                borderRadius="full"
                onClick={() => swiperRef.current?.slideNext()}
              />
            </>
          )}
        </Box>
      )}

      {/* ================= MOBILE HP <768px 2 KOLOM VERTIKAL ================= */}
      {isMobile && itemsToShow.length > 0 && (
        <Box>
          <Box
            display="grid"
            gridTemplateColumns="repeat(2, 1fr)"
            gap={3}
            w="100%"
          >
            {itemsToShow.map((item) => {
              const adData = {
                ...item,
                boostId: item.boostId, 
                isBoosted: item.isBoosted, 
                price: item.price ?? 0,
                currency: item.currency ?? "Rp",
              };

              return (
                <Box key={item.id} w="100%">
                  <AdCard ad={adData} />
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}