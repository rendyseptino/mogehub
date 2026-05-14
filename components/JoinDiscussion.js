"use client";

import { useEffect, useState, useRef } from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Box,
  Flex,
  Text,
  Image,
  Input,
  Avatar,
  VStack,
  HStack,
  Spinner,
  useToast,
  IconButton,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";

import { io } from "socket.io-client";
import { CloseIcon } from "@chakra-ui/icons";
import VerifiedBadge from "@/components/VerifiedBadge";
import { FaArrowUp } from "react-icons/fa";

export default function JoinDiscussion({
  isOpen,
  onClose,
  adId,
  adTitle,
  media,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [openReplies, setOpenReplies] = useState({});

  const socketRef = useRef(null);
  const loadedRef = useRef(false);

  const toast = useToast();
  const API = "https://api.mogehub.com";

  const myUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;

  const brandBg = useColorModeValue("brand.500", "brand.500");
  const inputBg = useColorModeValue("white", "gray.800");

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const handleSessionExpired = () => {
    localStorage.removeItem("token");
    onClose?.();

    toast({
      title: "Session expired",
      description: "Silakan login ulang",
      status: "error",
      duration: 3000,
    });

    window.location.href = "/login";
  };

  // ================= FETCH =================
  const fetchDiscussion = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/ad/${adId}/discussion`);
      if (res.status === 401) return handleSessionExpired();

      const data = await res.json();
      setComments(data?.discussion?.comments || []);
      loadedRef.current = true;
    } finally {
      setLoading(false);
    }
  };

  // ================= RECURSIVE INSERT =================
  const insertNested = (list, newComment) => {
    return list.map((c) => {
      if (c.id === newComment.parentId) {
        const exists = (c.replies || []).some((r) => r.id === newComment.id);
        if (!exists) {
          return {
            ...c,
            replies: [...(c.replies || []), newComment],
          };
        }
      }

      if (c.replies?.length) {
        return {
          ...c,
          replies: insertNested(c.replies, newComment),
        };
      }

      return c;
    });
  };

  // ================= SOCKET =================
  useEffect(() => {
    if (!isOpen || !adId) return;

    const socket = io(API, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("joinAdDiscussion", adId);

    socket.on("newAdComment", (data) => {
      if (parseInt(data.adId) !== parseInt(adId)) return;

      const newComment = data.comment;

      setComments((prev) => {
        const exists = prev.some((c) => c.id === newComment.id);
        if (exists) return prev;

        if (newComment.parentId) {
          return insertNested(prev, newComment);
        }

        return [...prev, newComment];
      });
    });

    return () => {
      socket.emit("leaveAdDiscussion", adId);
      socket.disconnect();
    };
  }, [isOpen, adId]);

  useEffect(() => {
    if (isOpen && adId && !loadedRef.current) {
      fetchDiscussion();
    }
  }, [isOpen, adId]);

  // ================= SEND =================
  const handleSend = async () => {
    const token = getToken();
    if (!token) return handleSessionExpired();
    if (!message.trim()) return;

    try {
      setSending(true);

      const res = await fetch(`${API}/api/ad/${adId}/discussion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: message,
          parentId: replyTo?.id || null,
        }),
      });

      if (res.status === 401) return handleSessionExpired();

      const data = await res.json();
      const newComment = data?.comment;

      if (newComment) {
        setComments((prev) => {
          const exists = prev.some((c) => c.id === newComment.id);
          if (exists) return prev;

          if (newComment.parentId) {
            return insertNested(prev, newComment);
          }

          return [...prev, newComment];
        });

        setMessage("");
        setReplyTo(null);
      }
    } finally {
      setSending(false);
    }
  };

  // ================= REPLY =================
  const startReply = (comment) => {
    if (comment.user?.username === myUser?.username) {
      toast({
        title: "Tidak bisa reply diri sendiri",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    setReplyTo(comment);
    setMessage(`@${comment.user.username} `);
  };

  const toggleReplies = (id) => {
  setOpenReplies((prev) => ({
    ...prev,
    [id]: !prev[id],
  }));
};

  const thumbnail = media?.[0]?.url;

  // ================= REPLY RENDER =================
  const renderReplies = (replies = []) =>
    replies.map((r) => (
      <Box key={r.id} ml={10} mt={2}>
        <HStack align="start" spacing={2}>
          <Avatar size="xs" src={r.user?.profilePhoto} />

          <Box>
            <HStack spacing={1}>
              <Text fontSize="xs" fontWeight="bold">
                {r.user?.username}
              </Text>

              {/* ✅ VERIFIED BADGE BALIK */}
              <VerifiedBadge
                show={r.user?.verification?.status === "approved"}
                size={12}
              />
            </HStack>

            <Text fontSize="xs">{r.content}</Text>

          </Box>
        </HStack>
      </Box>
    ));

  // ================= COMMENT =================
  const renderComment = (c) => (
    <Box key={c.id} py={3}>
      <HStack align="start" spacing={3}>
        <Avatar size="sm" src={c.user?.profilePhoto} />

        <Box flex={1}>
          <HStack spacing={1}>
            <Text fontWeight="bold" fontSize="sm">
              {c.user?.username}
            </Text>

            {/* ✅ VERIFIED BADGE BALIK */}
            <VerifiedBadge
              show={c.user?.verification?.status === "approved"}
              size={12}
            />
          </HStack>

          <Text fontSize="sm">{c.content}</Text>

          {c.user?.username !== myUser?.username && (
            <Button size="xs" variant="ghost" onClick={() => startReply(c)}>
              Reply
            </Button>
          )}

          {c.replies?.length > 0 && (
          <Button
            size="xs"
            variant="ghost"
            onClick={() => toggleReplies(c.id)}
            mt={1}
          >
            {openReplies[c.id]
              ? `Hide Reply`
              : `View Reply (${c.replies.length})`}
          </Button>
        )}

        {openReplies[c.id] && renderReplies(c.replies)}
        </Box>
      </HStack>
    </Box>
  );

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>

        {/* HEADER */}
        <DrawerHeader borderBottomWidth="1px">
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              {thumbnail && (
                <Image
                  src={thumbnail}
                  boxSize="45px"
                  objectFit="cover"
                  borderRadius="md"
                />
              )}
              <Text fontWeight="bold">{adTitle}</Text>
            </HStack>

            <IconButton icon={<CloseIcon />} onClick={onClose} />
          </Flex>
        </DrawerHeader>

        {/* BODY */}
        <DrawerBody>
          {loading ? (
            <Spinner />
          ) : (
            <VStack align="stretch">
              {comments.map(renderComment)}
            </VStack>
          )}
        </DrawerBody>

        {/* FOOTER */}
        <DrawerFooter borderTopWidth="1px">
          <Flex w="100%" gap={2}>
            <Input
              bg={inputBg}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis komentar..."
            />

            {/* ✅ ICON HITAM FIX */}
            <IconButton
              onClick={handleSend}
              isLoading={sending}
              bg={brandBg}
              borderRadius="full"
              aria-label="send"
            >
              <FaArrowUp color="black" />
            </IconButton>
          </Flex>
        </DrawerFooter>

      </DrawerContent>
    </Drawer>
  );
}