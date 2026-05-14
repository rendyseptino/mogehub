"use client";
import { useRouter } from "next/navigation";
import { Box, IconButton, Flex } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import AdCard from "./AdCard";
import SectionTitle from "./SectionTitle";
import { GoRocket } from "react-icons/go"; // icon rocket
import LoadingSpinner from "./LoadingSpinner";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRef, useState, useEffect } from "react";
import "swiper/css";
import { isMobileCard } from "../utils/responsiveCard";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

const translations = { en, id };


export default function BoostedSection({ items }) {
  const visibleCount = 12;
  const showViewAll = items?.length > 12;
  const swiperRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [trackedBoosts, setTrackedBoosts] = useState({}); // track boosts yg udh di-track
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  const router = useRouter();
  

  // detect mobile
  useEffect(() => {
    const checkWidth = () => setIsMobile(isMobileCard());
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

 useEffect(() => {
  const trackViews = async () => {
    if (!items) return;

    // filter hanya ad yang boost dan belum di-track
    const itemsToTrack = items
      .slice(0, visibleCount)
      .filter(ad => ad.isBoosted && ad.boostId && !trackedBoosts[ad.boostId]);

    if (itemsToTrack.length === 0) return;

    try {
      await Promise.all(
        itemsToTrack.map(ad =>
          fetch("https://api.mogehub.com/api/boost-tracking/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ boostAdId: ad.boostId, type: "view" }),
          })
            .then(res => console.log(`Boost view tracked for ${ad.boostId}, status: ${res.status}`))
            .catch(err => console.error("Boost view tracking failed:", err))
        )
      );

      // update state tracked
      const newTracked = { ...trackedBoosts };
      itemsToTrack.forEach(ad => newTracked[ad.boostId] = true);
      setTrackedBoosts(newTracked);

    } catch (err) {
      console.error("Error tracking boosted views:", err);
    }
  };

  trackViews();
}, [items, trackedBoosts]);;

  // loading state
  if (!items) {
    return <LoadingSpinner />;
  }

  const itemsToShow = items.slice(0, visibleCount);

  return (
    <Box
      my={{ base: 10, lg: 16 }}
      maxW="1200px"
      mx="auto"
      px={{ base: 3, lg: 0 }}
    >
      {/* 🔥 Section Title */}
      <Flex justify="space-between" align="center" mb={3}>
  <SectionTitle
    title={t.boostedAds}
    icon={<GoRocket size={20} color="#FF6B00" />}
  />

      {showViewAll && (
      <Box
        as="button"
        fontSize="sm"
        px={3}
        py={1}
        borderRadius="md"
        bg="brand.500"
        color="black"
        _hover={{ bg: "brand.600" }}
        onClick={() => router.push("/allads")}
      >
        {t.viewAll}
      </Box>
    )}
    </Flex>

      {/* DESKTOP */}
      {!isMobile && itemsToShow.length > 0 && (
        <Box position="relative">
          <Swiper
            slidesPerView="auto"
            spaceBetween={12}
            loop={itemsToShow.length >= 5}
            centeredSlides={false}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
          >
            {itemsToShow.map((item) => (
              <SwiperSlide
                key={item.id}
                style={{ width: "220px", flexShrink: 0 }}
              >
                <AdCard ad={item} />
              </SwiperSlide>
            ))}
          </Swiper>

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

      {/* MOBILE */}
      {isMobile && itemsToShow.length > 0 && (
        <Box>
          <Box
            display="grid"
            gridTemplateColumns="repeat(2, 1fr)"
            gap={3}
            w="100%"
          >
            {itemsToShow.map((item) => (
              <Box key={item.id} w="100%">
                <AdCard ad={item} />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}