"use client";

import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Box,
  Text,
  VStack,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";

export default function ActivityDrawer({ isActive, setActive, setUnread }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🎨 AUTO DARK / LIGHT MODE
  const textColor = useColorModeValue("gray.800", "gray.200");
  const subTextColor = useColorModeValue("gray.500", "gray.400");

  useEffect(() => {
    if (!isActive) return;

    const fetchActivities = async () => {
      try {
        setLoading(true);

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

        console.log("🔥 TOKEN:", token);

        if (!token) {
          console.log("❌ TOKEN KOSONG");
          setActivities([]);
          return;
        }

        const res = await fetch(
          "https://api.mogehub.com/api/activities",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("📡 STATUS:", res.status);

        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error("❌ RESPONSE BUKAN JSON:", text);
          setActivities([]);
          return;
        }

        console.log("📦 DATA:", data);

        if (!res.ok) {
          throw new Error(data?.error || "Failed fetch activity");
        }

        const activityList = data.activities || [];

        setActivities(activityList);

        // 🔴 HITUNG UNREAD
        const unreadCount = activityList.filter((a) => !a.read).length;
        if (setUnread) setUnread(unreadCount);

      } catch (err) {
        console.error("❌ FETCH ACTIVITY ERROR:", err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [isActive]);

  const handleClose = () => {
    setActive(false);
  };

  return (
    <Drawer isOpen={isActive} placement="right" onClose={handleClose} size="sm">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton onClick={handleClose} />
        <DrawerHeader>Activities</DrawerHeader>

        <DrawerBody>
          <VStack spacing={3} align="stretch">
            {loading && <Spinner />}

            {!loading && activities.length === 0 && (
              <Text fontSize="sm" color={subTextColor}>
                Belum ada aktivitas.
              </Text>
            )}

            {!loading &&
              activities.map((act) => (
                <Box key={act.id} py={2}>
                  
                  {/* 🔥 MESSAGE DARI BACKEND (UDAH CLEAN) */}
                  <Text fontSize="sm" color={textColor}>
                    {act.display || "Aktivitas baru"}
                  </Text>

                  {/* ⭐ RATING */}
                  {act.type === "blog_rating" && act.rating && (
                    <Box mt={1}>
                      {[...Array(act.rating)].map((_, i) => (
                        <StarIcon key={i} color="yellow.400" mr={1} />
                      ))}
                    </Box>
                  )}

                  {/* 🕒 TIME */}
                  <Text fontSize="xs" color={subTextColor} mt={1}>
                    {act.createdAt
                      ? new Date(act.createdAt).toLocaleString()
                      : ""}
                  </Text>

                </Box>
              ))}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}