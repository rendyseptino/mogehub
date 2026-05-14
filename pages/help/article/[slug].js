"use client";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useMemo } from "react";

import {
  Box,
  Container,
  Heading,
  Text,
  Spinner,
  Button,
  VStack,
  HStack,
  IconButton,
  useColorModeValue,
  SimpleGrid,
} from "@chakra-ui/react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";

import { useLanguageContext } from "../../../context/LanguageContext";
import { mobileAndTabletFont, mobileAndTabletPadding } from "../../../utils/responsive";

// locales
import en from "../../../locales/en.json";
import id from "../../../locales/id.json";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ArticlePage() {
  const router = useRouter();
  const { slug } = router.query;

  const { language } = useLanguageContext();
  const t = language === "en" ? en : id;

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const pageTitle = useMemo(() => {
  if (!article) {
    return language === "en"
      ? "Help Article - MogeHub"
      : "Artikel Bantuan - MogeHub";
  }

  return `${article.title} - ${article.category?.name ?? "Help"} - MogeHub`;
}, [article, language]);

  // Theme colors
  const bg = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.300");
  const cardHoverBg = useColorModeValue("gray.100", "gray.700");
  const brandColor = useColorModeValue("black", "brand.500");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const articleParagraphBg = useColorModeValue("white", "gray.700");

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/help/article/${slug}?lang=${language}`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

        const data = await res.json();

        if (!data || !data.id) throw new Error("Article not found");

        setArticle(data);
      } catch (err) {
        console.error("Fetch article error:", err);
        setError(err.message || "Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, language]);

  const giveFeedback = async (helpful) => {
    if (!article) return;
    try {
      const res = await fetch(`${API_URL}/api/help/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: article.id, helpful }),
      });
      if (!res.ok) throw new Error("Failed to send feedback");

      setFeedbackGiven(true);
      console.log("Feedback sent:", { articleId: article.id, helpful });
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  if (loading) {
    return (
      <Box p={20} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={20} textAlign="center">
        <Text color="red.500" mb={4}>
          {t.errorLoadingArticle}: {error}
        </Text>
        <Button
          onClick={() => router.back()}
          leftIcon={<IoMdArrowBack />}
          colorScheme="brand"
          variant="outline"
        >
          {t.goBack}
        </Button>
      </Box>
    );
  }

  if (!article) {
    return (
      <Box p={20} textAlign="center">
        <Text>{t.articleNotFound}</Text>
        <Button
          mt={4}
          onClick={() => router.back()}
          leftIcon={<IoMdArrowBack />}
          colorScheme="brand"
          variant="outline"
        >
          {t.goBack}
        </Button>
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh" py={{ base: 12, md: 16 }}>
      <Head>
      <title>{pageTitle}</title>
    </Head>
      <Container maxW="container.md">
        {/* Back button */}
        <Button
          mb={6}
          onClick={() => router.back()}
          variant="outline"
          border="2px solid"
          borderColor={borderColor}
          borderRadius="xl"
          color={brandColor}
          fontSize={{ base: "md", md: "lg" }}
          px={4}
          py={2}
          leftIcon={<IoMdArrowBack size={20} />}
          _hover={{ bg: cardHoverBg }}
        >
          {t.goBack}
        </Button>

        {/* Article title */}
        <Heading mb={6} fontSize={mobileAndTabletFont} color={textColor}>
          {article.title}
        </Heading>

        {/* Article content */}
        <VStack align="stretch" spacing={4}>
          {article.content.split(/\n+/).map((para, idx) => (
            <Text
              key={idx}
              fontSize={{ base: "sm", md: "md" }}
              p={mobileAndTabletPadding}
              bg={articleParagraphBg}
              borderRadius="xl"
              shadow="sm"
              color={textColor}
            >
              <span dangerouslySetInnerHTML={{ __html: para }} />
            </Text>
          ))}
        </VStack>

        {/* ===== FEEDBACK ===== */}
        {!feedbackGiven ? (
          <HStack spacing={4} mt={8} justify={{ base: "center", md: "flex-start" }}>
            <Text fontWeight="bold" color={textColor}>
              Was this article helpful?
            </Text>
            <Button
              leftIcon={<FaThumbsUp />}
              colorScheme="green"
              variant="solid"
              size={{ base: "sm", md: "md" }}
              borderRadius="xl"
              shadow="sm"
              _hover={{ transform: "translateY(-2px)", shadow: "md" }}
              onClick={() => giveFeedback(true)}
            >
              Yes
            </Button>
            <Button
              leftIcon={<FaThumbsDown />}
              colorScheme="red"
              variant="solid"
              size={{ base: "sm", md: "md" }}
              borderRadius="xl"
              shadow="sm"
              _hover={{ transform: "translateY(-2px)", shadow: "md" }}
              onClick={() => giveFeedback(false)}
            >
              No
            </Button>
          </HStack>
        ) : (
          <Text mt={8} fontWeight="bold" color="green.500">
            Thank you for your feedback!
          </Text>
        )}
      </Container>
    </Box>
  );
}