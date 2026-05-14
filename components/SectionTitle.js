"use client";

import { Box, Text, useColorModeValue, HStack } from "@chakra-ui/react";
import { useLanguageContext } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";

export default function SectionTitle({ title, subtitle, icon }) {
  const { language } = useLanguageContext();
  const t = language === "en" ? en : id;

  const textColor = useColorModeValue("black", "white");
  const subtitleColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Box mb={5}>
      {/* Icon + Title horizontal */}
      <HStack spacing={2} alignItems="center">
        {icon && icon} {/* icon di kiri */}
        <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold" color={textColor}>
          {title}
        </Text>
      </HStack>
      {subtitle && (
        <Text fontSize={{ base: "sm", md: "md" }} color={subtitleColor}>
          {subtitle}
        </Text>
      )}
    </Box>
  );
}