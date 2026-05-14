import React from "react";
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import LoadingSpinner from "./LoadingSpinner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { GiFullMotorcycleHelmet, GiMonclerJacket, GiCartwheel } from "react-icons/gi";
import { FaMotorcycle, FaTools } from "react-icons/fa";
import { FaMotorcycle as FaMotorcycleAlt } from "react-icons/fa6";
import { SiYamahamotorcorporation } from "react-icons/si";
import { MdOutlineElectricBolt } from "react-icons/md";
import { isMobileCard, isTabletCard, isDesktopCard } from "../utils/responsiveCard";
import { useRouter } from "next/navigation";

export default function CategorySection({ categories }) {
  const router = useRouter();

  const defaultBg = useColorModeValue("white", "gray.800");
  const isLight = useColorModeValue(true, false);

  if (!categories || categories.length === 0) {
    return (
      <Box mt={6} mb={10} maxW="1200px" mx="auto">
        <LoadingSpinner />
      </Box>
    );
  }

  let slidesPerView = 4;
  let spaceBetween = 8;

  if (isDesktopCard()) {
    slidesPerView = 5;
    spaceBetween = 12;
  } else if (isTabletCard()) {
    slidesPerView = 5;
    spaceBetween = 10;
  } else if (isMobileCard()) {
    slidesPerView = 4;
    spaceBetween = 8;
  }

  // 🎨 Premium color system
  const styleMap = {
    Apparel: {
      icon: <GiMonclerJacket size={33} color="#3182CE" />,
      bg: "#EBF8FF",
    },
    Baru: {
  icon: (
    <Box position="relative" display="inline-flex">
      {/* OUTLINE LAYER */}
      <FaMotorcycleAlt
        size={35}
        color="#2F855A"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          filter: "blur(0px)",
          transform: "scale(1.05)",
        }}
      />

      {/* MAIN ICON */}
      <FaMotorcycleAlt
        size={35}
        color="#ceff00"
        style={{
          filter: isLight
            ? "none"
            : "drop-shadow(0 0 6px rgba(206,255,0,0.45))",
        }}
      />
    </Box>
  ),
  bg: "#F0FFF4",
},
    Bekas: {
      icon: <FaMotorcycle size={35} color="#DD6B20" />,
      bg: "#FFF5F5",
    },
    Aksesoris: {
      icon: <SiYamahamotorcorporation size={33} color="#805AD5" />,
      bg: "#FAF5FF",
    },
    Sparepart: {
      icon: <GiCartwheel size={30} color="#E53E3E" />,
      bg: "#FFF5F5",
    },
    Helm: {
      icon: <GiFullMotorcycleHelmet size={33} color="#2D3748" />,
      bg: "#F7FAFC",
    },
    Elektronik: {
      icon: (
        <MdOutlineElectricBolt
          size={33}
          color="#D69E2E"
          style={{ filter: "drop-shadow(0 0 4px rgba(214,158,46,0.4))" }}
        />
      ),
      bg: "#FFFBEB",
    },
    Servis: {
      icon: <FaTools size={28} color="#718096" />,
      bg: "#EDF2F7",
    },
  };

  return (
    <Box mt={6} mb={10} maxW="1200px" mx="auto">
      <Swiper
        modules={[Autoplay]}
        slidesPerView={slidesPerView}
        spaceBetween={spaceBetween}
        loop={categories.length > slidesPerView}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
      >
        {categories.map((cat) => {
          const label = cat.alias || cat.name;

          const style = styleMap[cat.alias] || {
            icon: <GiFullMotorcycleHelmet size={30} />,
            bg: defaultBg,
          };

          return (
            <SwiperSlide key={cat.id}>
              <Flex direction="column" align="center" justify="center">
              <Box
  position="relative"
  w={20}
  h={20}
  display="flex"
  alignItems="center"
  justifyContent="center"
  mb={2}
  cursor="pointer"
  onClick={() => {
    router.push(
      `/allads?category=${encodeURIComponent(cat.name)}`
    );
  }}
  borderRadius="2xl"
  bg="rgba(255,255,255,0.04)"
  backdropFilter="blur(10px)"
  border="1px solid rgba(255,255,255,0.08)"
  boxShadow="0 8px 24px rgba(0,0,0,0.15)"
  transition="all 0.35s ease"
  _hover={{
    transform: "translateY(-6px)",
    boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
    borderColor: "brand.500",
  }}
  _before={{
    content: '""',
    position: "absolute",
    inset: 0,
    borderRadius: "2xl",
    background:
      "radial-gradient(circle at top, rgba(206,255,0,0.18), transparent 70%)",
    opacity: 0,
    transition: "0.35s ease",
  }}
  _hoverBefore={{
    opacity: 1,
  }}
>
  {/* glow layer */}
  <Box
    position="absolute"
    inset={0}
    borderRadius="2xl"
    bg="brand.500"
    opacity={0.05}
    filter="blur(12px)"
  />

  {/* glow layer */}
  <Box
    position="absolute"
    inset={0}
    borderRadius="2xl"
    bg="brand.500"
    opacity={0.05}
    filter="blur(12px)"
  />

  {/* icon wrapper */}
  <Box
    position="relative"
    transform="translateY(0px)"
    transition="0.35s ease"
    _hover={{
      transform: "translateY(-2px) scale(1.05)",
    }}
  >
    {style.icon}
  </Box>
</Box>

                <Text
  fontSize="sm"
  fontWeight="600"
  textAlign="center"
  noOfLines={1}
  color={useColorModeValue("gray.700", "gray.200")}
  letterSpacing="0.2px"
>
                  {label}
                </Text>
              </Flex>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </Box>
  );
}