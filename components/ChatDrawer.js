"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useSocket } from "@/context/SocketContext";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup, 
  InputLeftElement,
  Avatar,
  useColorModeValue,
  Divider,
  Badge,
  Checkbox,
  IconButton,
  Flex,
  useToast,
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { LuSearch } from "react-icons/lu";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { IoCameraOutline } from "react-icons/io5";
import { useNotification } from "@/context/NotificationContext";
import DotLoader from "@/components/DotLoader";

export default function ChatDrawer({ isOpen, onClose, userId, token, onOpenRoom }) {
  const socket = useSocket();
  const { enabled, selectedSound, volume } = useNotification();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const fileInputRef = useRef(null);
  

  const [admins, setAdmins] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem("chat-unread");
    return saved ? JSON.parse(saved) : {};
  });
  const [frequentPrivate, setFrequentPrivate] = useState(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("frequent-private");
    return saved ? JSON.parse(saved) : [];
  });

  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [creating, setCreating] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, roomId: null });
  const [memberSearch, setMemberSearch] = useState("");
  // ===== BROADCAST STATE =====
  const [broadcasts, setBroadcasts] = useState([]);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [broadcastMembers, setBroadcastMembers] = useState([]);
  const [isEditBroadcast, setIsEditBroadcast] = useState(false);
  const [currentBroadcastId, setCurrentBroadcastId] = useState(null);
  const [deleteBroadcastModal, setDeleteBroadcastModal] = useState({ isOpen: false, broadcastId: null });
  const [loading, setLoading] = useState(false);
 


  const fetchWithAuth = async (url, options = {}) => {
    if (!token) return null;
    const headers = { Authorization: `Bearer ${token}`, ...(options.headers || {}) };
    try {
      const res = await fetch(url, { ...options, headers });
      const text = await res.text();
      try { return JSON.parse(text); } catch { return text; }
    } catch (err) { console.error("Fetch error:", err); return null; }
  };


  
  useEffect(() => {
  if (!isOpen || !token) return;

  const init = async () => {
    try {
      setLoading(true); // 🔥 MULAI LOADING

      const adminsData = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admins`);
      const roomsData = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms`);
      const unreadData = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/unread`);
      const broadcastData = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/broadcast`);

      // admins
      if (adminsData) setAdmins(adminsData.filter((a) => a.id !== userId));

      // rooms
      setRooms(
        roomsData.filter(
          (r) =>
            r.type === "group" ||
            r.type === "private" ||
            r.type === "broadcast" // 🔥 pastikan broadcast ikut
        )
      );

      // broadcasts
      if (Array.isArray(broadcastData)) {
        setBroadcasts(broadcastData);
      } else if (broadcastData?.data) {
        setBroadcasts(broadcastData.data);
      } else {
        setBroadcasts([]);
      }

      // unread
      if (unreadData) {
        setUnread(unreadData);
        localStorage.setItem("chat-unread", JSON.stringify(unreadData));
      }
    } catch (err) {
      console.error("Error fetching chat drawer data:", err);
    } finally {
      setLoading(false); // 🔥 SELESAI LOADING
    }
  };

  init();
}, [isOpen, token]);


  useEffect(() => {
  if (!socket || !userId) return;

  const seenMessages = new Set();

  const handler = (data) => {
    const senderId = String(
      data?.message?.senderId ||
      data?.senderId ||
      data?.message?.sender?.id ||
      ""
    );

    const roomId = String(
      data?.roomId ||
      data?.message?.roomId ||
      ""
    );

    if (!data?.isNotif || !senderId || senderId === String(userId) || !roomId) return;

    const messageId =
      data?.message?.id ||
      `${roomId}-${senderId}-${data?.message?.createdAt || Date.now()}`;

    if (seenMessages.has(messageId)) return;
    seenMessages.add(messageId);

    // 🔥 FIX REALTIME + SOUND SEKALIGUS
    setUnread((prev) => {
      const updated = {
        ...prev,
        [roomId]: (prev[roomId] || 0) + 1,
      };

      localStorage.setItem("chat-unread", JSON.stringify(updated));

      // 🔊 SOUND LANGSUNG
      if (enabled && selectedSound) {
        try {
          playSound(selectedSound, volume);
        } catch (err) {
          console.error("Sound error:", err);
        }
      }

      return updated;
    });
  };

  socket.on("receiveMessage", handler);

  return () => {
    socket.off("receiveMessage", handler);
  };
}, [socket, userId, enabled, selectedSound, volume]);


  const filteredAdmins = admins.filter((a) => a.username.toLowerCase().includes(search.toLowerCase()));
  const filteredMembers = admins.filter((a) => a.username.toLowerCase().includes(memberSearch.toLowerCase()));
  const avatarObjectUrl = useMemo(() => avatarFile ? URL.createObjectURL(avatarFile) : null, [avatarFile]);

  const handleSubmitGroup = async () => {
    if (!groupName || groupMembers.length === 0) return toast({ title: "Name & members required!", status: "error" });
    setCreating(true);
    try {
      let avatarUrl = avatarPreview || null;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        const uploadRes = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/upload-avatar`, { method: "POST", body: formData });
        avatarUrl = uploadRes?.url || avatarUrl;
      }

      if (isEdit && currentRoomId) {
        try {
          // 🔥 PUT request untuk update group
          const updated = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms/${currentRoomId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: groupName,
                participants: groupMembers, // participant yang dipilih
                avatar: avatarUrl,
              }),
            }
          );

          if (updated?.id) {
            // update state rooms lokal
            setRooms((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r))
            );
            toast({ title: "Group updated!", status: "success" });
          } else {
            toast({ title: "Failed to update group", status: "error" });
          }
        } catch (err) {
          console.error("Failed to update group:", err);
          toast({ title: "Failed to update group", status: "error" });
        }
      } else {
        try {
          // 🔥 POST request untuk create group baru
          const room = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: groupName,
                type: "group",
                participants: groupMembers,
                avatar: avatarUrl,
              }),
            }
          );

          if (room?.id) {
            setRooms((prev) => [...prev, room]);
            toast({ title: "Group created!", status: "success" });
          } else {
            toast({ title: "Failed to create group", status: "error" });
          }
        } catch (err) {
          console.error("Failed to create group:", err);
          toast({ title: "Failed to create group", status: "error" });
        }
      }
      setShowCreate(false);
      setGroupName("");
      setGroupMembers([]);
      setAvatarFile(null);
      setAvatarPreview(null);
      setIsEdit(false);
      setCurrentRoomId(null);
      setMemberSearch("");
    } catch (err) {
      console.error("Failed to create/update group:", err);
      toast({ title: "Failed to create/update group", status: "error" });
    } finally { setCreating(false); }
  };

  const handleEditGroup = (room) => {
    setGroupName(room.name);
    setGroupMembers(room.participants.map((p) => p.userId));
    setAvatarPreview(room.avatar || null);
    setAvatarFile(null);
    setIsEdit(true);
    setCurrentRoomId(room.id);
    setShowCreate(true);
    setMemberSearch("");
  };

  const handleDeleteGroup = (roomId) => setDeleteModal({ isOpen: true, roomId });
  const confirmDeleteGroup = async () => {
    const { roomId } = deleteModal;
    const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms/${roomId}`, { method: "DELETE" });
    if (res?.success) setRooms((prev) => prev.filter((r) => r.id !== roomId));
    toast({ title: res?.success ? "Group deleted" : "Failed to delete group", status: res?.success ? "success" : "error" });
    setDeleteModal({ isOpen: false, roomId: null });
  };

  const handleOpenPrivate = async (admin) => {
  const room = rooms.find(
    (r) =>
      r.type === "private" &&
      r.participants.map((p) => p.userId).includes(admin.id) &&
      r.participants.map((p) => p.userId).includes(Number(userId))
  );

  // 🔥 tutup drawer dulu
  onClose();

  // 🔥 buka room di next tick (BIAR SCROLL WORK)
  setTimeout(() => {
    onOpenRoom({ type: "private", targetUser: admin });
  }, 0);

  // 🔥 backend + state tetep jalan normal
  if (room?.id)
    await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms/${room.id}/read`,
      { method: "POST" }
    );

  setUnread((prev) => {
    const updated = { ...prev, [room?.id]: 0 };
    localStorage.setItem("chat-unread", JSON.stringify(updated));
    return updated;
  });

  setFrequentPrivate((prev) => {
    const newList = [admin.id, ...prev.filter((id) => id !== admin.id)];
    localStorage.setItem("frequent-private", JSON.stringify(newList));
    return newList;
  });
};
  const handleOpenGroup = (room) => {
    onOpenRoom({ type: "group", room });
    setUnread((prev) => { const updated = { ...prev, [room.id]: 0 }; localStorage.setItem("chat-unread", JSON.stringify(updated)); return updated; });
  };

  // ===== BROADCAST HANDLER =====
const handleSubmitBroadcast = async () => {
  if (!broadcastTitle || !broadcastContent || broadcastMembers.length === 0) {
    return toast({ title: "All fields required!", status: "error" });
  }

  try {
    if (isEditBroadcast) {
      const updated = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/broadcast/${currentBroadcastId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: broadcastTitle,
            content: broadcastContent,
            participants: broadcastMembers,
          }),
        }
      );

      // ✅ FIX (NORMALIZE)
if (updated?.id) {
  const normalizedRoom = {
    ...updated,
    participants: (updated.participants || []).map((p) => ({
      ...p,
      userId: p.userId ?? p.user?.id,
    })),
  };

  setRooms((prev) =>
    Array.isArray(prev)
      ? prev.map((r) => (r.id === normalizedRoom.id ? normalizedRoom : r))
      : [normalizedRoom]
  );

  setBroadcasts((prev) =>
  Array.isArray(prev)
    ? prev.map((r) => (r.id === normalizedRoom.id ? normalizedRoom : r))
    : [normalizedRoom]
);
}
    } else {
      const created = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/broadcast`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: broadcastTitle,
            content: broadcastContent,
            participants: broadcastMembers,
          }),
        }
      );

      // ✅ FIX (NORMALIZE)
