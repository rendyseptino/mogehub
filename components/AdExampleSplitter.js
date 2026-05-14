"use client";

import { useEffect, useState } from "react";
import {
  Box,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  Avatar,
  VStack,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { FcFlashOn } from "react-icons/fc";
import { GoGlobe } from "react-icons/go";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import NextImage from "next/image";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

// ================= DUMMY DATA =================
const sellerStatic = {
  name: "Rendy",
  profilePhoto: "/forumlogolight.png",
  verified: true,
};

const freeAd = {
  title: "BMW M1000 RR",
  price: "Rp. 500.000.000",
  image: "/contohiklan.png",
  premium: false,
};

const premiumAd = {
  title: "BMW M1000 RR",
  price: "Rp. 500.000.000",
  image: "/contohiklan.png",
  premium: true,
};

const MotionBox = motion(Box);

export default function AdExampleSplitter() {
  const [showPremium, setShowPremium] = useState(false);
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const muted = useColorModeValue("gray.500", "gray.400");

  // ================= AUTO SWITCH =================
  useEffect(() => {
    const interval = setInterval(() => {
      setShowPremium((prev) => !prev);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentAd = showPremium ? premiumAd : freeAd;

  return (
    <VStack spacing={4} w="100%">
      {/* ================= MAIN CARD ================= */}
      <MotionBox
        minH={{
          base: "580px",
          md: "unset",
        }}
        whileHover={{
          y: -6,
          scale: 1.015,
        }}
        transition={{
          duration: 0.3,
        }}
        position="relative"
        w="100%"
        maxW="430px"
        overflow="hidden"
        borderRadius="32px"
        bg={cardBg}
        border="1px solid"
        borderColor={
          showPremium ? "brand.500" : borderColor
        }
        boxShadow={
          showPremium
            ? "0 0 60px rgba(206,255,0,0.18)"
            : "0 10px 40px rgba(0,0,0,0.12)"
        }
      >
        {/* ================= IMAGE AREA ================= */}
        <Box
          position="relative"
          h="270px"
          overflow="hidden"
          bg={showPremium ? "brand.500" : "gray.100"}
        >
          {/* IMAGE SWITCH ONLY */}
          <AnimatePresence mode="wait">
            <MotionBox
              key={showPremium ? "premium-image" : "free-image"}
              initial={{
                opacity: 0,
                y: showPremium ? 120 : -120,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: showPremium ? -120 : 120,
              }}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              position="absolute"
              inset={0}
            >
              {/* IMAGE */}
              <MotionBox
                position="absolute"
                inset={0}
                animate={{
                  scale: showPremium ? 1.05 : 1,
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              >
                <NextImage
                  src={currentAd.image}
                  alt={currentAd.title}
                  fill
                  priority
                  unoptimized
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              </MotionBox>

              {/* OVERLAY */}
              <Box
                position="absolute"
                inset={0}
                bgGradient="linear(to-t, rgba(0,0,0,0.78), transparent)"
                zIndex={2}
              />

              {/* SPONSORED */}
              {showPremium && (
                <Badge
                  position="absolute"
                  top={4}
                  right={4}
                  zIndex={5}
                  bg="white"
                  color="black"
                  px={3}
                  py={1.5}
                  borderRadius="5px"
                >
                  <HStack spacing={1}>
                    <GoGlobe size={13} />
                    <Text fontSize="xs">
                      Sponsored
                    </Text>
                  </HStack>
                </Badge>
              )}

            </MotionBox>
          </AnimatePresence>
        </Box>

        {/* ================= INFO ================= */}
        <Box
  p={5}
  pt={showPremium ? 5 : 8}
  transition="all 0.35s cubic-bezier(0.22, 1, 0.36, 1)"
>
          {/* PREMIUM HIGHLIGHT */}
{showPremium && (
  <Badge
    mb={3}
    colorScheme="yellow"
    px={3}
    py={1}
    borderRadius="5px"
  >
    <HStack spacing={1}>
      <FcFlashOn size={12} />
      <Text fontSize="xs">
        Highlight
      </Text>
    </HStack>
  </Badge>
)}

{/* TITLE */}
<Text
  fontSize="xl"
  fontWeight="bold"
  color={textColor}
  mb={4}
  noOfLines={1}
>
  {currentAd.title}
</Text>
          <HStack spacing={3}>
            <Avatar
              size="sm"
              src={sellerStatic.profilePhoto}
            />

            <VStack
              align="start"
              spacing={0}
            >
              <HStack spacing={1}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color={textColor}
                >
                  {sellerStatic.name}
                </Text>

                {sellerStatic.verified && (
                  <RiVerifiedBadgeFill color="#4299E1" />
                )}
              </HStack>

              <Text
                fontSize="xs"
                color={muted}
              >
                Trusted Seller
              </Text>
            </VStack>
          </HStack>

          <Text
          mt={5}
          fontSize="2xl"
          fontWeight="bold"
          color={textColor}
          transition="0.3s ease"
        >
          {currentAd.price}
        </Text>

          <Text
            mt={2}
            fontSize="sm"
            color={muted}
            lineHeight="1.7"
          >
            {showPremium
              ? t.premiumAdDescription
              : t.freeAdDescription}
          </Text>
        </Box>
      </MotionBox>
    </VStack>
  );
}