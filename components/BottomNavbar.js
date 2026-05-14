"use client";

import React, { useState, useEffect } from "react";
import { Box, Flex, Text, useColorMode } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useLanguageContext } from "../context/LanguageContext";
import ActivityDrawer from "./ActivityDrawer";

import { GoHome, GoHomeFill } from "react-icons/go";
import { IoSearchOutline, IoSearchSharp } from "react-icons/io5";
import { FiBell } from "react-icons/fi"; // non-active
import { FaBell } from "react-icons/fa"; // active
import { FaRegUser, FaUser } from "react-icons/fa";
import { mobileOnly } from "../utils/responsive";

import en from "../locales/en.json";
import id from "../locales/id.json";

const translations = { en, id };

const menuItems = [
  { key: "home", iconOutline: GoHome, iconFill: GoHomeFill, href: "/", match: ["/"] },
  { key: "browse", iconOutline: IoSearchOutline, iconFill: IoSearchSharp, href: "/allads", match: ["/allads"] },
  { key: "activity", iconOutline: FiBell, iconFill: FaBell, href: "/activity", match: ["/activity"] },
  { key: "profile", iconOutline: FaRegUser, iconFill: FaUser, href: "/profile", match: ["/profile", "/not-signed-in", "/seller"] },
];

export default function BottomNavbar() {
  const { colorMode } = useColorMode();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  const router = useRouter();
  const currentPath = router.pathname;

  const bgColor = { light: "white", dark: "gray.900" };
  const iconColor = { light: "gray.500", dark: "gray.400" };
  const iconActiveColor = { light: "black", dark: "white" };
  const textColor = { light: "gray.700", dark: "white" };
  const textActiveColor = { light: "black", dark: "white" };

  const [user, setUser] = useState(null);
  const [drawerActive, setDrawerActive] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } 
        catch { localStorage.removeItem("user"); setUser(null); }
      }
    }
  }, []);

  const handleProfileClick = () => {
    if (user) router.push("/seller/dashboard");
    else router.push("/not-signed-in");
  };

  const isPathActive = (matchList) => {
    if (!matchList?.length) return false;
    return matchList.some((path) => path === "/" ? currentPath === "/" : currentPath === path || currentPath.startsWith(path + "/"));
  };

  const handleActivityClick = () => {
    if (!user) {
      router.push("/activity/not-logged-in");
      return;
    }
    setDrawerActive((prev) => !prev);
  };

  return (
    <>
      <Box
        position="fixed"
        bottom={0}
        left={0}
        w="100%"
        bg={bgColor[colorMode]}
        borderTop="1px solid"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        zIndex={1000}
        py={2}
        px={2}
        display={mobileOnly}
        shadow="md"
      >
        <Flex justify="space-around" align="center" w="100%">
          {menuItems.map((item) => {
            // ✅ FIXED: Activity active logic juga cek path /activity*
            const isActive = item.key === "activity"
              ? drawerActive || currentPath.startsWith("/activity")
              : isPathActive(item.match);

            const Icon = isActive ? item.iconFill : item.iconOutline;
            const color = isActive ? iconActiveColor[colorMode] : iconColor[colorMode];

            if (item.key === "profile") {
              return (
                <Flex key={item.key} direction="column" align="center" cursor="pointer" justify="center" mt={1} onClick={handleProfileClick}>
                  <Icon size={22} color={color} />
                  <Text fontSize="xs" color={isActive ? textActiveColor[colorMode] : textColor[colorMode]} mt={0.5}>
                    {t?.[item.key] || item.key}
                  </Text>
                </Flex>
              );
            }

            if (item.key === "activity") {
              return (
                <Flex key={item.key} direction="column" align="center" cursor="pointer" justify="center" mt={1} position="relative" onClick={handleActivityClick}>
                  <Icon size={22} color={color} />
                  {unreadCount > 0 && (
                    <Box position="absolute" top="-2px" right="-2px" bg="red.500" w="15px" h="15px" borderRadius="full" display="flex" alignItems="center" justifyContent="center" fontSize="0.65em" color="white">
                      {unreadCount}
                    </Box>
                  )}
                  <Text fontSize="xs" color={isActive ? textActiveColor[colorMode] : textColor[colorMode]} mt={0.5}>
                    {t?.[item.key] || item.key}
                  </Text>
                </Flex>
              );
            }

            return (
              <Link key={item.key} href={item.href} passHref>
                <Flex direction="column" align="center" cursor="pointer" justify="center" mt={1}>
                  <Icon size={22} color={color} />
                  <Text fontSize="xs" color={isActive ? textActiveColor[colorMode] : textColor[colorMode]} mt={0.5}>
                    {t?.[item.key] || item.key}
                  </Text>
                </Flex>
              </Link>
            );
          })}
        </Flex>
      </Box>

      {user && <ActivityDrawer token={user?.token} isActive={drawerActive} setActive={setDrawerActive} setUnread={setUnreadCount} />}
    </>
  );
}