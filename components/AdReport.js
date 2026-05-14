"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  RadioGroup,
  Radio,
  Stack,
  Textarea,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  useToast,
  Badge,
  Flex,
} from "@chakra-ui/react";

import { FaExclamationTriangle } from "react-icons/fa";
import { useRouter } from "next/router";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };


export default function AdReport({ adId }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  const isLoggedIn =
    typeof window !== "undefined" && !!localStorage.getItem("token");

  // 🔥 CHECK SUDAH PERNAH REPORT (tetep ada, tapi ga dipake di UI)
  useEffect(() => {
    const checkReport = async () => {
      if (!isLoggedIn) return;

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `https://api.mogehub.com/api/report/check/${adId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (data?.hasReported) {
          setHasReported(true);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkReport();
  }, [adId, isLoggedIn]);

  const reset = () => {
    setReason("");
    setDescription("");
    setEvidence(null);
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) return;

    if (!reason) {
      return toast({
        title: t.select_reason,
        status: "warning",
      });
    }

    if (!evidence) {
      return toast({
        title: t.evidence_required_error,
        status: "warning",
      });
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("reason", reason);
      formData.append("description", description);
      formData.append("evidence", evidence);

      const res = await fetch(
        `https://api.mogehub.com/api/report/ad/${adId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to report");

      toast({
        title: t.report_success,
        status: "success",
      });

      setHasReported(true);
      reset();
      onClose();
    } catch (err) {
      toast({
        title: t.report_failed,
        description: err.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BUTTON */}
      <Button
        leftIcon={<FaExclamationTriangle />}
        colorScheme={isLoggedIn ? "red" : "gray"}
        variant="outline"
        size="sm"
        onClick={onOpen}
      >
        {t.report_ad}
      </Button>

      {/* DRAWER */}
      <Drawer placement="right" onClose={onClose} isOpen={isOpen} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Report Iklan</DrawerHeader>

          <DrawerBody>

            {/* 🔥 BELUM LOGIN */}
            {!isLoggedIn && (
              <Flex justify="center" mb={4}>
                <Badge
                  variant="outline"
                  colorScheme="red"
                  px={4}
                  py={2}
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  gap={2}
                  cursor="pointer"
                  onClick={() => router.push("/login")}
                >
                  <FaExclamationTriangle />
                  {t.please_login_to_report}
                </Badge>
              </Flex>
            )}

            {/* ALASAN */}
            <FormControl mb={4} isDisabled={!isLoggedIn}>
              <FormLabel>{t.reason}</FormLabel>
              <RadioGroup onChange={setReason} value={reason}>
                <Stack direction="column">
                  <Radio value="scam">{t.scam}</Radio>
                  <Radio value="fake">{t.fake}</Radio>
                  <Radio value="spam">{t.spam}</Radio>
                  <Radio value="inappropriate">{t.inappropriate}</Radio>
                  <Radio value="other">{t.other}</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {/* DESKRIPSI */}
            <FormControl mb={4} isDisabled={!isLoggedIn}>
              <FormLabel>{t.description_optional}</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.describe_details}
              />
            </FormControl>

            {/* BUKTI */}
            <FormControl mb={6} isDisabled={!isLoggedIn}>
              <FormLabel>{t.evidence_required}</FormLabel>
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setEvidence(e.target.files[0])}
              />
            </FormControl>

            {/* SUBMIT */}
            <Button
              w="100%"
              onClick={handleSubmit}
              isLoading={loading}
              isDisabled={!isLoggedIn}
              bg={isLoggedIn ? "red.500" : "gray.300"}
              color={isLoggedIn ? "white" : "black"}
              _hover={isLoggedIn ? { bg: "red.600" } : {}}
            >
              {t.submit_report}
            </Button>

          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}