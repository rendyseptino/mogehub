"use client";

import { Box, Button, useColorModeValue } from "@chakra-ui/react";
import ForumCard from "./ForumCard";
import SectionTitle from "./SectionTitle";
import { useRouter } from "next/router";
import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

const translations = { en, id };

export default function ForumSection({ threads }) {
  const router = useRouter();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const sectionBg = useColorModeValue(
    "linear-gradient(90deg, #f8fbff 0%, #dff7f1 35%, #eef6ff 70%, #ffffff 100%)",
    "linear-gradient(120deg, #020617 0%, #0f172a 35%, #111827 60%, rgba(206,255,0,0.22) 85%, rgba(206,255,0,0.12) 100%)"
  );

  const MotionFlex = motion(Box);

  const x = useMotionValue(0);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  // ================= ITEMS =================
  const items = useMemo(() => {
    const base = (threads?.slice(0, 6) || []).map((thread, i) => ({
      ...thread,
      thumbnail: `/forum${i + 1}.png`,
    }));

    return base.length > 1 ? [...base, ...base] : base;
  }, [threads]);

  // ================= AUTO SCROLL (SEAMLESS CONTINUOUS) =================
useEffect(() => {
  if (!containerRef.current) return;

  let raf;
  let position = 0;
  let speed = 0.6;

  let distance = containerRef.current.scrollWidth / 2;

  const step = () => {
    // selalu lanjut dari posisi terakhir (bukan reset)
    position -= speed;

    // 🔥 INI KUNCI LOOP TANPA JUMP
    if (Math.abs(position) >= distance) {
      position += distance;
    }

    x.set(position);

    raf = requestAnimationFrame(step);
  };

  step();

  return () => cancelAnimationFrame(raf);
}, [x, items.length]);
  return (
    <Box
      w="100%"
      bg={sectionBg}
      py={{ base: 8, md: 10 }}
      overflow="hidden"
    >
      <Box maxW="1200px" mx="auto" px={{ base: 3, md: 0 }}>
        <SectionTitle title={t.latestForum} />

        {/* ================= CAROUSEL ================= */}
        {items.length > 0 && (
          <Box mb={5} overflow="hidden">
            <MotionFlex
              ref={containerRef}
              style={{ x }}
              display="flex"
              gap={{ base: 3, md: 4 }}
              w="max-content"
              drag="x"
              dragElastic={0.15}
              dragMomentum={true}

              // ================= DRAG LOCK =================
              onDragStart={() => {
                isDragging.current = false;
              }}

              onDrag={(e, info) => {
                if (Math.abs(info.offset.x) > 5) {
                  isDragging.current = true;
                }
              }}

              onDragEnd={(e, info) => {
                x.set(x.get() + info.offset.x);

                setTimeout(() => {
                  isDragging.current = false;
                }, 50);
              }}
            >
              {items.map((thread, index) => (
                <Box key={`${thread.id}-${index}`} minW="250px">
                  <ForumCard
                    thread={thread}
                    isDragging={isDragging}
                    onClick={() =>
                      router.push(`/forum?threadId=${thread.id}`)
                    }
                  />
                </Box>
              ))}
            </MotionFlex>
          </Box>
        )}

        {/* ================= BUTTON ================= */}
        <Box textAlign="center">
          <Button
            bg="brand.500"
            color="black"
            size="md"
            _hover={{ bg: "teal.600" }}
            onClick={() => router.push("/forum")}
          >
            {t.viewAllForum}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}