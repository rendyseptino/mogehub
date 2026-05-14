"use client";

import { HStack, Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

export default function TypingDots() {
  return (
    <HStack spacing={1} justify="flex-start" px={3} py={1}>
      <Box
        w="8px"
        h="8px"
        bg="gray.500"
        borderRadius="full"
        animation={`${bounce} 1.4s infinite ease-in-out both`}
      />
      <Box
        w="8px"
        h="8px"
        bg="gray.500"
        borderRadius="full"
        animation={`${bounce} 1.4s infinite ease-in-out 0.2s`}
      />
      <Box
        w="8px"
        h="8px"
        bg="gray.500"
        borderRadius="full"
        animation={`${bounce} 1.4s infinite ease-in-out 0.4s`}
      />
    </HStack>
  );
}