if (created?.id) {
  const normalizedRoom = {
    ...created,
    participants: (created.participants || []).map((p) => ({
      ...p,
      userId: p.userId ?? p.user?.id, // 🔥 FIX
    })),
  };

  setRooms((prev) =>
    Array.isArray(prev) ? [...prev, normalizedRoom] : [normalizedRoom]
  );

  setBroadcasts((prev) =>
  Array.isArray(prev) ? [...prev, normalizedRoom] : [normalizedRoom]
);
}
    }

    // ===== RESET FORM =====
    setBroadcastTitle("");
    setBroadcastContent("");
    setBroadcastMembers([]);
    setIsEditBroadcast(false);
    setCurrentBroadcastId(null);
    setShowBroadcastForm(false);
  } catch (err) {
    console.error("BROADCAST ERROR:", err);
    toast({ title: "Failed to submit broadcast", status: "error" });
  }
};

const handleEditBroadcast = (b) => {
  setBroadcastTitle(b.name);
  setBroadcastContent(b.messages?.[0]?.content || "");
  setBroadcastMembers(b.participants?.map(p => p.userId ?? p.user?.id) || []);
  setIsEditBroadcast(true);
  setCurrentBroadcastId(b.id);
  setShowBroadcastForm(true);
};



// ===== FUNGSIONALITAS =====
const handleDeleteBroadcastClick = (id) => {
  setDeleteBroadcastModal({ isOpen: true, broadcastId: id });
};

