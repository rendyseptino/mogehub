"use client";

import { Box, Image } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { useRouter } from "next/navigation";

import { desktopOnly, mobileOnly } from "../utils/responsive";

export default function HeroBanner({ ads }) {
  const router = useRouter();
  const banners = ads || [];

  // Fungsi klik banner
  const handleClick = (adId) => {
    if (!adId) return;
    router.push(`/ad-banner/${adId}`);
  };

  return (
    <Box
      mt={{ base: 20, md: 28 }} // turun biar aman dari navbar
      mb={{ base: 10, md: 14 }}
      maxW="1200px"
      mx="auto"
      px={{ base: 4, md: 0 }}
    >
      {/* ================= DESKTOP ================= */}
      <Box display={desktopOnly}>
        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={Math.min(3, banners.length)}
          spaceBetween={20}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          loop={banners.length > 1} // loop cuma kalau >1
        >
          {banners.map((ad, idx) => (
            <SwiperSlide key={ad.id || idx}>
              <Box
                h="230px"
                borderRadius="xl"
                overflow="hidden"
                cursor="pointer"
                onClick={() => handleClick(ad.id)}
              >
                <Image
                src={ad.imageUrl || ad.thumbnail?.url || "/placeholder.png"}
                alt={ad.title || `Banner ${idx + 1}`}
                objectFit="cover"
                objectPosition="center"
                w="100%"
                h="100%"
              />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* ================= MOBILE ================= */}
      <Box display={mobileOnly}>
        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={banners.length === 1 ? 1 : 1.5}
          spaceBetween={14}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          loop={banners.length > 1}
        >
          {banners.map((ad, idx) => (
            <SwiperSlide key={ad.id || idx}>
              <Box
                h="140px"
                borderRadius="xl"
                overflow="hidden"
                cursor="pointer"
                onClick={() => handleClick(ad.id)}
              >
                <Image
                  src={ad.imageUrl || ad.thumbnail?.url || "/placeholder.png"}
                  alt={ad.title || `Banner ${idx + 1}`}
                  objectFit="cover"
                  w="100%"
                  h="100%"
                />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
}