"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Image,
  Text,
  VStack,
  Spinner,
  IconButton,
  Flex,
  HStack,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { BiTrash } from "react-icons/bi";
import { IoHeartDislike } from "react-icons/io5";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

const translations = { en, id };

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export default function WishlistAdPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [page, setPage] = useState(1);
  const perPage = 7;

  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const cardBg = useColorModeValue("white", "gray.800");
  const emptyBg = useColorModeValue(
    "rgba(255,255,255,0.75)",
    "rgba(255,255,255,0.04)"
  );

  const borderColor = useColorModeValue(
    "rgba(0,0,0,0.06)",
    "rgba(255,255,255,0.08)"
  );

  // ================= FETCH DATA =================
  const fetchFavorites = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "https://api.mogehub.com/api/ad/user/favorites",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setFavorites(data.favorites || []);
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchFavorites();
  }, [token]);

  useEffect(() => {
    const socket = window.socket;
    if (!socket) return;

    socket.on("wishlist:add", (newItem) => {
      setFavorites((prev) => [newItem, ...prev]);
    });

    socket.on("wishlist:remove", (adId) => {
      setFavorites((prev) =>
        prev.filter((item) => item.ad.id !== adId)
      );
    });

    return () => {
      socket.off("wishlist:add");
      socket.off("wishlist:remove");
    };
  }, []);

  // ================= REMOVE =================
  const handleRemove = async (adId) => {
    try {
      await fetch(`https://api.mogehub.com/api/ad/${adId}/favorite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFavorites((prev) =>
        prev.filter((item) => item.ad.id !== adId)
      );

      const socket = window.socket;
      if (socket) {
        socket.emit("wishlist:remove");
      }
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  // ================= PAGINATION =================
  const start = (page - 1) * perPage;
  const paginated = favorites.slice(start, start + perPage);
  const totalPages = Math.ceil(favorites.length / perPage);

  // ================= UI =================
  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Box p={5}>
      <Text fontSize="2xl" fontWeight="bold" mb={5}>
        {t.wishlist_page_title}
      </Text>

      {favorites.length === 0 ? (
        <MotionFlex
          direction="column"
          align="center"
          justify="center"
          minH="65vh"
          textAlign="center"
          px={6}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* PREMIUM GLOW CARD */}
          <MotionBox
            position="relative"
            p={{ base: 8, md: 10 }}
            borderRadius="32px"
            bg={emptyBg}
            border="1px solid"
            borderColor={borderColor}
            backdropFilter="blur(18px)"
            overflow="hidden"
            boxShadow="0 10px 50px rgba(0,0,0,0.18)"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* background glow */}
            <Box
              position="absolute"
              top="-80px"
              left="50%"
              transform="translateX(-50%)"
              w="220px"
              h="220px"
              bg="brand.500"
              opacity={0.12}
              filter="blur(90px)"
              borderRadius="full"
            />

            {/* ICON */}
            <MotionBox
              animate={{
                scale: [1, 1.08, 1],
                rotate: [0, -4, 4, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <IoHeartDislike size={90} />
            </MotionBox>

            {/* TITLE */}
            <Text
              mt={6}
              fontSize="2xl"
              fontWeight="extrabold"
            >
              {t.wishlist_empty_title}
            </Text>

            {/* SUBTEXT */}
           <Text
            mt={3}
            maxW="420px"
            color="gray.500"
            lineHeight="1.8"
            fontSize="sm"
          >
            {t.wishlist_empty_description}
          </Text>

            {/* BUTTON */}
            <MotionBox
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.96,
              }}
            >
              <Button
                mt={7}
                size="lg"
                bg="brand.500"
                color="black"
                _hover={{
                  bg: "brand.400",
                }}
                borderRadius="full"
                px={8}
                onClick={() => router.push("/allads")}
              >
                {t.wishlist_empty_button}
              </Button>
            </MotionBox>
          </MotionBox>
        </MotionFlex>
      ) : (
        <Grid
          templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
          gap={5}
        >
          {paginated.map((item) => {
            const ad = item.ad;
            const image = ad.media?.[0]?.url;

            return (
              <Box
                key={ad.id}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                position="relative"
                cursor="pointer"
                bg={cardBg}
                _hover={{ transform: "scale(1.02)" }}
                transition="0.2s"
              >
                {/* IMAGE */}
                <Image
                  src={image}
                  alt={ad.title}
                  w="100%"
                  h="150px"
                  objectFit="cover"
                  onClick={() => router.push(`/ad/${ad.id}`)}
                />

                {/* REMOVE BUTTON */}
                <IconButton
                  icon={<BiTrash />}
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                  bg="red.500"
                  color="white"
                  _hover={{ bg: "red.600" }}
                  onClick={() => handleRemove(ad.id)}
                />

                {/* INFO */}
                <VStack p={3} align="start">
                  <Text fontWeight="bold" noOfLines={2}>
                    {ad.title}
                  </Text>

                  <Text fontSize="sm" color="gray.500">
                    {ad.city}
                  </Text>
                </VStack>
              </Box>
            );
          })}
        </Grid>
      )}

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <HStack mt={6} justify="center">
          <Button
            onClick={() => setPage((p) => p - 1)}
            isDisabled={page === 1}
          >
            {t.pagination_prev}
          </Button>

          <Text>
            {t.pagination_page} {page} / {totalPages}
          </Text>

          <Button
            onClick={() => setPage((p) => p + 1)}
            isDisabled={page === totalPages}
          >
            {t.pagination_next}
          </Button>
        </HStack>
      )}
    </Box>
  );
}