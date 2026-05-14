"use client";

import { Box, Button, IconButton, Flex, useColorModeValue } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { PiCrownLight } from "react-icons/pi";
import AdCard from "./AdCard";
import SectionTitle from "./SectionTitle";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRef, useEffect, useState } from "react";
import "swiper/css";
import { isMobileCard } from "../utils/responsiveCard"; // <-- pakai responsiveCard
import { useRouter } from "next/navigation"; // <-- import router
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

const translations = { en, id };

export default function ProductSection({ premiumProducts, freeProducts }) {
  const visibleCount = 8;

  const swiperPremium = useRef(null);
  const swiperFree = useRef(null);
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  const premiumIconColor = useColorModeValue("#B7791F", "#f6c344");

  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter(); // <-- router untuk redirect

  // pakai responsiveCard untuk detect HP
  useEffect(() => {
    const checkWidth = () => setIsMobile(isMobileCard());
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const premiumToShow = premiumProducts?.slice(0, visibleCount) || [];
  const freeToShow = freeProducts?.slice(0, visibleCount) || [];

  return (
    <Box my={{ base: 10, lg: 16 }} maxW="1200px" mx="auto" px={{ base: 3, lg: 0 }}>

      {/* ================= PREMIUM ================= */}
      {premiumToShow.length > 0 && (
        <Box mb={10}>
          <Flex justify="space-between" align="center" mb={3}>
            <SectionTitle
            title={t.premiumProducts}
            icon={<PiCrownLight size={20} color={premiumIconColor} />}
          />

            {premiumProducts.length > visibleCount && (
              <Button
                size="sm"
                bg="brand.500"
                color="black"
                _hover={{ bg: "brand.600" }}
                borderRadius="md"
                onClick={() => router.push("/allads?type=premium")}
              >
                {t.viewAll}
              </Button>
            )}
          </Flex>

          {!isMobile ? (
            <Box position="relative">
              <Swiper
                slidesPerView="auto"
                spaceBetween={12}
                loop={premiumToShow.length >= 5}
                centeredSlides={false}
                onSwiper={(swiper) => (swiperPremium.current = swiper)}
              >
                {premiumToShow.map((product) => (
                  <SwiperSlide
                    key={product.id}
                    style={{ width: "220px", flexShrink: 0 }}
                  >
                    <AdCard ad={product} />
                  </SwiperSlide>
                ))}
              </Swiper>

              {premiumToShow.length > 1 && (
                <>
                  <IconButton
                    aria-label="prev"
                    icon={<ChevronLeftIcon />}
                    position="absolute"
                    left="-20px"
                    top="40%"
                    zIndex="10"
                    borderRadius="full"
                    onClick={() => swiperPremium.current?.slidePrev()}
                  />
                  <IconButton
                    aria-label="next"
                    icon={<ChevronRightIcon />}
                    position="absolute"
                    right="-20px"
                    top="40%"
                    zIndex="10"
                    borderRadius="full"
                    onClick={() => swiperPremium.current?.slideNext()}
                  />
                </>
              )}
            </Box>
          ) : (
            <Box>
              <Box
                display="grid"
                gridTemplateColumns="repeat(2, 1fr)"
                gap={3}
                w="100%"
              >
                {premiumToShow.map((product) => (
                  <Box key={product.id} w="100%">
                    <AdCard ad={product} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* ================= GRATIS ================= */}
      {freeToShow.length > 0 && (
        <Box>
          <Flex justify="space-between" align="center" mb={3}>
            <SectionTitle title={t.freeProducts} />

            {freeProducts.length > visibleCount && (
              <Button
                size="sm"
                bg="brand.500"
                color="black"
                _hover={{ bg: "brand.600" }}
                borderRadius="md"
                onClick={() => router.push("/all-ads?type=free")}
              >
                {t.viewAll}
              </Button>
            )}
          </Flex>

          {!isMobile ? (
            <Box position="relative">
              <Swiper
                slidesPerView="auto"
                spaceBetween={12}
                loop={freeToShow.length >= 5}
                centeredSlides={false}
                onSwiper={(swiper) => (swiperFree.current = swiper)}
              >
                {freeToShow.map((product) => (
                  <SwiperSlide
                    key={product.id}
                    style={{ width: "220px", flexShrink: 0 }}
                  >
                    <AdCard ad={product} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </Box>
          ) : (
            <Box>
              <Box
                display="grid"
                gridTemplateColumns="repeat(2, 1fr)"
                gap={3}
                w="100%"
              >
                {freeToShow.map((product) => (
                  <Box key={product.id} w="100%">
                    <AdCard ad={product} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}

    </Box>
  );
}