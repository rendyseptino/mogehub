"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { MdVerified } from "react-icons/md";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

export default function DashboardTourModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const bg = useColorModeValue("white", "gray.800");
  const text = useColorModeValue("gray.800", "whiteAlpha.900");

  const active = useColorModeValue("blue.500", "blue.300");
  const inactive = useColorModeValue("gray.300", "gray.600");

  const totalSteps = 5;

  const next = () => setStep((s) => Math.min(s + 1, totalSteps));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleSkip = () => {
    setStep(1);
    onClose();
  };

  const StepIndicator = () => {
  return (
    <Flex align="center" justify="center" mb={6}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const index = i + 1;

        const isDone = step > index;
        const isCurrent = step === index;
        const isPending = step < index;

        return (
          <Flex key={index} align="center">
            {/* Circle */}
            <Box
              w="28px"
              h="28px"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="sm"
              fontWeight="bold"
              
              bg={
                isDone || isCurrent
                  ? "brand.500"
                  : "gray.300"
              }

              color={
                isDone || isCurrent
                  ? "black"
                  : "gray.600"
              }

              boxShadow={
                isCurrent
                  ? "0 0 12px rgba(59,130,246,0.4)"
                  : "none"
              }

              transition="0.2s"
            >
              {index}
            </Box>

            {/* Line */}
            {index !== totalSteps && (
              <Box
                w="32px"
                h="2px"
                mx={2}
                bg={
                  step > index
                    ? "brand.500"
                    : "gray.300"
                }
                transition="0.2s"
              />
            )}
          </Flex>
        );
      })}
    </Flex>
  );
};
  return (
    <Modal
    isOpen={isOpen}
    onClose={handleClose}
    isCentered
    size="lg"
    closeOnOverlayClick={false}
    closeOnEsc={false}
    motionPreset="fade"
    >
         <ModalOverlay backdropFilter="blur(8px)" />

      <ModalContent bg={bg} color={text} borderRadius="xl" px={2} py={2}>
        
        {/* STEP INDICATOR */}
        <Box pt={5}>
          <StepIndicator />
        </Box>

        <ModalBody pb={6}>
          
          {/* STEP 1 */}
          {step === 1 && (
            <Box textAlign="center">

                <Flex justify="center" mb={3}>
                <Text fontSize="50px">👋</Text>
                </Flex>

                <Text fontSize="2xl" fontWeight="bold" mb={2}>
                {t.tour.step1.title}
                </Text>

                <Text fontSize="sm" color="gray.500">
                {t.tour.step1.desc}
                </Text>

                <Text fontSize="sm" mt={2} color="blue.400" fontWeight="semibold">
                {t.tour.step1.cta}
                </Text>

            </Box>
            )}

          {/* STEP 2 */}
          {step === 2 && (
            <Box textAlign="center">

                <Flex justify="center" mb={3}>
                <Text fontSize="50px">💳</Text>
                </Flex>

                <Text fontSize="2xl" fontWeight="bold" mb={2}>
                {t.tour.step2.title}
                </Text>

                <Text fontSize="sm" color="gray.500">
               {t.tour.step2.desc}
                </Text>

                <Text fontSize="sm" mt={2} color="blue.400" fontWeight="semibold">
                {t.tour.step2.cta}
                </Text>

            </Box>
            )}

          {/* STEP 3 */}
          {step === 3 && (
        <Box textAlign="center">

            <Flex justify="center" mb={3}>
            <Text fontSize="50px">🚀</Text>
            </Flex>

            <Text fontSize="2xl" fontWeight="bold" mb={2}>
           {t.tour.step3.title}
            </Text>

            <Text fontSize="sm" color="gray.500">
            {t.tour.step3.desc}
            </Text>

            <Text fontSize="sm" mt={2} color="blue.400" fontWeight="semibold">
           {t.tour.step3.cta}
            </Text>

        </Box>
        )}

          {/* STEP 4 */}
            {step === 4 && (
            <Box textAlign="center">
                
                {/* ICON VERIFIED */}
                <Flex justify="center" mb={3}>
                <Box
                    fontSize="60px"
                    color="#1DA1F2"
                    filter="drop-shadow(0 0 10px rgba(29,161,242,0.6))"
                >
                    <MdVerified />
                </Box>
                </Flex>

                <Text fontSize="2xl" fontWeight="bold" mb={2}>
                {t.tour.step4.title}
                </Text>

                <Text fontSize="sm" color="gray.500">
                {t.tour.step4.desc}
                </Text>

                <Text fontSize="sm" mt={2} color="blue.400" fontWeight="semibold">
               {t.tour.step4.cta}
                </Text>
            </Box>
            )}

          {/* STEP 5 */}
          {step === 5 && (
  <Box textAlign="center">

    <Flex justify="center" mb={3}>
      <Text fontSize="50px">⚙️</Text>
    </Flex>

    <Text fontSize="2xl" fontWeight="bold" mb={2}>
       {t.tour.step5.title}
    </Text>

    <Text fontSize="sm" color="gray.500">
     {t.tour.step5.desc}
    </Text>

    <Text fontSize="sm" mt={2} color="blue.400" fontWeight="semibold">
     {t.tour.step5.cta}
    </Text>

  </Box>
)}
        </ModalBody>

        <ModalFooter justifyContent="space-between">
          
          {/* LEFT */}
          <Box>
            {step === 1 && (
              <Button variant="ghost" onClick={handleSkip}>
                {t.tour.skip}
              </Button>
            )}

            {step > 1 && (
              <Button variant="ghost" onClick={back}>
                {t.tour.back}
              </Button>
            )}
          </Box>

          {/* RIGHT */}
          <Box>
            {step < totalSteps && (
              <Button
                bg="brand.500"
                color="black"
                _hover={{ bg: "brand.600" }}
                onClick={next}
                >
               {t.tour.next}
                </Button>
            )}

            {step === totalSteps && (
              <Button colorScheme="green" onClick={handleClose}>
                {t.tour.finish}
              </Button>
            )}
          </Box>

        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}