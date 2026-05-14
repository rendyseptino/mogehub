import Head from "next/head";
import {
  Box,
  Heading,
  Text,
  Stack,
  useColorMode,
  Container,
  Flex,
  Image,
  Divider,
} from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { useLanguageContext } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";

const translations = { en, id };

export default function TermsPage() {
  const { colorMode } = useColorMode();
  const { language } = useLanguageContext();

  const t = translations[language]?.terms || translations.id.terms;

  const cardBg = colorMode === "light" ? "white" : "gray.900";
  const borderColor = colorMode === "light" ? "gray.200" : "whiteAlpha.200";
  const labelColor = colorMode === "light" ? "gray.600" : "gray.400";
  const pageBg = colorMode === "light" ? "gray.50" : "black";
  const pageTitle =
  language === "en"
    ? "Terms & Conditions - MogeHub"
    : "Syarat dan Ketentuan - MogeHub";

  const logoSrc =
    colorMode === "light"
      ? "/mogehubmasterlight.png"
      : "/mogehubmasterdark.png";

  // 👉 gampang buat tuning nanti
  const LOGO_H = "40px";
  const LOGO_W = "auto";

  // anchor ke judul
  const topRef = useRef(null);

  useEffect(() => {
    // tunggu layout selesai biar offset sticky header aman
    requestAnimationFrame(() => {
      if (topRef.current) {
        const y =
          topRef.current.getBoundingClientRect().top +
          window.pageYOffset -
          72; // tinggi header

        window.scrollTo({
          top: y < 0 ? 0 : y,
          behavior: "auto",
        });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    });
  }, []);

  return (
    <Box minH="100vh" bg={pageBg}>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Box ref={topRef} />
      {/* Header */}
      <Box
        position="sticky"
        top="0"
        zIndex="10"
        bg={colorMode === "light" ? "whiteAlpha.900" : "blackAlpha.700"}
        backdropFilter="blur(10px)"
        borderBottomWidth="1px"
        borderColor={borderColor}
      >
        <Container maxW="6xl" px={{ base: 4, md: 8 }}>
          <Flex h="72px" align="center" justify="center">
            <Link href="/" passHref>
              <Box cursor="pointer">
                <Image
                  src={logoSrc}
                  alt="MogeHub"
                  h={LOGO_H}
                  w={LOGO_W}
                  objectFit="contain"
                />
              </Box>
            </Link>
          </Flex>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="4xl" px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }}>
        {/* anchor target */}
        <Stack spacing={6} mb={10}>
          <Heading size="lg" letterSpacing="-0.02em">
            {t.title}
          </Heading>
          <Text fontSize="sm" color={labelColor}>
            {t.lastUpdated}
          </Text>
        </Stack>

        <Box
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          rounded="2xl"
          p={{ base: 5, md: 10 }}
          shadow="lg"
        >
          <Stack spacing={10}>
            {t.sections.map((section, idx) => (
              <Box key={idx}>
                <Heading size="md" mb={4} letterSpacing="-0.01em">
                  {section.title}
                </Heading>

                <Stack spacing={3}>
                  {section.paragraphs.map((p, i) => (
                    <Text
                      key={i}
                      fontSize="sm"
                      lineHeight="1.8"
                      color={
                        colorMode === "light" ? "gray.700" : "gray.300"
                      }
                    >
                      {p}
                    </Text>
                  ))}
                </Stack>

                {idx !== t.sections.length - 1 && (
                  <Divider mt={8} borderColor={borderColor} />
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}