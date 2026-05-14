"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  useColorMode,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { FaBell } from "react-icons/fa";
import { useRouter } from "next/router";
import BottomNavbar from "../../components/BottomNavbar"; // pastikan path sesuai
import { mobileOnly } from "../../utils/responsive"; // utils responsive

export default function NotLoggedInActivity() {
  const router = useRouter();
  const { colorMode } = useColorMode();

  const bgColor = { light: "gray.50", dark: "gray.800" };
  const textColor = { light: "gray.700", dark: "gray.100" };
  const loginBtnText = { light: "black", dark: "white" };
  const signUpTextColor = "black";

  return (
    <Flex
      direction="column"
      w="100vw"
      h="100vh"
      align="center"
      justify="flex-start"
      bg={bgColor[colorMode]}
      px={{ base: 4, md: 8 }}
      pt={{ base: 24, md: 32 }} // naikin konten lebih ke atas
    >
      <VStack spacing={{ base: 6, md: 8 }} flex="1" justify="flex-start">
        {/* Icon Bell */}
        <Box
          bg="#90cdf4"
          borderRadius="full"
          p={{ base: 6, md: 8 }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={{ base: 4, md: 6 }}
        >
          <FaBell size={80} color="white" />
        </Box>

        {/* Title */}
        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          textAlign="center"
          color={textColor[colorMode]}
        >
          You're not signed in
        </Text>

        {/* Subtitle */}
        <Text
          fontSize={{ base: "md", md: "lg" }}
          textAlign="center"
          color={textColor[colorMode]}
          maxW={{ base: "250px", md: "350px" }}
        >
          Login to see your activity
        </Text>

        {/* Buttons */}
        <HStack spacing={{ base: 3, md: 4 }} mt={{ base: 4, md: 6 }}>
          <Button
            onClick={() => router.push("/login")}
            bg={colorMode === "light" ? "gray.300" : "gray.700"}
            color={loginBtnText[colorMode]}
            borderRadius="full"
            px={{ base: 6, md: 8 }}
            py={{ base: 3, md: 4 }}
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="bold"
            _hover={{
              bg: colorMode === "light" ? "gray.400" : "gray.600",
            }}
          >
            Login
          </Button>

          <Button
            onClick={() => router.push("/register")}
            bg="brand.500"
            color={signUpTextColor}
            borderRadius="full"
            px={{ base: 6, md: 8 }}
            py={{ base: 3, md: 4 }}
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="bold"
            _hover={{ bg: "brand.600" }}
          >
            Signup
          </Button>
        </HStack>
      </VStack>

      {/* Bottom Navbar */}
      <Box w="100%" display={mobileOnly} mt={{ base: 8, md: 10 }}>
        <BottomNavbar />
      </Box>
    </Flex>
  );
}