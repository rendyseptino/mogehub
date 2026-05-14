"use client";

import {
  Box,
  Text,
  Image,
  Flex,
  Badge,
  Avatar,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { useRouter } from "next/router";
import VerifiedBadge from "./VerifiedBadge";
import { useLanguageContext } from "@/context/LanguageContext";
import { timeAgo } from "@/utils/timeAgo";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

export default function SimilarAds({ adId }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  // ===== THEME =====
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const priceColor = useColorModeValue("gray.900", "white");
  const subText = useColorModeValue("gray.500", "gray.400");

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ad/${adId}/similar`
        );

        if (!res.ok) throw new Error("Failed to fetch similar ads");

        const data = await res.json();
        setAds(data.similarAds || []);
      } catch (err) {
        console.error("Failed to load similar ads", err);
      } finally {
        setLoading(false);
      }
    };

    if (adId) fetchSimilar();
  }, [adId]);

  // ===== IMAGE =====
  const getImage = (ad) => {
    if (!ad?.media) return "https://via.placeholder.com/400x300";

    if (Array.isArray(ad.media)) {
      return ad.media?.[0]?.url || ad.media?.[0];
    }

    return ad.media?.url || "https://via.placeholder.com/400x300";
  };

  // ===== SELLER =====
  const getSellerName = (ad) => {
  if (!ad) return "Unknown";

  if (ad.isDealer) {
    return ad.dealerName || ad.username || "Dealer";
  }

  return ad.username || "Unknown";
};
  const getProfilePhoto = (ad) => ad.profilePhoto || "";
  const isVerified = (ad) =>
  ad.sellerVerified === true ||
  ad.verification?.status === "approved";

  

  if (!ads.length && !loading) return null;

  return (
    <Box mt={12} mb={10} px={4} maxW="1200px" mx="auto">
      {/* TITLE */}
      <Text fontSize="xl" fontWeight="bold" mb={4} color={textColor}>
        {t.similar_ads}
      </Text>

      {/* LOADING */}
      {loading && (
        <Text fontSize="sm" color={subText}>
         {t.loading_similar_ads}
        </Text>
      )}

      {/* MARQUEE */}
      {!loading && ads.length > 0 && (
        <Marquee speed={40} gradient={false} pauseOnHover loop={0}>
          <Box display="flex" gap={4} py={2}>
            {ads.map((ad) => (
              <Box
                key={ad.id}
                minW="270px"
                maxW="270px"
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="14px"
                overflow="hidden"
                cursor="pointer"
                onClick={() => router.push(`/ad/${ad.id}`)}
                _hover={{
                  transform: "translateY(-3px)",
                  transition: "0.2s",
                }}
              >
                {/* IMAGE */}
                <Box h="160px" bg="gray.100">
                  <Image
                    src={getImage(ad)}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                </Box>

                {/* CONTENT */}
                <Box p={3}>
                  {/* TITLE */}
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={textColor}
                    noOfLines={1}
                  >
                    {ad.title}
                  </Text>

                  {/* PRICE */}
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={priceColor}
                    mt={1}
                  >
                    {ad.currency} {ad.price?.toLocaleString()}
                  </Text>

                  {/* CITY */}
                  <Flex justify="space-between" mt={2} align="center">
                    <Badge fontSize="10px" colorScheme="green">
                      {ad.city || "Unknown"}
                    </Badge>
                  </Flex>

                 <HStack mt={3} spacing={2} justify="space-between" w="100%">
  
                {/* LEFT SIDE: SELLER */}
                <HStack spacing={2}>
                    <Avatar
                    size="xs"
                    src={getProfilePhoto(ad)}
                    name={getSellerName(ad)}
                    />

                    <Text fontSize="sm" fontWeight="bold" color={textColor}>
                    {getSellerName(ad)}
                    </Text>

                    <VerifiedBadge show={isVerified(ad)} />
                </HStack>

                {/* RIGHT SIDE: TIME AGO */}
                <Text fontSize="xs" color={subText}>
                     {timeAgo(ad.createdAt, language)}
                </Text>

                </HStack>
                </Box>
              </Box>
            ))}
          </Box>
        </Marquee>
      )}
    </Box>
  );
}