const confirmDeleteBroadcast = async () => {
  const { broadcastId } = deleteBroadcastModal;
  if (!broadcastId) return;

  try {
    const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/broadcast/${broadcastId}`, { method: "DELETE" });

    if (res?.success) {
      // 🔥 Hapus broadcast dari state
      setBroadcasts((prev) => prev.filter((b) => b.id !== broadcastId));
      setRooms((prev) => prev.filter((r) => r.id !== broadcastId));
      toast({ title: "Broadcast deleted", status: "success" });
    } else {
      toast({ title: "Failed to delete broadcast", status: "error" });
    }
  } catch (err) {
    console.error("DELETE BROADCAST ERROR:", err);
    toast({ title: "Failed to delete broadcast", status: "error" });
  } finally {
    setDeleteBroadcastModal({ isOpen: false, broadcastId: null });
  }
};

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader fontSize="2xl">Chats</DrawerHeader>
          <DrawerBody p={0}>

            {loading ? (
    <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center">
      <DotLoader size={22} color={colorMode === "light" ? "#90cdf4" : "brand.500"} />
    </Box>
  ) : (
    <>
{/* ===== BROADCAST SECTION ===== */}
<Box p={3}>
  <HStack justify="space-between">
    <Text fontWeight="bold">Broadcast Message</Text>
    <Button
      size="xs"
      onClick={() => {
        setShowBroadcastForm(!showBroadcastForm);
        if (!showBroadcastForm) {
          setBroadcastTitle("");
          setBroadcastContent("");
          setBroadcastMembers([]);
          setIsEditBroadcast(false);
        }
      }}
    >
      {showBroadcastForm ? "Close" : "Create"}
    </Button>
  </HStack>

  {showBroadcastForm && (
    <VStack mt={3} spacing={3} align="stretch">
      <Input
        placeholder="Title"
        value={broadcastTitle}
        onChange={(e) => setBroadcastTitle(e.target.value)}
      />
      <Input
        placeholder="Message"
        value={broadcastContent}
        onChange={(e) => setBroadcastContent(e.target.value)}
      />

      {/* ===== SELECT ALL CHECKBOX ===== */}
      <Checkbox
        isChecked={broadcastMembers.length === admins.length && admins.length > 0}
        onChange={(e) => {
          if (e.target.checked) {
            setBroadcastMembers(admins.map((a) => a.id)); // Centang semua
          } else {
            setBroadcastMembers([]); // Hapus semua
          }
        }}
      >
        Select All
      </Checkbox>

      <VStack align="start" maxH="150px" overflowY="auto">
        {admins.map((a) => (
          <Checkbox
            key={a.id}
            isChecked={broadcastMembers.includes(a.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setBroadcastMembers((prev) => {
                  if (!prev.includes(a.id)) return [...prev, a.id];
                  return prev;
                });
              } else {
                setBroadcastMembers((prev) =>
                  prev.filter((id) => id !== a.id)
                );
              }
            }}
          >
            {a.username}
          </Checkbox>
        ))}
      </VStack>



      <Button onClick={handleSubmitBroadcast}>
        {isEditBroadcast ? "Update Broadcast" : "Create Broadcast"}
      </Button>
    </VStack>
  )}
</Box>
  
{/* ===== LIST BROADCAST ===== */}
<VStack mt={3} align="stretch">
  {rooms
    .filter((r) => {
      if (r.type !== "broadcast") return false;
      if (!Array.isArray(r.participants)) return false;

      // 🔥 Hanya tampilkan jika userId termasuk peserta atau creator
      const participantIds = r.participants.map((p) => p.userId ?? p.user?.id);
      return participantIds.includes(Number(userId)) || Number(r.createdBy) === Number(userId);
    })
    .map((b) => {
      const unreadCount = unread[b.id] || 0;
      const memberCount = b.participants.length;
      const isOwner = Number(b.createdBy) === Number(userId);

      return (
        <Box
          key={`broadcast-${b.id}`}
          px={3}
          py={3}
          _hover={{
            bg: colorMode === "dark" ? "gray.600" : "gray.100",
            cursor: "pointer",
          }}
        onClick={async () => {
            // 🔥 tutup drawer 1 dulu biar konsisten
            onClose();

            // 🔥 buka drawer 2 di next tick supaya UI dan scroll aman
            setTimeout(() => {
              onOpenRoom(b);
            }, 0);

            // 🔥 tandai broadcast sebagai sudah dibaca
            if (b?.id) {
              await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms/${b.id}/read`,
                { method: "POST" }
              );
            }

            // 🔥 update unread lokal
            setUnread((prev) => {
              const updated = { ...prev, [b.id]: 0 };
              localStorage.setItem("chat-unread", JSON.stringify(updated));
              return updated;
            });
          }}
        >
          <HStack justify="space-between">
            <HStack>
              <Avatar size="sm" src={b.avatar} name={b.name || b.title} />
              <Text _hover={{ color: colorMode === "dark" ? "gray.200" : "black" }}>
                {b.name || b.title}
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Badge
                colorScheme="blue"
                borderRadius="full"
                minW="24px"
                textAlign="center"
              >
                {memberCount}
              </Badge>
              {unreadCount > 0 && (
                <Badge
                  colorScheme="red"
                  borderRadius="full"
                  minW="24px"
                  textAlign="center"
                >
                  {unreadCount}
                </Badge>
              )}
              {isOwner && (
                <>
                  <IconButton
                    icon={<CiEdit />}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditBroadcast(b);
                    }}
                  />
                  <IconButton
                    icon={<MdOutlineDeleteSweep />}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                     handleDeleteBroadcastClick(b.id);
                    }}
                  />
                </>
              )}
            </HStack>
          </HStack>
        </Box>
      );
    })}

  {/* ===== TEXT "BELUM ADA BROADCAST" CENTER ===== */}
  {rooms.filter((r) => {
    if (r.type !== "broadcast") return false;
    if (!Array.isArray(r.participants)) return false;
    const participantIds = r.participants.map((p) => p.userId ?? p.user?.id);
    return participantIds.includes(Number(userId)) || Number(r.createdBy) === Number(userId);
  }).length === 0 && (
    <Flex w="full" h="150px" align="center" justify="center">
      <Text fontSize="sm" opacity={0.6} textAlign="center">
        Belum ada broadcast
      </Text>
    </Flex>
  )}
