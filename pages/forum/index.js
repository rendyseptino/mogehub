// File: /pages/forum/index.js
import dynamic from "next/dynamic";
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
  AspectRatio,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { IconBrandHipchat, IconHeart } from "@tabler/icons-react";
import NextImage from "next/image";
import { useUser } from "../../context/UserContext";


import ForumThreadDrawer from "@/components/ForumThreadDrawer";
import AuthDrawer from "@/components/AuthDrawer";
import { Avatar } from "@chakra-ui/react";
import VerifiedBadge from "../../components/VerifiedBadge";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";


import {
  mobileOnly,
  desktopOnly,
  mobileAndTabletFont,
  mobileAndTabletPadding,
} from "@/utils/responsive";

const TipTapEditor = dynamic(() => import("@/components/TipTapEditor"), {
  ssr: false,
});

const translations = { en, id };


const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const getUserIdFromToken = () => {
  try {
    const token = getAuthToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id || payload?.userId || null;
  } catch {
    return null;
  }
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

export default function ForumHome() {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const router = useRouter();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  const topRef = useRef(null);

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagIds, setTagIds] = useState([]);
  const [creating, setCreating] = useState(false);

  const [editingThreadId, setEditingThreadId] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const { user } = useUser();
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    setCurrentUserId(user?.id || null);
  }, [user]);

  const fetchAll = async () => {
    if (!backendUrl) return;
    try {
      setLoading(true);
      const [threadRes, catRes, tagRes] = await Promise.all([
        fetch(`${backendUrl}/api/forum/threads`, {
          headers: getAuthToken()
            ? { Authorization: `Bearer ${getAuthToken()}` }
            : {},
        }),
        fetch(`${backendUrl}/api/forum/categories`),
        fetch(`${backendUrl}/api/forum/tags`),
      ]);

      if (!threadRes.ok) throw new Error("Gagal mengambil threads");
      if (!catRes.ok) throw new Error("Gagal mengambil categories");
      if (!tagRes.ok) throw new Error("Gagal mengambil tags");

      const threadData = await threadRes.json();
      const catData = await catRes.json();
      const tagData = await tagRes.json();

      setThreads(Array.isArray(threadData) ? threadData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setTags(Array.isArray(tagData) ? tagData : []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || t.error_load_forum,
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
  }, [backendUrl, currentUserId]);

  useEffect(() => {
    if (!router.isReady) return;
    const { __login, token } = router.query;
    if (__login === "google" && token) {
      localStorage.setItem("token", token);
      toast({
        title: t.login_success,
        description: t.login_google,
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      setAuthDrawerOpen(false);
      setCurrentUserId(getUserIdFromToken());
      fetchAll();
      const cleanQuery = { ...router.query };
      delete cleanQuery.__login;
      delete cleanQuery.token;
      router.replace(
        { pathname: router.pathname, query: cleanQuery },
        undefined,
        { shallow: true }
      );
    }
  }, [router.isReady, router.query]);

  // 🔹 Auto open drawer kalau ada query threadId
useEffect(() => {
  if (!router.isReady) return;
  const { threadId } = router.query;
  if (threadId) {
    (async () => {
      try {
        const res = await fetch(`${backendUrl}/api/forum/threads/${threadId}`, {
          headers: getAuthToken()
            ? { Authorization: `Bearer ${getAuthToken()}` }
            : {},
        });
        if (!res.ok) throw new Error("Gagal load thread");
        const data = await res.json();
        setSelectedThread(data);
        setDrawerOpen(true);
      } catch (e) {
        toast({
          title: "Error",
          description: e.message || t.error_load_thread,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    })();
  }
}, [router.isReady, router.query.threadId, backendUrl]);

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

  const handleSubmitThread = async () => {
    const token = getAuthToken();
    if (!token) return setAuthDrawerOpen(true);
    if (!title.trim() || !content.trim())
      return toast({
        title: "Error",
        description: t.validation_required,
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    try {
      setCreating(true);
      const url = editingThreadId
        ? `${backendUrl}/api/forum/threads/${editingThreadId}`
        : `${backendUrl}/api/forum/threads`;
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
          categoryId: categoryId || null,
          tagIds,
        }),
      });

      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).message ||
            t.error_submit_thread
        );

      toast({
        title: t.success,
        description: editingThreadId
          ? t.success_update_thread
          : t.success_create_thread,
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
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteThread = async (threadId) => {
    const token = getAuthToken();
    if (!token) return setAuthDrawerOpen(true);
    if (!confirm(t.confirm_delete)) return;

    try {
      const res = await fetch(
        `${backendUrl}/api/forum/threads/${threadId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).message ||
            t.error_delete_thread
        );

      toast({ title: t.success_delete_thread, status: "success", duration: 2000 });
      fetchAll();
    } catch (e) {
      toast({ title: "Error", description: e.message, status: "error" });
    }
  };

  // ================= HANDLE LIKE UPDATE DARI DRAWER =================
const handleThreadLikeUpdate = (updatedThread) => {
  // update threads list
  setThreads(prev =>
    prev.map(t =>
      t.id === updatedThread.id
        ? { ...t, isLiked: updatedThread.isLiked, likesCount: updatedThread.likesCount }
        : t
    )
  );

  // update selectedThread kalau drawer lagi buka thread yang sama
  if (selectedThread?.id === updatedThread.id) {
    setSelectedThread(prev => ({
      ...prev,
      isLiked: updatedThread.isLiked,
      likesCount: updatedThread.likesCount,
    }));
  }
};

  const handleLikeClick = async (thread) => {
    const token = getAuthToken();
    if (!token) {
      setAuthDrawerOpen(true);
      return;
    }

    const alreadyLiked = !!thread.isLiked;

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== thread.id) return t;

        return {
          ...t,
          isLiked: !alreadyLiked,
          likesCount: Math.max(
            0,
            (t.likesCount || 0) + (alreadyLiked ? -1 : 1)
          ),
        };
      })
    );

    try {
      const res = await fetch(
        `${backendUrl}/api/forum/threads/${thread.id}/like`,
        {
          method: alreadyLiked ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Gagal update like");
      }
    } catch (e) {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== thread.id) return t;

          return {
            ...t,
            isLiked: alreadyLiked,
            likesCount: Math.max(
              0,
              (t.likesCount || 0) + (alreadyLiked ? 1 : -1)
            ),
          };
        })
      );

      toast({ title: "Error", description: e.message, status: "error" });
    }
  };

  const cardBg = colorMode === "light" ? "white" : "gray.900";
  const borderColor =
    colorMode === "light" ? "gray.200" : "whiteAlpha.400";
  const muted = colorMode === "light" ? "gray.500" : "gray.400";
  const forumLogo =
    colorMode === "light"
      ? "/mogehubmasterlight.png"
      : "/mogehubmasterdark.png";

  return (
    <>
      <Head>
        <title>Forum Komunitas Moge – Mogehub</title>
        <meta name="description" content="Forum komunitas moge Indonesia." />
      </Head>

      <Box ref={topRef} />
      <Box px={mobileAndTabletPadding} py={mobileAndTabletPadding} maxW="1400px" mx="auto">
        {/* Header */}
        <Flex
          mb={4}
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align={{ lg: "center" }}
          gap={4}
        >
          <Box>
            <Link href="/" passHref>
            <Box cursor="pointer" display="inline-block">
              <Box
                position="relative"
                h="46px"
                w={{ base: "190px", md: "250px" }}
                mb={1}
              >
                <NextImage
                  src={forumLogo}
                  alt="Forum Mogehub"
                  fill
                  priority
                  unoptimized
                  style={{
                    objectFit: "contain",
                  }}
                />
              </Box>
            </Box>
          </Link>
            <Text fontSize={mobileAndTabletFont} color={muted}>
              {t.forum_subtitle}
            </Text>
          </Box>
          <Button
            bg="brand.500"
            color="black"
            _hover={{ bg: "brand.600" }}
            onClick={() => {
              const token = getAuthToken();
              if (!token) return setAuthDrawerOpen(true); // wajib munculin drawer login
              setEditingThreadId(null);
              setShowCreate((s) => !s);
            }}
          >
            {t.create_thread}
          </Button>
        </Flex>

        {/* Dropdown filter */}
        <Flex mb={8} gap={2} wrap="wrap">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            flex="1"
          >
            <option value="">{t.all_categories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            flex="1"
          >
            <option value="">{t.all_tags}</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </Flex>

        {/* Create thread box */}
        {showCreate && (
          <Box
            mb={10}
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            rounded="2xl"
            p={mobileAndTabletPadding}
            boxShadow="sm"
          >
            <Stack spacing={6}>
              <Heading size="sm">
                {editingThreadId ? t.edit_thread : t.new_thread}
              </Heading>
              <Divider />
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Box>
                  <Text fontSize={mobileAndTabletFont} mb={1} color={muted}>
                    {t.Forumtitle}
                  </Text>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Box>
                <Box>
                  <Text fontSize={mobileAndTabletFont} mb={1} color={muted}>
                    {t.category}
                  </Text>
                  <Select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">{t.placeholder_category}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box gridColumn={{ lg: "1 / -1" }}>
                  <Text fontSize={mobileAndTabletFont} mb={1} color={muted}>
                    {t.content}
                  </Text>
                  <TipTapEditor content={content} onUpdate={setContent} />
                </Box>
                <Box>
                  <Text fontSize={mobileAndTabletFont} mb={1} color={muted}>
                    {t.tag}
                  </Text>
                  <Select
                    value=""
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!val || tagIds.includes(val)) return;
                      setTagIds((p) => [...p, val]);
                    }}
                  >
                    <option value="">{t.placeholder_tag}</option>
                    {tags.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box>
                  <Text fontSize={mobileAndTabletFont} mb={1} color={muted}>
                    {t.selected_tag}
                  </Text>
                  <HStack wrap="wrap">
                    {tagIds.map((id) => {
                      const tg = tags.find((x) => x.id === id);
                      return (
                        <Tag
                          key={id}
                          cursor="pointer"
                          onClick={() =>
                            setTagIds((p) => p.filter((x) => x !== id))
                          }
                        >
                          {tg?.name} ✕
                        </Tag>
                      );
                    })}
                  </HStack>
                </Box>
              </SimpleGrid>
              <Flex justify="flex-end" gap={3}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCreate(false);
                    setEditingThreadId(null);
                  }}
                >
                  {t.cancel}
                </Button>
                <Button
                  bg="brand.500"
                  color="black"
                  isLoading={creating}
                  onClick={handleSubmitThread}
                >
                  {editingThreadId ? t.update_thread : t.publish}

                </Button>
              </Flex>
            </Stack>
          </Box>
        )}

        {/* Threads */}
        {loading ? (
          <Flex minH="220px" align="center" justify="center">
            <Spinner size="xl" />
          </Flex>
        ) : filteredThreads.length === 0 ? (
          <Box textAlign="center" py={16}>
            <Text fontSize="2xl" fontWeight="bold" mb={2}>
              {t.no_threads}
            </Text>
            <Text mb={4} color={muted}>
              {t.no_threads_desc}
            </Text>
            <Button
              bg="brand.500"
              color="black"
              _hover={{ bg: "brand.600" }}
              onClick={() => setShowCreate(true)}
            >
             {t.create_thread_now}
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {filteredThreads.map((thread) => {
              const youtubeEmbed = getYoutubeEmbedFromHtml(thread.content);
              const threadContentWithoutYoutube = removeYoutubeIframe(
                thread.content
              );
              const isOwner =
                currentUserId &&
                String(thread.author?.id) === String(currentUserId);

              const liked = !!thread.isLiked;
              const likesCount =
                typeof thread.likesCount === "number"
                  ? thread.likesCount
                  : 0;

              return (
                <Box
                  key={thread.id}
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                  rounded="2xl"
                  p={mobileAndTabletPadding}
                >
                  <Stack spacing={3}>
                    <Flex justify="space-between" align="start">
                      <Text
                        fontWeight="bold"
                        cursor="pointer"
                        color="blue.500"
                        onClick={async () => {
                          try {
                            const res = await fetch(
                              `${backendUrl}/api/forum/threads/${thread.id}`,
                              {
                                headers: getAuthToken()
                                  ? {
                                      Authorization: `Bearer ${getAuthToken()}`,
                                    }
                                  : {},
                              }
                            );
                            const data = await res.json();
                            setSelectedThread(data);
                            setDrawerOpen(true);
                          } catch (e) {
                            toast({
                              title: "Error",
                              description: "Gagal load thread",
                              status: "error",
                              duration: 3000,
                              isClosable: true,
                            });
                          }
                        }}
                      >
                        {thread.title}
                      </Text>
                      {isOwner && (
                        <HStack>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingThreadId(thread.id);
                              setTitle(thread.title || "");
                              setContent(thread.content || "");
                              setCategoryId(
                                thread.categoryId
                                  ? String(thread.categoryId)
                                  : ""
                              );
                              setTagIds(
                                thread.tags?.map((x) => x.tagId) || []
                              );
                              setShowCreate(true);
                              window.scrollTo({
                                top: 0,
                                behavior: "smooth",
                              });
                            }}
                            leftIcon={<FiEdit2 />}
                          >
                            {t.edit}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteThread(thread.id)
                            }
                            leftIcon={<FiTrash2 />}
                          >
                            {t.delete}
                          </Button>
                        </HStack>
                      )}
                    </Flex>

                    <HStack spacing={2} align="center" fontSize={mobileAndTabletFont} color={muted}>
                    <Avatar
                      size="sm"
                      src={thread.author?.profilePhoto || "/placeholder.png"}
                      name={thread.author?.username}
                    />
                    <Text fontWeight="medium">{thread.author?.displayName || thread.author?.username || "Unknown"}</Text>
                    <VerifiedBadge show={thread.author?.verification?.status === "approved"} size={14} />
                  </HStack>

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
                      dangerouslySetInnerHTML={{
                        __html: threadContentWithoutYoutube,
                      }}
                    />

                    <HStack spacing={2} wrap="wrap">
                      {thread.tags?.map((t) => (
                        <Tag key={t.tagId}>
                          {tags.find((x) => x.id === t.tagId)?.name ||
                            "Tag"}
                        </Tag>
                      ))}
                    </HStack>

                    <Flex
                      justify="space-between"
                      fontSize="sm"
                      color={muted}
                      align="center"
                    >
                      <HStack
                      spacing={1}
                      cursor="pointer"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const res = await fetch(`${backendUrl}/api/forum/threads/${thread.id}`, {
                            headers: getAuthToken()
                              ? { Authorization: `Bearer ${getAuthToken()}` }
                              : {},
                          });
                          const data = await res.json();
                          setSelectedThread(data);
                          setDrawerOpen(true);
                        } catch (e) {
                          toast({
                            title: "Error",
                            description: "Gagal load thread",
                            status: "error",
                            duration: 3000,
                            isClosable: true,
                          });
                        }
                      }}
                    >
                      <IconBrandHipchat size={16} />
                      <Text>{thread.comments?.length || 0}</Text>
                    </HStack>

                      <HStack
                        spacing={1}
                        cursor="pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLikeClick(thread);
                        }}
                      >
                        <IconHeart
                          size={18}
                          stroke={liked ? "#E53E3E" : muted}
                          fill={liked ? "#E53E3E" : "none"}
                        />
                        <Text>{likesCount}</Text>
                      </HStack>
                    </Flex>
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
        onLikeUpdate={handleThreadLikeUpdate}
      />

      <AuthDrawer
        isOpen={authDrawerOpen}
        onClose={() => setAuthDrawerOpen(false)}
        onSuccessLogin={(provider) => {
          toast({
            title:
              provider === "google"
                ? t.login_google
                : t.login_success,
            status: "success",
            duration: 2500,
            isClosable: true,
          });
          setAuthDrawerOpen(false);
          setCurrentUserId(getUserIdFromToken());
          fetchAll();
        }}
      />
    </>
  );
}
