"use client";
import Head from "next/head";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLanguageContext } from "../../context/LanguageContext";

import {
  Box,
  Heading,
  Input,
  VStack,
  Text,
  Spinner,
  SimpleGrid,
  Container,
  HStack,
  Button,
  useColorModeValue,
  IconButton,
  Flex,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";

import { IoHelpBuoy } from "react-icons/io5";
import { AiOutlineEnter } from "react-icons/ai";
import { FiArrowLeft } from "react-icons/fi";

import { mobileAndTabletPadding } from "../../utils/responsive";

import en from "../../locales/en.json";
import id from "../../locales/id.json";


const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 5;

export default function HelpIndex() {
  const router = useRouter();
  const { language } = useLanguageContext();
  const t = language === "en" ? en : id;
  const pageTitle =
  language === "en"
    ? "Help Center - MogeHub"
    : "Pusat Bantuan - MogeHub";


  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/help/categories?lang=${language}`);
        const data = await res.json();
        const formattedData = Array.isArray(data)
          ? data.map((cat) => ({
              ...cat,
              name: cat.name || t.noName,
              description: cat.description || t.noDescription,
            }))
          : [];
        setCategories(formattedData);
      } catch (err) {
        console.error("Fetch categories error:", err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [language, t.noName, t.noDescription]);

  useEffect(() => {
    if (search.length < 3) {
      setArticles([]);
      setCurrentPage(1);
      return;
    }
    const fetchArticles = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/help/search?q=${encodeURIComponent(search)}&lang=${language}`
        );
        const data = await res.json();
        const mappedArticles = Array.isArray(data)
          ? data.map((article) => ({
              id: article.id,
              slug: article.slug,
              title:
                article.translations?.[language]?.title ||
                article.translations?.id?.title ||
                article.title,
            }))
          : [];
        setArticles(mappedArticles);
        setCurrentPage(1);
      } catch (err) {
        console.error("Search error:", err);
        setArticles([]);
      }
    };
    fetchArticles();
  }, [search, language]);

  // ================= THEME COLORS =================
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.600");
  const cardHoverBg = useColorModeValue("gray.200", "gray.500");
  const brandColor = useColorModeValue("black", "brand.500");
  const textColor = useColorModeValue("black", "white");
  const sectionBorder = useColorModeValue("gray.300", "gray.500");
  const searchSectionBg = useColorModeValue("transparent", "gray.900");
  const resultSectionBg = useColorModeValue("gray.100", "gray.700");

  if (loading) {
    return (
      <Box p={20} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  

  const totalPages = Math.ceil(articles.length / PAGE_SIZE);
  const displayedArticles = articles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <Box bg={bgColor} minH="100vh" py={16}>
      <Container maxW="container.lg">
        <Head>
        <title>{pageTitle}</title>
        </Head>
        {/* ================= SEARCH + BACK SECTION WITH ANIMATED BG IMAGE ================= */}
        <Box
          position="relative"
          borderRadius="2xl"
          mb={12}
          overflow="hidden"
          p={{ base: 6, md: 12 }}
          border="1px solid"
          borderColor={sectionBorder}
          bg={searchSectionBg}
        >
          {/* Floating help.png ornament only kanan atas */}
          <Box
            position="absolute"
            top="5%"
            right="5%"
            w={{ base: "150px", md: "250px" }}
            h={{ base: "150px", md: "250px" }}
            backgroundImage="url('/help.png')"
            backgroundSize="contain"
            backgroundRepeat="no-repeat"
            opacity={0.35}
            animation="floatReverse 12s ease-in-out infinite"
          />

          {/* Section content */}
          <Flex mb={8} align="center">
            <IconButton
              icon={<FiArrowLeft />}
              aria-label="Back"
              variant="outline"
              onClick={() => router.push("/")}
            />
          </Flex>

          <VStack spacing={8} align="stretch">
            <HStack justifyContent="center" spacing={3}>
              <IoHelpBuoy size={40} color={textColor} />
              <Heading
                fontSize={{ base: "2xl", md: "4xl" }}
                textAlign="center"
                color={textColor}
              >
                {t.helpCenter}
              </Heading>
            </HStack>

            <InputGroup maxW={{ base: "100%", md: "600px" }} mx="auto">
              <Box w="1px" h="100%" bg="gray.300" mx={2} />
              <Input
                pl={{ base: 4, md: 4 }}
                placeholder={t.searchHelp}
                size="lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                borderRadius="2xl"
                p={mobileAndTabletPadding}
                border="1px solid"
                borderColor="gray.300"
                _focus={{
                  bg: "transparent",
                  borderColor: brandColor,
                  boxShadow: `0 0 0 2px ${brandColor}`,
                  color: textColor,
                }}
                _hover={{ borderColor: brandColor }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && search.length >= 3) setCurrentPage(1);
                }}
              />
              <InputRightElement
                pointerEvents="none"
                mr={{ base: 2, md: 2 }}
                top="50%"
                transform="translateY(-50%)"
              >
                <AiOutlineEnter
                  size={20}
                  color={textColor}
                  style={{
                    border: `2px solid ${textColor}`,
                    borderRadius: 4,
                    padding: 2,
                  }}
                />
              </InputRightElement>
            </InputGroup>
          </VStack>
        </Box>

        {/* ================= CATEGORY / SEARCH RESULTS SECTION ================= */}
        <Box
          bg={resultSectionBg}
          p={{ base: 6, md: 8 }}
          borderRadius="2xl"
        >
          {search.length > 2 ? (
            <VStack align="stretch" spacing={4}>
              {displayedArticles.length === 0 ? (
                <Text textAlign="center" color="gray.500" fontSize="md">
                  {t.noArticles}
                </Text>
              ) : (
                displayedArticles.map((article) => (
                  <Box
                    key={article.id}
                    p={6}
                    bg={cardBg}
                    borderRadius="2xl"
                    cursor="pointer"
                    shadow="md"
                    _hover={{
                      bg: cardHoverBg,
                      shadow: "xl",
                      transform: "translateY(-2px)",
                    }}
                    transition="all 0.3s"
                    textAlign="center"
                    onClick={() => router.push(`/help/article/${article.slug}`)}
                  >
                    <Text
                      fontWeight="bold"
                      fontSize={{ base: "md", md: "lg" }}
                      color={textColor}
                    >
                      {article.title}
                    </Text>
                  </Box>
                ))
              )}

              {totalPages > 1 && (
                <HStack justifyContent="center" spacing={2} mt={4}>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i + 1}
                      size="sm"
                      colorScheme={i + 1 === currentPage ? "brand" : "gray"}
                      variant={i + 1 === currentPage ? "solid" : "outline"}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </HStack>
              )}
            </VStack>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {categories.map((cat) => (
                <Box
                  key={cat.id}
                  p={6}
                  bg={cardBg}
                  borderRadius="2xl"
                  cursor="pointer"
                  textAlign="center"
                  shadow="md"
                  _hover={{
                    bg: cardHoverBg,
                    shadow: "xl",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.3s"
                  onClick={() => router.push(`/help/category/${cat.slug}`)}
                >
                  <Heading size="md" mb={3} color={brandColor}>
                    {cat.name}
                  </Heading>
                  <Text fontSize="md" color={textColor}>
                    {cat.description}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Container>

      <style jsx>{`
        @keyframes floatReverse {
          0% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </Box>
  );
}