</VStack>
<Divider />
            <Box p={3}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <LuSearch color={colorMode === "light" ? "#4A5568" : "#CBD5E0"} />
                </InputLeftElement>
                <Input
                  placeholder="Search admin..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  borderRadius="full"
                />
              </InputGroup>
            </Box>
            <Divider />

            <Text px={3} py={1} fontWeight="bold">PRIVATE CHAT</Text>
            <VStack align="stretch" spacing={0}>
              {[...frequentPrivate.map(id => filteredAdmins.find(a => a.id === id)).filter(Boolean), 
                ...filteredAdmins.filter(a => !frequentPrivate.includes(a.id))
              ].map((admin) => {
                const room = rooms.find(r => r.type === "private" && r.participants.map(p => p.userId).includes(admin.id));
                const unreadCount = room?.id ? unread[room.id] || 0 : 0;

                return (
                  <Box
                    key={`private-${admin.id}`}
                    px={3}
                    py={3}
                    _hover={{
                      bg: colorMode === "dark" ? "gray.600" : "gray.100",
                      cursor: "pointer",
                    }}
                    onClick={() => handleOpenPrivate(admin)}
                  >
                    <HStack justify="space-between">
                      <HStack>
                      <Avatar 
                        size="sm" 
                        name={admin.username} 
                        src={admin.profilePhoto || ""} 
                      />
                      <Text _hover={{ color: colorMode === "dark" ? "gray.200" : "black" }}>
                        {admin.username} {admin.user?.verified && "✅"}
                      </Text>
                    </HStack>
                      {unreadCount > 0 && (
                        <Badge
                          colorScheme="red"
                          borderRadius="full"
                          minW="24px"
                          textAlign="center"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </HStack>
                  </Box>
                );
              })}
            </VStack>

            <Divider mt={2} mb={2} />

            <Text px={3} py={1} fontWeight="bold">My Group</Text>
            {/* GROUP CHATS */}
          <VStack align="stretch" spacing={0}>
              {rooms
                .filter((r) => {
                  if (r.type !== "group") return false;
                  if (!Array.isArray(r.participants)) return false;
                  return r.participants.some((p) => {
                    const pid = p.userId ?? p.user?.id ?? null;
                    return Number(pid) === Number(userId);
                  });
                })
                .map((room) => {
                  const memberCount = room.participants.length;
                  const unreadCount = unread[room.id] || 0;
                  return (
                    <Box
                      key={`group-${room.id}`}
                      px={3}
                      py={3}
                      _hover={{
                        bg: colorMode === "dark" ? "gray.600" : "gray.100", // dark mode lebih gelap
                        cursor: "pointer",
                      }}
                     onClick={async () => {
                        // 🔥 tutup drawer dulu biar UI clean
                        onClose();

                        // 🔥 buka room di next tick (biar Drawer 2 mount dengan proper)
                        setTimeout(() => {
                          onOpenRoom(room);
                        }, 0);

                        // 🔥 backend + unread tetap jalan normal
                        if (room?.id)
                          await fetchWithAuth(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms/${room.id}/read`,
                            { method: "POST" }
                          );

                        setUnread((prev) => {
                          const updated = { ...prev, [room.id]: 0 };
                          localStorage.setItem("chat-unread", JSON.stringify(updated));
                          return updated;
                        });
                      }}
                    >
                      <HStack justify="space-between">
                        <HStack>
                          <Avatar size="sm" src={room.avatar} name={room.name} />
                          <Text
                            _hover={{ color: colorMode === "dark" ? "gray.200" : "black" }} // text hover dark mode
                          >
                            {room.name}
                          </Text>

                          {room.participants.find((p) => p.userId === userId && p.isAdmin) && (
                            <HStack spacing={1}>
                              <IconButton
                                aria-label="Edit Group"
                                icon={<CiEdit />}
                                size="sm"
                                color="black"
                                bg={colorMode === "dark" ? "gray.500" : "gray.200"}
                                _hover={{
                                  bg: colorMode === "dark" ? "gray.400" : "gray.300",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditGroup(room);
                                }}
                              />
                              <IconButton
                                aria-label="Delete Group"
                                icon={<MdOutlineDeleteSweep />}
                                size="sm"
                                color="black"
                                bg={colorMode === "dark" ? "gray.500" : "gray.200"}
                                _hover={{
                                  bg: colorMode === "dark" ? "gray.400" : "gray.300",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteGroup(room.id);
                                }}
                              />
                            </HStack>
                          )}
                        </HStack>

                        <Badge
                          colorScheme="blue"
                          borderRadius="full"
                          minW="24px"
                          textAlign="center"
                        >
                          {memberCount}
                        </Badge>
                        {unreadCount > 0 && (
                          <Badge
                            colorScheme="red"
                            borderRadius="full"
                            minW="24px"
                            textAlign="center"
                          >
                            {unreadCount}
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                  );
                })}
            </VStack>
                      
            <Divider />

            <Box p={3}>
              <HStack justify="space-between">
                <Text fontWeight="bold">Groups</Text>
                <Button size="xs" leftIcon={<FaPlus />} bg="brand.500" color="black" borderRadius="full" onClick={() => {
                  setShowCreate(!showCreate);
                  if (!showCreate) { setGroupName(""); setGroupMembers([]); setAvatarFile(null); setAvatarPreview(null); setIsEdit(false); setCurrentRoomId(null); setMemberSearch(""); }
                }}>{showCreate ? "Close" : "Create"}</Button>
              </HStack>

              {showCreate && (
                <VStack mt={3} spacing={4} align="stretch">
                  <Input
                    placeholder="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    borderRadius="full"
                    h="10"
                    px={4}
                  />

                 <Box position="relative" w="100px" h="100px" mx="auto">
                    {/* Avatar */}
                    <Avatar
                      size="full"
                      src={avatarObjectUrl || avatarPreview || ""} // akan kosong kalau dihapus
                      name="Avatar"
                    />

                    {/* ICON CAMERA (hanya tampil jika belum ada avatar) */}
                    {!avatarObjectUrl && !avatarPreview && (
                      <IconButton
                        icon={<IoCameraOutline color={colorMode === "dark" ? "black" : "black"} />}
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        borderRadius="full"
                        onClick={() => fileInputRef.current?.click()}
                        bg={colorMode === "dark" ? "gray.200" : "gray.100"} // bg normal
                        _hover={{ bg: colorMode === "dark" ? "gray.300" : "gray.200" }}
                        size="lg" // gedein icon supaya jelas
                      />
                    )}

                    {/* INPUT FILE */}
                    <Input
                      type="file"
                      ref={fileInputRef}
                      display="none"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setAvatarFile(file);
                          setAvatarPreview(null);
                        }
                      }}
                    />

                    {/* BUTTON HAPUS (X) muncul hanya kalau ada avatar */}
                    {(avatarObjectUrl || avatarPreview) && (
                      <Button
                        size="xs"
                        position="absolute"
                        bottom="-10px"
                        left="50%"
                        transform="translateX(-50%)"
                        colorScheme="red"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(null);
                          // 🔥 pastikan placeholder default muncul lagi
                        }}
                      >
                        X
                      </Button>
                    )}
                  </Box>
                  <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <LuSearch color={colorMode === "light" ? "#4A5568" : "#CBD5E0"} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search members..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    borderRadius="full"
                  />
                </InputGroup>

                  <VStack align="start" maxH="150px" overflowY="auto">
                    {filteredMembers.map((a) => (
                      <Checkbox
                        key={a.id}
                        isChecked={groupMembers.includes(a.id)}
                        onChange={(e) => {
                          if (e.target.checked) setGroupMembers((prev) => [...prev, a.id]);
                          else setGroupMembers((prev) => prev.filter((id) => id !== a.id));
                        }}
                      >
                        {a.username}
                      </Checkbox>
                    ))}
                  </VStack>

                  <Button bg="brand.500" color="black" borderRadius="full" isLoading={creating} onClick={handleSubmitGroup}>
                    {isEdit ? "Update Group" : "Create Group"}
                  </Button>
                </VStack>
              )}
            </Box>

            {/* ===== FOOTER STICKY DI BAWAH ===== */}
<Box
  mt={4} // jarak dari section atas
  w="100%"
  bg={useColorModeValue("white", "gray.700")}
  borderTop="1px solid"
  borderColor={useColorModeValue("gray.200", "gray.700")}
  textAlign="center"
  py={4}
  position="sticky"
  bottom={0}
>
  <Text fontWeight="bold">MogeHub Chat System</Text>
  <Text fontSize="sm" color="gray.500">
    Version 2.2
  </Text>
</Box>
             </>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Modal
        isOpen={deleteBroadcastModal.isOpen}
        onClose={() => setDeleteBroadcastModal({ isOpen: false, broadcastId: null })}
        isCentered
      >
        <ModalOverlay />
        <ModalContent bg={colorMode === "dark" ? "gray.700" : "white"}>
          <ModalHeader>Delete Broadcast</ModalHeader>
          <ModalBody>Are you sure you want to delete this broadcast?</ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={() => setDeleteBroadcastModal({ isOpen: false, broadcastId: null })}>Cancel</Button>
            <Button bg="gray.300" onClick={confirmDeleteBroadcast}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, roomId: null })} isCentered>
        <ModalOverlay />
        <ModalContent bg={colorMode === "dark" ? "gray.700" : "white"}>
          <ModalHeader>Delete Group</ModalHeader>
          <ModalBody>Are you sure you want to delete this group?</ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={() => setDeleteModal({ isOpen: false, roomId: null })}>Cancel</Button>
            <Button bg="gray.300" onClick={confirmDeleteGroup}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

