import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  Box,
  Flex,
  Heading,
  Text,
  Spinner,
  Stack,
  HStack,
  Tag,
  Button,
  Input,
  useToast,
  useColorMode,
  AspectRatio,
} from "@chakra-ui/react";
import TipTapEditor from "@/components/TipTapEditor";

// ================= HELPER AUTH =================
const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// ================= HELPER YOUTUBE =================
const getYoutubeEmbedFromHtml = (html) => {
  if (!html) return "";
  if (typeof window === "undefined") return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const iframe = doc.querySelector(
      'iframe[src*="youtube.com/embed"], iframe[src*="youtube-nocookie.com/embed"]'
    );
    return iframe?.getAttribute("src") || "";
  } catch {
    return "";
  }
};

const removeYoutubeIframe = (html) => {
  if (!html) return "";
  return html.replace(
    /<iframe[^>]*src=["'](?:https?:)?\/\/(?:www\.)?youtube(-nocookie)?\.com\/embed\/[^"']*["'][^>]*><\/iframe>/gi,
    ""
  );
};

export default function ForumThreadDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { colorMode } = useColorMode();
  const toast = useToast();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // ================= FETCH THREAD =================
  const fetchThread = async () => {
    if (!id || !backendUrl) return;
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/api/forum/threads/${id}`);
      if (!res.ok) throw new Error("Gagal mengambil thread");
      const data = await res.json();
      setThread(data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Gagal load thread",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchThread();
  }, [id]);

  // ================= CREATE COMMENT =================
  const handleCreateComment = async () => {
    const token = getAuthToken();
    if (!token) {
      toast({
        title: "Login required",
        description: "Silakan login dulu",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!commentText.trim()) {
      toast({
        title: "Error",
        description: "Komentar tidak boleh kosong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      setSubmittingComment(true);
      const res = await fetch(`${backendUrl}/api/forum/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          threadId: id,
          content: commentText.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menambahkan komentar");
      }
      setCommentText("");
      fetchThread(); // refresh thread & komentar
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Gagal menambahkan komentar",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const cardBg = colorMode === "light" ? "white" : "gray.900";
  const borderColor = colorMode === "light" ? "gray.200" : "whiteAlpha.200";
  const muted = colorMode === "light" ? "gray.500" : "gray.400";

  if (loading) {
    return (
      <Flex minH="300px" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!thread) {
    return (
      <Box textAlign="center" py={20}>
        <Heading size="md">Thread tidak ditemukan</Heading>
      </Box>
    );
  }

  const youtubeEmbed = getYoutubeEmbedFromHtml(thread.content);
  const threadContentWithoutYoutube = removeYoutubeIframe(thread.content);

  return (
    <>
      <Head>
        <title>{thread.title} – Mogehub Forum</title>
      </Head>

      <Box px={{ base: 4, md: 10 }} py={8} maxW="900px" mx="auto">
        {/* THREAD DETAIL */}
        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded="2xl" p={6} mb={8}>
          <Stack spacing={3}>
            <Heading size="lg">{thread.title}</Heading>
            <Text fontSize="sm" color={muted}>
              by {thread.author?.username || "Unknown"} • {new Date(thread.createdAt).toLocaleDateString("id-ID")}
            </Text>

            {youtubeEmbed && (
              <AspectRatio ratio={16 / 9} borderRadius="md" overflow="hidden">
                <iframe
                  src={youtubeEmbed}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </AspectRatio>
            )}

            <Box
              className="ProseMirror"
              sx={{
                "& p": { margin: "0 0 8px 0" },
                "& strong": { fontWeight: "bold" },
                "& em": { fontStyle: "italic" },
                "& u": { textDecoration: "underline" },
                "& h1": { fontSize: "1.25rem", fontWeight: "bold", margin: "0 0 8px 0" },
                "& h2": { fontSize: "1.125rem", fontWeight: "bold", margin: "0 0 6px 0" },
                "& h3": { fontSize: "1rem", fontWeight: "bold", margin: "0 0 4px 0" },
                display: "-webkit-box",
                WebkitLineClamp: 10,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
              dangerouslySetInnerHTML={{ __html: threadContentWithoutYoutube }}
            />

            <HStack spacing={2} wrap="wrap">
              {thread.category && <Tag size="sm" variant="subtle">{thread.category.name}</Tag>}
              {thread.tags?.map((t) => <Tag key={t.id} size="sm" variant="outline">{t.tag?.name}</Tag>)}
            </HStack>

            <Flex pt={1} justify="space-between" fontSize="sm" color={muted}>
              <Text>{thread.comments?.length || 0} komentar</Text>
              <Text>{thread.likes?.length || 0} like</Text>
            </Flex>
          </Stack>
        </Box>

        {/* COMMENTS SECTION */}
        <Box>
          <Heading size="md" mb={4}>Komentar</Heading>

          {/* COMMENT FORM */}
          <Box mb={6}>
            <TipTapEditor content={commentText} onUpdate={setCommentText} placeholder="Tulis komentar..." />
            <Flex justify="flex-end" mt={2}>
              <Button
                bg="brand.500"
                color="black"
                _hover={{ bg: "brand.600" }}
                isLoading={submittingComment}
                onClick={handleCreateComment}
              >
                Kirim Komentar
              </Button>
            </Flex>
          </Box>

          {/* COMMENT LIST */}
          {thread.comments?.length === 0 ? (
            <Text fontSize="sm" color={muted}>Belum ada komentar.</Text>
          ) : (
            <Stack spacing={4}>
              {thread.comments.map((c) => (
                <Box key={c.id} bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded="2xl" p={4}>
                  <Text fontWeight="bold">{c.author?.username || "Unknown"}</Text>
                  <Text fontSize="sm" color={muted}>{new Date(c.createdAt).toLocaleDateString("id-ID")}</Text>
                  <Box dangerouslySetInnerHTML={{ __html: c.content }} mt={1} />
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </>
  );
}