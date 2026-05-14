import { useEffect, useState, useRef, useMemo } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  IconButton,
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Image,
  Button,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Spinner,
} from "@chakra-ui/react";
import { FaPaperPlane, FaPlus } from "react-icons/fa";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { useSocket } from "../context/SocketContext";
import TypingDots from "./TypingDots";
import { useColorModeValue } from "@chakra-ui/react";
import { FaMicrophone } from "react-icons/fa6";
import { FaRegStopCircle } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
import BubbleCustom from "./bubbleCustom";
const getAuthToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

export default function MyChatDrawer({ isOpen, onClose, room, userId, openChatDrawer  }) {

  const handleClose = () => {
    onClose();        // tutup drawer 2
    openChatDrawer(); // buka drawer 1
  };
  const socket = useSocket(getAuthToken());
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewList, setPreviewList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef();
  const scrollContainerRef = useRef();
  const inputRef = useRef();
  const [forceScroll, setForceScroll] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const audioChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const [voicePreview, setVoicePreview] = useState(null);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const voiceBg = useColorModeValue("gray.100", "gray.700");
  const streamRef = useRef(null);
  const chatBg = useColorModeValue(
  "url('/chat-light.png')",
  "url('/chat-dark.png')"
);

  const targetUser = useMemo(() => {
    if (!room?.participants || !userId) return null;
    return room.participants.find((p) => p.userId !== userId)?.user;
  }, [room, userId]);

  const isGroup = room?.type === "group";
  const headerName = isGroup ? room.name : targetUser?.username;
  const headerAvatar = isGroup ? room.avatar || "/default-group-avatar.png" : targetUser?.avatar;
  const groupMembersCount = isGroup ? room.participants.length : 1;

  // ================= FETCH =================
  useEffect(() => {
    if (!room) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms/${room.id}/messages`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    })
      .then((res) => res.json())
      .then(setMessages);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms/${room.id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    }).catch(() => {});
  }, [room]);

  // ================= SOCKET =================
  useEffect(() => {
    if (!socket || !room) return;
    socket.emit("joinRoom", room.id);

    const messageHandler = (data) => {
      if (data.roomId !== room.id) return;
      setMessages((prev) => {
        const exists = prev.find((m) => m.id === data.message.id);
        if (exists) return prev;
        return [...prev, data.message];
      });
    };

    const typingHandler = (data) => {
      if (data.roomId !== room.id && data.senderId !== userId) return;
      if (data.senderId !== userId) setIsTyping(data.isTyping);
    };

    const onlineHandler = ({ userId: uid, isOnline }) => {
      if (!isGroup && uid === targetUser?.id) setIsOnline(isOnline);
    };

    socket.on("receiveMessage", messageHandler);
    socket.on("typing", typingHandler);
    socket.on("userOnline", onlineHandler);

    return () => {
      socket.off("receiveMessage", messageHandler);
      socket.off("typing", typingHandler);
      socket.off("userOnline", onlineHandler);
    };
  }, [socket, room, userId, targetUser, isGroup]);

 // ================= VOICE NOTE =================
  const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    streamRef.current = stream; // 🔥 penting

    const recorder = new MediaRecorder(stream);

    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    setVoicePreview(null);
    setVoiceBlob(null);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, {
        type: recorder.mimeType || "audio/webm",
      });

      audioChunksRef.current = [];

      if (!blob || blob.size === 0) {
        console.error("EMPTY BLOB");
        return;
      }

      const url = URL.createObjectURL(blob);

      setVoiceBlob(blob);
      setVoicePreview(url);
      setIsRecording(false);

      // 🔥 STOP STREAM PROPERLY
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };

    recorder.start();
    setIsRecording(true);

  } catch (err) {
    console.log("MIC ERROR:", err);
    setIsRecording(false);
  }
};

const stopRecording = () => {
  const recorder = mediaRecorderRef.current;

  if (!recorder) return;

  if (recorder.state !== "recording") return;

  recorder.stop();
};

const cancelVoice = () => {
  setVoicePreview(null);
  setVoiceBlob(null);

  mediaRecorderRef.current?.stop();

  streamRef.current?.getTracks().forEach((t) => t.stop());
  streamRef.current = null;

  mediaRecorderRef.current = null;
};

const sendVoice = async () => {
  if (!voiceBlob || voiceBlob.size === 0) return;

  const formData = new FormData();
  formData.append("file", voiceBlob, "voice.webm");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chat/upload/voice`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    }
  );

  const data = await res.json();

  const msgRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        roomId: room.id,
        content: "",
        type: "voice",
        voiceUrl: data.url,
        voiceDuration: 0,
      }),
    }
  );

  const msg = await msgRes.json();

  socket.emit("sendMessage", {
    roomId: room.id,
    senderId: userId,
    message: msg,
  });

  setMessages((prev) => [...prev, msg]);

  setVoicePreview(null);
  setVoiceBlob(null);
};


  // ================= FILE PREVIEW =================
  const handleFilesSelected = (files) => {
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const previews = newFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
    }));
    setPreviewList(previews);
  };

  const removeFile = (i) => {
    const updated = selectedFiles.filter((_, idx) => idx !== i);
    setSelectedFiles(updated);
    setPreviewList(updated.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      type: f.type,
      name: f.name,
    })));
  };

  // ================= SEND FIX =================
