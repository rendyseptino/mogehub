import { Box, Image, IconButton, useBreakpointValue } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useRef } from "react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

const banners = [
  "/banner1.jpg",
  "/banner2.jpg",
  "/banner3.jpg",
  "/banner4.jpg",
  "/banner5.jpg",
];

export default function HeroBanner() {
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const swiperRef = useRef(null);

  return (
    <Box w="100%" maxW="1200px" mx="auto" mt={{ base: 4, md: 10 }} position="relative">
      <Swiper
        modules={[Pagination, Autoplay]}
        slidesPerView={2.5}
        spaceBetween={20}
        pagination={isDesktop ? false : { clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
      >
        {banners.map((src, idx) => (
          <SwiperSlide key={idx}>
            <Box h={{ base: "200px", md: "250px" }} borderRadius="md" overflow="hidden">
              <Image src={src} alt={`Banner ${idx + 1}`} objectFit="cover" w="100%" h="100%" />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Arrow desktop custom */}
      {isDesktop && (
        <Box
          position="absolute"
          bottom={2}
          w="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
          zIndex={10}
        >
          {/* Arrow kiri */}
          <IconButton
            aria-label="Previous"
            icon={<ChevronLeftIcon w={6} h={6} />}
            bg="brand.500"
            color="black"
            _hover={{ bg: "brand.600" }}
            borderRadius="full"
            w={12}
            h={12}
            mr={4}
            onClick={() => swiperRef.current.slidePrev()}
          />
          {/* Arrow kanan */}
          <IconButton
            aria-label="Next"
            icon={<ChevronRightIcon w={6} h={6} />}
            bg="brand.500"
            color="black"
            _hover={{ bg: "brand.600" }}
            borderRadius="full"
            w={12}
            h={12}
            ml={4}
            onClick={() => swiperRef.current.slideNext()}
          />
        </Box>
      )}
    </Box>
  );
}
