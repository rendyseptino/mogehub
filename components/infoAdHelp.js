"use client";

import { useState, useEffect } from "react";
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

import { MdLiveHelp } from "react-icons/md";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

export default function InfoAdHelp() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  

  const [understood, setUnderstood] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ================= THEME =================
  const floatBg = useColorModeValue("brand.500", "brand.400");
  const floatHover = useColorModeValue("brand.600", "brand.500");

  const modalBg = useColorModeValue("white", "gray.800");
  const modalText = useColorModeValue("gray.800", "whiteAlpha.900");
  const modalSubText = useColorModeValue("gray.600", "gray.300");

  const hintBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const hintBorder = useColorModeValue("gray.200", "whiteAlpha.200");

  // ================= SAFE MOBILE DETECTION =================
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      {/* ================= FLOATING BUTTON ================= */}
      <Box
        position="fixed"
        bottom={{ base: "18px", md: "24px" }}
        right={{ base: "18px", md: "24px" }}
        zIndex={1200}
      >
        {isMobile ? (
          <IconButton
            onClick={onOpen}
            icon={<MdLiveHelp size={22} />}
            bg={floatBg}
            color="black"
            _hover={{ bg: floatHover }}
            borderRadius="full"
            size="lg"
            boxShadow="lg"
            aria-label="Help"
          />
        ) : (
          <Button
            onClick={onOpen}
            bg={floatBg}
            color="black"
            _hover={{ bg: floatHover }}
            borderRadius="full"
            boxShadow="lg"
            leftIcon={<MdLiveHelp size={20} />}
          >
            {t.info_ad_help_button}
          </Button>
        )}
      </Box>

      {/* ================= MODAL ================= */}
      <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="lg"
      motionPreset="scale"
    >
      <ModalOverlay
        bg="blackAlpha.700"
        backdropFilter="blur(10px)"
      />

      <ModalContent
        bg={modalBg}
        borderRadius="2xl"
        border="1px solid"
        borderColor={useColorModeValue("blackAlpha.100", "whiteAlpha.200")}
        boxShadow="0 25px 80px rgba(0,0,0,0.45)"
        overflow="hidden"
      >

          <ModalHeader color={modalText}>
            {t.info_ad_help_title}
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
                  lineHeight="1.2"
                >
                  {t.info_ad_help_how_it_works}
                </Text>

                <Text fontSize="md" color={modalSubText} lineHeight="1.7">
                  {t.info_ad_help_description_1}
                  <br /><br />

                   {t.info_ad_help_description_2}
                  <br />
                 • {t.info_ad_help_product_ad}<br />
                  • {t.info_ad_help_banner_ad}<br /><br />

                   {t.info_ad_help_description_3}
                  <br /><br />

                 {t.info_ad_help_description_4}
                  <br /><br />

                  {t.info_ad_help_description_5}
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
              {t.info_ad_help_understand}
            </Button>
          </ModalFooter>

        </ModalContent>
      </Modal>
    </>
  );
}