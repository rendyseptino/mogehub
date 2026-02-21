"use client";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

// Video list dari /public
const videos = [
  "/night.mp4",   // kiri
  "/happylol.mp4",    // tengah
  "/fun.mp4",     // kanan
];

export default function SwiperRegister() {
  const isDesktop = useBreakpointValue({ base: false, md: true });

  return (
    <Box w="100%" maxW="900px" mx="auto" mt={{ base: 4, md: 8 }}>
      <Swiper
        modules={[Pagination, Autoplay]}
        slidesPerView={isDesktop ? 1.2 : 1} // desktop sedikit preview kiri/kanan
        spaceBetween={-40} // overlap biar kiri/kanan muncul
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
      >
        {videos.map((video, idx) => (
          <SwiperSlide key={idx} style={{ display: "flex", justifyContent: "center" }}>
            <Box
              w={{ base: "80%", md: "80%" }} // semua video ukuran sama
              h={{ base: "200px", md: "250px" }}
              borderRadius="md"
              overflow="hidden"
              position="relative"
              zIndex={idx === 1 ? 10 : 5} // video tengah tetap di depan
            >
              <video
                src={video}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
