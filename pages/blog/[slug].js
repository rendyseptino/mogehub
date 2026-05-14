"use client";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Box,
  Text,
  Image,
  Flex,
  Button,
  Stack,
  Avatar,
  Textarea,
  useColorMode,
  useColorModeValue,
  HStack,
  Icon,
  useToast,
  Link,
} from "@chakra-ui/react";
import { FaStar, FaLinkedin, FaFacebook } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { BsTwitterX } from "react-icons/bs";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BottomNavbar from "../../components/BottomNavbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useUser } from "../../context/UserContext";

// helper: strip HTML tags
const stripHtml = (html) => (html ? html.replace(/<[^>]+>/g, "") : "");

// helper: format date ke Indonesia (tanggal bulan tahun + jam:menit)
const formatDateFriendly = (dateStr) => {
  if (!dateStr) return "-";
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateStr).toLocaleDateString("id-ID", options);
};

// ambil token dari localStorage
const getAuthToken = () => (typeof window === "undefined" ? null : localStorage.getItem("token"));

// helper: ambil URL profilePhoto full path
const getProfilePhoto = (photoPath) => {
  if (!photoPath) return "/default-admin.png";
  return photoPath.startsWith("http") ? photoPath : `${process.env.NEXT_PUBLIC_BASE_URL}${photoPath}`;
};

