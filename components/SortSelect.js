"use client";

import { Select, HStack, Text } from "@chakra-ui/react";

export default function SortSelect({
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  selectedCategory,
  t,
}) {
  const handleChange = (value) => {
    // =====================
    // RESET DEFAULT
    // =====================
    if (!value) {
      setSortBy("");
      setSortOrder("desc");
      return;
    }

    const [field, order] = value.split("|");

    // =====================
    // SET STATE ONLY (NO FETCH HERE)
    // =====================
    setSortBy(field);
    setSortOrder(order);
  };

  const value = sortBy ? `${sortBy}|${sortOrder}` : "";

  return (
    <HStack spacing={2}>
      <Text fontSize="sm" fontWeight="medium">
        Sort
      </Text>

      <Select
        placeholder="Default (Recommended)"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      >
        {/* PRICE */}
        <option value="price|asc">Price (Low → High)</option>
        <option value="price|desc">Price (High → Low)</option>

        {/* YEAR */}
        <option value="year|desc">Year (New → Old)</option>
        <option value="year|asc">Year (Old → New)</option>

        {/* KM ONLY MOTOR BEKAS */}
        {selectedCategory === "Motor Bekas" && (
          <>
            <option value="km|asc">KM (Low → High)</option>
            <option value="km|desc">KM (High → Low)</option>
          </>
        )}
      </Select>

      {sortBy && (
        <Text fontSize="xs" color="gray.500">
          {sortBy} ({sortOrder})
        </Text>
      )}
    </HStack>
  );
}