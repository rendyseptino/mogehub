"use client";

import { useEffect, useState } from "react";
import { IconButton, useToast } from "@chakra-ui/react";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { useColorModeValue } from "@chakra-ui/react";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

export default function WishlistAd({ adId }) {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const cardBg = useColorModeValue("gray.100", "gray.700");
  const hoverBg = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("black", "white");
  

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // =========================
  // CHECK STATUS AWAL
  // =========================
  useEffect(() => {
    if (!token || !adId) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `https://api.mogehub.com/api/ad/${adId}/favorite-status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setFavorited(data.favorited);
      } catch (err) {
        console.error("Failed to check favorite:", err);
      }
    };

    checkStatus();
  }, [adId, token]);

  // =========================
  // TOGGLE FAVORITE
  // =========================
  const handleToggle = async () => {
    if (!token) {
      toast({
      title: t.wishlist_login_required,
      description: t.wishlist_login_desc,
      status: "warning",
      duration: 2000,
      isClosable: true,
    });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `https://api.mogehub.com/api/ad/${adId}/favorite`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setFavorited(data.favorited);

      toast({
      title: data.favorited
        ? t.wishlist_added
        : t.wishlist_removed,
      status: data.favorited ? "success" : "info",
      duration: 1500,
      isClosable: true,
    });
    } catch (err) {
      console.error("Favorite error:", err);

      toast({
      title: t.wishlist_error,
      status: "error",
      duration: 2000,
      isClosable: true,
    });
    } finally {
      setLoading(false);
    }
  };

  return (
  <IconButton
    icon={
      favorited ? <BiSolidLike size={26} /> : <BiLike size={26} />
    }
    aria-label="Wishlist"
    borderRadius="full"
    size="lg"
    onClick={handleToggle}
    isLoading={loading}
    bg={favorited ? "red.500" : cardBg}
    color={favorited ? "white" : textColor}
    _hover={{
      transform: "scale(1.15)",
      bg: favorited ? "red.600" : hoverBg,
    }}
    boxShadow="md"
  />
);
}