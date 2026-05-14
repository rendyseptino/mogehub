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
  Text,
} from "@chakra-ui/react";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };


export default function LinkModal({ isOpen, onClose, onSubmit }) {
  const [url, setUrl] = useState("");
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>{t.link_modal_title}</ModalHeader>

        <ModalBody>
          <Text fontSize="sm" mb={2}>
            {t.link_modal_intro}
          </Text>

          <Text fontSize="sm" mb={2}>
            {t.link_modal_how}
          </Text>

          <Text fontSize="sm" pl={3} mb={2}>
            {t.link_modal_step_1}<br />
           {t.link_modal_step_2}<br />
            {t.link_modal_step_3}
          </Text>

          <Input
            placeholder="https://example.com"
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
            Apply
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}