"use client";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Spinner,
  Button,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";

import { IoMdArrowBack } from "react-icons/io";

import { useLanguageContext } from "../../../context/LanguageContext";
import { mobileAndTabletPadding } from "../../../utils/responsive";

// locales
import en from "../../../locales/en.json";
import id from "../../../locales/id.json";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;

  const { language } = useLanguageContext();
  const t = language === "en" ? en : id;
  

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pageTitle = category
  ? `${category.name} - MogeHub Help Center`
  : language === "en"
    ? "Help Category - MogeHub"
    : "Kategori Bantuan - MogeHub";

  // Theme colors
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardHoverBg = useColorModeValue("gray.100", "gray.600");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.300");
  const brandColor = useColorModeValue("black", "brand.500");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  useEffect(() => {
    if (!slug) return;

    const fetchCategory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/help/category/${slug}?lang=${language}`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

        const data = await res.json();
        if (!data || !data.id) throw new Error("Category not found");

        setCategory(data);
      } catch (err) {
        console.error("Fetch category error:", err);
        setError(err.message || "Failed to load category");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug, language]);

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
          {t.errorLoadingCategory}: {error}
        </Text>
        <Button onClick={() => router.push("/help")} colorScheme="brand">
          {t.goBack}
        </Button>
      </Box>
    );
  }

  if (!category) {
    return (
      <Box p={20} textAlign="center">
        <Text>{t.categoryNotFound}</Text>
        <Button mt={4} onClick={() => router.push("/help")} colorScheme="brand">
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
          onClick={() => router.push("/help")}
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

        {/* Category header */}
        <Heading
          mb={2}
          fontSize={{ base: "2xl", md: "3xl" }}
          color={brandColor}
          textAlign={{ base: "center", md: "left" }}
        >
          {category.name}
        </Heading>

        <Text
          mb={10}
          color={subTextColor}
          fontSize={{ base: "md", md: "lg" }}
          p={mobileAndTabletPadding}
          textAlign={{ base: "center", md: "left" }}
        >
          {category.description}
        </Text>

        {/* Articles list */}
        <VStack align="stretch" spacing={4}>
          {category.articles.map((article) => (
            <Box
              key={article.id}
              p={{ base: 4, md: 6 }}
              bg={cardBg}
              borderRadius="2xl"
              cursor="pointer"
              shadow="sm"
              _hover={{
                bg: cardHoverBg,
                shadow: "md",
                transform: "translateY(-2px)",
                transition: "all 0.3s ease-in-out",
              }}
              transition="all 0.3s ease-in-out"
              onClick={() => router.push(`/help/article/${article.slug}`)}
            >
              <HStack justify="space-between" align="center">
                <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} color={textColor}>
                  {article.title}
                </Text>
                <Text fontSize="sm" color={subTextColor}>
                  {article.views} views
                </Text>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Container>
    </Box>
  );
}