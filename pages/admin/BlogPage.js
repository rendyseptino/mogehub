"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Input,
  Textarea,
  Button,
  VStack,
  Heading,
  Image,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

// 🔥 FIX SSR TIPTAP
const TipTapEditor = dynamic(
  () => import("../../components/TipTapEditor"),
  { ssr: false }
);

// 🔥 GET TOKEN (SAFE + DEBUG)
const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  console.log("🔥 TOKEN FROM LOCALSTORAGE:", token);
  return token;
};

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [imageError, setImageError] = useState(false);
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const toast = useToast();
  const router = useRouter();
  const API_ADMIN = "https://api.mogehub.com/admin/blogs";

  // 🔥 CHECK CONTENT KOSONG (TIPTAP SAFE)
  const isContentEmpty = (html) => {
    if (!html) return true;
    const text = html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "")
      .trim();
    return text.length === 0;
  };

  // ================= AUTH CHECK =================
  const checkAuth = () => {
    const token = getAuthToken();
    if (!token) {
      toast({
        title: t.blog_admin_login_required,
        status: "error",
      });
      router.push("/login"); // redirect ke halaman login
      return false;
    }
    return true;
  };

  // ================= FETCH BLOG =================
  const fetchBlogs = async () => {
    if (!checkAuth()) return;

    try {
      const token = getAuthToken();
      console.log("🚀 FETCH BLOGS START");
      console.log("👉 TOKEN:", token);

      const res = await fetch(API_ADMIN, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔥 KUNCI FIX
        },
      });

      console.log("📡 RESPONSE STATUS:", res.status);

      const data = await res.json().catch(() => ({}));
      console.log("📦 RESPONSE DATA:", data);

      if (!res.ok) {
        if (res.status === 401) {
          toast({
            title: t.blog_admin_login_required,
            status: "error",
          });
          localStorage.removeItem("token");
          router.push("/login");
        }
        throw new Error(data.message || t.blog_admin_fetch_failed);
      }

      setBlogs(data.blogs || []);
    } catch (err) {
      console.error("❌ FETCH BLOG ERROR:", err.message);
      toast({
        title: err.message,
        status: "error",
      });
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // ================= CREATE BLOG =================
  const handleCreate = async () => {
    if (!checkAuth()) return;

    try {
      const token = getAuthToken();

      if (!title || !excerpt || isContentEmpty(content) || !coverImage) {
        toast({
          title: t.blog_admin_required_fields,
          status: "warning",
        });
        return;
      }

      const payload = { title, excerpt, content, coverImage };
      console.log("📤 PAYLOAD:", payload);

      const res = await fetch(API_ADMIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("📡 RESPONSE STATUS:", res.status);

      const data = await res.json().catch(() => ({}));
      console.log("📦 RESPONSE DATA:", data);

      if (!res.ok) {
        throw new Error(data.message || data.error || t.blog_admin_create_failed);
      }

      toast({
        title: t.blog_admin_created,
        status: "success",
      });

      // 🔥 RESET FORM
      setTitle("");
      setExcerpt("");
      setContent("");
      setCoverImage("");
      setImageError(false);

      fetchBlogs();
    } catch (err) {
      console.error("❌ CREATE BLOG ERROR:", err.message);
      toast({ title: err.message, status: "error" });
    }
  };

  // ================= DELETE BLOG =================
  const handleDelete = async (id) => {
    if (!checkAuth()) return;

    try {
      const token = getAuthToken();
      console.log("🚀 DELETE BLOG:", id);
      console.log("👉 TOKEN:", token);

      const res = await fetch(`${API_ADMIN}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 DELETE STATUS:", res.status);

      const data = await res.json().catch(() => ({}));
      console.log("📦 DELETE RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.message || t.blog_admin_delete_failed);
      }

      fetchBlogs();

      toast({
        title: t.blog_admin_deleted,
        status: "success",
      });
    } catch (err) {
      console.error("❌ DELETE BLOG ERROR:", err.message);
      toast({ title: err.message, status: "error" });
    }
  };

  return (
    <Box>
      <Heading mb={6}>{t.blog_admin_title}</Heading>

      <VStack spacing={4} align="stretch" mb={10}>
        <Input
          placeholder={t.blog_admin_title_placeholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Textarea
         placeholder={t.blog_admin_excerpt_placeholder}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />

        <Input
          placeholder={t.blog_admin_cover_placeholder}
          value={coverImage}
          onChange={(e) => {
            setCoverImage(e.target.value);
            setImageError(false);
          }}
        />

        {coverImage && !imageError && (
          <Box borderWidth="1px" borderRadius="lg" p={2}>
            <Image
              src={coverImage}
              alt={t.blog_admin_preview_cover}
              objectFit="contain"
              w="100%"
              h="auto"
              maxH="300px"
              mx="auto"
              onError={() => setImageError(true)}
            />
          </Box>
        )}

        {imageError && (
          <Text fontSize="sm" color="red.500">
            {t.blog_admin_invalid_image}
          </Text>
        )}

        <Box borderWidth="1px" borderRadius="lg" p={3}>
          <TipTapEditor content={content} onUpdate={setContent} />
        </Box>

        <Button colorScheme="blue" onClick={handleCreate}>
          {t.blog_admin_create_button}
        </Button>
      </VStack>

      <Heading size="md" mb={4}>
       {t.blog_admin_list_title}
      </Heading>

      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
        {blogs.map((blog) => (
          <Box key={blog.id} borderWidth="1px" p={4} borderRadius="lg">
            {blog.coverImage && (
              <Box borderRadius="md" overflow="hidden" p={2}>
                <Image
                  src={blog.coverImage}
                  objectFit="contain"
                  w="100%"
                  h="auto"
                  maxH="200px"
                  mx="auto"
                />
              </Box>
            )}

            <Text fontWeight="bold" noOfLines={2}>
              {blog.title}
            </Text>

            <Text fontSize="sm" color="gray.500" noOfLines={2}>
              {blog.excerpt}
            </Text>

            <Button
              mt={3}
              size="sm"
              colorScheme="red"
              onClick={() => handleDelete(blog.id)}
            >
              {t.common_delete}
            </Button>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}