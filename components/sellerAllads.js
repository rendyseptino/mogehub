"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Grid,
  Box,
  Image,
  Text,
  VStack,
  Spinner,
  Flex,
  Avatar,
  Button,
  useColorMode,
  HStack,
} from "@chakra-ui/react";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import VerifiedBadge from "./VerifiedBadge";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

export default function SellerAllAds({ isOpen, onClose, sellerId }) {
  const { colorMode } = useColorMode();
  const router = useRouter();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const fetchAds = async () => {
    if (!sellerId) return;

    try {
      setLoading(true);

      const res = await fetch(
        `https://api.mogehub.com/api/ad/seller/${sellerId}/active-ads`
      );

      const data = await res.json();
      setAds(data.ads || []);
    } catch (err) {
      console.error("Fetch seller ads error:", err);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAds();
      setVisibleCount(5); // reset pagination tiap open
    }
  }, [isOpen]);

  // =========================
  // 🔥 SELLER HEADER DATA
  // =========================
  const seller = ads?.[0]?.seller;

  const sellerName = useMemo(() => {
    if (!seller) return "";
    return seller.type === "dealer"
      ? seller.dealerName || seller.username
      : seller.username;
  }, [seller]);

  const isVerified = seller?.verification?.status === "approved";

  const visibleAds = ads.slice(0, visibleCount);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
        
        {/* ================= HEADER SELLER ================= */}
        <ModalHeader>
          {seller && (
            <Flex align="center" gap={3}>
              <Avatar
                size="sm"
                src={seller.profilePhoto || undefined}
                name={sellerName}
              />

              <Box>
                <HStack spacing={1}>
                  <Text fontWeight="bold">{sellerName}</Text>
                  <VerifiedBadge show={isVerified} />
                </HStack>

                <Text fontSize="xs" color="gray.500">
                 {t.activeads}
                </Text>
              </Box>
            </Flex>
          )}
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody pb={6}>
          {loading ? (
            <Flex justify="center" align="center" minH="200px">
              <Spinner />
            </Flex>
          ) : ads.length === 0 ? (
            <Flex justify="center" align="center" minH="200px">
              <Text color="gray.500">No active ads</Text>
            </Flex>
          ) : (
            <>
              {/* GRID ADS */}
              <Grid
                templateColumns="repeat(auto-fill, minmax(150px, 1fr))"
                gap={4}
              >
                {visibleAds.map((ad) => {
                  const image = ad.media?.[0]?.url;

                  return (
                    <Box
                      key={ad.id}
                      borderWidth="1px"
                      borderRadius="lg"
                      overflow="hidden"
                      cursor="pointer"
                      transition="0.2s"
                      _hover={{ transform: "scale(1.03)" }}
                      onClick={() => {
                        onClose();
                        router.push(`/ad/${ad.id}`);
                      }}
                    >
                      <Image
                        src={image}
                        alt={ad.title}
                        w="100%"
                        h="120px"
                        objectFit="cover"
                      />

                      <VStack p={2} align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="bold" noOfLines={2}>
                          {ad.title}
                        </Text>

                        <Text fontSize="xs" color="gray.500">
                          {ad.city}
                        </Text>

                        <Text fontSize="sm" fontWeight="semibold">
                          {ad.currency} {ad.price?.toLocaleString()}
                        </Text>
                      </VStack>
                    </Box>
                  );
                })}
              </Grid>

              {/* LOAD MORE */}
              {visibleCount < ads.length && (
                <Flex justify="center" mt={4}>
                  <Button
                    size="sm"
                    onClick={() => setVisibleCount((prev) => prev + 5)}
                  >
                    {t.loadMore}
                  </Button>
                </Flex>
              )}
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}