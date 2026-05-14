"use client";
import { HStack, Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react"; 

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

export default function DotLoader({ color = "black", size = 3 }) {
  return (
    <HStack spacing={1}>
      <Box
        w={size}
        h={size}
        bg={color}
        borderRadius="full"
        animation={`${bounce} 1.4s infinite ease-in-out both`}
        animationDelay="0s"
      />
      <Box
        w={size}
        h={size}
        bg={color}
        borderRadius="full"
        animation={`${bounce} 1.4s infinite ease-in-out both`}
        animationDelay="0.2s"
      />
      <Box
        w={size}
        h={size}
        bg={color}
        borderRadius="full"
        animation={`${bounce} 1.4s infinite ease-in-out both`}
        animationDelay="0.4s"
      />
    </HStack>
  );
}