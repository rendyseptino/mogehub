"use client";

import {
  Box,
  Container,
  Text,
  Heading,
  Spinner,
  Flex,
  Button,
  useColorMode,
  Divider,
} from "@chakra-ui/react";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import useLanguage from "../../hooks/useLanguage";

// locales
import en from "../../locales/en.json";
import id from "../../locales/id.json";

const API_URL = "https://api.mogehub.com";

export default function HelpArticlePage() {
  const router = useRouter();
  const { slug } = router.query;

  const { colorMode } = useColorMode();
  const { language } = useLanguage();
  const t = language === "en" ? en : id;

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const pageBg = colorMode === "light" ? "gray.50" : "gray.900";
  const sectionBg = colorMode === "light" ? "white" : "gray.800";
  const textMain = colorMode === "light" ? "gray.700" : "gray.200";
  const muted = colorMode === "light" ? "gray.500" : "gray.400";
  const borderColor = colorMode === "light" ? "gray.200" : "gray.700";

  useEffect(() => {
    if (!slug) return;

    fetch(`${API_URL}/api/help/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (!article) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Text>{t.helpArticleNotFound}</Text>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg}>
      {/* HEADER */}
      <Box borderBottom="1px solid" borderColor={borderColor} py={6}>
        <Container maxW="900px">
          <Button
            size="sm"
            variant="ghost"
            mb={3}
            onClick={() => router.push("/help")}
          >
            ← {t.helpBack}
          </Button>

          <Heading size="lg" color={textMain}>
            {article.title}
          </Heading>
        </Container>
      </Box>

      {/* ARTICLE */}
      <Box py={{ base: 10, lg: 14 }}>
        <Container maxW="900px">
          <Box
            bg={sectionBg}
            borderWidth="1px"
            borderColor={borderColor}
            rounded="xl"
            p={{ base: 6, lg: 10 }}
          >
            <Box
              color={textMain}
              lineHeight="1.8"
              fontSize="md"
              sx={{
                h1: { fontSize: "24px", fontWeight: "bold", mb: 4 },
                h2: { fontSize: "20px", fontWeight: "bold", mb: 3 },
                p: { mb: 4 },
                ul: { pl: 6, mb: 4 },
                li: { mb: 2 },
                img: { rounded: "lg", my: 6 },
              }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </Box>

          {/* FEEDBACK */}
          <Box mt={10} textAlign="center">
            <Text mb={4} color={muted}>
              {t.helpArticleFeedback}
            </Text>

            <Flex gap={4} justify="center">
              <Button size="sm" variant="outline">
                👍 {t.helpYes}
              </Button>

              <Button size="sm" variant="outline">
                👎 {t.helpNo}
              </Button>
            </Flex>
          </Box>
        </Container>
      </Box>

      {/* FOOTER */}
      <Box borderTop="1px solid" borderColor={borderColor} py={8}>
        <Container maxW="900px">
          <Flex justify="space-between" flexWrap="wrap" gap={4}>
            <Text fontSize="sm" color={muted}>
              © {new Date().getFullYear()} MogeHub
            </Text>

            <Flex gap={4}>
              <Text fontSize="sm" color={muted}>
                {t.footerHelp}
              </Text>

              <Text fontSize="sm" color={muted}>
                {t.footerTerms}
              </Text>

              <Text fontSize="sm" color={muted}>
                {t.footerPrivacy}
              </Text>
            </Flex>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}