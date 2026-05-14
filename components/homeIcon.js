"use client";

import { IconButton, useColorModeValue } from "@chakra-ui/react";
import { GoHome } from "react-icons/go";
import { useRouter } from "next/router";

export default function HomeIcon() {
  const router = useRouter();

  return (
    <IconButton
      icon={<GoHome size={22} />}
      aria-label="Home"
      onClick={() => router.push("/")}
      borderRadius="full"
      size="lg"
      bg={useColorModeValue("gray.100", "gray.700")}
      color={useColorModeValue("black", "white")}
      _hover={{
        bg: useColorModeValue("gray.200", "gray.600"),
        transform: "scale(1.1)",
      }}
      transition="all 0.2s"
      boxShadow="md"
    />
  );
}