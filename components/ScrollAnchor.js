import { Flex, IconButton, Badge } from "@chakra-ui/react";
import { FaArrowDown } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";

export default function ScrollAnchor({ containerRef, messages, isTyping }) {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastLengthRef = useRef(0);

  // 🔥 SCROLL DETECT (FIX: DEPEND ON ELEMENT)
  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const handleScroll = () => {
      const distance =
        el.scrollHeight - el.scrollTop - el.clientHeight;

      const nearBottom = distance < 120;

      setIsAtBottom(nearBottom);

      if (nearBottom) {
        setUnreadCount(0);
      }
    };

    // 🔥 INIT CHECK WAJIB
    handleScroll();

    el.addEventListener("scroll", handleScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [containerRef?.current]); // 🔥 FIX BESAR DI SINI

  // 🔥 NEW MESSAGE COUNT
  useEffect(() => {
    const diff = messages.length - lastLengthRef.current;

    if (diff > 0 && !isAtBottom) {
      setUnreadCount((prev) => prev + diff);
    }

    lastLengthRef.current = messages.length;
  }, [messages.length, isAtBottom]);

  // 🔥 TYPING (TIDAK NGERUSAK SCROLL USER)
  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const distance =
      el.scrollHeight - el.scrollTop - el.clientHeight;

    const nearBottom = distance < 80;

    if (isTyping && nearBottom) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [isTyping]);

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
      {!isAtBottom && (
        <Flex
          position="absolute"
          bottom="95px"
          left="50%"
          transform="translateX(-50%)"
          direction="column"
          align="center"
          zIndex={999} // 🔥 BIAR GA KE TUTUP
        >
          <IconButton
            icon={<FaArrowDown />}
            bg="brand.500"
            color="white"
            borderRadius="full"
            boxShadow="lg"
            onClick={scrollToBottom}
          />

          {unreadCount > 0 && (
            <Badge mt={1} borderRadius="full" colorScheme="red">
              {unreadCount}
            </Badge>
          )}
        </Flex>
      )}
    </>
  );
}