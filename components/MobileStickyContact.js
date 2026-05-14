"use client";

import {
  Box,
  HStack,
  Button,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";

import { BsWhatsapp } from "react-icons/bs";
import { BiPhoneCall } from "react-icons/bi";
import { FaRegShareFromSquare } from "react-icons/fa6";

export default function MobileStickyContact({ phone, username, adTitle }) {
  const toast = useToast();

  if (!phone) return null;

  // ===== CHAKRA COLOR MODE =====
  const bg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");

  // ===== CLEAN PHONE =====
  const cleanPhone = phone.replace(/\D/g, "");
  const waPhone = cleanPhone.startsWith("0")
    ? `62${cleanPhone.slice(1)}`
    : cleanPhone;

  // ===== WHATSAPP MESSAGE =====
  const message = `Halo ${username}, saya melihat iklan "${adTitle}" di MogeHub. Apakah masih tersedia?`;

  const encodedMessage = encodeURIComponent(message);

  const whatsappLink = `https://wa.me/${waPhone}?text=${encodedMessage}`;

  // ===== SHARE FUNCTION =====
  const handleShare = async () => {
    const shareText = `Coba cek iklan ini di MogeHub:\n${adTitle}`;

    const shareData = {
      title: adTitle,
      text: shareText,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        console.log("Share cancelled");
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);

        toast({
          title: "Link copied",
          description: "Ad link copied to clipboard",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } catch {
        toast({
          title: "Share not supported",
          status: "error",
          duration: 2000,
        });
      }
    }
  };

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      width="100%"
      bg={bg}
      borderTop="1px solid"
      borderColor={borderColor}
      display={{ base: "block", md: "none" }}
      zIndex="1000"
      px={3}
      pt={3}
      pb="calc(env(safe-area-inset-bottom) + 12px)"
    >
      <HStack spacing={3}>
        {/* WHATSAPP */}
        <Button
          as="a"
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          leftIcon={<BsWhatsapp />}
          bg="green.400"
          color="white"
          _hover={{ bg: "green.500" }}
          flex="1"
        >
          WhatsApp
        </Button>

        {/* CALL */}
        <Button
          as="a"
          href={`tel:${cleanPhone}`}
          leftIcon={<BiPhoneCall />}
          bg="#90cdf4"
          color="black"
          _hover={{ bg: "#7fbce6" }}
          flex="1"
        >
          Call
        </Button>

        {/* SHARE */}
        <Button
          onClick={handleShare}
          leftIcon={<FaRegShareFromSquare />}
          bg="gray.300"
          color="black"
          _hover={{ bg: "gray.400" }}
          flex="1"
        >
          Share
        </Button>
      </HStack>
    </Box>
  );
}