import { Button } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ViewIcon } from "@chakra-ui/icons";

// ✅ LANGUAGE CONTEXT
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

const translations = { en, id };

export default function PreviewBanner({ bannerId }) {
  const router = useRouter();

  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const handlePreview = () => {
    if (!bannerId) return;
    router.push(`/ad-banner/${bannerId}`);
  };

  return (
    <Button
      size="sm"
      leftIcon={<ViewIcon />}
      colorScheme="blue"
      variant="outline"
      onClick={handlePreview}
    >
      {t.bannerPreview}
    </Button>
  );
}