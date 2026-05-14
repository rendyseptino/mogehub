"use client";

import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Box,
  Text,
  Button,
  Stack,
  HStack,
  Badge,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IoRocketOutline } from "react-icons/io5";
import { FaRocket } from "react-icons/fa6";

const PACKAGES = [
  {
    tier: "BASIC",
    desc: "Tingkatkan visibilitas iklan",
    duration: 3,
    price: 10000,
  },
  {
    tier: "PREMIUM",
    desc: "Lebih sering tampil di atas",
    duration: 7,
    price: 30000,
  },
  {
    tier: "ULTRA",
    desc: "Maksimal tampil di posisi teratas",
    duration: 14,
    price: 70000,
  },
];

const getTierColor = (tier) => {
  switch (tier) {
    case "BASIC":
      return "gray";
    case "PREMIUM":
      return "purple";
    case "ULTRA":
      return "orange";
    default:
      return "gray";
  }
};

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const TIER_ORDER = {
  BASIC: 1,
  PREMIUM: 2,
  ULTRA: 3,
};

export default function BoostDrawer({
  isOpen,
  onClose,
  adId,
  onSelectPackage, // 🔥 IMPORTANT FIX
}) {
  const [activeBoost, setActiveBoost] = useState(null);
  const [loading, setLoading] = useState(false);

  const isMobile = useBreakpointValue({ base: true, md: false });

  const bgCard = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const activeBg = useColorModeValue("gray.100", "gray.700");
  const activeText = useColorModeValue("gray.800", "gray.100");

  useEffect(() => {
    if (!isOpen) return;

    const fetchBoost = async () => {
      const token = getAuthToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/boost/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      const found = data.find((b) => {
        const end = new Date(b.endDate);

        return (
          Number(b.adId) === Number(adId) &&
          end.getTime() > Date.now()
        );
      });

      setActiveBoost(found || null);
    };

    fetchBoost();
  }, [isOpen, adId]);

  const getRemainingDays = () => {
    if (!activeBoost) return 0;
    const now = new Date();
    const end = new Date(activeBoost.endDate);
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  const currentTier = activeBoost?.tier;

  // 🔥 CLEAN BOOST HANDLER
  const handleBoost = (pkg) => {
    if (!onSelectPackage) return;

    onSelectPackage({
      adId,
      tier: pkg.tier,
      price: pkg.price,
      duration: pkg.duration,
    });

    onClose(); // optional UX: langsung tutup drawer
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement={isMobile ? "bottom" : "right"}
    >
      <DrawerOverlay />

      <DrawerContent
        borderTopRadius={isMobile ? "2xl" : "0"}
        maxW={isMobile ? "100%" : "500px"}
        mx={isMobile ? 0 : "auto"}
        borderRadius={!isMobile ? "xl" : "0"}
      >
        <DrawerCloseButton />

        <DrawerHeader>
          <HStack spacing={3} align="center">
            <Box
              p={2}
              borderRadius="full"
              bg={useColorModeValue("gray.200", "gray.700")}
            >
              <FaRocket size={16} />
            </Box>

            <Text fontSize="lg" fontWeight="bold">
              Boost Iklan
            </Text>
          </HStack>
        </DrawerHeader>

        <DrawerBody>
          {activeBoost && (
            <Box
              mb={4}
              p={4}
              borderRadius="xl"
              bg={activeBg}
              color={activeText}
            >
              <Text fontWeight="semibold">
                Aktif: {activeBoost.tier}
              </Text>

              <Text fontSize="sm" opacity={0.8}>
                {getRemainingDays()} hari tersisa
              </Text>
            </Box>
          )}

          <Stack spacing={4}>
            {PACKAGES.map((pkg) => {
              const isCurrent = activeBoost?.tier === pkg.tier;
              const isLowerOrSame =
              currentTier &&
              TIER_ORDER[pkg.tier] <= TIER_ORDER[currentTier];

              return (
                <Box
                  key={pkg.tier}
                  p={5}
                  borderRadius="2xl"
                  bg={bgCard}
                  border="1px solid"
                  borderColor={borderColor}
                  transition="0.2s"
                  _hover={{ transform: "scale(1.02)" }}
                >
                  <Badge
                    colorScheme={getTierColor(pkg.tier)}
                    mb={2}
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {pkg.tier}
                  </Badge>

                  <Text fontSize="sm" opacity={0.8} mb={2}>
                    {pkg.desc}
                  </Text>

                  <Text fontWeight="semibold">
                    {pkg.duration} Hari
                  </Text>

                  <Text fontSize="lg" fontWeight="bold" mb={3}>
                    Rp {pkg.price.toLocaleString()}
                  </Text>

                  <Button
                  size="md"
                  leftIcon={<IoRocketOutline color="black" />}
                  bg="brand.500"
                  color="black"
                  isDisabled={isCurrent || isLowerOrSame}
                  opacity={isCurrent || isLowerOrSame ? 0.4 : 1}
                  cursor={isCurrent || isLowerOrSame ? "not-allowed" : "pointer"}
                  onClick={() => handleBoost(pkg)}
                >
                  {isCurrent
                    ? "Active"
                    : isLowerOrSame
                    ? "Not Available"
                    : "Boost Now"}
                </Button>
                </Box>
              );
            })}
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}