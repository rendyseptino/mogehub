"use client";

import React, { useEffect, useState } from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";

export default function DividerLines({ desktopView }) {
  const [lineHeight, setLineHeight] = useState(0);

  useEffect(() => {
    if (!desktopView) return;

    const updateLineHeight = () => {
      const footer = document.querySelector("footer");
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top + window.scrollY;
        const viewportTop = window.scrollY;
        const newHeight = footerTop - viewportTop; // tinggi dari top viewport sampai atas footer
        setLineHeight(newHeight);
      }
    };

    updateLineHeight();
    window.addEventListener("resize", updateLineHeight);
    window.addEventListener("scroll", updateLineHeight);
    return () => {
      window.removeEventListener("resize", updateLineHeight);
      window.removeEventListener("scroll", updateLineHeight);
    };
  }, [desktopView]);

  if (!desktopView) return null;

  return (
    <Box
      position="fixed"
      top={0}              // nempel top viewport
      left="50%"
      transform="translateX(-50%)"
      w="2px"
      h={`${lineHeight}px`} // otomatis sampai atas footer
      bg={useColorModeValue("gray.300", "brand.500")}
      zIndex={1}          // rendah tapi tetap kelihatan
    />
  );
}