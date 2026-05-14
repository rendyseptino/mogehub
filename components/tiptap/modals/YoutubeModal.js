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
  Link,
} from "@chakra-ui/react";

import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

export default function YoutubeModal({ isOpen, onClose, onSubmit }) {
  const [url, setUrl] = useState("");
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>{t.youtube_modal_title}</ModalHeader>

        <ModalBody>
          <Text fontSize="sm" mb={2}>
          {t.youtube_modal_intro}{" "}
          <br />
          {t.youtube_modal_help}{" "}
          <Link
            href="https://support.google.com/youtube/answer/57741"
            target="_blank"
            color="blue.500"
            textDecoration="underline"
          >
             {t.youtube_modal_help_link}
          </Link>
        </Text>

          <Input
            placeholder="https://www.youtube.com/watch?v=..."
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