"use client";

import { Flex } from "@chakra-ui/react";

export default function MogehubSplash() {
  return (
    <Flex
      position="fixed"
      inset="0"
      w="100%"
      h="100dvh"
      minH="100dvh"
      zIndex="2147483647"
      align="center"
      justify="center"
      bg="#ffffff"
      overflow="hidden"
      pointerEvents="all"
      style={{
        contain: "layout style paint",
      }}
    >
      {/* VIDEO ONLY (NO EFFECTS) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          width: "min(420px, 85vw)",
          objectFit: "contain",
          userSelect: "none",
          pointerEvents: "none",
          display: "block",
        }}
      >
        <source src="/myMogeHub.mp4" type="video/mp4" />
      </video>
    </Flex>
  );
}