const handleSend = async () => {
  if (!room) return;

  if (
    !newMessage.trim() &&
    selectedFiles.length === 0 &&
    !voiceBlob
  ) return;

  setIsSending(true);
  const token = getAuthToken();
  let data;

  try {
    // ================= VOICE =================
    if (voiceBlob) {
      const formData = new FormData();
      formData.append("file", voiceBlob, "voice.webm");

      const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/chat/upload/voice`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }
);

      if (!res.ok) return console.log("ERROR VOICE UPLOAD");

      const upload = await res.json();

      const msgRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomId: room.id,
            content: "",
            type: "voice",
            voiceUrl: upload.url,
            voiceDuration: 0,
          }),
        }
      );

      if (!msgRes.ok) return console.log("ERROR VOICE MESSAGE");

      data = await msgRes.json();

      setVoiceBlob(null);
      setVoicePreview(null);
    }

    // ================= ATTACHMENT =================
    else if (selectedFiles.length > 0) {
      const formData = new FormData();
      formData.append("roomId", room.id);
      formData.append("content", newMessage || "");

      selectedFiles.forEach((file) =>
        formData.append("files", file)
      );

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/attachments`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) return console.log("ERROR ATTACHMENT");

      data = await res.json();
    }

    // ================= TEXT =================
    else {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomId: room.id,
            content: newMessage.trim(),
          }),
        }
      );

      if (!res.ok) return console.log("ERROR TEXT");

      data = await res.json();
    }

    // ================= SAFE GUARD =================
    if (!data) return;

    socket.emit("sendMessage", {
      roomId: room.id,
      senderId: userId,
      message: data,
    });

    setMessages((prev) => {
      const exists = prev.find((m) => m.id === data.id);
      if (exists) return prev;
      return [...prev, data];
    });

    setNewMessage("");
    setSelectedFiles([]);
    setPreviewList([]);

    socket.emit("typing", {
      roomId: room.id,
      senderId: userId,
      isTyping: false,
    });

    inputRef.current?.focus();
  } catch (err) {
    console.log("SEND ERROR:", err);
  } finally {
    setIsSending(false);
  }
};


 // ================= SCROLL =================

// 🔥 MASUK ROOM → SCROLL SETELAH MESSAGES ADA
useEffect(() => {
  if (!scrollContainerRef.current) return;
  if (!messages.length) return; // ⛔ tunggu messages masuk dulu

  const container = scrollContainerRef.current;

  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
  });
}, [room?.id, messages.length]);


// 🔥 HANDLE SCROLL DINAMIS (chat baru + typing)
useEffect(() => {
  if (!scrollContainerRef.current) return;
  const container = scrollContainerRef.current;

  const isNearBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight < 60;

  // 🔥 RULE:
  // - forceScroll → selalu turun
  // - dekat bawah → auto follow
  // - isTyping → paksa turun walaupun lagi di atas
  if (forceScroll || isNearBottom || isTyping) {
    setTimeout(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }, 0);

    setForceScroll(false);
  }
}, [messages.length, isTyping]);

if (!room) return null;

