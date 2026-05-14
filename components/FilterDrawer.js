"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Stack,
  Select,
  Box,       
  Divider, 
  Button,
  HStack,
} from "@chakra-ui/react";

import { TbCurrentLocation } from "react-icons/tb";
import { useToast } from "@chakra-ui/react";
import { useLanguageContext } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";

export default function FilterDrawer({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  selectedType,
  setSelectedType,
  selectedAdType,
  setSelectedAdType,
  searchQuery,
  setSearchQuery,
  setSelectedAutocompleteAd,
  fetchAds,
  useNearby,
  setUseNearby,
  coords,
  setCoords,
  locationAllowed,
  onEmptySearch,
}) {
  const { language } = useLanguageContext();
  const translations = { en, id };
  const t = translations[language] || translations.id;

  const [tempCategory, setTempCategory] = useState("");
  const [tempSubcategory, setTempSubcategory] = useState("");
  const [tempType, setTempType] = useState("all");
  const [tempAdType, setTempAdType] = useState("all");
  const toast = useToast();
  

  useEffect(() => {
    if (isOpen) {
      setTempCategory(selectedCategory);
      setTempSubcategory(selectedSubcategory);
      setTempType(selectedType);
      setTempAdType(selectedAdType);
    }
  }, [isOpen, selectedCategory, selectedSubcategory, selectedType, selectedAdType]);

  const isFilterActive =
    tempCategory ||
    tempSubcategory ||
    tempType !== "all" ||
    tempAdType !== "all"; // searchQuery tetap pause

  const handleApply = () => {
    setSelectedCategory(tempCategory);
    setSelectedSubcategory(tempSubcategory);
    setSelectedType(tempType);
    setSelectedAdType(tempAdType);

    onClose();
    fetchAds();
  };

  const handleReset = () => {
  // 🔹 reset temporary drawer state
  setTempCategory("");
  setTempSubcategory("");
  setTempType("all");
  setTempAdType("all");

  // 🔹 reset main AllAdsPage state
  setSelectedCategory("");
  setSelectedSubcategory("");
  setSelectedType("all");
  setSelectedAdType("all");
  setSearchQuery("");
  setSelectedAutocompleteAd(null);

  // 🔹 reset lokasi
  setUseNearby(false);
  setCoords(null);
  localStorage.setItem("locationAllowed", "false");

  // 🔹 panggil callback untuk MobileSearchBar biar autocomplete hilang
  if (onEmptySearch) onEmptySearch();

  // 🔹 tutup drawer
  onClose();

  // 🔹 delay minimal biar state sudah update → fetch semua ads
  setTimeout(() => {
    fetchAds(""); // kosongin searchOverride supaya fetch semua
  }, 0);
};
  const handleUseCurrentLocation = async () => {
  if (!navigator.geolocation) {
    toast({
      title: "Browser tidak mendukung geolocation",
      status: "error",
      duration: 4000,
      isClosable: true,
    });
    return;
  }

  try {
    const permissionStatus = await navigator.permissions.query({ name: "geolocation" });

    if (permissionStatus.state === "denied") {
      // user sebelumnya tolak, langsung reload
      window.location.reload();
      return;
    }

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setUseNearby(true);
          localStorage.setItem("locationAllowed", "true");
          // 🔥 FIX UTAMA
          window.location.reload();
          fetchAds();
          onClose(); // tutup drawer biar toast terlihat
          toast({
            title: "Lokasi digunakan",
            description: "Anda sedang menggunakan lokasi saat ini",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          toast({
            title: "Gagal mendapatkan lokasi",
            description: "Pastikan izin lokasi diberikan.",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        },
        { enableHighAccuracy: true }
      );
    };

    if (permissionStatus.state === "granted") {
      getLocation(); // sudah diizinkan
    } else if (permissionStatus.state === "prompt") {
      getLocation(); // belum dipilih, browser akan munculin popup
    }
  } catch (err) {
    console.error("Permission check error:", err);
    toast({
      title: "Terjadi kesalahan",
      description: "Tidak bisa mengecek izin lokasi",
      status: "error",
      duration: 4000,
      isClosable: true,
    });
  }
};



  return (
    <Drawer placement="bottom" onClose={onClose} isOpen={isOpen}>
      <DrawerOverlay />
      <DrawerContent borderTopRadius="xl">
        <DrawerCloseButton />
        <DrawerHeader>{t?.filter || "Filter"}</DrawerHeader>

        <DrawerBody pb={6}>
          <Stack spacing={3}>
            {/* CATEGORY */}
            <Select
              placeholder={t?.category || "Category"}
              value={tempCategory}
              onChange={(e) => {
                const newCategory = e.target.value;
                setTempCategory(newCategory);
                setTempSubcategory("");
                
                // 🔥 fetch langsung sesuai category baru
                setSelectedCategory(newCategory);
                setSelectedSubcategory("");
                fetchAds();
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              placeholder={t?.subcategory || "Subcategory"}
              value={tempSubcategory}
              onChange={(e) => {
                const newSubcategory = e.target.value;
                setTempSubcategory(newSubcategory);

                // 🔥 fetch langsung sesuai subcategory baru
                setSelectedSubcategory(newSubcategory);
                fetchAds();
              }}
            >
              {tempCategory &&
                categories
                  .find((c) => c.name === tempCategory)
                  ?.subcategories.map((sc) => (
                    <option key={sc.id} value={sc.name}>
                      {sc.name}
                    </option>
                  ))}
            </Select>

            {/* TYPE HIGHLIGHT / REGULAR */}
              <Select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  fetchAds();
                }}
              >
                <option value="all">{t?.all || "All"}</option>
                <option value="premium">{t?.highlight || "Highlight"}</option>
                <option value="free">{t?.regular || "Regular"}</option>
              </Select>

              {/* AD TYPE JUAL / SEWA */}
              <Select
                value={selectedAdType}
                onChange={(e) => {
                  setSelectedAdType(e.target.value);
                  fetchAds();
                }}
              >
                <option value="all">{t?.allTypes || "All Types"}</option>
                <option value="jual">{t?.sell || "Jual"}</option>
                <option value="sewa">{t?.rent || "Sewa"}</option>
              </Select>

            {/* BUTTONS */}
            <HStack spacing={3} pt={2}>
              <Button
                flex={1}
                onClick={handleApply}
                isDisabled={!isFilterActive}
                bg={isFilterActive ? "#90cdf4" : "gray.300"}
                color={isFilterActive ? "black" : "gray.600"}
                _hover={
                  isFilterActive
                    ? { bg: "#7fbbe3" }
                    : { bg: "gray.300", cursor: "not-allowed" }
                }
              >
                {t?.apply || "Apply"}
              </Button>

              <Button
                flex={1}
                bg="#ceff00"
                color="black"
                _hover={{ bg: "#bfff00" }}
                onClick={handleReset}
              >
                {t?.reset || "Reset"}
              </Button>
            </HStack>

            
            <Box mt={4} mb={2}>
              <Divider />
            </Box>

            {/* USE CURRENT LOCATION */}
            {!locationAllowed && (
              <Button
                leftIcon={<TbCurrentLocation />}
                variant="outline"
                colorScheme="blue"
                onClick={handleUseCurrentLocation}
              >
                {t?.useCurrentLocation || "Gunakan Lokasi Saat Ini"}
              </Button>
            )}
                      </Stack>
                    </DrawerBody>
                  </DrawerContent>
                </Drawer>
              );
            }