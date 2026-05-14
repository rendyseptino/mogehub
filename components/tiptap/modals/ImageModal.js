"use client";

import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Box,
  Text,
} from "@chakra-ui/react";

import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };


export default function ImageModal({ isOpen, onClose, onSubmit }) {
  const [url, setUrl] = useState("");
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>{t.image_modal_title}</ModalHeader>

        <ModalBody>
          <Text fontSize="sm" mb={2}>
             {t.image_modal_intro}
          </Text>

          <Box fontSize="sm" mb={2}>
            <Text>{t.image_modal_step_desktop}</Text>
            <Text pl={3}>{t.image_modal_step_desktop_desc}</Text>
          </Box>

          <Box fontSize="sm" mb={2}>
            <Text>{t.image_modal_step_mobile}</Text>
            <Text pl={3}>
              {t.image_modal_step_mobile_desc}
            </Text>
          </Box>

          <Box fontSize="sm" mb={2}>
            <Text>{t.image_modal_step_input}</Text>
            <Text pl={3}>
              {t.image_modal_step_input_desc}
            </Text>
          </Box>

          <Input
            placeholder="https://image-url.com/image.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            onClick={() => {
              if (!url) return;
              onSubmit(url);
              setUrl("");
              onClose();
            }}
          >
            Insert
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}