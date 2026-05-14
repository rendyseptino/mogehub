"use client";

import { Button } from "@chakra-ui/react";
import { useRouter } from "next/router";

// 🔥 IMPORT LANGUAGE
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

const translations = { en, id };

export default function PreviewAds({ adId, status }) {
  const router = useRouter();

  // 🌍 LANGUAGE
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  // ❌ Jangan tampil kalau bukan active
  if (status !== "active") return null;

  const handlePreview = () => {
    router.push(`/ad/${adId}`);
  };

  return (
    <Button
      size="sm"
      colorScheme="blue"
      variant="outline"
      onClick={handlePreview}
      w="fit-content"
    >
      {t.previewAd || "Preview"}
    </Button>
  );
}