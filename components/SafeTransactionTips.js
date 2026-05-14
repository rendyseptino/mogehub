"use client";

import {
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";

import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { FaShieldAlt } from "react-icons/fa";

import { useLanguageContext } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";

export default function SafeTransactionTips() {
  const { language } = useLanguageContext();
  const t = language === "en" ? en : id;

  const sectionBg = useColorModeValue("gray.100", "gray.700"); // Card bg mengikuti mode
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900"); // Text mengikuti mode

  const tips = [
    t["safe_tip_1"] || "Avoid paying before meeting the seller",
    t["safe_tip_2"] || "Meet in a public place for transactions",
    t["safe_tip_3"] || "Check seller profile and history",
    t["safe_tip_4"] || "Be cautious with prices that are too cheap",
    t["safe_tip_5"] || "Report suspicious listings to MogeHub",
  ];

  return (
    <>
      {/* CARD UTAMA */}
      <Box
        mt={6}
        p={5}
        borderRadius="md"
        bg={sectionBg}
        border="2px solid #90cdf4"
        position="relative"
      >
        {/* TITLE */}
        <HStack mb={3}>
          <Icon as={FaShieldAlt} boxSize={5} color={textColor} />
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            {t["safe_transaction"] || "Safe Transaction Tips"}
          </Text>
        </HStack>

        {/* TIPS */}
        <VStack align="start" spacing={2}>
          {tips.map((tip, idx) => (
            <HStack key={idx} align="start">
              <Icon
                as={IoShieldCheckmarkSharp}
                mt="3px"
                color="green.600"
                boxSize={5}
              />
              <Text fontSize="sm" fontWeight="bold" color={textColor}>
                {tip}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* WARNING SECTION TERPISAH FULLWIDTH */}
      <Box
        mt="-20px" // nempel ke bawah card
        bg="#90cdf4"
        mx={0} // fullwidth
        px={5}
        py={3}
        borderBottomRadius="md"
      >
        <HStack align="start">
          <Text mt="3px" fontSize="lg">
            ⚠️
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="black">
            {t["mogehub_warning"] ||
              "MogeHub never asks for payments outside the platform."}
          </Text>
        </HStack>
      </Box>
    </>
  );
}