export default function BlogDetailPage() {
  const router = useRouter();
  const toast = useToast();
  const { slug } = router.query;

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingValue, setRatingValue] = useState(0);

  // === MODE PERSIST FIX ===
  const { colorMode, setColorMode } = useColorMode();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleColorMode = () => {
    const newMode = colorMode === "light" ? "dark" : "light";
    setColorMode(newMode);
    localStorage.setItem("chakra-ui-color-mode", newMode);
  };
  // ====================

  const bgCard = useColorModeValue("white", "gray.700");
  const textMain = useColorModeValue("black", "white");
  const subText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  const token = getAuthToken();
  const isLoggedIn = !!token;

  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.mogehub.com/api/blogs/${slug}`);
        const data = await res.json();
        setBlog(data.blog);
        if (isLoggedIn && data.blog.ratings?.length) {
          const userRating = data.blog.ratings.find(
            (r) => r.authorId === parseInt(token.split("-")[0])
          );
          if (userRating) setRatingValue(userRating.value);
        }
      } catch (err) {
        console.error("Failed to fetch blog:", err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const handleAddComment = async () => {
    if (!isLoggedIn) {
      toast({ title: "Login dulu untuk komentar", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (!commentContent.trim()) return;

    try {
      const res = await fetch(`https://api.mogehub.com/api/blogs/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: blog.id, content: commentContent }),
      });
      const data = await res.json();

      // pakai user dari context langsung
      const newComment = {
        ...data.comment,
        author: {
          username: user.username,
          profilePhoto: user.profilePhoto,
        },
      };

      setBlog((prev) => ({ ...prev, comments: [newComment, ...(prev.comments || [])] }));
      setCommentContent("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast({ title: "Gagal komentar", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleAddRating = async (value) => {
    if (!isLoggedIn) {
      toast({ title: "Login dulu untuk memberi rating", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    try {
      const res = await fetch(`https://api.mogehub.com/api/blogs/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: blog.id, value }),
      });
      const data = await res.json();
      setBlog((prev) => ({
        ...prev,
        ratings: [...(prev.ratings || []).filter((r) => r.authorId !== data.rating.authorId), data.rating],
      }));
      setRatingValue(data.rating.value);
    } catch (err) {
      console.error("Failed to add rating:", err);
      toast({ title: "Gagal memberi rating", status: "error", duration: 3000, isClosable: true });
    }
  };

  if (!mounted) return null;

  if (loading)
    return (
      <Box minH="100vh">
        <Navbar onToggleColorMode={handleToggleColorMode} />
        <Box mt={24} mb={10} maxW="800px" mx="auto">
          <LoadingSpinner />
        </Box>
        <Footer />
        <BottomNavbar />
      </Box>
    );

  if (!blog)
    return (
      <Box minH="100vh">
        <Head>
          <title>MogeHub | Blog not found</title>
          <meta name="description" content="Blog tidak ditemukan" />
        </Head>
        <Navbar onToggleColorMode={handleToggleColorMode} />
        <Box mt={24} mb={10} maxW="800px" mx="auto" textAlign="center">
          <Text fontSize="xl" fontWeight="bold">
            Blog not found
          </Text>
          <Button mt={4} bg="#90cdf4" color="black" onClick={() => router.back()}>
            Go Back
          </Button>
        </Box>
        <Footer />
        <BottomNavbar />
      </Box>
    );

  const avgRating = blog.ratings?.length
    ? blog.ratings.reduce((a, b) => a + b.value, 0) / blog.ratings.length
    : 0;

  const shareLinks = {
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(blog.title + " " + window.location.href)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
  };

  const userRatingValue = isLoggedIn
    ? ratingValue
    : blog.ratings?.length
    ? Math.round(blog.ratings.reduce((a, b) => a + b.value, 0) / blog.ratings.length)
    : 0;

  return (
    <Box minH="100vh">
      <Head>
        <title>MogeHub | {blog.title}</title>
        <meta name="description" content={stripHtml(blog.content).slice(0, 150)} />
      </Head>

      <Navbar onToggleColorMode={handleToggleColorMode} />
      <Box maxW="800px" mx="auto" mt={24} px={{ base: 4, md: 8 }} mb={12}>
        <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" mb={4} color={textMain}>
          {blog.title}
        </Text>

        {blog.coverImage && (
          <Box borderRadius="xl" overflow="hidden" mb={6}>
            <Image src={blog.coverImage} alt={blog.title} w="100%" borderRadius="xl" />
          </Box>
        )}

        <Flex align="center" mb={2} gap={3}>
          <Avatar
            src={getProfilePhoto(blog.author?.profilePhoto)}
            name={blog.author?.username || "Admin"}
            size="sm"
          />
          <Box>
            <Text fontSize="sm" color={subText}>
              By {blog.author?.username || "Admin"}
            </Text>
            <Text fontSize="xs" color={subText}>
              Created At: {formatDateFriendly(blog.createdAt)}
            </Text>
          </Box>
        </Flex>

        <Box mb={6}>
          <Text color={textMain} whiteSpace="pre-line">
            {stripHtml(blog.content)}
          </Text>
        </Box>

        <Text mb={4} fontSize="sm" color={subText}>
          Views: {blog.views}
        </Text>

        {/* Share Section */}
        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>
            Share this post:
          </Text>
          <HStack spacing={4}>
            <Link href={shareLinks.linkedin} isExternal>
              <Icon as={FaLinkedin} w={6} h={6} color="#0077B5" cursor="pointer" />
            </Link>
            <Link href={shareLinks.whatsapp} isExternal>
              <Icon as={IoLogoWhatsapp} w={6} h={6} color="#25D366" cursor="pointer" />
            </Link>
            <Link href={shareLinks.twitter} isExternal>
              <Icon as={BsTwitterX} w={6} h={6} color="#1DA1F2" cursor="pointer" />
            </Link>
            <Link href={shareLinks.facebook} isExternal>
              <Icon as={FaFacebook} w={6} h={6} color="#1877F2" cursor="pointer" />
            </Link>
          </HStack>
        </Box>

        {/* Rating */}
        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>
            Rating ({blog.ratings?.length || 0}) - Avg: {avgRating.toFixed(1)}
          </Text>
          <HStack spacing={1}>
            {[1, 2, 3, 4, 5].map((star) => {
              let starColor = "gray.300";

              if (!isLoggedIn && star <= userRatingValue) {
                starColor = "yellow.400";
              } else if (isLoggedIn && star <= (hoverRating || ratingValue)) {
                starColor = "yellow.400";
              }

              return (
                <Icon
                  key={star}
                  as={FaStar}
                  w={6}
                  h={6}
                  cursor="pointer"
                  color={starColor}
                  onMouseEnter={isLoggedIn ? () => setHoverRating(star) : undefined}
                  onMouseLeave={isLoggedIn ? () => setHoverRating(0) : undefined}
                  onClick={
                    isLoggedIn
                      ? () => handleAddRating(star)
                      : () =>
                          toast({
                            title: "Login dulu untuk memberi rating",
                            status: "warning",
                            duration: 3000,
                            isClosable: true,
                          })
                  }
                />
              );
            })}
          </HStack>
        </Box>

        {/* Comments Section */}
        <Box mb={6}>
          <Text fontWeight="bold" mb={2}>
            Comments ({blog.comments?.length || 0})
          </Text>

          <Stack spacing={3}>
            <Textarea
              placeholder="Add a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              color={colorMode === "dark" ? "white" : "black"}
              _focus={{ borderColor: "#90cdf4", color: colorMode === "dark" ? "white" : "black" }}
            />
            <Button
              size="sm"
              onClick={handleAddComment}
              isDisabled={!commentContent.trim()}
              bg={commentContent.trim() ? "#90cdf4" : undefined}
              color={commentContent.trim() ? "black" : undefined}
              mb={4}
            >
              Submit
            </Button>

            {blog.comments?.map((c) => (
              <Box key={c.id} p={2} border="1px solid" borderColor={borderColor} borderRadius="md">
                <Flex align="center" gap={2} mb={1}>
                  <Avatar size="xs" src={getProfilePhoto(c.author?.profilePhoto)} name={c.author?.username || "Admin"} />
                  <Text fontSize="sm" fontWeight="bold">
                    {c.author?.username || "Admin"}
                  </Text>
                  <Text fontSize="xs" color={subText}>
                    {formatDateFriendly(c.createdAt)}
                  </Text>
                </Flex>
                <Text>{stripHtml(c.content)}</Text>
              </Box>
            ))}
          </Stack>
        </Box>

        <Button mt={6} bg="#90cdf4" color="black" onClick={() => router.back()}>
          Back
        </Button>
      </Box>
      <Footer />
      <BottomNavbar />
    </Box>
  );
}