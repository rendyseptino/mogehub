import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Box,
  Text,
  Stack,
  Flex,
  Heading,
  HStack,
  Tag,
  useColorMode,
  AspectRatio,
  Textarea,
  Divider,
  IconButton,
  Button,
} from "@chakra-ui/react";
import { FiSend, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";

// ====== IMPORT AUTH DRAWER ======
import AuthDrawer from "./AuthDrawer";
import { Avatar } from "@chakra-ui/react";
import VerifiedBadge from "./VerifiedBadge";
import { Icon } from "@chakra-ui/react";
import { FiHeart } from "react-icons/fi"; // icon empty heart
import { FaHeart } from "react-icons/fa"; // icon filled heart

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

// ================= GET CURRENT USER ID =================
const getCurrentUserId = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id || payload?.userId || null;
  } catch {
    return null;
  }
};


// ================== COMMENT ITEM RECURSIVE ==================
const CommentItem = ({ comment, currentUserId, handleReply }) => {
  const [showReplies, setShowReplies] = useState(false);
  const isOwnComment = comment.author?.id === currentUserId;
   const { colorMode } = useColorMode();

  return (
    <Box>
      <Box borderRadius="md" p={3}>
        <Flex justify="space-between" align="center" mb={1}>
          <HStack spacing={2} align="center">
            <Avatar
              size="xs"
              src={comment.author?.profilePhoto || "/placeholder.png"}
              name={comment.author?.username}
            />
            <Text
                fontWeight="medium"
                color={colorMode === "light" ? "gray.900" : "white"}
              >
              {comment.author?.displayName}
            </Text>
            <VerifiedBadge show={comment.author?.verification?.status === "approved"} size={12} />
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {new Date(comment.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </Flex>
        <Text mb={2}>{comment.content}</Text>
        <Flex gap={2}>
          {!isOwnComment && (
            <Button
              size="xs"
              variant="link"
              onClick={() => handleReply(comment.id, comment.author?.displayName)}
            >
              Reply
            </Button>
          )}
          {comment.replies?.length > 0 && (
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setShowReplies(!showReplies)}
              leftIcon={showReplies ? <FiChevronUp /> : <FiChevronDown />}
            >
              {showReplies
                ? "Hide replies"
                : `View ${comment.replies.length} repl${
                    comment.replies.length > 1 ? "ies" : "y"
                  }`}
            </Button>
          )}
        </Flex>
      </Box>

      {/* NESTED REPLIES */}
      {showReplies &&
        comment.replies?.map((reply) => (
          <Box key={reply.id} pl={6} mt={2}>
            <CommentItem
              comment={reply}
              currentUserId={currentUserId}
              handleReply={handleReply}
            />
          </Box>
        ))}
    </Box>
  );
};

// ================== CONVERT FLAT COMMENTS TO NESTED ==================
const buildNestedComments = (comments) => {
  const map = {};
  const roots = [];

  // Buat map semua comments dulu
  comments.forEach((c) => {
    map[c.id] = { ...c, replies: [] };
  });

  // Loop lagi, pasang ke parent jika parentId ada
  comments.forEach((c) => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].replies.push(map[c.id]);
    }
  });

  // Root comments cuma yang parentId null
  comments.forEach((c) => {
    if (!c.parentId) {
      roots.push(map[c.id]);
    }
  });

  return roots;
};

