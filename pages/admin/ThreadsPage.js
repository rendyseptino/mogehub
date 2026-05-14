// File: /pages/admin/ThreadsPage.js
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Spinner,
  Stack,
  SimpleGrid,
  Select,
  Input,
  Tag,
  HStack,
  useToast,
  useColorMode,
  Divider,
  Image,
  AspectRatio,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState, useRef } from "react";
import Head from "next/head";
import TipTapEditor from "@/components/TipTapEditor";
import ForumThreadDrawer from "@/components/ForumThreadDrawer";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };


import {
  mobileAndTabletFont,
  mobileAndTabletPadding,
} from "@/utils/responsive";

const backendUrl = process.env.NEXT_PUBLIC_API_URL;

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const getYoutubeEmbedFromHtml = (html) => {
  if (!html || typeof window === "undefined") return "";
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

export default function AdminThreadsPage() {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const topRef = useRef(null);
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  // CREATE / EDIT THREAD
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagIds, setTagIds] = useState([]);
  const [creating, setCreating] = useState(false);
  const [editingThreadId, setEditingThreadId] = useState(null);

  // THREAD DRAWER
  const [selectedThread, setSelectedThread] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // FILTER
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  // ================= FETCH DATA =================
  const fetchAll = async () => {
    try {
      setLoading(true);
      const [threadRes, catRes, tagRes] = await Promise.all([
        fetch(`${backendUrl}/api/forum/threads`),
        fetch(`${backendUrl}/api/forum/categories`),
        fetch(`${backendUrl}/api/forum/tags`),
      ]);

      if (!threadRes.ok) throw new Error("Gagal fetch threads");
      if (!catRes.ok) throw new Error("Gagal fetch categories");
      if (!tagRes.ok) throw new Error("Gagal fetch tags");

      const threadData = await threadRes.json();
      const catData = await catRes.json();
      const tagData = await tagRes.json();

      setThreads(Array.isArray(threadData) ? threadData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setTags(Array.isArray(tagData) ? tagData : []);
    } catch (err) {
      console.error(err);
      toast({
        title: t.common_error,
        description: err.message || t.admin_forum_failed_load_forum,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ================= CREATE / UPDATE THREAD =================
const handleSubmitThread = async () => {
  const token = getAuthToken();
  if (!token) {
    toast({
      title: t.common_error,
      description: t.auth_login_required,
      status: "error",
      duration: 2500,
      isClosable: true,
    });
    return;
  }

  if (!title.trim() || !content.trim()) {
    toast({
      title: t.common_error,
      description: t.admin_forum_title_content_required,
      status: "error",
      duration: 2500,
      isClosable: true,
    });
    return;
  }

  // ✅ Ambil authorId dari token JWT
  let authorId = null;
  try {
    // Token JWT biasanya format: header.payload.signature
    const payload = JSON.parse(atob(token.split(".")[1]));
    authorId = payload.id; // pastikan payload.id sesuai struktur JWT lo
  } catch (e) {
    console.error("Gagal ambil authorId dari token", e);
    toast({
      title: t.common_error,
      description: t.admin_forum_failed_get_user_id,
      status: "error",
      duration: 2500,
      isClosable: true,
    });
    return;
  }

  try {
    setCreating(true);

    const url = editingThreadId
      ? `${backendUrl}/admin/forum/threads/${editingThreadId}`
      : `${backendUrl}/admin/forum/threads`;
    const method = editingThreadId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: title.trim(),
        content: content.trim(),
        categoryId: categoryId ? Number(categoryId) : null,
        tagIds: tagIds.map((id) => Number(id)),
        authorId, // ✅ Sudah pasti terdefinisi
      }),
    });

    if (!res.ok) throw new Error("Gagal submit thread");

    toast({
      title: t.common_success,
      description: editingThreadId
        ? t.admin_forum_thread_updated
        : t.admin_forum_thread_created,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    setTitle("");
    setContent("");
    setCategoryId("");
    setTagIds([]);
    setEditingThreadId(null);
    setShowCreate(false);
    fetchAll();
  } catch (err) {
    toast({
      title: t.common_error,
      description: err.message || t.admin_forum_failed_submit_thread,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setCreating(false);
  }
};
  // ================= DELETE THREAD =================
  const handleDelete = async (id) => {
    const token = getAuthToken();
    if (!token) {
      toast({
        title: "Error",
        description: "Login terlebih dahulu",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
      return;
    }
    if (!confirm(t.admin_forum_delete_confirm)) return;

    try {
      const res = await fetch(`${backendUrl}/admin/forum/threads/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Gagal hapus thread");

      toast({
        title: t.common_success,
        description:  t.admin_forum_thread_deleted,
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      fetchAll();
    } catch (err) {
      toast({
        title: t.common_error,
        description: err.message || t.admin_forum_failed_delete_thread,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const cardBg = colorMode === "light" ? "white" : "gray.900";
  const borderColor = colorMode === "light" ? "gray.200" : "whiteAlpha.400";
  const muted = colorMode === "light" ? "gray.500" : "gray.400";
  const forumLogo =
    colorMode === "light"
      ? "/mogehubmasterlight.png"
      : "/mogehubmasterdark.png";

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      if (categoryFilter && String(t.categoryId) !== String(categoryFilter))
        return false;
      if (tagFilter) {
        const hasTag = t.tags?.some(
          (x) => String(x.tagId) === String(tagFilter)
        );
        if (!hasTag) return false;
      }
      return true;
    });
  }, [threads, categoryFilter, tagFilter]);

  return (
    <>
      <Head>
        <title>{t.admin_forum_page_title}</title>
      </Head>

      <Box ref={topRef} px={mobileAndTabletPadding} py={mobileAndTabletPadding} maxW="1400px" mx="auto">
        {/* Header */}
        <Flex
          mb={4}
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align={{ lg: "center" }}
          gap={4}
        >
          <Box>
            <Image src={forumLogo} alt="Forum Mogehub" h="46px" maxW="250px" mb={1} objectFit="contain" />
            <Text fontSize={mobileAndTabletFont} color={muted}>
              {t.admin_forum_subtitle}
            </Text>
          </Box>

          <Button
            bg="brand.500"
            color="black"
            _hover={{ bg: "brand.600" }}
            onClick={() => {
              setShowCreate((s) => !s);
              setTitle("");
              setContent("");
              setCategoryId("");
              setTagIds([]);
              setEditingThreadId(null);
            }}
          >
            {t.admin_forum_create_thread}
          </Button>
        </Flex>

        {/* Filters */}
        <Flex mb={8} gap={2} wrap="wrap">
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} flex="1">
            <option value="">{t.admin_forum_all_categories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} flex="1">
            <option value="">{t.admin_forum_all_tags}</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </Flex>

        {/* Create / Edit Thread Box */}
        {showCreate && (
          <Box mb={10} bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded="2xl" p={mobileAndTabletPadding} boxShadow="sm">
            <Stack spacing={6}>
              <Heading size="sm">{editingThreadId ? t.admin_forum_edit_thread : t.admin_forum_new_thread}</Heading>
              <Divider />
              <Stack spacing={4}>
                <Box>
                  <Text fontSize={mobileAndTabletFont} mb={1} color={muted}>{t.admin_forum_title}</Text>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </Box>
                <Box>
                  <Text fontSize={mobileAndTabletFont} mb={1} color={muted}>{t.admin_forum_category}</Text>
                  <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">{t.admin_forum_select_category}</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </Box>
                <Box>
                  <Text fontSize={mobileAndTabletFont} mb={1} color={muted}>{t.admin_forum_content}</Text>
                  <TipTapEditor content={content} onUpdate={setContent} />
                </Box>
                <Box>
                  <Text fontSize={mobileAndTabletFont} mb={1} color={muted}>{t.admin_forum_tag}</Text>
                  <Select value="" onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!val || tagIds.includes(val)) return;
                    setTagIds((p) => [...p, val]);
                  }}>
                    <option value="">{t.admin_forum_add_tag}</option>
                    {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Select>
                </Box>
                <Box>
                  <Text fontSize={mobileAndTabletFont} mb={1} color={muted}>{t.admin_forum_selected_tags}</Text>
                  <HStack wrap="wrap">
                    {tagIds.map((id) => {
                      const tg = tags.find((x) => x.id === id);
                      return (
                        <Tag key={id} cursor="pointer" onClick={() => setTagIds((p) => p.filter((x) => x !== id))}>
                          {tg?.name} ✕
                        </Tag>
                      );
                    })}
                  </HStack>
                </Box>
              </Stack>
              <Flex justify="flex-end" gap={3}>
                <Button variant="ghost" onClick={() => { setShowCreate(false); setEditingThreadId(null); }}>{t.common_cancel}</Button>
                <Button bg="brand.500" color="black" isLoading={creating} onClick={handleSubmitThread}>
                  {editingThreadId ? t.admin_forum_update_thread : t.admin_forum_publish}
                </Button>
              </Flex>
            </Stack>
          </Box>
        )}

        {/* Threads List */}
        {loading ? (
          <Flex minH="220px" align="center" justify="center"><Spinner size="xl" /></Flex>
        ) : filteredThreads.length === 0 ? (
          <Box textAlign="center" py={16}>
            <Text fontSize="2xl" fontWeight="bold" mb={2}>{t.admin_forum_empty_title}</Text>
            <Text mb={4} color={muted}>{t.admin_forum_create_first_thread}</Text>
            <Button bg="brand.500" color="black" _hover={{ bg: "brand.600" }} onClick={() => setShowCreate(true)}>Buat Thread Sekarang</Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {filteredThreads.map((thread) => {
              const youtubeEmbed = getYoutubeEmbedFromHtml(thread.content);
              const threadContentWithoutYoutube = removeYoutubeIframe(thread.content);

              return (
                <Box key={thread.id} bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded="2xl" p={mobileAndTabletPadding}>
                  <Stack spacing={3}>
                    <Flex justify="space-between" align="start">
                      <Text fontWeight="bold" cursor="pointer" color="blue.500"
                        onClick={async () => {
                          try {
                            const res = await fetch(`${backendUrl}/api/forum/threads/${thread.id}`);
                            const data = await res.json();
                            setSelectedThread(data);
                            setDrawerOpen(true);
                          } catch (e) {
                            toast({ title: "Error", description: "Gagal load thread", status: "error", duration: 3000, isClosable: true });
                          }
                        }}
                      >
                        {thread.title}
                      </Text>
                      <HStack>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingThreadId(thread.id);
                          setTitle(thread.title || "");
                          setContent(thread.content || "");
                          setCategoryId(thread.categoryId ? String(thread.categoryId) : "");
                          setTagIds(thread.tags?.map((x) => x.tagId) || []);
                          setShowCreate(true);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}>{t.common_edit}</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(thread.id)}>{t.common_delete}</Button>
                      </HStack>
                    </Flex>

                    <Text fontSize={mobileAndTabletFont} color={muted}>
                      by {thread.author?.username || "Unknown"}
                    </Text>

                    {youtubeEmbed && (
                      <AspectRatio ratio={16 / 9}>
                        <iframe
                          src={youtubeEmbed}
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </AspectRatio>
                    )}

                    <Box
                      className="ProseMirror"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                      dangerouslySetInnerHTML={{ __html: threadContentWithoutYoutube }}
                    />

                    <HStack spacing={2} wrap="wrap">
                      {thread.tags?.map((t) => (
                        <Tag key={t.tagId}>{tags.find((x) => x.id === t.tagId)?.name || t.common_tag}</Tag>
                      ))}
                    </HStack>
                  </Stack>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </Box>

      <ForumThreadDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        thread={selectedThread}
        backendUrl={backendUrl}
        toast={toast}
      />
    </>
  );
}