"use client";

import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import {
  Box,
  Flex,
  Text,
  Image,
  Stack,
  useColorModeValue,
  Spinner,
  SimpleGrid,
  Link,
  Select,
  Button,
  Avatar,
  HStack,
  Badge,
  Input,
  InputGroup,
  InputRightElement,
  InputLeftElement,
} from "@chakra-ui/react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileFilterBar from "../components/MobileFilterBar";
import FilterDrawer from "../components/FilterDrawer";
import VerifiedBadge from "../components/VerifiedBadge";
import StickySearchBar from "../components/StickySearchBar";
import { timeAgo } from "../utils/timeAgo";
import AddFilter from "../components/AddFilter";
import TotalAdsProduct from "../components/TotalAdsProduct";
import {
  isMobileCard,
  isTabletCard,
  isLargeTabletCard,
} from "../utils/responsiveCard";


import { useLanguageContext } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";
import { useSearchParams } from "next/navigation";

import { FcFlashOn } from "react-icons/fc";
import { IoSearch } from "react-icons/io5";
import { GoGlobe } from "react-icons/go";
import { LuMapPin } from "react-icons/lu";
import { TbSearchOff } from "react-icons/tb";

export default function AllAdsPage({ initialType = "all" }) {
  const { language } = useLanguageContext();
  const translations = { en, id };
  const t = translations[language] || translations.id;

  
  const [trackedBoosts, setTrackedBoosts] = useState({});
  const [locationName, setLocationName] = useState("");
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isLargeTablet, setIsLargeTablet] = useState(false);
  
  const getLocationName = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "id" } }
      );

      const data = await res.json();

      const suburb =
        data.address.suburb ||
        data.address.city_district ||
        data.address.district ||
        "";

      const city =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        "";

      return [suburb, city].filter(Boolean).join(", ");
    } catch {
      return "";
    }
  };

  const getCoords = () =>
  new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => resolve(null),
      { enableHighAccuracy: true }
    );
  });

  

  const handleAdClick = async (ad) => {
    if (ad.isBoosted && ad.boostId) {
      try {
        await fetch("https://api.mogehub.com/api/boost-tracking/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            boostAdId: ad.boostId,
            type: "click",
          }),
        });
      } catch (err) {
        console.error("Click tracking failed:", err);
      }
    }
  };

  const searchParams = useSearchParams();
  const typeParam = searchParams?.get("type") || initialType;

  // 🔥 NEW: ambil category dari URL
  const categoryParam = searchParams?.get("category") || "";

  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);

  // 🔥 NEW: default dari URL
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedType, setSelectedType] = useState(typeParam);
  const [selectedAdType, setSelectedAdType] = useState("all");
  const [sortPrice, setSortPrice] = useState("");
  const [sortYear, setSortYear] = useState("");
  const [sortKm, setSortKm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // BARIS 54–60 (setelah useState existing)
const [useNearby, setUseNearby] = useState(true); // toggle pakai lokasi
const [coords, setCoords] = useState(null);  


useEffect(() => {
  const checkView = () => {
    setIsMobile(isMobileCard());
    setIsTablet(isTabletCard());
    setIsLargeTablet(isLargeTabletCard());
  };

  checkView();

  window.addEventListener("resize", checkView);

  return () => window.removeEventListener("resize", checkView);
}, []);

// ===================== INIT LOCATION (RUN ONCE) =====================
useEffect(() => {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;

      setCoords({ latitude, longitude });
      setLocationAllowed(true);

      const name = await getLocationName(latitude, longitude);
      setLocationName(name);
    },
    () => {
      setLocationAllowed(false);
      setLocationName("");
    },
    { enableHighAccuracy: true }
  );
}, []);



