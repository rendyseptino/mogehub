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

import { MdLiveHelp } from "react-icons/md";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };


export default function SubscriptionHelp() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [understood, setUnderstood] = useState(false);

  // ================= FLOATING BUTTON STYLE =================
  const floatBg = useColorModeValue("brand.500", "brand.400");
  const floatHover = useColorModeValue("brand.600", "brand.500");

  // MOBILE DETECTION SIMPLE
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // ================= MODAL STYLE =================
  const modalBg = useColorModeValue("white", "gray.800");
  const modalText = useColorModeValue("gray.800", "whiteAlpha.900");
  const modalSubText = useColorModeValue("gray.600", "gray.300");

  const hintBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const hintBorder = useColorModeValue("gray.200", "whiteAlpha.200");

  return (
    <>
      {/* ================= FLOATING BUTTON ================= */}
      <Box
        position="fixed"
        bottom={{ base: "18px", md: "24px" }}
        right={{ base: "18px", md: "24px" }}
        zIndex={1200}   // 🔥 di bawah modal/drawer chakra (biasanya 1300+)
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
          {t.floating_help}
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
            {t.titleHelpSubscription}
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
                letterSpacing="-0.2px"
                >
                {t.section_title}
                </Text>

                <Text fontSize="md" color={modalSubText} lineHeight="1.7">
              {t.subscription_help.description_paragraphs.map((p, i) => (
                <Box key={i} mb={3}>
                  {p}
                </Box>
              ))}
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
             {t.understood_button}
            </Button>
          </ModalFooter>

        </ModalContent>
      </Modal>
    </>
  );
}