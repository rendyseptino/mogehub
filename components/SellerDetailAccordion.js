"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Avatar,
  Text,
  HStack,
  Link,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import VerifiedBadge from "./VerifiedBadge";
import { FaInstagram, FaFacebook, FaYoutube, FaTwitter, FaTiktok } from "react-icons/fa";
import SellerAllAds from "@/components/sellerAllads";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
import { timeAgo, memberSince } from "@/utils/timeAgo";
import { useDisclosure } from "@chakra-ui/react";
const translations = { en, id };

export default function SellerDetailAccordion({ ad }) {
  const [showDetail, setShowDetail] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const sectionBg = useColorModeValue("gray.100", "gray.700");
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const btnBg = useColorModeValue("transparent", "brand.500");
  const btnColor = useColorModeValue("black", "black");
  const btnBorder = useColorModeValue("#90cdf4", "transparent");

  const getSocialIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "instagram": return <FaInstagram />;
      case "facebook": return <FaFacebook />;
      case "twitter":
      case "x": return <FaTwitter />;
      case "youtube": return <FaYoutube />;
      case "tiktok": return <FaTiktok />;
      default: return null;
    }
  };

  return (
    <Box mt={4} p={4} bg={sectionBg} borderRadius="md">
      {/* PROFILE PHOTO + NAME + VERIFIED + MEMBER SINCE */}
      <Flex align="center" justify="space-between" mb={3} gap={2}>
        
        {/* LEFT SIDE */}
        <Flex align="center" gap={3} flex="1" minW={0}>
          <Avatar
            size="md"
            name={ad.username}
            src={ad.sellerProfilePhoto || undefined}
            flexShrink={0}
          />

          <Box flex="1" minW={0}>
            
            {/* NAME + BADGES */}
            <Flex
              align="center"
              gap={1}
              wrap="wrap"
              minW={0}
            >
              <Text
                fontSize="lg"
                fontWeight="bold"
                noOfLines={1}
                flexShrink={1}
                minW={0}
              >
                {ad.username}
              </Text>

              {/* VERIFIED */}
              <VerifiedBadge show={ad.sellerVerified} />

              {/* DEALER */}
              {ad.isDealer && (
                <Badge
                  fontSize="xs"
                  px={2}
                  py={0.5}
                  borderRadius="md"
                  bg="brand.500"
                  color="black"
                  flexShrink={0}
                >
                  DEALER
                </Badge>
              )}
            </Flex>

            {/* MEMBER SINCE */}
            {/* MEMBER SINCE */}
          {ad.userJoinedAt && (
          <Text fontSize="sm" color="gray.500" noOfLines={1}>
            {memberSince(ad.userJoinedAt, language)}
          </Text>
        )}
          </Box>
        </Flex>

        {/* RIGHT BUTTON */}
       <Button
        size="sm"
        onClick={() => setShowDetail(!showDetail)}
        flexShrink={0}
        bg={btnBg}
        color={btnColor}
        border="2px solid"
        borderColor={btnBorder}
        _hover={{
          bg: useColorModeValue("#90cdf4", "brand.600"),
          color: "black",
        }}
        _active={{
          transform: "scale(0.97)",
        }}
      >
      {showDetail ? t.hide_details : t.seller_details}
    </Button>
      </Flex>

      {/* ACCORDION CONTENT */}
      {showDetail && (
        <Accordion allowToggle mt={2}>
          <AccordionItem border="none">
            <AccordionButton p={0}>
              <Box flex="1" textAlign="left" fontWeight="semibold">
                {t.seller_details}
              </Box>
              <AccordionIcon />
            </AccordionButton>

            <AccordionPanel pb={4}>
              <Box mb={2}>
                <Flex align="center" gap={2} wrap="wrap">
                <Text>{t.total_ads}: {ad.totalAds}</Text>

                <Text
                  color="blue.400"
                  fontSize="sm"
                  cursor="pointer"
                  _hover={{ textDecoration: "underline" }}
                  onClick={onOpen}
                >
                  {t.see_all_ads}
                </Text>
              </Flex>
                <Text>
                  {t.active_packages}:{" "}
                  {ad.activePackages && ad.activePackages.length > 0
                    ? ad.activePackages.map((p) => p.plan).join(", ")
                    : "-"}
                </Text>

                <Text>
                  {t.verification_status}:{" "}
                  {ad.sellerVerified ? (
                    <Badge colorScheme="green">{t.verified}</Badge>
                  ) : (
                    <Badge colorScheme="white">{t.unverified}</Badge>
                  )}
                </Text>
              </Box>

              {/* SOCIAL MEDIA */}
              {ad.socials && ad.socials.length > 0 && (
                <HStack spacing={4} mt={2} wrap="wrap">
                  {ad.socials.map((s, idx) => (
                    <Link key={idx} href={s.value} isExternal fontSize="22px">
                      {getSocialIcon(s.type)}
                    </Link>
                  ))}
                </HStack>
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
      <SellerAllAds
            isOpen={isOpen}
            onClose={onClose}
            sellerId={ad.sellerId}
          />

    </Box>
  );
}