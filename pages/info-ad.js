"use client";

import { Box, Flex, Text, Button, HStack, VStack, Image, useColorMode, Container, SimpleGrid, Badge, Center } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Marquee from "react-fast-marquee";

import { useLanguageContext } from "@/context/LanguageContext";
import { mobileOnly, desktopOnly } from "../utils/responsive";
import AdExampleSplitter from "../components/AdExampleSplitter";
import Footer from "../components/Footer";
import InfoAdHelp from "../components/infoAdHelp";
import BenefitSection from "../components/BenefitSection";

// ✅ IMPORT LOCALES
import en from "../locales/en.json";
import id from "../locales/id.json";
const translations = { en, id };

export default function InfoAdPage() {
  const { colorMode } = useColorMode();
  const router = useRouter();
 const { language } = useLanguageContext();
   const t = translations[language] || translations.id;

  const pageBg = colorMode === "light" ? "gray.50" : "gray.900";
  const sectionBg = colorMode === "light" ? "white" : "gray.800";
  const textMain = colorMode === "light" ? "gray.700" : "gray.200";
  const muted = colorMode === "light" ? "gray.500" : "gray.400";
  const borderColor = colorMode === "light" ? "gray.200" : "gray.700";

  const handleCta = () => router.push("/login");

  return (
    <Box minH="100vh" bg={pageBg}>
      {/* ================= HERO / 3D MARQUEE ================= */}
      <Box position="relative" overflow="hidden" pt={{ base: 16, lg: 24 }} pb={{ base: 20, lg: 28 }}>
        <Container maxW="1100px">
          <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 10, lg: 16 }} align="center">
            {/* TEXT */}
            <Box flex="1" mb={{ base: 8, lg: 0 }}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" mb={3} color={textMain}>
                {t.infoAdHeroTitle}
              </Text>
              <Text mb={6} color={muted} maxW="520px">
                {t.infoAdHeroSubtitle}
              </Text>

              <HStack spacing={4} mb={{ base: 6, lg: 0 }}>
                <Button rounded="full" bg="brand.500" color="black" _hover={{ bg: "brand.600" }} onClick={handleCta}>
                  {t.postAdNow}
                </Button>
                <Button
                  rounded="full"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("example-ads")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  {t.seeExampleAds}
                </Button>
              </HStack>
            </Box>

            {/* HERO DESKTOP */}
            <Box flex="1" display={desktopOnly}>
              <ThreeColumnMarquee />
            </Box>

            {/* HERO MOBILE */}
            <Box w="full" display={mobileOnly}>
              <ThreeColumnMarquee />
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* ================= CONTOH IKLAN ================= */}
        <Box
          id="example-ads"
          bg={sectionBg}
          py={{ base: 12, lg: 16 }}
          borderTop="1px solid"
          borderColor={borderColor}
        >
          <Container maxW="1100px">
            <Text
              fontSize="xl"
              fontWeight="bold"
              mb={2}
              color={textMain}
            >
              {t.exampleAds}
            </Text>

            <Text mb={6} color={muted}>
              {t.exampleAdsDesc}
            </Text>

            {/* ⚡ AD EXAMPLE SPLITTER */}
            <Box
              position="relative"
              display="flex"
              justifyContent="center"
              alignItems="flex-start"
              w="full"
            >
              <AdExampleSplitter />
            </Box>

          </Container>
        </Box>
      
          {/* ================= BENEFIT / PAKET ================= */}
          <Box
            py={{ base: 20, lg: 28 }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            overflow="hidden"
          >
            {/* BACKGROUND GLOW */}
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w={{ base: "300px", lg: "600px" }}
              h={{ base: "300px", lg: "600px" }}
              bg="brand.500"
              opacity={0.06}
              filter="blur(140px)"
              borderRadius="full"
            />

            <Container maxW="1100px" position="relative" zIndex={2}>
              <Text
                fontSize="xl"
                fontWeight="bold"
                mb={10}
                color={textMain}
                textAlign="center"
              >
                {t.adBenefits}
              </Text>

              <BenefitSection />
            </Container>
          </Box>

      {/* ================= CTA ================= */}
      <Box bg={sectionBg} py={{ base: 12, lg: 16 }}>
        <Container maxW="900px">
          <Center>
            <VStack spacing={6} textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color={textMain}>
                {t.readyToPostAd}
              </Text>
              <Text color={muted}>
                {t.readyToPostAdDesc}
              </Text>
              <Button rounded="full" size="lg" bg="brand.500" color="black" _hover={{ bg: "brand.600" }} onClick={handleCta}>
                {t.postAdNow}
              </Button>
            </VStack>
          </Center>
        </Container>
      </Box>

      {/* ================= TIPS & EDUKASI ================= */}
      <Box py={{ base: 12, lg: 16 }}>
        <Container maxW="1100px">
          <Text fontSize="xl" fontWeight="bold" mb={6} color={textMain}>
            {t.adTips}
          </Text>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <TipCard title={t.tip1} desc={t.tip1Desc} />
            <TipCard title={t.tip2} desc={t.tip2Desc} />
            <TipCard title={t.tip3} desc={t.tip3Desc} />
          </SimpleGrid>
        </Container>
      </Box>

      {/* ================= FOOTER ================= */}
      <Footer />
      <InfoAdHelp />
    </Box>
  );
}