const requestLocation = () => {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setLocationAllowed(true);

      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      localStorage.setItem("locationAllowed", "true");
    },
    (err) => {
      
      setLocationAllowed(false);
      localStorage.setItem("locationAllowed", "false");
    }
  );
};






  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 8;
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}, [currentPage]);

  const [searchQuery, setSearchQuery] = useState("");
  const hardResetSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowAutocomplete(false);
    setSelectedAutocompleteAd(null);
    setIsAutocompleteSelected(false);

    setCurrentPage(1);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    fetchAds("");
  };
  const [searchResults, setSearchResults] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const hasSearch = searchQuery?.trim().length > 0;
  const debounceTimeout = useRef(null);

  const [selectedAutocompleteAd, setSelectedAutocompleteAd] = useState(null);
  const [isAutocompleteSelected, setIsAutocompleteSelected] = useState(false);
  

  const mobileSearchBarRef = useRef(null);
  const navbarHeight = 50;

  useEffect(() => {
    const handleScroll = () => {
      if (!mobileSearchBarRef.current) return;

      const searchBarEl = mobileSearchBarRef.current;
      const rect = searchBarEl.getBoundingClientRect();
      const offsetTop = rect.top + window.scrollY;

      if (window.scrollY > offsetTop - navbarHeight) {
        searchBarEl.style.position = "fixed";
        searchBarEl.style.top = "50px";
        searchBarEl.style.left = "0";
        searchBarEl.style.right = "0";
        searchBarEl.style.zIndex = "1000";
        searchBarEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
      } else {
        searchBarEl.style.position = "relative";
        searchBarEl.style.top = "auto";
        searchBarEl.style.left = "auto";
        searchBarEl.style.right = "auto";
        searchBarEl.style.zIndex = "auto";
        searchBarEl.style.boxShadow = "none";
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://api.mogehub.com/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // 🔥 NEW: sync kalau URL berubah
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const fetchAds = async (searchOverride = "") => {
  setLoading(true);
  setError(null);

  

  try {
    // ===================== AMBIL COORDS =====================
    let currentCoords = coords;

   if (useNearby && !coords?.latitude && !coords?.longitude) {
  try {
    currentCoords = await getCoords(); // 🔥 INI UDAH CLEAN VERSION

    if (!currentCoords) {
      console.warn("No coords, fallback to non-nearby WITHOUT changing state");
    }

    setCoords(currentCoords);
  } catch (err) {
    console.warn("getCoords error:", err);
    currentCoords = null;
  }
}

    // ===================== BUILD PARAMS =====================
    const params = new URLSearchParams();
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedSubcategory) params.append("subcategory", selectedSubcategory);
    if (selectedType && selectedType !== "all") params.append("adType", selectedType);
    if (selectedAdType && selectedAdType !== "all") params.append("type", selectedAdType);

    const finalSearch = searchOverride || searchQuery;
    if (finalSearch) params.append("search", finalSearch);

    // ===================== BUILD ENDPOINT =====================
const canUseNearby = useNearby && currentCoords?.latitude && currentCoords?.longitude;

let endpoint = "https://api.mogehub.com/api/ads";

if (canUseNearby) {
  endpoint = "https://api.mogehub.com/api/ads/nearby";
  params.append("latitude", currentCoords.latitude);
  params.append("longitude", currentCoords.longitude);
}



    // ===================== FETCH ADS & BOOST PARALLEL =====================
let data = { ads: [] };
let boostedAds = [];

try {
  const [adsRes, boostRes] = await Promise.all([
    fetch(`${endpoint}?${params.toString()}`),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/boost`)
  ]);

  // ================= ADS =================
  if (adsRes.ok && (adsRes.headers.get("content-type") || "").includes("application/json")) {
    data = await adsRes.json();
  } else {
    const text = await adsRes.text();
    console.warn("ADS NOT JSON:", text);
    data = { ads: [] };
  }

  // ================= BOOST =================
  if (boostRes.ok && (boostRes.headers.get("content-type") || "").includes("application/json")) {
    const boostData = await boostRes.json();
    boostedAds = boostData?.ads || [];
  } else {
    const text = await boostRes.text();
    console.warn("BOOST NOT JSON:", text);
  }

} catch (err) {
  console.warn("Failed fetch ads or boost ads:", err);
}



   // ===================== MAP + SORT =====================
const fixedAds = (data.ads || [])
  .map((ad) => {
    // 🔥 PRIORITAS: pakai data dari backend (kayak BoostedSection)
    let isBoosted = !!ad.isBoosted;
    let boostId = ad.boostId || null;
    let boost = ad.boost || null;

    // 🔥 FALLBACK: kalau backend belum inject, baru pakai boostedAds
    if (!isBoosted && boostedAds?.length) {
      const boostData = boostedAds.find(
        (b) =>
          String(b.adId || b.ad?.id) === String(ad.id)
      );

      if (boostData) {
        isBoosted = true;
        boostId = boostData.id || null;
        boost = boostData;
      }
    }

    

    return {
      ...ad,
     
       // 🔥 FINAL RESULT (dipakai AdCard & tracking)
      isBoosted,
      boostId,
      boost,

      // existing logic (JANGAN DIUBAH)
      isPremium: ad.seller?.subscription?.[0]?.productQuota > 1,

      seller: {
        ...ad.seller,
        verified: ad.seller?.verification?.status === "approved",
      },
    };
  })
  .sort((a, b) => {
    // 1️⃣ Boosted score dulu (kalau dua-duanya boosted)
    if (a.isBoosted && b.isBoosted) {
      return (b.boost?.score || 0) - (a.boost?.score || 0);
    }

    // 2️⃣ Boosted di atas semua
    if (a.isBoosted) return -1;
    if (b.isBoosted) return 1;

    // 3️⃣ Nearby (JANGAN DIRUSAK)
    if (canUseNearby) {
      return (a.distance || Infinity) - (b.distance || Infinity);
    }

    // 4️⃣ fallback terbaru
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  

let finalAds = fixedAds;

if (finalSearch) {
  finalAds = fixedAds.filter(ad =>
    ad.title?.toLowerCase().includes(finalSearch.toLowerCase())
  );
}

// ================= PRICE SORT =================
if (sortPrice === "low_high") {
  finalAds.sort((a, b) => (a.price || 0) - (b.price || 0));
}

if (sortPrice === "high_low") {
  finalAds.sort((a, b) => (b.price || 0) - (a.price || 0));
}

// ================= YEAR SORT =================
if (sortYear === "new_old") {
  finalAds.sort((a, b) => (b.year || 0) - (a.year || 0));
}

if (sortYear === "old_new") {
  finalAds.sort((a, b) => (a.year || 0) - (b.year || 0));
}

// ================= KM SORT =================
if (sortKm === "low_high") {
  finalAds.sort((a, b) => (a.km || 0) - (b.km || 0));
}

if (sortKm === "high_low") {
  finalAds.sort((a, b) => (b.km || 0) - (a.km || 0));
}



// 🔥 PAKAI HASIL FILTER
setAds(finalAds);
setCurrentPage(1);

} catch (err) {
  console.error("fetchAds error:", err);
  setError(err.message);
} finally {
  setLoading(false);
}
};

// ===================== HANDLE AUTOCOMPLETE =====================
const handleSelectAutocomplete = async (ad) => {
  setShowAutocomplete(false);
  setIsAutocompleteSelected(true);
  setSearchQuery(ad.title);

  try {
    const res = await fetch(`https://api.mogehub.com/api/ads/${ad.id}`);
    const data = await res.json();
    // 🔥 ambil boosted ads dari backend sama kayak fetchAds
    let boostedAds = [];
    try {
      const boostRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/boost`);
      if (boostRes.ok && (boostRes.headers.get("content-type") || "").includes("application/json")) {
        const boostData = await boostRes.json();
        boostedAds = boostData?.ads || [];
      }
    } catch (err) {
      console.warn("Failed to fetch boost ads:", err);
    }

    // 🔥 cek apakah ad ini ada di boost list
    const boostData = boostedAds.find((b) => b.adId === data.ad.id);
    const selectedAd = {
      ...data.ad,

       displayName:
    data.ad.seller?.type === "dealer"
      ? (data.ad.seller?.dealerName || data.ad.seller?.username)
      : data.ad.seller?.username,
      isBoosted: !!boostData,       // pake hasil pencarian boostData
      boost: boostData || null,     // kalau ada boostData, pakai
      isPremium: data.ad.seller?.subscription?.[0]?.productQuota > 1, // pake perhitungan premium
      seller: {
        ...data.ad.seller,
        verified: data.ad.seller?.verification?.status === "approved",
      },
    };
     
    setSelectedAutocompleteAd(selectedAd);
    setAds([selectedAd]);
    setCurrentPage(1);
  } catch (err) {
    console.error("Failed fetch ad detail for autocomplete:", err);
    setSelectedAutocompleteAd(ad);
    setAds([ad]);
    setCurrentPage(1);
  }
};

useEffect(() => {
  if (!searchQuery.trim()) {
    hardResetSearch();
    return;
  }
}, [searchQuery]);


  useEffect(() => {
  // setiap kali filter state berubah, fetchAds otomatis
  fetchAds(); // ambil data sesuai state terbaru
}, [selectedCategory, selectedSubcategory, selectedType, selectedAdType, sortPrice, sortYear, sortKm]);

// 🔥 MOBILE SEARCH BAR RESET: otomatis fetch semua iklan saat search bar kosong
useEffect(() => {
  if (searchQuery === "" && selectedAutocompleteAd === null) {
    fetchAds();
  }
}, [searchQuery, selectedAutocompleteAd]);


  useEffect(() => {
  if (!searchQuery.trim()) {
    setSearchResults([]);
    setShowAutocomplete(false);
    setSelectedAutocompleteAd(null);
    return;
  }

  if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

  debounceTimeout.current = setTimeout(async () => {
    try {
      // 🔹 endpoint sederhana tanpa nearby
      const res = await fetch(`https://api.mogehub.com/api/ads?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      // 🔹 filter ads yang title sesuai searchQuery
      const filteredAds = (data.ads || [])
        .filter(ad => ad.title?.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(ad => ({
          ...ad,
          seller: {
            ...ad.seller,
            verified: ad.seller?.verification?.status === "approved",
          },
         isBoosted: ad.isBoosted,
        }));

      setSearchResults(filteredAds);
      setShowAutocomplete(filteredAds.length > 0);

    } catch (err) {
      console.error("Search autocomplete failed:", err);
      setSearchResults([]);
      setShowAutocomplete(false);
    }
  }, 250);

  return () => clearTimeout(debounceTimeout.current);
}, [searchQuery]);
  useEffect(() => {
    if (selectedAutocompleteAd) {
      setAds([selectedAutocompleteAd]);
      setCurrentPage(1);
    }
  }, [selectedAutocompleteAd]);

  const bg = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const subText = useColorModeValue("gray.500", "gray.400");
  const iconColor = useColorModeValue("gray.400", "gray.300");
  const premiumBorderColor = useColorModeValue("yellow.400", "yellow.300");
  const normalBorderColor = useColorModeValue("gray.200", "gray.600");

  const autocompleteHoverBg = useColorModeValue("gray.100", "gray.600");

  const indexOfLastAd = currentPage * adsPerPage;
  const indexOfFirstAd = indexOfLastAd - adsPerPage;
  const currentAds = ads.slice(indexOfFirstAd, indexOfLastAd);

  useEffect(() => {
  const trackViews = async () => {
    if (!currentAds) return;

    const itemsToTrack = currentAds.filter(
      (ad) => ad.isBoosted && ad.boostId && !trackedBoosts[ad.boostId]
    );

    if (itemsToTrack.length === 0) return;

    try {
      await Promise.all(
        itemsToTrack.map((ad) =>
          fetch("https://api.mogehub.com/api/boost-tracking/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              boostAdId: ad.boostId,
              type: "view",
            }),
          })
        )
      );

      setTrackedBoosts((prev) => {
        const updated = { ...prev };
        itemsToTrack.forEach((ad) => {
          updated[ad.boostId] = true;
        });
        return updated;
      });

    } catch (err) {
      console.error("View tracking error:", err);
    }
  };

  trackViews();
}, [currentAds]); 


  const totalPages = Math.ceil(ads.length / adsPerPage);

  const handlePageChange = (page) => {
  setCurrentPage(page);
};

  if (error)
    return (
      <Flex minH="100vh" bg={bg} direction="column" align="center" p={4}>
        <Text color="red.500">Error: {error}</Text>
        <Footer />
      </Flex>
    );

  return (
    <Flex
  direction="column"
  bg={bg}
  minH="100vh"
  pb={isMobile || isTablet || isLargeTablet ? "64px" : "0px"}
>
      <Head>
        <title>{t?.all_ads || "All Ads"} | MogeHub</title>
        
      </Head>

      <Navbar />

     <Box
  display={{ base: "none", md: "block" }}
  px={8}
  pt={{ base: "110px", md: "20px" }}
>
  {locationAllowed && locationName && (
    <HStack spacing={3}>
      <LuMapPin />
      <Text fontSize="sm" fontWeight="medium">
        {locationName}
      </Text>
    </HStack>
  )}
</Box>



    <StickySearchBar
  ref={mobileSearchBarRef}
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  searchResults={searchResults}
  showAutocomplete={showAutocomplete}
  setShowAutocomplete={setShowAutocomplete}
  setSelectedAutocompleteAd={setSelectedAutocompleteAd}
  setIsFilterOpen={setIsFilterOpen}
  onHardResetSearch={hardResetSearch}
  onClear={() => {
    setSearchQuery("");
    setSelectedAutocompleteAd(null);
    fetchAds();
  }}
  onSearchSubmit={(query) => {
    setSelectedAutocompleteAd(null);
    fetchAds(query); 
  }}
/>

{/* 🔥 WRAPPER BIAR GA KETUTUP STICKY */}
<Box pt={{ base: "150px", md: "20px" }}>
  
  {/* MOBILE LOCATION */}
  <Box
    display={{ base: "block", md: "none" }}
    px={4}
    pt="6px"
    mb={1}
  >
    {locationAllowed && locationName && (
      <HStack spacing={2}>
        <LuMapPin />
        <Text fontSize="md" fontWeight="bold">
          {locationName}
        </Text>
      </HStack>
    )}
  </Box>

  {/* TITLE */}
  <Box px={{ base: 4, md: 8 }} pt={1} pb={2}>
    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
      {t?.all_ads || "All Ads"}
    </Text>
  </Box>

</Box>
      <Flex px={{ base: 2, md: 8 }} pt={{ base: 0, md: 1 }} align="flex-start" gap={6} flex="1">
        <Box display={{ base: "none", lg: "block" }} w="260px">
          <Box position="sticky" top="90px" bg={cardBg} p={4} borderRadius="md" shadow="sm">
            <Stack spacing={3}>
              <Text fontWeight="bold">{t["filter"] || "Filter"}</Text>

              <Box position="relative">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <IoSearch size={18} color={iconColor} />
                  </InputLeftElement>

                 <Input
                  placeholder={t?.searchProducts || "Search products..."}
                  value={searchQuery}
                  pl="40px"

                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);

                    setSelectedAutocompleteAd(null);
                    setIsAutocompleteSelected(false);

                    if (!value.trim()) {
                    hardResetSearch();
                    return;
                  } else {
                    setShowAutocomplete(true);
                  }
                  }}

                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();

                      setSelectedAutocompleteAd(null);
                      setShowAutocomplete(false);

                      fetchAds(searchQuery.trim());
                    }
                  }}

                  onFocus={() => {
                    if (searchResults.length > 0 && !isAutocompleteSelected) {
                      setShowAutocomplete(true);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                />

                  {searchQuery && (
                    <InputRightElement>
                      <Button
                        size="sm"
                        onClick={hardResetSearch}
                        variant="ghost"
                      >
                        ✕
                      </Button>
                    </InputRightElement>
                  )}
                </InputGroup>

                {showAutocomplete && !isAutocompleteSelected && searchResults.length > 0 && (
                  <Box
                    position="absolute"
                    bg={cardBg}
                    w="100%"
                    mt={1}
                    borderRadius="md"
                    shadow="md"
                    zIndex={10}
                    maxH="200px"
                    overflowY="auto"
                  >
                    {searchResults.map((ad) => (
                      <Flex
                        key={ad.id}
                        align="center"
                        p={2}
                        cursor="pointer"
                        _hover={{ bg: autocompleteHoverBg }}
                        onMouseDown={() => handleSelectAutocomplete(ad)}
                      >
                        <Image
                          src={ad.media?.[0]?.url || "/placeholder.png"}
                          boxSize="40px"
                          w="40px"
                          h="40px"
                          objectFit="cover"
                          borderRadius="md"
                          mr={2}
                        />
                        <Text noOfLines={1} fontSize="sm">
                          {ad.title}
                        </Text>
                      </Flex>
                    ))}
                  </Box>
                )}
              </Box>

              <Select
                placeholder={t?.category || "Category"}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory("");
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
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
              >
                {selectedCategory &&
                  categories
                    .find((c) => c.name === selectedCategory)
                    ?.subcategories.map((sc) => (
                      <option key={sc.id} value={sc.name}>
                        {sc.name}
                      </option>
                    ))}
              </Select>

              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">{t?.all || "All"}</option>
                <option value="premium">{t?.highlight || "Highlight"}</option>
                <option value="free">{t?.regular || "Regular"}</option>
              </Select>

              <Select
                value={selectedAdType}
                onChange={(e) => setSelectedAdType(e.target.value)}
              >
                <option value="all">{t?.allTypes || "All Types"}</option>
                <option value="jual">{t?.sell || "Jual"}</option>
                <option value="sewa">{t?.rent || "Sewa"}</option>
              </Select>

              <AddFilter
              selectedCategory={selectedCategory}
              setSortPrice={setSortPrice}
              setSortYear={setSortYear}
              setSortKm={setSortKm}
              sortPrice={sortPrice}
              sortYear={sortYear}
              sortKm={sortKm}
            />

              <Button
                mt={7}
                bg="#ceff00"
                color="black"
                _hover={{ bg: "#bfff00" }}
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedSubcategory("");
                  setSelectedType("all");
                  setSelectedAdType("all");
                  setSearchQuery("");
                  setSelectedAutocompleteAd(null);
                  fetchAds();
                }}
              >
               {t?.reset || "Reset"}
              </Button>
            </Stack>
          </Box>
        </Box>

       <Box flex="1" mt={2} position="relative" pb={12}>
        <TotalAdsProduct
    totalAllAds={ads.length}
    filteredAds={ads}
    selectedCategory={selectedCategory}
    selectedSubcategory={selectedSubcategory}
  searchQuery={searchQuery}
  />
          {loading && (
            <Flex
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              align="center"
              justify="center"
              bg={bg}
              zIndex="10"
            >
              <Spinner size="lg" />
            </Flex>
          )}
         
  {!loading && currentAds.length === 0 ? (
  <Flex
    direction="column"
    align="center"
    justify="center"
    w="100%"
    py={20}
    textAlign="center"
  >
    <TbSearchOff size={80} />

    <Text mt={4} fontSize="lg" fontWeight="semibold">
      {hasSearch
        ? t?.no_ads_for_keyword?.replace("{keyword}", searchQuery) ||
          `No ads found for "${searchQuery}"`
        : t?.no_ads_found || "No ads found"}
    </Text>

    <Text fontSize="sm" color={subText} mt={2}>
      {hasSearch
        ? t?.no_ads_for_keyword_desc ||
          "Try using a different keyword or broader search"
        : t?.no_ads_found_desc ||
          "Try searching with a different keyword"}
    </Text>
  </Flex>
) : (

  <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={6}>
  {currentAds.map((ad) => {
    return (
     <Link
          key={ad.id}
          href={`/ad/${ad.id}`}
          _hover={{ textDecoration: "none" }}
          onClick={() => handleAdClick(ad)}
        >
        <Box
          bg={cardBg}
          borderRadius="md"
          overflow="hidden"
          border="1px solid"
          borderColor={ad.isPremium ? premiumBorderColor : normalBorderColor}
          shadow={ad.isPremium ? "md" : "sm"}
          _hover={{ transform: "scale(1.02)" }}
          display="flex"
          flexDirection="column"
          minH="360px"
        >
          <Box flex="1" position="relative">
            {/* Cover Image */}
            <Image
            src={ad.media?.[0]?.url || "/placeholder.png"}
            w="100%"
            h="auto"
            aspectRatio={{ base: 1, md: 4 / 3 }}
            objectFit="cover"
            borderRadius="md"
          />

            {/* 🔥 Sponsored Badge di kanan atas */}
            {ad.isBoosted && (
              <HStack
                position="absolute"
                top={2}
                right={2}
                bg="rgba(50,50,50,0.6)" // abu2 semi-transparent
                px={2}
                py={1}
                borderRadius="md"
                spacing={1}
                align="center"
              >
                <GoGlobe size={16} color="white" />
                <Text fontSize="xs" fontWeight="bold" color="white">
                  Sponsored
                </Text>
              </HStack>
            )}
          </Box>

          {/* Stack Content */}
          <Stack p={2} spacing={1} flex="1" position="relative">
            {/* 🔥 Badges atas title */}
            <Flex justify="space-between" mb={1} minH="24px">
              {ad.isPremium && (
                <HStack
                  as={Badge}
                  px={2}
                  py={1}
                  spacing={1}
                  borderRadius="md"
                  colorScheme="yellow"
                  w="fit-content"
                >
                  <FcFlashOn size={16} />
                  <Text fontSize="xs" fontWeight="bold">
                    Highlight
                  </Text>
                </HStack>
              )}
            </Flex>
        

            {/* Title */}
            <Text fontWeight="bold" noOfLines={1}>
              {ad.title}
            </Text>

            {/* Harga */}
            <Text>
              {ad.currency} {ad.price?.toLocaleString() || "-"}
            </Text>

           {/* Seller */}
          <HStack spacing={2} mt={1} align="center" minW={0}>
            <Avatar
              size="xs"
              src={ad.seller?.profilePhoto || ""}
              name={ad.displayName || ad.seller?.username || "User"}
              flexShrink={0}
            />

            <HStack spacing={1} minW={0}>
              <Text
                fontSize="sm"
                fontWeight="medium"
                noOfLines={1}
                maxW="120px"
                isTruncated
              >
                {ad.displayName || ad.seller?.username || "User"}
              </Text>

              <VerifiedBadge show={ad.seller?.verified} />
            </HStack>
          </HStack>

            {/* Time Ago */}
            <Text fontSize="xs" color={subText}>
              {timeAgo(ad.createdAt, language)}
            </Text>
          </Stack>
        </Box>
      </Link>
    );
  })}
</SimpleGrid>
)}
          {totalPages > 1 && (
            <Flex justify="center" mt={6} mb={10} gap={2} wrap="wrap">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  size="sm"
                  onClick={() => handlePageChange(i + 1)}
                  variant={currentPage === i + 1 ? "solid" : "outline"}
                >
                  {i + 1}
                </Button>
              ))}
            </Flex>
          )}
          <Box minH="120px" />
        </Box>
      </Flex>

      <MobileFilterBar onOpen={() => setIsFilterOpen(true)} />

      <FilterDrawer
      isOpen={isFilterOpen}
      onClose={() => setIsFilterOpen(false)}
      categories={categories}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      selectedSubcategory={selectedSubcategory}
      setSelectedSubcategory={setSelectedSubcategory}
      selectedType={selectedType}
      setSelectedType={setSelectedType}
      selectedAdType={selectedAdType}
      setSelectedAdType={setSelectedAdType}
      fetchAds={fetchAds}
      locationAllowed={locationAllowed}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      setSelectedAutocompleteAd={setSelectedAutocompleteAd}
      useNearby={useNearby}
      setUseNearby={setUseNearby}
      coords={coords}
      setCoords={setCoords}
      onEmptySearch={() => {
        // reset MobileSearchBar state
        setSelectedAutocompleteAd(null);
        setSearchQuery("");
      }}
    />

      <Footer />
    </Flex>
  );
}