return (
  <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
    <DrawerOverlay />
    <DrawerContent>
      <DrawerCloseButton />
      <DrawerHeader>
        <VStack align="start" spacing={0}>
          
          <HStack>
            <Avatar
              size="sm"
              name={room.type === "broadcast" ? room.name || room.title : headerName}
              src={room.type === "broadcast" ? room.avatar || "/default-avatar.png" : headerAvatar}
            />
            <Text fontWeight="bold">
              {room.type === "broadcast" ? room.name || room.title : headerName}
            </Text>
          </HStack>

          {room.type === "group" && (
            <Text fontSize="xs" color="gray.400">{room.participants.length} members</Text>
          )}

          {!isGroup && room.type !== "broadcast" && (
            <Text fontSize="xs" color={isOnline ? "green.400" : "gray.400"}>
              {isOnline ? "Online" : "Offline"}
            </Text>
          )}
        </VStack>
      </DrawerHeader>

      <DrawerBody
  display="flex"
  flexDirection="column"
  p={0}
  height="100%"
  minH={0} // 🔥 pastiin DrawerBody shrinkable
>
  
{/* ================= CHAT AREA ================= */}
<Box
  flex="1"
  minH={0}
  overflowY="auto"
  ref={scrollContainerRef}
  key={room?.id + "-chat"}
  px={3}
  py={2}
  position="relative"
  bgImage={chatBg}
  bgSize="cover"
  bgPosition="center"
  bgRepeat="no-repeat"
  sx={{
    "&::-webkit-scrollbar": { display: "none" },
    scrollbarWidth: "none",
  }}
>
  <BubbleCustom
    messages={messages}
    userId={userId}
    containerRef={scrollContainerRef}
    isTyping={isTyping}
    typingUser={targetUser}
    onImageClick={(url) => setPreviewImage(url)}
  />
</Box>


  

  {/* ================= VOICE PREVIEW ================= */}
{voicePreview && (
  <Box px={3} pb={2}>
    <Box
      bg={voiceBg}
      p={3}
      borderRadius="md"
    >
      <audio controls src={voicePreview} style={{ width: "100%" }} />

      <HStack mt={2} justify="flex-end">
        <Button size="sm" onClick={cancelVoice}>
          Cancel
        </Button>
      </HStack>
    </Box>
  </Box>
)}

  {/* ================= PREVIEW ================= */}
  {previewList.length > 0 && (
    <HStack overflowX="auto" mt={2} px={3}>
      {previewList.map((p, i) => (
        <Box key={i} position="relative">
          {p.type.startsWith("image") ? (
            <Image src={p.url} boxSize="60px" borderRadius="8px" />
          ) : (
            <Box
              display="flex"
              alignItems="center"
              border="1px solid #ccc"
              px={2}
              py={1}
              borderRadius="md"
              maxW="60px"
              overflow="hidden"
              cursor="pointer"
              onClick={() => window.open(p.url, "_blank")}
            >
              <IoCloudDownloadOutline size={22} />
              <Text ml={1} isTruncated fontSize="xs">{p.name}</Text>
            </Box>
          )}
          <Button size="xs" position="absolute" top="0" right="0" onClick={() => removeFile(i)}>x</Button>
        </Box>
      ))}
    </HStack>
  )}

  
  {/* ================= INPUT ================= */}
<HStack mt={2} px={3} pb={2} spacing={2}>

  {/* FILE INPUT (hidden) */}
  <input
    type="file"
    multiple
    style={{ display: "none" }}
    id="filePicker"
    onChange={(e) =>
      handleFilesSelected(Array.from(e.target.files))
    }
  />

  {/* FILE BUTTON */}
  <IconButton
    icon={<FaPlus />}
    borderRadius="full"
    onClick={() =>
      document.getElementById("filePicker").click()
    }
    isDisabled={isSending}
  />

  {/* 🎤 VOICE BUTTON (MOBILE ONLY) */}
  <IconButton
    display={{ base: "flex", md: "none" }}
    icon={
      isRecording ? (
        <FaRegStopCircle />
      ) : (
        <FaMicrophone />
      )
    }
    colorScheme={isRecording ? "red" : "blue"}
    borderRadius="full"
    onClick={() => {
      if (isRecording) stopRecording();
      else startRecording();
    }}
    isDisabled={isSending}
  />

  {/* INPUT */}
  <Input
    ref={inputRef}
    placeholder="Type a message..."
    value={newMessage}
    onChange={(e) => {
      setNewMessage(e.target.value);

      if (socket && room) {
        socket.emit("typing", {
          roomId: room.id,
          senderId: userId,
          isTyping: e.target.value.length > 0,
        });
      }
    }}
    borderRadius="full"
    onKeyDown={(e) =>
      e.key === "Enter" && handleSend()
    }
    isDisabled={isSending}
  />

  {/* SEND */}
  <IconButton
    icon={
      isSending ? <Spinner size="sm" /> : <FaPaperPlane />
    }
    onClick={() => {
      setForceScroll(true);
      handleSend();
    }}
    borderRadius="full"
    isDisabled={isSending}
  />

</HStack>
</DrawerBody>

      <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Image src={previewImage} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </DrawerContent>
  </Drawer>
);
}