/* ================= THREE COLUMN HORIZONTAL MARQUEE ================= */
function ThreeColumnMarquee() {
  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
      <Marquee speed={20} gradient={false} pauseOnHover={false} loop={0}>
        <MarqueeItems images={imagesColumn1} />
      </Marquee>

      <Marquee speed={25} gradient={false} pauseOnHover={false} loop={0}>
        <MarqueeItems images={imagesColumn2} />
      </Marquee>

      <Marquee speed={22} gradient={false} pauseOnHover={false} loop={0}>
        <MarqueeItems images={imagesColumn3} />
      </Marquee>
    </SimpleGrid>
  );
}

const MarqueeItems = ({ images }) => {
  return (
    <HStack spacing={4}>
      {images.map((src, i) => (
        <Box key={i} minW="200px">
          <Image
            src={src}
            alt={`Gallery image ${i + 1}`}
            width="200px"
            height="150px"
            objectFit="cover"
            rounded="lg"
            shadow="md"
          />
        </Box>
      ))}
    </HStack>
  );
};

/* ================= PLACEHOLDER COMPONENTS & DUMMY DATA ================= */
function AdPlaceholderCard({ title, price, location, image, premium }) {
  return (
    <Box borderWidth="1px" rounded="lg" overflow="hidden" position="relative">
      {premium && (
        <Badge position="absolute" top="2" right="2" colorScheme="yellow">
          PRO
        </Badge>
      )}
      <Image src={image} alt={title} height="120px" width="100%" objectFit="cover" />
      <Box p={3}>
        <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>{title}</Text>
        <Text fontSize="sm" color="gray.500">{location}</Text>
        <Text fontWeight="bold" fontSize="sm">{price}</Text>
      </Box>
    </Box>
  );
}

function BenefitCard({ title, desc }) {
  return (
    <Box p={5} bg="whiteAlpha.50" borderWidth="1px" rounded="xl">
      <Text fontWeight="bold" mb={2}>{title}</Text>
      <Text fontSize="sm" color="gray.500">{desc}</Text>
    </Box>
  );
}

function TipCard({ title, desc }) {
  return (
    <Box p={5} borderWidth="1px" rounded="xl">
      <Text fontWeight="bold" mb={2}>{title}</Text>
      <Text fontSize="sm" color="gray.500">{desc}</Text>
    </Box>
  );
}

/* ================= DUMMY DATA ================= */
const imagesColumn1 = [
  "https://picsum.photos/seed/moge1/280/200",
  "https://picsum.photos/seed/moge2/280/200",
  "https://picsum.photos/seed/moge3/280/200",
  "https://picsum.photos/seed/moge4/280/200",
];

const imagesColumn2 = [
  "https://picsum.photos/seed/moge5/280/200",
  "https://picsum.photos/seed/moge6/280/200",
  "https://picsum.photos/seed/moge7/280/200",
  "https://picsum.photos/seed/moge8/280/200",
];

const imagesColumn3 = [
  "https://picsum.photos/seed/moge9/280/200",
  "https://picsum.photos/seed/moge10/280/200",
  "https://picsum.photos/seed/moge11/280/200",
  "https://picsum.photos/seed/moge12/280/200",
];

