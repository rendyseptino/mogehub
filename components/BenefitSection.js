"use client";

import {
  Box,
  Text,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";

import { motion } from "framer-motion";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

const translations = { en, id };

const MotionBox = motion(Box);

export default function BenefitSection() {
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  // ✅ PINDAH KE DALAM COMPONENT
  const benefits = [
  {
    title: t.benefit1,
    desc: t.benefit1Desc,
    icon: "📢",
  },
  {
    title: t.benefit2,
    desc: t.benefit2Desc,
    icon: "🔥",
  },
  {
    title: t.benefit3,
    desc: t.benefit3Desc,
    icon: "✨",
  },
  {
    title: t.benefit4,
    desc: t.benefit4Desc,
    icon: "⚡",
  },

  // ✅ BOOST ADS
  {
    title: language === "id"
      ? "Boost Ads"
      : "Boost Ads",

    desc:
      language === "id"
        ? "Boost iklan agar tampil paling atas."
        : "Boost your ads to appear at the top.",

    icon: "🚀",
  },
];
  return (
    <SimpleGrid
      columns={{ base: 1, md: 2, lg: 5 }}
      spacing={6}
    >
      {benefits.map((item, index) => (
        <MotionBox
          key={index}

          initial={{
            opacity: 0,
            y: 60,
            scale: 0.92,
          }}

          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}

          viewport={{ once: true }}

          animate={{
            y: [0, -8, 0],
          }}

          transition={{
            opacity: {
              duration: 0.5,
              delay: index * 0.12,
            },

            scale: {
              duration: 0.45,
              delay: index * 0.12,
            },

            y: {
              duration: 4 + index,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}

          whileHover={{
            scale: 1.04,
            y: -10,
            rotate: -1,
          }}

          position="relative"
          overflow="hidden"
          rounded="3xl"
          p={7}
          bg="brand.500"
          color="black"
          cursor="pointer"
          border="1px solid rgba(255,255,255,0.18)"
          boxShadow="0 20px 50px rgba(206,255,0,0.18)"
        >
          {/* PREMIUM SHINE */}
          <Box
            position="absolute"
            top="-120%"
            left="-40%"
            w="80px"
            h="250%"
            bg="rgba(255,255,255,0.22)"
            transform="rotate(25deg)"
            animation="shine 5s linear infinite"
            sx={{
              "@keyframes shine": {
                "0%": {
                  left: "-40%",
                },
                "100%": {
                  left: "140%",
                },
              },
            }}
          />

          {/* GLOW */}
          <Box
            position="absolute"
            top="-40px"
            right="-40px"
            w="140px"
            h="140px"
            bg="whiteAlpha.300"
            borderRadius="full"
            filter="blur(45px)"
          />

          {/* CONTENT */}
          <VStack
            align="start"
            spacing={4}
            position="relative"
            zIndex={2}
          >
            <Text
              fontSize="4xl"
              lineHeight="1"
            >
              {item.icon}
            </Text>

            <Text
              fontWeight="extrabold"
              fontSize="xl"
              lineHeight="1.2"
            >
              {item.title}
            </Text>

            <Text
                fontSize={{ base: "md", lg: "md" }}
                fontWeight="bold"
                color="blackAlpha.800"
                lineHeight="1.7"
                >
                {item.desc}
                </Text>
          </VStack>
        </MotionBox>
      ))}
    </SimpleGrid>
  );
}