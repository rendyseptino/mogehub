import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Spinner,
  useColorModeValue,
  Box,
  Text,
  Badge,
  Image,
  Flex,
} from "@chakra-ui/react";
import { timeAgo } from "@/utils/timeAgo";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };


const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdHistoryDrawer({ isOpen, onClose, loadHistory }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 7;
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  const timeAgoColor = useColorModeValue("gray.500", "gray.200");


  useEffect(() => {
  if (isOpen) setPage(1);
}, [isOpen]);
  

  useEffect(() => {
    if (!isOpen) return;

    if (typeof loadHistory !== "function") {
      console.error("loadHistory is not a function");
      return;
    }

    setLoading(true);

    loadHistory()
      .then((res) => {
        const fixed = (res || []).map((i) => {
          const rawThumb =
            i.thumbnail ||
            i.imageUrl ||
            i.image_url ||
            null;

          let finalThumb = null;

          if (rawThumb) {
            // ✅ kalau backend sudah kirim signed url S3
            if (
              rawThumb.startsWith("http://") ||
              rawThumb.startsWith("https://")
            ) {
              finalThumb = rawThumb;
            }
            // ❌ jangan pernah render s3:// langsung di browser
            else if (rawThumb.startsWith("s3://")) {
              finalThumb = null;
            }
            // ✅ path relatif backend (banners/xxx.png, uploads/xxx.png, dll)
            else {
              const clean =
                rawThumb.startsWith("/")
                  ? rawThumb
                  : `/${rawThumb}`;

              finalThumb = `${BASE_URL}${clean}`;
            }
          }

          return {
            ...i,
            thumbnail: finalThumb,
          };
        });

        setItems(fixed);
      })
      .catch((err) => {
        console.error("loadHistory error:", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [isOpen, loadHistory]);

  const paginatedItems = items.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const getBadgeColor = (status) => {
    if (status === "pending_review") return "yellow";
    if (status === "rejected") return "red";
    if (status === "active") return "green";
    if (status === "inactive") return "gray";
    if (status === "expired") return "purple";
    return "gray";
  };

 const getStatusLabel = (status) => {
  if (status === "pending_review") return t.adHistory.status.pending;
  if (status === "rejected") return t.adHistory.status.rejected;
  if (status === "active") return t.adHistory.status.active;
  if (status === "inactive") return t.adHistory.status.inactive;
  if (status === "expired") return t.adHistory.status.expired;
  return status;
};

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{t.adHistory.title}</DrawerHeader>

        <DrawerBody>
          {loading && <Spinner />}

          {!loading && items.length === 0 && (
            <Text fontSize="sm">{t.adHistory.empty}</Text>
          )}

          {!loading &&
            paginatedItems.map((i) => (
              <Box
                key={`${i.type || "ad"}-${i.id}`}
                borderWidth="1px"
                borderRadius="md"
                p={3}
                mb={3}
              >
                <Flex gap={3} align="center">
                  {i.thumbnail && (
                    <Image
                      src={i.thumbnail}
                      alt={i.title}
                      boxSize="70px"
                      objectFit="cover"
                      borderRadius="md"
                      fallbackSrc="https://via.placeholder.com/70"
                    />
                  )}

                  <Box flex="1">
                    <Box position="relative">
  
                    {/* BADGE TYPE (POJOK KANAN) */}
                    <Badge
                      position="absolute"
                      top="0"
                      right="0"
                      fontSize="xs"
                      colorScheme={i.type === "banner" ? "purple" : "blue"}
                    >
                      {i.type === "banner"
                      ? t.adHistory.type.banner
                      : t.adHistory.type.product}
                    </Badge>

                    <Text fontWeight="bold" mb={1} noOfLines={2} pr={16}>
                      {i.title}
                    </Text>

                    <Text fontSize="xs" color={timeAgoColor}>
                      {timeAgo(i.createdAt, language)}
                    </Text>

                  </Box>

                    <Badge colorScheme={getBadgeColor(i.status)}>
                      {getStatusLabel(i.status)}
                    </Badge>

                    {i.status === "rejected" && i.rejectReason && (
                      <Text mt={2} fontSize="sm" color="red.500">
                        {i.rejectReason}
                      </Text>
                    )}
                  </Box>
                </Flex>
              </Box>
            ))}
            {/* 🔥 PAGINATION TARUH DI SINI (PALING BAWAH LIST) */}
          {items.length > pageSize && (
            <Flex justify="center" mt={4} gap={2}>
              
              <Badge
                cursor="pointer"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                 {t.adHistory.pagination.prev}
              </Badge>

              <Text fontSize="sm">
                {page} / {Math.ceil(items.length / pageSize)}
              </Text>

              <Badge
                cursor="pointer"
                onClick={() =>
                  setPage((p) =>
                    Math.min(p + 1, Math.ceil(items.length / pageSize))
                  )
                }
              >
               {t.adHistory.pagination.next}
              </Badge>

            </Flex>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}