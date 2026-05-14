"use client";

import { Box, Text, Badge, useColorModeValue } from "@chakra-ui/react";
import { useLanguageContext } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";
import NextImage from "next/image";

// 🔹 ForumCard versi sederhana
// 🔹 Background transparan
// 🔹 Total komentar ditambahkan, author dan timestamp pakai seperti awal
export default function ForumCard({ thread, onClick, isDragging }) {
  const { language } = useLanguageContext();
  const t = language === "en" ? en : id;

  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("black", "white");

  // ambil thumbnail utama
  const thumbnail = thread.thumbnail || "/default-forum.jpg"; // default kalau nggak ada

  return (
    <Box
      borderRadius="md"
      border="1px solid"
      borderColor={borderColor}
      bg="transparent"
      shadow="sm"
      cursor="pointer"
      _hover={{ transform: "scale(1.02)", transition: "0.3s" }}
      onClick={(e) => {
      if (isDragging?.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      onClick?.();
    }}
    >
      {/* ===== THUMBNAIL ===== */}
      <Box
        position="relative"
        w="100%"
        h={{ base: "120px", md: "150px" }}
        overflow="hidden"
        borderTopRadius="md"
      >
        <NextImage
          src={thumbnail}
          alt={thread.title}
          fill
          priority
          unoptimized
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{
            objectFit: "cover",
          }}
        />
      </Box>

      {/* ===== TITLE & INFO ===== */}
      <Box p={4}>
        <Text fontWeight="bold" fontSize="md" color={textColor} noOfLines={1}>
          {thread.title}
        </Text>

        {/* Total komentar */}
        <Badge colorScheme="teal" mt={2}>
          {thread.commentCount} {t.comments || "Comments"}
        </Badge>

        {/* Author + timestamp */}
        <Text fontSize="sm" color={textColor} mt={1}>
          {t.by || "By"} {thread.author} • {
    new Date(thread.timestamp).toLocaleDateString(
      language === "en" ? "en-GB" : "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    )
  }
      </Text>
      </Box>
    </Box>
  );
}
