"use client";

import { Button, HStack, Badge, useToast } from "@chakra-ui/react";
import { IoRocketOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useColorModeValue } from "@chakra-ui/react";

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export default function BoostButton({
  adId,
  currentStatus,
  onClick, // 🔥 IMPORTANT: trigger parent (AdsPage)
}) {
  const [activeBoost, setActiveBoost] = useState(null);
  const toast = useToast();

  const badgeBg = useColorModeValue("gray.200", "gray.700");
  const badgeText = useColorModeValue("gray.800", "gray.100");

  // =========================
  // FETCH ACTIVE BOOST STATUS
  // =========================
  useEffect(() => {
    const fetchBoost = async () => {
      try {
        const token = getAuthToken();

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/boost/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        const found = (data || []).find((b) => {
          const end = new Date(b.endDate);

          return (
            Number(b.adId) === Number(adId) &&
            end.getTime() > Date.now()
          );
        });

        setActiveBoost(found || null);
      } catch (err) {
        console.error("Boost fetch error:", err);
      }
    };

    fetchBoost();
  }, [adId]);

  // =========================
  // REMAINING DAYS
  // =========================
  const getRemainingDays = () => {
    if (!activeBoost) return null;

    const now = new Date();
    const end = new Date(activeBoost.endDate);

    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  // =========================
  // CLICK HANDLER (SAFE FLOW)
  // =========================
  const handleClick = () => {
    // ❌ guard status
    if (currentStatus !== "active") {
      toast({
        title: "Iklan belum aktif",
        description: "Aktifkan iklan dulu sebelum boost",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // ✅ trigger parent (AdsPage → BoostDrawer → Checkout → Tripay)
    if (onClick) {
      onClick();
    }
  };

  return (
    <HStack spacing={2}>
      {/* ================= BOOST BUTTON ================= */}
      <Button
        size="sm"
        leftIcon={<IoRocketOutline size={16} color="#ee5b17" />}
        bg="brand.500"
        color="black"
        _hover={{ opacity: 0.9 }}
        onClick={handleClick}
        opacity={currentStatus !== "active" ? 0.6 : 1}
        cursor={currentStatus !== "active" ? "not-allowed" : "pointer"}
      >
        Boost
      </Button>

      {/* ================= ACTIVE BOOST BADGE ================= */}
      {activeBoost && (
        <Badge
          bg={badgeBg}
          color={badgeText}
          borderRadius="full"
          px={3}
          py={1}
          fontSize="xs"
          fontWeight="medium"
          display="flex"
          alignItems="center"
          gap={1}
        >
          <IoRocketOutline size={16} />
          {activeBoost.tier} • {getRemainingDays()} hari lagi
        </Badge>
      )}
    </HStack>
  );
}