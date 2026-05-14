"use client";

import {
  Box,
  Flex,
  Stack,
  Text,
  Link as ChakraLink,
  Divider,
  useColorMode,
  HStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { FaFire } from "react-icons/fa";
import { IoHelpBuoy } from "react-icons/io5";
import { FaCreditCard } from "react-icons/fa";
import { GiFullMotorcycleHelmet } from "react-icons/gi";
import { HiUserGroup } from "react-icons/hi2";
import { TbBrandBlogger } from "react-icons/tb";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguageContext } from "../context/LanguageContext";
import PaymentMethodPage from "@/pages/paymentMethod";
import Image from "next/image";
import en from "../locales/en.json";
import id from "../locales/id.json";

const translations = { en, id };

export default function Footer() {
  const { colorMode } = useColorMode();
  const { language } = useLanguageContext();

  const tFooter = translations[language]?.footer || translations.id.footer;
  const tRoot = translations[language] || translations.id;

  const borderColor = colorMode === "light" ? "gray.200" : "whiteAlpha.200";
  const textColor = colorMode === "light" ? "gray.600" : "gray.400";
  const titleColor = colorMode === "light" ? "gray.800" : "whiteAlpha.900";
  const bg = colorMode === "light" ? "white" : "black";

  const logoSrc =
    colorMode === "light"
      ? "/mogehubmasterlight.png"
      : "/mogehubmasterdark.png";

  const LOGO_H = "34px";
  const LOGO_W = "auto";

  return (
    <Box
      as="footer"
      bg={bg}
      borderTopWidth="1px"
      borderColor={borderColor}
      w="100%"
      p={{ base: 10, md: 12 }}
    >
      <Stack spacing={10} w="100%">
        {/* Top: responsive flex */}
        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align={{ base: "flex-start", lg: "flex-start" }}
          gap={{ base: 8, lg: 16 }}
        >
          {/* Logo */}
          <Stack spacing={3} flex="1">
            <ChakraLink as={Link} href="/" w="fit-content">
            <Box cursor="pointer" w="fit-content">
              <Box position="relative" height={LOGO_H} width="140px">
              <Image
                src={logoSrc}
                alt="MogeHub"
                fill
                priority
                unoptimized
                sizes="140px"
                style={{
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </Box>
            </Box>
          </ChakraLink>

            <Text
              fontSize="sm"
              color={textColor}
              maxW={{ base: "100%", lg: "360px" }}
            >
              {tFooter.description}
            </Text>
          </Stack>

          {/* Legal Links */}
          <Stack spacing={3} flex="1">
            <Text fontSize="sm" fontWeight="semibold" color={titleColor}>
              {tFooter.legal}
            </Text>
            <ChakraLink
              as={Link}
              href="/terms"
              fontSize="sm"
              color={textColor}
              _hover={{ color: "brand.500", textDecoration: "none" }}
            >
              {tFooter.terms}
            </ChakraLink>

            <ChakraLink
            as={Link}
            href="/privacy"
            fontSize="sm"
            color={textColor}
            _hover={{ color: "brand.500", textDecoration: "none" }}
          >
            {tFooter.privacy}
          </ChakraLink>
          </Stack>

          {/* Contact Links */}
          <Stack spacing={3} flex="1">
            <Text fontSize="sm" fontWeight="semibold" color={titleColor}>
              {tFooter.contactTitle || "Kontak"}
            </Text>
            
            {/* SUPPORT EMAIL */}
            <ChakraLink
              href="mailto:support@mogehub.com"
              fontSize="sm"
              color={textColor}
              _hover={{ color: "brand.500", textDecoration: "none" }}
              isExternal
            >
              support@mogehub.com
            </ChakraLink>

            {tFooter.contactLinks?.map((link, idx) => (
              <ChakraLink
                key={idx}
                href={link.href}
                fontSize="sm"
                color={textColor}
                _hover={{ color: "brand.500", textDecoration: "none" }}
                isExternal
              >
                {link.label}
              </ChakraLink>
            ))}
          </Stack>

          {/* Navigation Links */}
          <Stack spacing={3} flex="1">
            <Text fontSize="sm" fontWeight="semibold" color={titleColor}>
              {tFooter.navigation || "Navigation"}
            </Text>

            <HStack spacing={2} align="center">
              <IoHelpBuoy />
              <ChakraLink
              as={Link}
              href="/help"
              fontSize="sm"
              color={textColor}
              _hover={{ color: "brand.500", textDecoration: "none" }}
            >
              {tFooter.helpCenter || "Help Center"}
            </ChakraLink>
            </HStack>

            <HStack spacing={2} align="center">
              <FaFire />
              <ChakraLink
              as={Link}
              href="/subscription"
              fontSize="sm"
              color={textColor}
              _hover={{ color: "brand.500", textDecoration: "none" }}
            >
              {tRoot.notSignedIn?.subscriptions || "Subscriptions"}
            </ChakraLink>
            </HStack>

            <HStack spacing={2} align="center">
            <FaCreditCard />
            <ChakraLink
              as={Link}
              href="/paymentMethod"
              fontSize="sm"
              color={textColor}
              _hover={{ color: "brand.500", textDecoration: "none" }}
            >
               {tFooter.PaymentMethods || "Payment Methods"}
            </ChakraLink>
          </HStack>

            {/* NEW: About MogeHub */}
            <HStack spacing={2} align="center">
              <GiFullMotorcycleHelmet />
              <ChakraLink
              as={Link}
              href="/about"
              fontSize="sm"
              color={textColor}
              _hover={{ color: "brand.500", textDecoration: "none" }}
            >
             {tFooter.about || "About MogeHub"}
            </ChakraLink>
            </HStack>

            {/* NEW: BLOG MogeHub */}
            <HStack spacing={2} align="center">
              <TbBrandBlogger />
              <ChakraLink
                as={Link}
                href="/blog"
                fontSize="sm"
                color={textColor}
                _hover={{ color: "brand.500", textDecoration: "none" }}
              >
                Blog MogeHub
              </ChakraLink>
            </HStack>

            {/* NEW: Forum */}
            <HStack spacing={2} align="center">
              <HiUserGroup />
              <ChakraLink
              as={Link}
              href="/forum"
              fontSize="sm"
              color={textColor}
              _hover={{ color: "brand.500", textDecoration: "none" }}
            >
              Forum
            </ChakraLink>
            </HStack>
          </Stack>
        </Flex>

        

        <Divider borderColor={borderColor} />

        <Flex justify="center" mt={4}>
        <LanguageSwitcher />
      </Flex>

        <Flex justify="center" align="center" direction="column">
          <Text fontSize="sm" color={textColor} textAlign="center">
            © {new Date().getFullYear()} MogeHub. {tFooter.rights} | {tFooter.tagline}
          </Text>
          <Text
            fontSize="sm"
            fontStyle="italic"
            textAlign="center"
            bgGradient={
              colorMode === "light"
                ? "linear(to-r, #3b82f6, #ef4444)"
                : "linear(to-r, #ceff00, #90cdf4)"
            }
            bgClip="text"
            fontWeight="bold"
          >
            Septino’s Signature
          </Text>
        </Flex>

        
      </Stack>
    </Box>
  );
}