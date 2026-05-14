import {
  Box,
  Text,
  Image,
  VStack,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";

import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

const translations = { en, id };


export default function BannerPreviewCompare({ file, existingImage }) {
  const src = file ? URL.createObjectURL(file) : existingImage;
  const bg = useColorModeValue("white", "gray.800");
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  return (
    <VStack align="stretch" spacing={3} mt={4}>
      

      {/* WRAPPER DIPAKSA MOBILE WIDTH */}
      <Box
        w="100%"
        maxW="375px"   // 🔥 INI KUNCI: FIX JADI MOBILE SIZE
        mx="auto"      // center di desktop
      >
        <Badge mb={2} colorScheme="purple">
         {t.mobilePreview}
        </Badge>

        <Box
          w="100%"
          borderRadius="lg"
          overflow="hidden"
          bg={bg}
        >
          <Image
            src={src}
            w="100%"
            h="160px"
            objectFit="cover"
            objectPosition="center"
          />
        </Box>

        
      </Box>

    </VStack>
  );
}