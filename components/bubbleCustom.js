import {
  Box,
  Text,
  HStack,
  VStack,
  Image,
  IconButton,
  Avatar,
  Flex,
  Badge,
} from "@chakra-ui/react";

import { FaPlay, FaArrowDown, FaRegPauseCircle } from "react-icons/fa";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import TypingDots from "./TypingDots";
import { useColorModeValue } from "@chakra-ui/react";


export default function BubbleCustom({
  messages = [],
  userId,
  onImageClick,
  containerRef,
  isTyping,
  typingUser,
}) {
  const audioRefs = useRef({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const lastLengthRef = useRef(0);
  const [playingId, setPlayingId] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [durationMap, setDurationMap] = useState({});
  const bubbleBgReceiver = useColorModeValue("gray.300", "gray.200");
  const bubbleTextSize = useColorModeValue("md", "sm");
  const formatDateLabel = (date) => {
  const d = new Date(date);
  const now = new Date();

  const diffTime = now.setHours(0,0,0,0) - new Date(d).setHours(0,0,0,0);
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
 

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const isNewDay = (current, prev) => {
  if (!prev) return true;

  const d1 = new Date(current);
  const d2 = new Date(prev);

  return (
    d1.getDate() !== d2.getDate() ||
    d1.getMonth() !== d2.getMonth() ||
    d1.getFullYear() !== d2.getFullYear()
  );
};


  // ================= SCROLL DETECT =================
  useEffect(() => {
  const el = containerRef?.current;
  if (!el) return;

  const onScroll = () => {
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;

    const nearBottom = distanceFromBottom < 80;

    setIsAtBottom(nearBottom);

    if (nearBottom) {
      setUnreadCount(0);
    }
  };

  el.addEventListener("scroll", onScroll);

  // 🔥 INIT CHECK (biar private chat juga ke-detect)
  onScroll();

  return () => el.removeEventListener("scroll", onScroll);
}, [containerRef, messages.length]); // 🔥 TAMBAH messages.length

  // ================= NEW MESSAGE DETECT =================
  useEffect(() => {
    const diff = messages.length - lastLengthRef.current;

    if (diff > 0 && !isAtBottom) {
      setUnreadCount((prev) => prev + diff);
    }

    lastLengthRef.current = messages.length;
  }, [messages.length, isAtBottom]);

  const scrollToBottom = () => {
    const el = containerRef?.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });

    setUnreadCount(0);
  };

  return (
    <>
      {/* ================= CHAT ================= */}
<VStack align="stretch" spacing={2} px={2}>
  {messages.map((msg, index) => {
    const prevMsg = messages[index - 1];

    const showDate = isNewDay(
      msg.createdAt,
      prevMsg?.createdAt
    );

    const isSender = msg.senderId === userId;

    const msgDate = new Date(msg.createdAt || Date.now());

    return (
      <Box key={msg.id}>

        {/* ================= DATE SEPARATOR ================= */}
        {showDate && (
          <Flex justify="center" my={3}>
            <Box
              bg="white"
              color="black"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              boxShadow="sm"
            >
              {formatDateLabel(msg.createdAt)}
            </Box>
          </Flex>
        )}

        {/* ================= MESSAGE ROW ================= */}
        <HStack
          justify={isSender ? "flex-end" : "flex-start"}
          align="flex-end"
          spacing={2}
        >
          {!isSender && (
            <Avatar
              size="xs"
              name={msg.sender?.username || "U"}
              src={msg.sender?.avatar}
            />
          )}

          {/* ================= BUBBLE ================= */}
          <Box
            position="relative"
            maxW="75%"
            px={4}
            py={2}
            borderRadius="18px"
            bg={isSender ? "blue.500" : bubbleBgReceiver}
            color={isSender ? "white" : "black"}
            boxShadow="sm"
            display="inline-flex"
            flexDirection="column"
            _after={{
              content: '""',
              position: "absolute",
              bottom: "0px",
              [isSender ? "right" : "left"]: "-6px",

              width: "12px",
              height: "12px",
              bg: isSender ? "blue.500" : "gray.200",

              clipPath: isSender
                ? "polygon(0 0, 100% 100%, 0 100%)"
                : "polygon(100% 0, 100% 100%, 0 100%)",
            }}
          >

            {/* ================= TEXT ================= */}
            {msg.content && msg.type !== "voice" && (
              <Text fontSize={bubbleTextSize} whiteSpace="pre-wrap">
                {msg.content}
              </Text>
            )}

            {/* ================= IMAGE / FILE ================= */}
            {msg.attachments?.map((att, i) => (
              <Box key={i} mt={2}>
                {att.type?.startsWith("image") ? (
                  <Image
                    src={att.url}
                    maxW="200px"
                    borderRadius="10px"
                    cursor="pointer"
                    onClick={() => onImageClick?.(att.url)}
                  />
                ) : (
                  <HStack
                    cursor="pointer"
                    onClick={() => window.open(att.url)}
                    bg="whiteAlpha.300"
                    p={2}
                    borderRadius="md"
                  >
                    <IoCloudDownloadOutline />
                    <Text fontSize="sm" isTruncated>
                      {att.name}
                    </Text>
                  </HStack>
                )}
              </Box>
            ))}

            {/* ================= VOICE ================= */}
            {msg.type === "voice" && msg.voiceUrl && (
            <Box
                mt={2}
                bg="brand.500"
                px={3}
                py={2}
                borderRadius="full"
                maxW="100%"
                display="flex"
                flexDirection="column"
                gap={1}
            >
                    {/* ================= TOP ROW ================= */}
                    <HStack spacing={3} align="center">
                    <IconButton
                        size="sm"
                        icon={
                        playingId === msg.id ? (
                            <FaRegPauseCircle color="black" />
                        ) : (
                            <FaPlay color="black" />
                        )
                        }
                        bg="white"
                        borderRadius="full"
                        onClick={() => {
                        const audio = audioRefs.current[msg.id];
                        if (!audio) return;

                        if (audio.paused) {
                            audio.play();
                            setPlayingId(msg.id);
                        } else {
                            audio.pause();
                            setPlayingId(null);
                        }
                        }}
                    />

                    <Text fontSize="sm" color="black">
                        Voice message
                    </Text>
                    </HStack>

                    {/* ================= PROGRESS BAR ================= */}
                        {playingId === msg.id && (
                        <Box w="100%" px={1}>
                            <Box
                            h="3px"
                            bg="whiteAlpha.400"
                            borderRadius="full"
                            overflow="hidden"
                            >
                            <Box
                                h="100%"
                                bg="black"
                                width={
                                durationMap[msg.id]
                                    ? `${(progressMap[msg.id] / durationMap[msg.id]) * 100}%`
                                    : "0%"
                                }
                                transition="width 0.1s linear"
                            />
                            </Box>
                        </Box>
                        )}

                    {/* ================= AUDIO ================= */}
                    <audio
                    ref={(el) => {
                        if (el) {
                        audioRefs.current[msg.id] = el;

                        el.onloadedmetadata = () => {
                            setDurationMap((prev) => ({
                            ...prev,
                            [msg.id]: el.duration,
                            }));
                        };

                        el.ontimeupdate = () => {
                            setProgressMap((prev) => ({
                            ...prev,
                            [msg.id]: el.currentTime,
                            }));
                        };

                        el.onended = () => {
                            setPlayingId(null);

                            setProgressMap((prev) => ({
                            ...prev,
                            [msg.id]: 0,
                            }));
                        };
                        }
                    }}
                    preload="metadata"
                    playsInline
                    style={{ display: "none" }}
                    >
                    <source src={msg.voiceUrl} type="audio/mpeg" />
                    <source src={msg.voiceUrl} type="audio/mp3" />
                    <source src={msg.voiceUrl} type="audio/ogg" />
                    <source src={msg.voiceUrl} type="audio/webm" />
                    </audio>
                </Box>
                )}

            {/* ================= TIMESTAMP ================= */}
            <Flex justify="flex-end" mt={1}>
              <Text fontSize="10px" opacity={0.6}>
                {msgDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Flex>

          </Box>
        </HStack>
      </Box>
    );
  })}

  {/* ================= TYPING ================= */}
  {isTyping && typingUser && (
    <HStack>
      <Avatar size="xs" name={typingUser?.username} />
      <TypingDots />
    </HStack>
  )}
</VStack>

{/* ================= FLOAT BUTTON ================= */}
{!isAtBottom && (
  <Flex
    position="sticky"
    bottom="20px"
    left="0"
    w="100%"
    justify="center"
    align="center"
    zIndex={10}
    direction="column"
  >
    <IconButton
      icon={<FaArrowDown color="black" />}
      bg="brand.500"
      borderRadius="full"
      boxShadow="lg"
      onClick={scrollToBottom}
    />

    {unreadCount > 0 && (
      <Badge colorScheme="red" mt={1} borderRadius="full">
        {unreadCount}
      </Badge>
    )}
  </Flex>
)}
      
    </>
  );
}