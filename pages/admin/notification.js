"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Select,
  Switch,
  Button,
  SimpleGrid,
  Divider,
  useToast,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { playSound } from "@/utils/sound";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

// 🔹 Ambil token dari localStorage
const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export default function NotificationSettings() {
  const toast = useToast();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  

  const [enabled, setEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState("");
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(true);

  const soundsList = ["chat1.wav"]; // tambahin file baru disini

  // 🔹 ColorMode Support
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const labelColor = useColorModeValue("gray.700", "white");
  const sliderTrackBg = useColorModeValue("gray.200", "gray.600");
  const sliderFilledBg = useColorModeValue("blue.500", "blue.300");

  // 🔹 Full backend API URL
  const API_URL = "https://api.mogehub.com/api/settings";

  // ================= FETCH SETTINGS =================
  const fetchSettings = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t.notification_settings_fetch_failed);
      }

      const data = await res.json().catch(() => ({}));

      // Set state sesuai backend
      setEnabled(data.enabled ?? true);
      setSelectedSound(
        data.selectedSound && soundsList.includes(data.selectedSound)
          ? data.selectedSound
          : soundsList[0]
      );
      setVolume(data.volume ?? 0.5);
    } catch (err) {
      console.error("❌ FETCH SETTINGS ERROR:", err.message);
      toast({ title: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ================= SAVE SETTINGS =================
  const handleSave = async () => {
    const token = getAuthToken();
    if (!token) {
      toast({ title: t.notification_settings_login_required, status: "error" });
      return;
    }

    const payload = { notificationSettings: { enabled, selectedSound, volume } };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t.notification_settings_update_failed);
      }

      window.dispatchEvent(new Event("notificationSettingsUpdated"));

      toast({ title: t.notification_settings_saved, status: "success" });
    } catch (err) {
      console.error("❌ SAVE SETTINGS ERROR:", err.message);
      toast({ title: err.message, status: "error" });
    }
  };

  // ================= TEST SOUND =================
  const handleTestSound = () => {
    if (!enabled || !selectedSound) return;
    playSound(selectedSound, volume);
  };

  if (loading) return <Text>{t.notification_settings_loading}</Text>;

  return (
    <Box px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }} flex="1">
      <VStack spacing={4} mb={6} align="start">
        <Heading size="lg" color={labelColor}>{t.notification_settings_title}</Heading>
        <Text fontSize="sm" color={labelColor}>
          {t.notification_settings_subtitle}
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} alignItems="start">
        {/* Settings Card */}
        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded="2xl" p={8} shadow="sm">
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" color={labelColor}>{t.notification_settings_enable_sound}</Text>
              <Switch isChecked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            </HStack>

            <Box>
              <Text fontSize="sm" mb={1} color={labelColor}>{t.notification_settings_choose_sound}</Text>
              <Select
                value={selectedSound}
                onChange={(e) => setSelectedSound(e.target.value)}
                isDisabled={!enabled}
              >
                {soundsList.map((sound) => (
                  <option key={sound} value={sound}>
                    {sound.replace(".wav", "")}
                  </option>
                ))}
              </Select>
            </Box>

            <Box>
              <Text fontSize="sm" mb={1} color={labelColor}>{t.notification_settings_volume}: {Math.round(volume * 100)}%</Text>
              <Slider
                value={volume}
                min={0}
                max={1}
                step={0.01}
                onChange={(val) => setVolume(val)}
                isDisabled={!enabled}
              >
                <SliderTrack bg={sliderTrackBg}>
                  <SliderFilledTrack bg={sliderFilledBg} />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>

            <HStack spacing={4} pt={2}>
              <Button colorScheme="blue" onClick={handleTestSound} isDisabled={!enabled || !selectedSound}>
                {t.notification_settings_test_sound}
              </Button>
              <Button onClick={handleSave}>{t.notification_settings_save}</Button>
            </HStack>
          </VStack>
        </Box>

        {/* Preview Card */}
        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded="2xl" p={8} shadow="sm">
          <VStack spacing={6} align="stretch">
            <Heading size="md" color={labelColor}>{t.notification_settings_preview}</Heading>
            <Divider />
            <Text fontSize="sm" color={labelColor}>
              {t.notification_settings_status}:{" "}
              <Badge colorScheme={enabled ? "green" : "red"}>
                {enabled ? t.common_enabled : t.common_disabled}
              </Badge>
            </Text>
            <Text fontSize="sm" color={labelColor}>
              {t.notification_settings_sound}: {selectedSound.replace(".wav", "") || "-"}
            </Text>
            <Text fontSize="sm" color={labelColor}>
              {t.notification_settings_volume}: {Math.round(volume * 100)}%
            </Text>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}