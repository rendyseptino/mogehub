"use client";

import { Box, Image } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { desktopOnly, mobileOnly } from "../utils/responsive";

export default function AdBannerSection({ premiumAds, freeAds }) {
  const router = useRouter();
  const adsToShow = [...premiumAds, ...freeAds];

  // Simpan dimensi asli tiap image (desktop)
  const [imageSizes, setImageSizes] = useState({}); // { [adId]: { width, height } }

  const handleClick = (adId) => {
    if (!adId) return;
    router.push(`/ad-banner/${adId}`);
  };

  const handleImageLoad = (adId, e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setImageSizes((prev) => ({ ...prev, [adId]: { width: naturalWidth, height: naturalHeight } }));
    }
  };

  return (
    <Box mt={{ base: 20, md: 24 }} mb={{ base: 10, md: 14 }} maxW="1200px" mx="auto" px={{ base: 4, md: 0 }}>
      
      {/* ================= DESKTOP ================= */}
      <Box display={desktopOnly}>
        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={Math.min(3, adsToShow.length)}
          spaceBetween={20}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          loop={adsToShow.length > 1}
        >
          {adsToShow.map((ad, idx) => {
            const size = imageSizes[ad.id];
            return (
              <SwiperSlide key={ad.id || idx}>
                <Box
                  borderRadius="xl"
                  overflow="visible"
                  cursor="pointer"
                  onClick={() => handleClick(ad.id)}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  {/* Wrapper border pas di gambar */}
                  <Box position="relative" display="inline-block">
                    <Image
                      src={ad.imageUrl || ad.thumbnail?.url || "/placeholder.png"}
                      alt={ad.title || `Ad ${idx + 1}`}
                      display="block"
                      w="100%"
                      h="auto"
                      maxHeight="200px"
                      borderRadius="xl"
                      onLoad={(e) => handleImageLoad(ad.id, e)}
                    />
                    {size && (
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        w="100%"
                        h="100%"
                        border="2px solid #90cdf4"
                        borderRadius="xl"
                        pointerEvents="none"
                      />
                    )}
                  </Box>
                </Box>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </Box>

      {/* ================= MOBILE ================= */}
      <Box display={mobileOnly}>
        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={adsToShow.length === 1 ? 1 : 1.5}
          spaceBetween={14}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          loop={adsToShow.length > 1}
        >
          {adsToShow.map((ad, idx) => (
            <SwiperSlide key={ad.id || idx}>
              <Box
                borderRadius="xl"
                overflow="hidden"
                cursor="pointer"
                onClick={() => handleClick(ad.id)}
              >
                {/* Mobile tetap pb 50% */}
                <Box position="relative" w="100%" pb="50%">
                  <Image
                    src={ad.imageUrl || ad.thumbnail?.url || "/placeholder.png"}
                    alt={ad.title || `Ad ${idx + 1}`}
                    objectFit="cover"
                    position="absolute"
                    top="0"
                    left="0"
                    w="100%"
                    h="100%"
                  />
                </Box>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

    </Box>
  );
}