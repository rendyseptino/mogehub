"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "../../context/UserContext";
import { useLanguageContext } from "../../context/LanguageContext";
import en from "../../locales/en.json";
import id from "../../locales/id.json";

import {
  Box,
  Flex,
  Text,
  Button,
  Checkbox,
  Input,
  VStack,
  Heading,
  useColorMode,
  Spinner,
  useToast,
  HStack,
  Icon,
} from "@chakra-ui/react";

import {
  mobileAndTabletFont,
  mobileAndTabletPadding,
} from "../../utils/responsive";

import { IoWarningOutline } from "react-icons/io5";

const translations = { en, id };

export default function DeleteAccountPage() {
  const { logout } = useUser();
  const router = useRouter();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [agreed, setAgreed] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [randomCode, setRandomCode] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRandomCode(code);
  }, []);

  const canDelete = agreed && verificationCode === randomCode;

  const handleDeleteAccount = async () => {
    if (!canDelete) return;
    setIsDeleting(true);

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error(t.tokenNotFound);

      const res = await fetch("https://api.mogehub.com/api/user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(t.invalidResponse);
      }

      if (!res.ok) throw new Error(data?.message || t.deleteFailed);

      toast({
        title: t.accountDeleted,
        description: t.accountDeletedDesc,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      localStorage.removeItem("token");
      logout();
      router.replace("/login");
    } catch (err) {
      console.error(err);
      toast({
        title: t.error,
        description: err.message || t.somethingWentWrong,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsDeleting(false);
    }
  };

  return (
    <Flex
      minH="80vh"
      align="center"
      justify="center"
      px={mobileAndTabletPadding}
      py={mobileAndTabletPadding}
      bg={colorMode === "light" ? "gray.50" : "gray.800"}
    >
      <Box
        // HANYA UNTUK DESKTOP
        w={{ base: "full", md: "400px" }}
        h={{ base: "auto", md: "400px" }} // Jadi kotak
        bg={colorMode === "light" ? "white" : "gray.700"}
        p={{ base: 6, md: 10 }}
        borderRadius="2xl"
        shadow="lg"
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        {/* TITLE WITH ICON */}
        <HStack mb={6} spacing={3}>
          <Icon as={IoWarningOutline} w={8} h={8} color="yellow.400" />
          <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }}>
            {t.deleteAccount}
          </Heading>
        </HStack>

        <Text
          fontSize={{ base: "md", md: "lg" }}
          mb={6}
          color={colorMode === "light" ? "gray.700" : "gray.200"}
        >
          {t.deleteAccountDesc}
        </Text>

        <VStack spacing={5} align="stretch">
          <Text fontSize={{ base: "md", md: "lg" }}>
            {t.enterCode}: <b>{randomCode}</b>
          </Text>

          <Input
            fontSize={{ base: "md", md: "lg" }}
            placeholder={t.enterCodePlaceholder}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />

          <Checkbox
            isChecked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            fontSize={{ base: "md", md: "lg" }}
          >
            {t.agreeTerms}
          </Checkbox>

          <Button
            leftIcon={<IoWarningOutline />}
            bg={canDelete ? "red.500" : "gray.300"}
            color={canDelete ? "white" : "black"}
            _hover={canDelete ? { bg: "red.600" } : {}}
            isDisabled={!canDelete || isDeleting}
            onClick={handleDeleteAccount}
            size="lg"
            py={6}
          >
            {isDeleting ? <Spinner size="sm" /> : t.deleteAccountButton}
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}