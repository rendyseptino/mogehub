"use client";

import { Box, Text, HStack, Badge, useColorModeValue } from "@chakra-ui/react";

export default function TotalAdsProduct({
  totalAllAds = 0,
  filteredAds = [],
  selectedCategory = "",
  selectedSubcategory = "",
  searchQuery = "", 
}) {
  const textColor = useColorModeValue("gray.700", "whiteAlpha.900");
  const subText = useColorModeValue("gray.500", "gray.400");

  const buildContext = () => {
  const parts = [];

  if (selectedCategory) parts.push(selectedCategory);
  if (selectedSubcategory) parts.push(selectedSubcategory);

  let base = parts.join(" → ");

  if (searchQuery) {
    base = base
      ? `${base} → Search: "${searchQuery}"`
      : `Search: "${searchQuery}"`;
  }

  return base;
};

const contextLabel = buildContext();

  const isFiltered =
  selectedCategory || selectedSubcategory || searchQuery;

  return (
    <Box
      w="100%"
      mb={3}
      p={3}
      borderRadius="md"
      bg={useColorModeValue("white", "gray.700")}
      border="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.600")}
    >
      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium" color={textColor}>
          Total Iklan Produk
        </Text>

        <Badge colorScheme={isFiltered ? "green" : "blue"}>
  {filteredAds.length} {isFiltered ? "hasil" : "total"}
</Badge>
      </HStack>

      <Text fontSize="xs" color={subText} mt={1}>
        {contextLabel || "Semua kategori"}
      </Text>
    </Box>
  );
}