"use client";

import { Box, Image, Text, Badge, useColorModeValue, HStack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useLanguageContext } from "../context/LanguageContext";
import { FcFlashOn } from "react-icons/fc";
import VerifiedBadge from "../components/VerifiedBadge";
import { timeAgo } from "../utils/timeAgo";
import { Avatar } from "@chakra-ui/react";
import { GoGlobe } from "react-icons/go";
import en from "../locales/en.json";
import id from "../locales/id.json";
import { isMobileCard, isTabletCard, isDesktopCard } from "../utils/responsiveCard";

const translations = { en, id };

// Helper format currency
function formatCurrency(price, currency) {
  if (price == null) return "-";
  switch (currency) {
    case "Rp":
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(price);
    case "$":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(price);
    default:
      return price;
  }
}

// Helper format waktu relatif


export default function AdCard({ ad }) {
  console.log("AD PROPS:", ad);
  const router = useRouter();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const bg = useColorModeValue("white", "gray.700");

  const borderColor = useColorModeValue(
    ad.isPremium ? "yellow.400" : "gray.200",
    ad.isPremium ? "yellow.300" : "gray.600"
  );

  const textColor = useColorModeValue("black", "white");
  const secondaryText = useColorModeValue("gray.600", "gray.300");

  const thumbnail =
    ad.imageUrl ||
    ad.thumbnail?.url ||
    "/placeholder.png";

  // 🔥 Handle click with boost tracking
  const handleClick = async () => {
    if (ad.isBoosted && ad.boostId) {
      console.log("Tracking click for boostAdId:", ad.boostId);

      try {
        const res = await fetch("https://api.mogehub.com/api/boost-tracking/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ boostAdId: ad.boostId, type: "click" }),
        });

        console.log("Boost click tracked, status:", res.status);
      } catch (err) {
        console.error("Boost click tracking failed:", err);
      }
    } else if (ad.isBoosted && !ad.boostId) {
      console.warn("Boosted ad clicked but boostId is missing for ad:", ad.id);
    }

    router.push(`/ad/${ad.id}`);
  };

  return (
    <Box
      w="100%"
      maxW={
      isDesktopCard()
        ? "250px"
        : isTabletCard()
        ? "240px"
        : "220px"
    }
      flex="0 0 auto"
      borderRadius="md"
      overflow="hidden"
      border="1px solid"
      borderColor={borderColor}
      bg={bg}
      shadow={ad.isPremium ? "md" : "sm"}
      cursor="pointer"
      transition="all 0.25s ease"
      display="flex"
      flexDirection="column"
      h={
  isDesktopCard()
    ? "390px"
    : isTabletCard()
    ? "410px"
    : "350px"
}
      _hover={{
        transform: "translateY(-3px) scale(1.02)",
        shadow: "lg",
      }}
      onClick={handleClick}
    >
      {/* Image */}
      <Box
      w="100%"
      aspectRatio={1}
      flexShrink={0} // 🔥 kunci biar image gak ketarik
      overflow="hidden"
      position="relative"
    >
      {ad.isBoosted && (
        <HStack
          position="absolute"
          top={2}
          right={2}
          bg="rgba(50,50,50,0.6)"
          px={2}
          py={1}
          borderRadius="md"
          spacing={1}
          align="center"
          zIndex={10}
        >
          <GoGlobe size={14} color="white" />
          <Text fontSize="xs" fontWeight="bold" color="white">
            {t.sponsored || "Sponsored"}
          </Text>
        </HStack>
      )}

      <Image
        src={thumbnail}
        alt={ad.title}
        w="100%"
        h="100%"
        objectFit="cover"
      />
    </Box>

      {/* 🔥 SLOT BADGE (SELALU ADA SPACE) */}
     <Box minH="26px" px={3} pt={2} mb={1}>
        {ad.isPremium && (
          <HStack
            as={Badge}
            px={2}
            py={1}
            spacing={1}
            borderRadius="md"
            colorScheme="yellow"
            w="fit-content"
          >
            <FcFlashOn size={16} />
            <Text fontSize="xs" fontWeight="bold">
              Highlight
            </Text>
          </HStack>
        )}
      </Box>

      {/* Content */}
      <Box
  p={3}
  pt={2}
  display="flex"
  flexDirection="column"
  flex="1"
  gap={1}
  justifyContent="space-between"
>
        {/* Judul */}
        <Text fontWeight="bold" fontSize="md" color={textColor} noOfLines={2}>
          {ad.title}
        </Text>

        {/* Harga (slot tetap) */}
        <Box minH="20px">
          {ad.price != null && (
            <Text color={textColor} fontWeight="bold" mt={1}>
              {formatCurrency(ad.price, ad.currency)}
            </Text>
          )}
        </Box>

       {/* Seller (slot tetap) */}
      <Box h="32px" overflow="hidden">
        {ad.username && (
          <HStack spacing={2} mt={1} align="center">
            <Avatar
              src={ad.sellerProfilePhoto || ""}
              name={ad.displayName}
              size="xs"
              flexShrink={0}
            />

            {/* 🔥 Nama + Verified jadi 1 grup */}
            <HStack spacing={1} minW={0}>
              <Text
                fontWeight="bold"
                fontSize="sm"
                color={textColor}
                noOfLines={1}
              >
                {ad.displayName || "User"}
              </Text>

              <VerifiedBadge show={ad.verified} />
            </HStack>
          </HStack>
        )}
      </Box>

        {/* Footer selalu bawah */}
        <Box mt="auto" minH="24px" pb={4}>
          {ad.createdAt && (
            <Text fontSize="xs" color={secondaryText}>
              {timeAgo(ad.createdAt, language)}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}