"use client";

import {
  VStack,
  Box,
  Badge,
  Text,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";

import { motion } from "framer-motion";
import { GrCart } from "react-icons/gr";
import { useRouter } from "next/router";

import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

const translations = { en, id };

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

export default function EmptyTransaction() {
  const router = useRouter();

  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const isDark = useColorModeValue(false, true);

  const rotatingBorder = useColorModeValue(
  "2px solid rgba(0,0,0,0.18)",
  "1px solid rgba(206,255,0,0.35)"
);

const rotatingShadow = useColorModeValue(
  "0 0 18px rgba(0,0,0,0.08)",
  "0 0 18px rgba(206,255,0,0.18)"
);

  const cardBg = useColorModeValue(
    "rgba(255,255,255,0.85)",
    "rgba(255,255,255,0.04)"
  );

  const borderColor = useColorModeValue(
    "rgba(0,0,0,0.06)",
    "rgba(255,255,255,0.08)"
  );

  const badgeBg = useColorModeValue(
    "gray.100",
    "whiteAlpha.200"
  );

  const badgeColor = useColorModeValue(
    "gray.700",
    "whiteAlpha.900"
  );

  const subText = useColorModeValue(
    "gray.500",
    "gray.400"
  );

  return (
    <MotionVStack
      mt={20}
      spacing={6}
      textAlign="center"
      px={5}
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* MAIN PREMIUM CARD */}
      <MotionBox
        position="relative"
        overflow="hidden"
        borderRadius="32px"
        p={{ base: 8, md: 10 }}
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        backdropFilter="blur(18px)"
        boxShadow="0 10px 40px rgba(0,0,0,0.15)"
        maxW="500px"
        w="full"
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* animated glow */}
        <MotionBox
          position="absolute"
          top="-120px"
          left="50%"
          transform="translateX(-50%)"
          w="260px"
          h="260px"
          bg="brand.500"
          borderRadius="full"
          filter="blur(100px)"
          opacity={0.14}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.16, 0.1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* ICON CONTAINER */}
        <MotionBox
          mx="auto"
          mb={6}
          w="110px"
          h="110px"
          borderRadius="30px"
          bg="brand.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          boxShadow={
            isDark
              ? `
                0 0 20px rgba(206,255,0,0.25),
                0 0 50px rgba(206,255,0,0.15)
              `
              : "0 12px 30px rgba(0,0,0,0.12)"
          }
          animate={{
            rotate: [0, -3, 3, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* rotating border glow */}
<MotionBox
  position="absolute"
  inset="-2px"
  borderRadius="32px"
  border={rotatingBorder}
  boxShadow={rotatingShadow}
  animate={{
    rotate: 360,
  }}
  transition={{
    duration: 12,
    repeat: Infinity,
    ease: "linear",
  }}
/>

          <GrCart size={52} color="black" />
        </MotionBox>

        {/* BADGE */}
        <Badge
          px={4}
          py={2}
          borderRadius="full"
          bg={badgeBg}
          color={badgeColor}
          fontSize="sm"
          fontWeight="semibold"
          mb={4}
        >
          {t.transactions.Badgeempty}
        </Badge>

        {/* TITLE */}
        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="extrabold"
          mb={3}
        >
          {t.transactions.empty}
        </Text>

        
        <MotionBox
          whileHover={{
            scale: 1.04,
          }}
          whileTap={{
            scale: 0.97,
          }}
        >
          
        </MotionBox>
      </MotionBox>
    </MotionVStack>
  );
}