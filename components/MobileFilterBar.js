"use client";

import { Box, Flex, Button, useColorModeValue } from "@chakra-ui/react";
import { LuFilter } from "react-icons/lu";

export default function MobileFilterBar({ onOpen }) {
  const bg = useColorModeValue("white", "gray.900");

  return (
    <Box
      display={{ base: "block", lg: "none" }}
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      zIndex="1000"
      bg={bg}
      borderTop="1px solid"
      borderColor="gray.200"
      px={4}
      py={3}
    >
      <Flex justify="center">
        <Button
        w="100%"
        maxW="400px"
        bg="#ceff00"
        color="black"
        _hover={{ bg: "#bfff00" }}
        onClick={onOpen}
        leftIcon={<LuFilter />}
        >
        Filter
        </Button>
      </Flex>
    </Box>
  );
}