// ================= MAIN COMPONENT ==================
export default function ForumThreadDrawer({
  isOpen,
  onClose,
  thread,
  backendUrl,
  toast,
}) {
  const { colorMode } = useColorMode();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState(null);
  const scrollRef = useRef(null);

  // ====== AUTH DRAWER STATE ======
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
const [isLiked, setIsLiked] = useState(thread?.isLiked || false);
  const [likesCount, setLikesCount] = useState(thread?.likesCount || 0);

useEffect(() => {
  if (thread) {
    setLikesCount(thread.likesCount || 0); // pakai likesCount dari backend
  }
}, [thread]);

  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
  }, []);

  useEffect(() => {
    if (thread) setComments(thread.comments || []);
  }, [thread]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [comments, isOpen]);


  const handleLikeClick = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    setIsAuthOpen(true);
    return;
  }

  const alreadyLiked = isLiked;
  setIsLiked(!alreadyLiked);
  setLikesCount((prev) => prev + (alreadyLiked ? -1 : 1));

  try {
    const res = await fetch(`${backendUrl}/api/forum/threads/${thread.id}/like`, {
      method: alreadyLiked ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Gagal update like");

    // optional: refresh dari backend biar sinkron
    const updatedThread = await res.json();
    setLikesCount(updatedThread.likesCount || 0);
    setIsLiked(updatedThread.isLiked);
  } catch (e) {
    setIsLiked(alreadyLiked);
    setLikesCount((prev) => prev + (alreadyLiked ? 1 : -1));
    toast({
      title: "Error",
      description: e.message,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};

  // ================= HANDLE SEND =================
  const handleSendMessage = async () => {
    if (!newComment.trim()) return;
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      if (typeof onClose === "function") onClose();
      setTimeout(() => setIsAuthOpen(true), 150);
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/forum/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          threadId: thread.id,
          content: newComment.trim(),
          parentId: replyToId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menambahkan komentar");
      }

      const updatedThread = await fetch(
        `${backendUrl}/api/forum/threads/${thread.id}`
      ).then((r) => r.json());

      setComments(updatedThread.comments || []);
      setNewComment("");
      setReplyToId(null);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Gagal menambahkan komentar",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // ================= HANDLE REPLY =================
  const handleReply = (id, username) => {
    setReplyToId(id);
    setNewComment(`@${username} `);
  };

  if (!thread) return null;

  const cardBg = colorMode === "light" ? "white" : "gray.900";
  const borderColor = colorMode === "light" ? "gray.200" : "whiteAlpha.200";
  const muted = colorMode === "light" ? "gray.500" : "gray.400";

  const youtubeEmbed = getYoutubeEmbedFromHtml(thread.content);
  const threadContentWithoutYoutube = removeYoutubeIframe(thread.content);

  const nestedComments = buildNestedComments(comments);

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="lg"
        trapFocus={false}
        returnFocusOnClose={false}
      >
        <DrawerOverlay />
        <DrawerContent bg={cardBg}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Heading size="md">{thread.title}</Heading>
            <HStack spacing={2} align="center" fontSize="sm" color={muted}>
              <Avatar
                size="sm"
                src={thread.author?.profilePhoto || "/placeholder.png"}
                name={thread.author?.username}
              />
              <Text
                fontWeight="medium"
                color={colorMode === "light" ? "gray.900" : "white"}
                _hover={{ opacity: 0.8 }}
              >
              {thread.author?.displayName}
            </Text>
              <VerifiedBadge show={thread.author?.verification?.status === "approved"} size={14} />
              <Text>
                • {new Date(thread.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })}
              </Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody display="flex" flexDirection="column" p={4}>
            {/* THREAD CONTENT */}
            <Box flex="0 0 auto" mb={4}>
              {youtubeEmbed && (
                <AspectRatio
                  ratio={16 / 9}
                  borderRadius="md"
                  overflow="hidden"
                  mb={3}
                >
                  <iframe
                    src={youtubeEmbed}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </AspectRatio>
              )}
              <Box
                className="ProseMirror"
                dangerouslySetInnerHTML={{
                  __html: threadContentWithoutYoutube,
                }}
                mb={3}
              />
              <HStack spacing={2} wrap="wrap" mb={3}>
                {thread.category && (
                  <Tag size="sm" variant="subtle">
                    {thread.category.name}
                  </Tag>
                )}
                {thread.tags?.map((t) => (
                  <Tag key={t.id} size="sm" variant="outline">
                    {t.tag?.name}
                  </Tag>
                ))}
              </HStack>
              <Flex pt={1} justify="space-between" fontSize="sm" color={muted} align="center">
              {/* Jumlah komentar tetap */}
              <Text>{comments.length} komentar</Text>

              
              {/* Likes count sebagai text, tetap sinkron backend */}
              <Flex align="center" gap={1}>
                <Text>{likesCount} likes</Text>
              </Flex>
            </Flex>
            </Box>

            {/* COMMENTS LIST */}
            <Box
              flex="1 1 auto"
              overflowY="auto"
              mb={3}
              ref={scrollRef}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              p={3}
            >
              {nestedComments.length === 0 ? (
                <Text fontSize="sm" color={muted} textAlign="center">
                  Belum ada komentar
                </Text>
              ) : (
                <Stack spacing={3}>
                  {nestedComments.map((c) => (
                    <CommentItem
                      key={c.id}
                      comment={c}
                      currentUserId={currentUserId}
                      handleReply={handleReply}
                    />
                  ))}
                </Stack>
              )}
            </Box>

            {/* INPUT KOMENTAR */}
            <Box mt="auto">
              <Divider mb={3} />
              <Flex gap={2}>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tulis komentar..."
                  resize="none"
                  rows={1}
                  _focus={{
                    borderColor: "brand.500",
                    boxShadow: "0 0 0 1px #D69E2E",
                  }}
                />
                <IconButton
                  icon={<FiSend />}
                  colorScheme="brand"
                  aria-label="Kirim komentar"
                  onClick={handleSendMessage}
                  isDisabled={!newComment.trim()}
                />
              </Flex>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* ================= AUTH DRAWER ================= */}
      <AuthDrawer
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccessLogin={(type) => {
          setIsAuthOpen(false);
          onClose(); // nutup drawer thread

          toast({
            title:
              type === "google"
                ? "Successfully login with Google"
                : "Successfully login with email",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });

          // update currentUserId biar Reply & highlight jalan
          setCurrentUserId(getCurrentUserId());
        }}
        defaultTab="login"
      />
    </>
  );
}
