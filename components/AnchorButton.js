"use client";

import { useEffect, useState } from "react";
import { IconButton, useColorModeValue } from "@chakra-ui/react";
import { FaArrowUp } from "react-icons/fa6";

export default function AnchorButton() {
  const [show, setShow] = useState(false);
  const [isScrollingTop, setIsScrollingTop] = useState(false);

  // warna (fallback ke brand kalau mau)
  const bg = useColorModeValue("brand.500", "brand.500");
  const color = "black";

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // muncul kalau scroll > 300px
      if (scrollY > 300) {
        setShow(true);
      } else {
        setShow(false);
      }

      // kalau sudah sampai atas, reset
      if (scrollY < 50) {
        setIsScrollingTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    setIsScrollingTop(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <IconButton
      icon={<FaArrowUp size={20} />}
      aria-label="Back to top"
      position="fixed"
      bottom={{ base: "80px", md: "30px" }} // mobile agak naik biar ga tabrakan sticky
      right={{ base: "16px", md: "30px" }}
      zIndex={2000}
      borderRadius="full"
      size="lg"
      bg={bg}
      color={color}
      _hover={{ transform: "scale(1.1)", opacity: 0.9 }}
      _active={{ transform: "scale(0.95)" }}
      boxShadow="lg"
      onClick={scrollToTop}
      opacity={show && !isScrollingTop ? 1 : 0}
      pointerEvents={show && !isScrollingTop ? "auto" : "none"}
      transition="opacity 0.4s ease, transform 0.2s ease"
    />
  );
}