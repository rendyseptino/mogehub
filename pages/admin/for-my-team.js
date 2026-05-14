"use client";

import Head from "next/head";
import {
  Box,
  Flex,
  Text,
  Stack,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { useLanguageContext } from "../../context/LanguageContext";
import en from "../../locales/en.json";
import id from "../../locales/id.json";

import Marquee from "react-fast-marquee";

const marqueeTexts = [
  "teamSpirit1",
  "teamSpirit2",
  "teamSpirit3",
  "teamSpirit4",
];

export default function ForMyTeamPage() {
  const { language } = useLanguageContext();
  const translations = { en, id };
  const t = translations[language] || translations.id;

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const subText = useColorModeValue("gray.600", "gray.400");

  return (
    <Box bg={bg} minH="100vh" px={{ base: 4, md: 6 }}>
      <Head>
        <title>{t.forMyTeam || "For My Team"} | MogeHub</title>
      </Head>

      {/* HEADER */}
      <Stack spacing={4} textAlign="center" mb={10} mt="90px">
        {/* ✅ HUGE TITLE */}
        <Text
          fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
          fontWeight="extrabold"
          color={textColor}
          lineHeight="1.2"
        >
          {t.headsUp}
        </Text>

        {/* ✅ SUBTEXT LEBIH GEDE */}
        <Text fontSize={{ base: "md", md: "lg" }} color={subText} maxW="600px" mx="auto">
          {t.teamSpiritContent}
        </Text>
      </Stack>

      {/* ✅ MARQUEE SUPER UPGRADE */}
      <Box
        bg="#ceff00"
        py={{ base: 4, md: 5 }}
        px={4}
        borderRadius="xl"
        mb={10}
      >
        <Marquee speed={60} gradient={false} pauseOnHover>
          <Flex align="center" gap={8} color="black">
            <Text
              fontWeight="bold"
              fontSize={{ base: "md", md: "lg", lg: "xl" }}
            >
              {marqueeTexts.map((key) => t[key]).join("   •   ")}
            </Text>
          </Flex>
        </Marquee>
      </Box>

      {/* CARDS (1 KOLOM) */}
      <SimpleGrid columns={1} spacing={6} mb={10}>
        <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="lg">
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" mb={3}>
            {t.visionTitle}
          </Text>
          <Text fontSize={{ base: "md", md: "lg" }} color={subText}>
            {t.visionContent}
          </Text>
        </Box>

        <Box bg={cardBg} p={6} borderRadius="2xl" boxShadow="lg">
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" mb={3}>
            {t.missionTitle}
          </Text>
          <Stack spacing={2} fontSize={{ base: "md", md: "lg" }} color={subText}>
            <Text>{t.mission1Team}</Text>
            <Text>{t.mission2Team}</Text>
            <Text>{t.mission3Team}</Text>
          </Stack>
        </Box>
      </SimpleGrid>

      {/* MESSAGE */}
      <Box
        bg={cardBg}
        p={6}
        borderRadius="2xl"
        boxShadow="lg"
        textAlign="center"
      >
        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" mb={3}>
          {t.teamSpiritTitle}
        </Text>
        <Text fontSize={{ base: "md", md: "lg" }} color={subText}>
          {t.teamSpiritContent}
        </Text>
      </Box>
    </Box>
  );
}