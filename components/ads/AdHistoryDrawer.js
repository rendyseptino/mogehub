import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Spinner,
  Box,
  Text,
  Badge,
  Image,
  Flex,
} from "@chakra-ui/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdHistoryDrawer({ isOpen, onClose, loadHistory }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const getBadgeColor = (status) => {
    if (status === "pending_review") return "yellow";
    if (status === "rejected") return "red";
    if (status === "active") return "green";
    if (status === "inactive") return "gray";
    if (status === "expired") return "purple";
    return "gray";
  };

  const getStatusLabel = (status) => {
    if (status === "pending_review") return "Dalam Review";
    if (status === "rejected") return "Ditolak";
    if (status === "active") return "Aktif";
    if (status === "inactive") return "Nonaktif";
    if (status === "expired") return "Expired";
    return status;
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>History Iklan</DrawerHeader>

        <DrawerBody>
          {loading && <Spinner />}

          {!loading && items.length === 0 && (
            <Text fontSize="sm">Belum ada history.</Text>
          )}

          {!loading &&
            items.map((i) => (
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
                    <Text fontWeight="bold" mb={1} noOfLines={2}>
                      {i.title}
                    </Text>

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
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}