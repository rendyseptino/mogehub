"use client";

import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Box,
  Text,
  VStack,
  Spinner,
  Badge,
  IconButton,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaRegBell } from "react-icons/fa";
import { useSocket } from "@/context/SocketContext";
import { useNotification } from "@/context/NotificationContext";
import { playSound } from "@/utils/sound";

export default function AdminActivityDrawer() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalImage, setModalImage] = useState(null);
  const socket = useSocket();
  const { enabled, selectedSound, volume } = useNotification();

  const fetchAdminActivities = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch("https://api.mogehub.com/api/activities/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed fetch admin activities");

      setActivities(data.activities || []);
      const unread = (data.activities || []).filter(a => !a.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("❌ FETCH ADMIN ACTIVITIES ERROR:", err);
      setActivities([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    try {
      const res = await fetch(`https://api.mogehub.com/api/activities/admin/mark-read/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to mark as read");

      setActivities(prev =>
        prev.map(act => (act.id === id ? { ...act, read: true } : act))
      );
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("❌ MARK AS READ ERROR:", err);
    }
  };

  

useEffect(() => {
  fetchAdminActivities();
}, []);

useEffect(() => {
  if (!socket) return;

  const seen = new Set();

  const handler = (newActivity) => {
    console.log("🔥 New activity realtime:", newActivity);

    if (!newActivity?.id) return;

    // 🔥 ANTI DUPLICATE (IMPORTANT)
    if (seen.has(newActivity.id)) return;
    seen.add(newActivity.id);

    // 🔥 UPDATE LIST REALTIME
    setActivities((prev) => {
      const exists = prev.some((a) => a.id === newActivity.id);
      if (exists) return prev;
      return [newActivity, ...prev];
    });

    // 🔥 UNREAD + SOUND HARUS SATU FLOW (SAMA KAYA CHAT LO)
    if (!newActivity.read) {
      setUnreadCount((prev) => prev + 1);

      if (enabled && selectedSound) {
        try {
          playSound(selectedSound, volume);
        } catch (err) {
          console.error("Sound error:", err);
        }
      }
    }
  };

  socket.on("admin:new-activity", handler);

  return () => {
    socket.off("admin:new-activity", handler);
  };
}, [socket, enabled, selectedSound, volume]);


  const toggleDrawer = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) fetchAdminActivities();
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    const options = {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return new Date(dateStr).toLocaleString("id-ID", options);
  };

  const textColor = useColorModeValue("gray.800", "gray.200");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const unreadBg = useColorModeValue("gray.100", "gray.700");
  const markReadColor = useColorModeValue("blue.500", "brand.500");

  return (
    <>
      <Box position="relative">
        <IconButton
          aria-label="Admin activities"
          icon={<FaRegBell size={24} />}
          onClick={toggleDrawer}
          variant="ghost"
          _hover={{ bg: "transparent" }}
        />
        {unreadCount > 0 && (
          <Badge
            position="absolute"
            top="-1"
            right="-1"
            colorScheme="red"
            borderRadius="full"
          >
            {unreadCount}
          </Badge>
        )}
      </Box>

      <Drawer isOpen={isOpen} placement="right" onClose={() => setIsOpen(false)} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton onClick={() => setIsOpen(false)} />
          <DrawerHeader>Admin Activities</DrawerHeader>
          <DrawerBody>
            <VStack spacing={3} align="stretch">
              {loading && <Spinner />}
              {!loading && activities.length === 0 && <Text>Belum ada aktivitas</Text>}

              {!loading &&
                activities.map((act) => (
                  <Box
                    key={act.id}
                    py={2}
                    px={2}
                    borderRadius="md"
                    bg={act.read ? "transparent" : unreadBg}
                  >
                    <Box>
                      {/* 🔥 THUMBNAIL REJECTED MEDIA */}
                      {act.rejectedMedia && act.rejectedMedia.length > 0 && (
                        <>
                          <Text fontSize="xs" color={subTextColor} mb={1}>
                            Media Penolakan:
                          </Text>
                          <HStack mb={2} spacing={2}>
                            {act.rejectedMedia.map((m, idx) => (
                              <Box
                                key={idx}
                                boxSize="50px"
                                flexShrink={0}
                                cursor="pointer"
                                onClick={() => setModalImage(m.resolvedUrl || m.url)}
                              >
                                <img
                                  src={m.resolvedUrl || m.url}
                                  alt={`Rejected media ${idx + 1}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: 4,
                                  }}
                                />
                              </Box>
                            ))}
                          </HStack>
                        </>
                      )}

                      {/* 🔥 THUMBNAIL MEDIA NORMAL */}
                      {act.media && act.media.length > 0 && (
                        <HStack mb={2} spacing={2}>
                          {act.media.map((m, idx) => (
                            <Box
                              key={idx}
                              boxSize="50px"
                              flexShrink={0}
                              cursor="pointer"
                              onClick={() => setModalImage(m.resolvedUrl || m.url)}
                            >
                              <img
                                src={m.resolvedUrl || m.url}
                                alt={`Media ${idx + 1}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: 4,
                                }}
                              />
                            </Box>
                          ))}
                        </HStack>
                      )}

                      {/* 🔥 DISPLAY & CREATED AT */}
                      <Text
                        fontWeight={act.read ? "normal" : "bold"}
                        color={textColor}
                        whiteSpace="pre-line"
                      >
                        {act.display || "Aktivitas baru"}
                      </Text>
                      <Text fontSize="xs" color={subTextColor}>
                        {formatDateTime(act.createdAt)}
                      </Text>

                      {/* 🔥 MARK AS READ CLICKABLE */}
                      {!act.read && (
                        <Text
                          fontSize="sm"
                          mt={1}
                          color={markReadColor}
                          cursor="pointer"
                          onClick={() => markAsRead(act.id)}
                        >
                          Mark as Read
                        </Text>
                      )}
                    </Box>
                  </Box>
                ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* 🔥 MODAL LIGHTBOX */}
      <Modal isOpen={!!modalImage} onClose={() => setModalImage(null)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={4}>
            {modalImage && (
              <img
                src={modalImage}
                alt="Preview"
                style={{ width: "100%", borderRadius: 8 }}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}