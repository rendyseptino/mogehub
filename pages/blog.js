"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Flex,
  Text,
  Image,
  Stack,
  Spinner,
  SimpleGrid,
  Link,
  useColorMode,
  useColorModeValue,
  Button,
  Avatar,
  HStack,
  Badge,
} from "@chakra-ui/react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguageContext } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";

export default function BlogPage() {
  const { language } = useLanguageContext();
  const translations = { en, id };
  const t = translations[language] || translations.id;

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 8;

  // === MODE PERSIST ===
  const { colorMode, setColorMode } = useColorMode();

  useEffect(() => {
    // baca dari localStorage saat mount
    const savedMode = localStorage.getItem("chakra-ui-color-mode");
    if (savedMode && savedMode !== colorMode) {
      setColorMode(savedMode);
    }
  }, [setColorMode]);

  const handleToggleColorMode = () => {
    const newMode = colorMode === "light" ? "dark" : "light";
    setColorMode(newMode);
    localStorage.setItem("chakra-ui-color-mode", newMode);
  };
  // ====================

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://api.mogehub.com/api/blogs");
        const data = await res.json();
        setBlogs(data.blogs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const bg = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const subText = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    const days = Math.floor(diff / 86400);
    if (days > 0) return `${days} ${t?.daysAgo || "d ago"}`;
    const hours = Math.floor(diff / 3600);
    if (hours > 0) return `${hours} ${t?.hoursAgo || "h ago"}`;
    const minutes = Math.floor(diff / 60);
    return `${minutes} ${t?.minutesAgo || "m ago"}`;
  };

  return (
    <Flex direction="column" bg={bg} minH="100vh">
      <Head>
        <title>{t?.blogs || "Blogs"} | MogeHub</title>
      </Head>

      <Navbar onToggleColorMode={handleToggleColorMode} />

      <Box px={{ base: 4, md: 8 }} py={4} mt={{ base: "90px", md: "80px" }}>
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          {t?.blogs || "Blogs"}
        </Text>
      </Box>

      <Box px={{ base: 4, md: 8 }} flex="1">
        {loading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="lg" />
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {currentBlogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`} _hover={{ textDecoration: "none" }}>
                <Box
                  bg={cardBg}
                  borderRadius="md"
                  overflow="hidden"
                  border="1px solid"
                  borderColor={borderColor}
                  shadow="sm"
                  _hover={{ transform: "scale(1.02)" }}
                  transition="all 0.2s"
                  display="flex"
                  flexDirection="column"
                  minH="320px"
                >
                  {blog.coverImage && (
                    <Image src={blog.coverImage} w="100%" h="180px" objectFit="cover" />
                  )}

                  <Stack p={4} spacing={2} flex="1">
                    <Text fontWeight="bold" noOfLines={2}>
                      {blog.title}
                    </Text>

                    <Text fontSize="sm" color={subText} noOfLines={3}>
                      {blog.excerpt}
                    </Text>

                    <Flex justify="space-between" align="center" mt={2}>
                      <HStack spacing={2}>
                        <Avatar
                          size="xs"
                          src={blog.author?.profilePhoto}
                          name={blog.author?.username || "Admin"}
                        />
                        <Text fontSize="sm">{blog.author?.username || "Admin"}</Text>
                      </HStack>

                      <Text fontSize="xs" color={subText}>
                        {timeAgo(blog.createdAt)}
                      </Text>
                    </Flex>

                    {blog.category && (
                      <Badge colorScheme="green" alignSelf="flex-start" mt={2}>
                        {blog.category.name}
                      </Badge>
                    )}
                  </Stack>
                </Box>
              </Link>
            ))}
          </SimpleGrid>
        )}

        {totalPages > 1 && (
          <Flex justify="center" mt={6} mb={10} gap={2} wrap="wrap">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                size="sm"
                onClick={() => handlePageChange(i + 1)}
                variant={currentPage === i + 1 ? "solid" : "outline"}
              >
                {i + 1}
              </Button>
            ))}
          </Flex>
        )}
      </Box>

      <Footer />
    </Flex>
  );
}