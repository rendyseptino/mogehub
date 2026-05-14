"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Text,
  IconButton,
  useDisclosure,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
} from "@chakra-ui/react";

import { BsInfoCircleFill } from "react-icons/bs";

import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

const translations = { en, id };

export default function BannerAdsHelp() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [understood, setUnderstood] = useState(false);

  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const modalBg = useColorModeValue("white", "gray.800");
  const modalText = useColorModeValue("gray.800", "whiteAlpha.900");
  const modalSubText = useColorModeValue("gray.600", "gray.300");

  const hintBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const hintBorder = useColorModeValue("gray.200", "whiteAlpha.200");

  const glowColor = useColorModeValue("#90cdf4", "#ceff00");

  const glowMid = useColorModeValue(
    `0 0 10px ${glowColor}aa, 0 0 20px ${glowColor}66`,
    `0 0 14px ${glowColor}cc`
  );

  const glowHover = useColorModeValue(
    `0 0 12px ${glowColor}, 0 0 22px ${glowColor}88`,
    `0 0 10px ${glowColor}`
  );

  return (
    <>
      <IconButton
        icon={<BsInfoCircleFill />}
        aria-label="Banner Ads Help"
        variant="ghost"
        size="sm"
        onClick={onOpen}
        bg={useColorModeValue("#ceff00", "transparent")}
        boxShadow={`0 0 0px ${glowColor}`}
        transition="all 0.3s ease-in-out"
        _after={{
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          boxShadow: glowMid,
          opacity: 0.6,
          animation: "pulseFade 2s ease-in-out infinite",
        }}
        sx={{
          "@keyframes pulseFade": {
            "0%": { opacity: 0 },
            "50%": { opacity: 1 },
            "100%": { opacity: 0 },
          },
        }}
        _hover={{
          transform: "scale(1.05)",
          boxShadow: glowHover,
        }}
      />

      <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="lg"
      motionPreset="scale"
    >
      <ModalOverlay
        bg="blackAlpha.750"
        backdropFilter="blur(12px)"
      />

      <ModalContent
        bg={modalBg}
        borderRadius="2xl"
        border="1px solid"
        borderColor={useColorModeValue("blackAlpha.100", "whiteAlpha.200")}
        boxShadow="0 30px 90px rgba(0,0,0,0.55)"
        overflow="hidden"
      >

          <ModalHeader color={modalText}>
            {t.bannerHelpTitle}
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody>
            <VStack align="start" spacing={4}>
              <Box
                w="full"
                p={5}
                borderRadius="xl"
                bg={hintBg}
                border="1px solid"
                borderColor={hintBorder}
              >
                <Text
                  fontSize="lg"
                  fontWeight="extrabold"
                  mb={4}
                  color={modalText}
                >
                  {t.bannerHelpSubtitle}
                </Text>

                <Text
                  fontSize="md"
                  color={modalSubText}
                  lineHeight="1.7"
                  whiteSpace="pre-line"
                >
                  {t.bannerHelpDesc}
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              w="full"
              bg="brand.500"
              color="black"
              _hover={{ bg: "brand.400" }}
              onClick={() => {
                setUnderstood(true);
                onClose();
              }}
            >
              {t.understand}
            </Button>
          </ModalFooter>

        </ModalContent>
      </Modal>
    </>
  );
}