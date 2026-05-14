"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Textarea,
  Button,
  Select,
  VStack,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  useColorMode,
  useColorModeValue,
  useToast,
  IconButton,
  Image,
  Badge,
  Spinner,
  AspectRatio,
  AlertTitle,
  AlertDescription,
  Switch,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Divider,
  Alert,
  AlertIcon,
  Modal,              
  ModalOverlay,       
  ModalContent,       
  ModalBody,          
  ModalCloseButton,   
  useDisclosure,
} from "@chakra-ui/react";
import { SmallCloseIcon, EditIcon, DeleteIcon, AddIcon } from "@chakra-ui/icons";
import { FaFacebook } from "react-icons/fa";          
import { FaInstagram } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import { useState, useEffect, useRef, useCallback } from "react";
import AdHistoryDrawer from "@/components/ads/AdHistoryDrawer";
import BoostButton from "@/components/BoostButton";
import BoostDrawer from "@/components/BoostDrawer";
import BoostCheckout from "@/components/boostCheckout";
import { desktopOnly, mobileOnly } from "@/utils/responsive";
import dynamic from "next/dynamic";
// Marketplace icons
import { marketplaceIcons, getMarketplaceIcon } from "@/utils/marketplaceIcons";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
import PreviewAds from "@/components/PreviewAds";
import AdsHelp from "@/components/AdsHelp";

const AdsMap = dynamic(() => import("@/components/AdsMap"), { ssr: false });

const translations = { en, id };
const API = `${process.env.NEXT_PUBLIC_API_URL}/seller`;



export default function AdsPage() {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const previewColor = useColorModeValue("gray.800", "white");
  const supportInputRef = useRef(null);
  const {
  isOpen: isBoostOpen,
  onOpen: onBoostOpen,
  onClose: onBoostClose,
} = useDisclosure();

const {
  isOpen: isCheckoutOpen,
  onOpen: onCheckoutOpen,
  onClose: onCheckoutClose,
} = useDisclosure();

const [selectedAdId, setSelectedAdId] = useState(null);
const [selectedPackage, setSelectedPackage] = useState(null);
const handleOpenBoost = (adId) => {
  setSelectedAdId(adId);
  onBoostOpen();
};
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [indonesiaCities, setIndonesiaCities] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [useDurationOnly, setUseDurationOnly] = useState(false);
  const [form, setForm] = useState({
    categoryId: "",
    subcategoryId: "",
    title: "",
    description: "",
    type: "",
    year: "",
    km: "",
    price: "",
    currency: "Rp",
    city: "",
    addressDetail: "",
    latitude: null,
    longitude: null,
    rentalStart: "",
    rentalEnd: "",
    rentalDuration: "",
    youtubeLink: "",
    supportFiles: [],
    status: "active",
    cc: "",
    phone: "",
    socials: [],
    license: "",
    marketplace: [],
  });
  const [existingMedia, setExistingMedia] = useState([]);
  const [removedMediaIds, setRemovedMediaIds] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [adPolicy, setAdPolicy] = useState(null);

useEffect(() => {
  const fetchPolicy = async () => {
    try {
      const res = await fetch(`${API}/ads/create-policy`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed fetch policy");

      setAdPolicy(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (token) fetchPolicy();
}, [token]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("user");
      const tkn = localStorage.getItem("token");
      if (u) setUser(JSON.parse(u));
      if (tkn) setToken(tkn);
    }
  }, []);

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [catRes, cityRes] = await Promise.all([
          fetch(`${API}/categories`),
          fetch(`${API}/cities`),
        ]);
        const catData = await catRes.json();
        const cityData = await cityRes.json();
        setCategories(catData || []);
        setIndonesiaCities(cityData || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMaster();
  }, []);

  const fetchAds = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/ads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const withVersion = (data.ads || []).map((ad) => ({
          ...ad,
          _v: Date.now(),
          media: ad.media.map((m) => ({ ...m, url: m.url || "https://via.placeholder.com/180" })),
        }));
        setAds(withVersion);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAds();
  }, [token]);

  const loadHistory = useCallback(async () => {
    if (!token) return [];
    try {
      const res = await fetch(`${API}/ads/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || t.failedFetchHistory);
      return data.history || [];
    } catch (e) {
      toast({ title: e.message, status: "error" });
      return [];
    }
  }, [token, t.failedFetchHistory, toast]);

  const clearError = (name) => {
    setErrors((prev) => {
      const n = { ...prev };
      delete n[name];
      return n;
    });
  };

  const handleCategoryChange = (e) => {
  const id = e.target.value;
  const cat = categories.find((c) => c.id === Number(id));

  setForm((prev) => {
    let updated = {
      ...prev,
      categoryId: id,
      subcategoryId: "",
    };

    const name = cat?.name?.toLowerCase();

    if (name === "motor baru") {
      updated.km = ""; // 🔥 RESET KM
    }

    // 🔥 RESET CC & LICENSE kalau bukan motor
    if (!["motor baru", "motor bekas"].includes(cat?.name?.toLowerCase())) {
      updated.cc = "";
      updated.license = "";
      updated.km = "";
    }

    return updated;
  });

  clearError("categoryId");
  setSubcategories(cat ? cat.subcategories || cat.sub || [] : []);
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleCcChange = (e) => {
    const onlyNumber = e.target.value.replace(/[^0-9]/g, "");
    setForm((prev) => ({ ...prev, cc: onlyNumber }));
    clearError("cc");
  };

  const handlePhoneChange = (e) => {
  const onlyNumber = e.target.value.replace(/[^0-9]/g, "");
  setForm((prev) => ({ ...prev, phone: onlyNumber }));
  clearError("phone");
};

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setForm((prev) => ({ ...prev, supportFiles: [...prev.supportFiles, ...files] }));
    clearError("supportFiles");
    e.target.value = null;
  };

  const removeFile = (index) => {
    setForm((prev) => ({ ...prev, supportFiles: prev.supportFiles.filter((_, i) => i !== index) }));
  };

  const removeExistingMedia = (index) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
    setRemovedMediaIds((prev) => [...prev, index]);
  };


  const triggerFileInput = () => supportInputRef.current?.click();

  const getEmbedLink = (url) => {
    if (!url) return "";
    const regex = /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w-]+)/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : "";
  };

  const selectedCategory = categories.find((c) => c.id === Number(form.categoryId));
  const isMotorCategory =
    selectedCategory && ["motor baru", "motor bekas"].includes(selectedCategory.name.toLowerCase());
    const isMotorBaru =
  selectedCategory?.name?.toLowerCase() === "motor baru";

const isMotorBekas =
  selectedCategory?.name?.toLowerCase() === "motor bekas";

  const validate = () => {
    const e = {};
    if (!form.categoryId) e.categoryId = true;
    if (!form.subcategoryId) e.subcategoryId = true;
    if (!form.title) e.title = true;
    if (!form.description) e.description = true;
    if (!form.type) e.type = true;
    if (!form.price) e.price = true;
    if (!form.currency) e.currency = true;
    if (!form.city) e.city = true;
    if (!form.phone) e.phone = true;
    // hanya validasi saat create
    if (!editMode && (!form.latitude || !form.longitude)) {
      e.location = true;
    }
    if (!form.addressDetail) e.addressDetail = true;
    if (form.type === "sewa") {
  if (useDurationOnly) {
    if (!form.rentalDuration || Number(form.rentalDuration) <= 0)
      e.rentalDuration = true;
  } else {
    if (!form.rentalStart) e.rentalStart = true;
    if (!form.rentalEnd) e.rentalEnd = true;

    // VALIDASI END DATE
    if (form.rentalStart && form.rentalEnd) {
      if (new Date(form.rentalEnd) < new Date(form.rentalStart)) {
        e.rentalEnd = true;
      }
    }
  }
}

if (isMotorBaru && (!form.year || Number(form.year) < 1900)) {
    e.year = true;
  }

  if (isMotorBekas && (!form.year || Number(form.year) < 1900)) {
    e.year = true;
  }

  // 🔥 KM ONLY FOR MOTOR BEKAS
if (isMotorBekas === true) {
  if (!form.km || Number(form.km) < 0) {
    e.km = true;
  }
} else {
  delete e.km;
}
    if (isMotorCategory && (!form.cc || Number(form.cc) < 500)) e.cc = true;
    if (isMotorCategory && !form.license) e.license = true;
    if (!editMode && form.supportFiles.length === 0) e.supportFiles = true;
    if (editMode && form.supportFiles.length === 0 && existingMedia.length === 0) e.supportFiles = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast({ title: t.fillRequiredFields, status: "error", duration: 2000, isClosable: true });
      return;
    }
    if (!user || !token) {
      toast({ title: t.loginFirst, status: "error" });
      return;
    }

    setSubmitLoading(true);
    const formData = new FormData();
        Object.keys(form).forEach((key) => {
      if (key === "supportFiles") {
        form.supportFiles.forEach((f) => formData.append("media", f));
      }
      // skip latitude/longitude karena nanti langsung append ke lat/lng
      else if (key === "latitude" || key === "longitude") return;
      else if (key === "socials") return;
      else if (key === "marketplace") return;
      else formData.append(key, form[key] ?? "");
    });

    // Tambahkan ini setelah loop
    formData.append("lat", form.latitude ? parseFloat(form.latitude) : null);
    formData.append("lng", form.longitude ? parseFloat(form.longitude) : null);
    const socialsToSend = (form.socials || [])
  .filter(s => s.type?.trim() && s.value?.trim());
    formData.append("socials", JSON.stringify(socialsToSend));
    const cleanmarketplace = (form.marketplace || [])
  .filter(m => m.type?.trim() && m.url?.trim());

formData.append("marketplace", JSON.stringify(cleanmarketplace));
    if (removedMediaIds.length > 0)
      formData.append("removedMediaIndices", JSON.stringify(removedMediaIds));

    

    const cleanFaqs = (faqs || [])
      .filter((f) => f.question?.trim() && f.answer?.trim())
      .map((f, i) => ({ question: f.question.trim(), answer: f.answer.trim(), order: i }));
    if (cleanFaqs.length > 0) formData.append("faqs", JSON.stringify(cleanFaqs));

    try {
      const url = editMode ? `${API}/ads/${editId}` : `${API}/ads`;
      const method = editMode ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || t.failedSaveAd);

      const ad = data?.ad;
      const isPending = ad?.status === "pending_review";

      toast({
        title: isPending
          ? editMode
            ? "Iklan berhasil diperbaharui, sedang dalam proses review. Silakan cek email secara berkala."
            : "Iklan berhasil dibuat, sedang dalam review. Silakan cek email secara berkala."
          : editMode
          ? t.adUpdated
          : t.adCreated,
        status: isPending ? "info" : "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchAds();
      resetForm();
    } catch (err) {
      toast({ title: err.message, status: "error" });
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      categoryId: "",
      subcategoryId: "",
      title: "",
      description: "",
      type: "",
      year: "",
      km: "",
      price: "",
      currency: "Rp",
      city: "",
      addressDetail: "",
      latitude: null,
      longitude: null,
      rentalStart: "",
      rentalEnd: "",
      rentalDuration: "",
      youtubeLink: "",
      supportFiles: [],
      status: "active",
      cc: "",
      phone: "",          
      socials: [],
      license: "",
      marketplace: [],   
    });
    setExistingMedia([]);
    setRemovedMediaIds([]);
    setFaqs([]);
    setErrors({});
    setEditMode(false);
    setEditId(null);
    setUseDurationOnly(false);
    setSubcategories([]);
    
  };

  const addFaq = () => setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  const updateFaq = (index, key, value) => setFaqs((prev) => { const c = [...prev]; c[index][key] = value; return c; });
  const removeFaq = (index) => setFaqs((prev) => prev.filter((_, i) => i !== index));

  const addSocial = (type) => {
  setForm(prev => ({
    ...prev,
    socials: [...(prev.socials || []), { type, value: "" }]
  }));
};

const updateSocial = (index, value) => {
  setForm(prev => {
    const newSocials = [...(prev.socials || [])];
    newSocials[index].value = value;
    return { ...prev, socials: newSocials };
  });
};

const removeSocial = (index) => {
  setForm(prev => {
    const newSocials = [...(prev.socials || [])];
    newSocials.splice(index, 1);
    return { ...prev, socials: newSocials };
  });
};

// ================= MARKETPLACE =================
const addMarketplace = (type) => {
  setForm(prev => ({
    ...prev,
    marketplace: [...(prev.marketplace || []), { type, url: "" }]
  }));
};

const updateMarketplace = (index, value) => {
  setForm(prev => {
    const arr = [...(prev.marketplace || [])];
    arr[index].url = value;
    return { ...prev, marketplace: arr };
  });
};

const removeMarketplace = (index) => {
  setForm(prev => {
    const arr = [...(prev.marketplace || [])];
    arr.splice(index, 1);
    return { ...prev, marketplace: arr };
  });
};

  const handleEdit = (ad) => {
    setForm({
      categoryId: ad.categoryId?.toString() || "",
      subcategoryId: ad.subcategoryId?.toString() || "",
      title: ad.title || "",
      description: ad.description || "",
      type: ad.type || "",
      year: ad.year || "",
      km: ad.category?.name?.toLowerCase() === "motor bekas" ? ad.km || "" : "",
      price: ad.price || "",
      currency: ad.currency || "Rp",
      city: ad.city || "",
      addressDetail: ad.addressDetail || "",
      latitude: ad.lat || null,
      longitude: ad.lng || null,
      rentalStart: ad.rentalStart ? ad.rentalStart.slice(0, 10) : "",
      rentalEnd: ad.rentalEnd ? ad.rentalEnd.slice(0, 10) : "",
      rentalDuration: ad.rentalDuration || "",
      youtubeLink: ad.youtubeLink || "",
      supportFiles: [],
      status: ad.status || "active",
      cc: ad.cc ? String(ad.cc) : "",
      phone: ad.phone || "", 
      socials: Array.isArray(ad.socials) ? ad.socials : [],
      license: ad.license || "",
      marketplace: Array.isArray(ad.marketplace) ? ad.marketplace : [],
    });
    const cat = categories.find((c) => c.id === ad.categoryId);
    setSubcategories(cat ? cat.subcategories || cat.sub || [] : []);
    setExistingMedia(ad.media || []);
    setRemovedMediaIds([]);
    setFaqs(Array.isArray(ad.faqs) ? ad.faqs.map((f) => ({ question: f.question || "", answer: f.answer || "" })) : []);
    setErrors({});
    setEditMode(true);
    setEditId(ad.id);
    setUseDurationOnly(!!ad.rentalDuration);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
  if (!confirm(t.confirmDeleteAd)) return;

  try {
    const res = await fetch(`${API}/ads/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || t.failedDeleteAd);

    // reset state dulu biar form bersih & list ads update
    await fetchAds();
    resetForm();

    // toast pake key translation
    toast({
      title: t.adDeleted, // key di JSON
      description: t.adDeletedDescription, // key di JSON, misal "Your ad has been successfully deleted."
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } catch (e) {
    toast({ title: e.message, status: "error" });
  }
};

  const toggleStatus = async (ad) => {
  // 🚫 block status tertentu
  if (["pending_review", "rejected"].includes(ad.status)) return;

  // 🚨 CEK QUOTA (INI YANG LU BUTUH)
  if (ad.status === "inactive" && ad.isQuotaExceeded) {
    toast({
      title: "Quota iklan habis",
      description: "Silahkan upgrade paket untuk menambah quota atau hapus iklan lain untuk aktifkan iklan ini.",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return; // ⛔ STOP TOTAL
  }

  const newStatus = ad.status === "active" ? "inactive" : "active";

  try {
    // ⚡ optimistic update
    setAds((prev) =>
      prev.map((a) =>
        a.id === ad.id ? { ...a, status: newStatus } : a
      )
    );

    const res = await fetch(`${API}/ads/${ad.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || t.failedUpdateStatus);
    }
  } catch (e) {
    toast({
      title: e.message,
      status: "error",
      duration: 3000,
      isClosable: true,
    });

    await fetchAds(); // 🔄 sync ulang
  }
};

  if (loading) return (<Flex justify="center" py={10}><Spinner /></Flex>);

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 1, lg: 2 }} spacing={6}>
        {/* Form Ads */}
        <Box {...desktopOnly} bg={colorMode === "light" ? "white" : "gray.700"} p={6} borderRadius="md" shadow="sm" borderWidth="1px">
          <VStack spacing={4} align="stretch">
           <HStack spacing={2}>
            <Heading size="md">
              {editMode ? t.editAd : t.createNewAd}
            </Heading>
            <AdsHelp />
          </HStack>
            {adPolicy?.showPreCreateAlert && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
               {t.basicInfo}
              </Alert>
            )}

            {/* Category */}
            <FormControl isInvalid={errors.categoryId} isRequired>
              <Select placeholder={t.selectCategory} value={form.categoryId} onChange={handleCategoryChange}focusBorderColor="#90cdf4">
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </Select>
              <FormErrorMessage>{t.categoryRequired}</FormErrorMessage>
            </FormControl>

            {/* Subcategory */}
            <FormControl isInvalid={errors.subcategoryId} isRequired>
              <Select placeholder={t.selectSubcategory} name="subcategoryId" value={form.subcategoryId} onChange={handleInputChange} focusBorderColor="#90cdf4" isDisabled={!subcategories.length}>
                {subcategories.map((sub) => (<option key={sub.id} value={sub.id}>{sub.name}</option>))}
              </Select>
              <FormErrorMessage>{t.subcategoryRequired}</FormErrorMessage>
            </FormControl>

            

            <FormControl isInvalid={errors.title} isRequired><Input placeholder={t.title} name="title" value={form.title} onChange={handleInputChange}focusBorderColor="#90cdf4"/><FormErrorMessage>{t.titleRequired}</FormErrorMessage></FormControl>
            <FormControl isInvalid={errors.description} isRequired>
            <FormControl isInvalid={errors.description} isRequired mb={4}>
              <Textarea
                placeholder={t.description}
                name="description"
                value={form.description}
                onChange={handleInputChange}
                focusBorderColor="#90cdf4"
              />
              <FormErrorMessage>{t.descriptionRequired}</FormErrorMessage>
            </FormControl>

            {/* Motor Section */}
            {isMotorCategory && (
              <VStack spacing={4} align="stretch" mt={2}>
                
                {/* CC */}
                <FormControl isInvalid={errors.cc} isRequired>
                  <Input
                    placeholder={t.motorCC}
                    name="cc"
                    value={form.cc}
                    onChange={handleCcChange}
                    focusBorderColor="#90cdf4"
                  />
                  <Text fontSize="sm" opacity={0.7} mt={1}>
                    Minimum 500 CC
                  </Text>
                  <FormErrorMessage>{t.ccMin}</FormErrorMessage>
                </FormControl>

                {/* LICENSE */}
                <FormControl isInvalid={errors.license} isRequired>
                  <FormLabel>{t.license}</FormLabel>
                  <Select
                    placeholder="Pilih License"
                    value={form.license}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, license: e.target.value }))
                    }
                    focusBorderColor="#90cdf4"
                  >
                    <option value="full_paper">Full Paper</option>
                    <option value="no_paper">No Paper</option>
                  </Select>
                  <FormErrorMessage>{t.licenseIsRequired}</FormErrorMessage>
                </FormControl>

                {/* MOTOR BARU */}
                {isMotorBaru && (
                  <FormControl isInvalid={errors.year} isRequired>
                    <Input
                     placeholder={t.motorYear}
                      name="year"
                      value={form.year}
                      onChange={handleInputChange}
                      focusBorderColor="#90cdf4"
                    />
                  </FormControl>
                )}

                {/* MOTOR BEKAS */}
                {isMotorBekas && (
                  <VStack spacing={4} align="stretch">
                    <FormControl isInvalid={errors.year} isRequired>
                      <Input
                        placeholder="Tahun Motor"
                        name="year"
                        value={form.year}
                        onChange={handleInputChange}
                        focusBorderColor="#90cdf4"
                      />
                    </FormControl>

                    <FormControl isInvalid={errors.km} isRequired>
                      <Input
                        placeholder="Kilometer (KM)"
                        name="km"
                        value={form.km}
                        onChange={handleInputChange}
                        focusBorderColor="#90cdf4"
                      />
                    </FormControl>
                  </VStack>
                )}

              </VStack>
            )}

            <FormErrorMessage>{t.descriptionRequired}</FormErrorMessage></FormControl>
            <FormControl isInvalid={errors.type} isRequired>
              <Select placeholder={t.type} name="type" value={form.type} onChange={handleInputChange} focusBorderColor="#90cdf4">
                <option value="jual">{t.sell}</option>
                <option value="sewa">{t.rent}</option>
              </Select>
              <Text fontSize="sm" opacity={0.7} mt={1}>
            {t.typeDesc}
          </Text>
              <FormErrorMessage>{t.typeRequired}</FormErrorMessage>
            </FormControl>
             
            {/* Rental */}
{/* Rental */}
{form.type === "sewa" && (
  <>
    {/* Jika toggle NON AKTIF, tampil tanggal */}
    {!useDurationOnly && (
      <>
        <FormControl isInvalid={errors.rentalStart} isRequired>
          <FormLabel>{t.startDate}</FormLabel>
          <Input
            type="date"
            name="rentalStart"
            value={form.rentalStart}
            onChange={handleInputChange}
            focusBorderColor="#90cdf4"
          />
          <FormErrorMessage>{t.rentalStartRequired}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.rentalEnd} isRequired mt={4}>
          <FormLabel>{t.endDate}</FormLabel>
          <Input
            type="date"
            name="rentalEnd"
            value={form.rentalEnd}
            onChange={handleInputChange}
            focusBorderColor="#90cdf4"
          />
          <FormErrorMessage>{t.rentalEndRequired}</FormErrorMessage>
        </FormControl>
      </>
    )}

    <Divider my={4} />

    {/* Toggle tetap selalu tampil */}
    <HStack justify="space-between" mb={2}>
      <Text fontWeight="semibold">{t.usingDay}</Text>
      <Switch
        isChecked={useDurationOnly}
        onChange={(e) => {
          const checked = e.target.checked;
          setUseDurationOnly(checked);

          if (checked) {
            // Hide tanggal & reset value
            setForm(prev => ({ ...prev, rentalStart: "", rentalEnd: "" }));
          } else {
            // Hide durasi & reset value
            setForm(prev => ({ ...prev, rentalDuration: "" }));
          }
        }}
      />
    </HStack>

    {/* Jika toggle AKTIF, tampil durasi */}
    {useDurationOnly && (
      <FormControl isInvalid={errors.rentalDuration} isRequired mt={2}>
        <FormLabel>{t.duration}</FormLabel>
        <Input
          type="number"
          name="rentalDuration"
          min={1}
          placeholder={t.durationDays}
          value={form.rentalDuration}
          onChange={handleInputChange}
          focusBorderColor="#90cdf4"
        />
        <Text fontSize="sm" opacity={0.7} mt={1}>
            {t.durationDesc}
          </Text>
        <FormErrorMessage>{t.durationRequired}</FormErrorMessage>
      </FormControl>
      
    )}
     <Divider my={4} />
  </>
)}
            <FormControl isInvalid={errors.price} isRequired>
            <Input
              placeholder={t.price}
              type="number"
              name="price"
              value={form.price}
              onChange={handleInputChange}
              focusBorderColor="#90cdf4"
            />
            <FormErrorMessage>{t.priceRequired}</FormErrorMessage>

            {/* Preview harga */}
            {form.price && (
              <Text
              fontSize="sm"
              color={previewColor}
              mt={1}
              fontWeight="bold"
            >
              Preview: {form.currency === "Rp"
                ? new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(form.price)
                : `$${Number(form.price).toLocaleString()}`}
            </Text>
            )}
          </FormControl>
            <FormControl><Select name="currency" value={form.currency} onChange={handleInputChange}focusBorderColor="#90cdf4"><option value="Rp">Rp</option><option value="$">$</option></Select></FormControl>

            {/* City */}
            <FormControl isInvalid={errors.city} isRequired>
              <Select
                placeholder={t.selectCity}
                name="city"
                value={form.city}
                onChange={handleInputChange}
                focusBorderColor="#90cdf4"
              >
                {indonesiaCities.map((prov) => (
                  <optgroup key={prov.province} label={prov.province}>
                    {prov.cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
              <FormErrorMessage>{t.cityRequired}</FormErrorMessage>
            </FormControl>

            {/* Map Component */}
            <FormControl isInvalid={errors.location} isRequired>
            <FormLabel>{t.locationAds}</FormLabel>

           <AdsMap 
            form={form} 
            setForm={setForm} 
            clearError={clearError}
          />

            <Text fontSize="sm" opacity={0.7} mt={1}>
              {t.dragMarker}
            </Text>

            <FormErrorMessage>
              {t.errorDragMap}
            </FormErrorMessage>
          </FormControl>

            <FormControl mt={4}>
          <FormLabel>{t.detailAddressMap}</FormLabel>

          <Textarea
            placeholder="ex: Jl. Pondok Indah No.12"
            value={form.addressDetail || ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                addressDetail: e.target.value,
              }))
            }
            focusBorderColor="#90cdf4"
            resize="vertical" 
            minH="80px"
          />

          <Text fontSize="sm" opacity={0.7} mt={1}>
            {t.changeSpesificAddress}
          </Text>
          <FormErrorMessage>
          {t.fillDetailAddress}
        </FormErrorMessage>
        </FormControl>

           

            {/* YouTube */}
            <Input placeholder={t.youtubeLinkPlaceholder} name="youtubeLink" value={form.youtubeLink} onChange={handleInputChange} focusBorderColor="#90cdf4"/>
            <Text fontSize="sm" opacity={0.7} mt={1}>
              {t.linkYoutubeAd}
            </Text>
            {form.youtubeLink && <AspectRatio ratio={16 / 9}><iframe src={getEmbedLink(form.youtubeLink)} allowFullScreen /></AspectRatio>}

            <Divider />

            <FormControl isInvalid={errors.phone} isRequired>
            <Input
              placeholder={t.phonePlaceholder}
              name="phone"
              value={form.phone || ""}
              onChange={handlePhoneChange}
              focusBorderColor="#90cdf4"
            />
             <Text fontSize="sm" opacity={0.7} mt={1}>
              {t.bannerPhone}
            </Text>
            <FormErrorMessage>{t.phoneRequired}</FormErrorMessage>
          </FormControl>

            {/* FAQ */}
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Heading size="sm">{t.faqOptional}</Heading>
                <IconButton size="sm" icon={<AddIcon />} aria-label={t.addFaq} onClick={addFaq} />
              </HStack>
              {faqs.length === 0 && <Text fontSize="sm" color="gray.500">{t.noFaq}</Text>}
              {faqs.map((faq, idx) => (
                <Box key={idx} borderWidth="1px" borderRadius="md" p={3}>
                  <HStack justify="space-between" mb={2}><Text fontWeight="semibold" fontSize="sm">{t.faq} #{idx + 1}</Text><IconButton size="xs" icon={<DeleteIcon />} aria-label={t.deleteFaq} onClick={() => removeFaq(idx)} /></HStack>
                  <Input mb={2} placeholder={t.question} value={faq.question} onChange={(e) => updateFaq(idx, "question", e.target.value)} />
                  <Textarea placeholder={t.answer} value={faq.answer} onChange={(e) => updateFaq(idx, "answer", e.target.value)} />
                </Box>
              ))}
            </VStack>

            <Divider my={4} />

            {/* ================= SOCIAL MEDIA ================= */}
          <VStack align="stretch" spacing={4}>
            
            <Heading size="sm">Social Media</Heading>

            <HStack justify="space-between">
              <Text fontWeight="semibold" fontSize="sm" opacity={0.7}>
                {t.socialMediaOptional}
              </Text>

              <Menu>
                <MenuButton as={Button} size="sm">
                  Add Social
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => addSocial("facebook")}>Facebook</MenuItem>
                  <MenuItem onClick={() => addSocial("twitter")}>Twitter</MenuItem>
                  <MenuItem onClick={() => addSocial("instagram")}>Instagram</MenuItem>
                  <MenuItem onClick={() => addSocial("youtube")}>YouTube</MenuItem>
                </MenuList>
              </Menu>
            </HStack>

            {form.socials?.map((s, idx) => (
              <HStack key={idx}>
                {s.type === "facebook" && <FaFacebook color="#1877F2" size={24} />}
                {s.type === "twitter" && <FaSquareXTwitter size={24} />}
                {s.type === "instagram" && <FaInstagram color="#E1306C" size={24} />}
                {s.type === "youtube" && <FaYoutube color="#FF0000" size={24} />}

                <Input
                  placeholder={`${s.type} URL`}
                  value={s.value}
                  onChange={(e) => updateSocial(idx, e.target.value)}
                  focusBorderColor="#90cdf4"
                />

                <IconButton
                  size="sm"
                  icon={<SmallCloseIcon />}
                  onClick={() => removeSocial(idx)}
                />
              </HStack>
            ))}
          </VStack>

          {/* ================= DIVIDER ================= */}
          <Divider my={6} />

          {/* ================= MARKETPLACE ================= */}
          <VStack align="stretch" spacing={4}>

            <Heading size="sm">Marketplace</Heading>

            <HStack justify="space-between">
              <Text fontWeight="semibold" fontSize="sm" opacity={0.7}>
                {t.marketplaceOptional}
              </Text>

              <Menu>
                <MenuButton as={Button} size="sm">
                  Add Marketplace
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => addMarketplace("tokopedia")}>Tokopedia</MenuItem>
                  <MenuItem onClick={() => addMarketplace("shopee")}>Shopee</MenuItem>
                  <MenuItem onClick={() => addMarketplace("lazada")}>Lazada</MenuItem>
                  <MenuItem onClick={() => addMarketplace("zalora")}>Zalora</MenuItem>
                </MenuList>
              </Menu>
            </HStack>

            {form.marketplace?.map((m, idx) => {
              const Icon = getMarketplaceIcon(m.type);

              return (
                <HStack key={idx} spacing={2} align="center">
                  {Icon && <Icon size={24} />}

                  <Input
                    placeholder={`https://${m.type}.com/...`}
                    value={m.url}
                    onChange={(e) => updateMarketplace(idx, e.target.value)}
                    focusBorderColor="#90cdf4"
                  />

                  <IconButton
                    size="sm"
                    icon={<SmallCloseIcon />}
                    onClick={() => removeMarketplace(idx)}
                  />
                </HStack>
              );
            })}
          </VStack>

           <Divider my={6} />
           
          {/* Media Upload */}
            <FormControl isInvalid={errors.supportFiles} isRequired>
              <FormLabel>{t.uploadImages}</FormLabel>
              <Text fontSize="sm" color="gray.500" mb={2}>
                Recommended size: 1200×800 px
              </Text>
              <HStack mt={2} spacing={2} wrap="wrap">
                <Box
                  onClick={triggerFileInput}
                  cursor="pointer"
                  w="80px"
                  h="80px"
                  border="2px dashed"
                  borderColor="gray.400"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="sm"
                >
                  {t.add}
                </Box>

                {existingMedia.map((m, idx) => (
                  <Box
                    key={m.id || idx}
                    position="relative"
                    w="80px"
                    h="80px"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    overflow="hidden"
                  >
                    <Image src={m.url || "https://via.placeholder.com/180"} objectFit="cover" w="full" h="full" fallbackSrc="https://via.placeholder.com/180" />
                    <IconButton size="xs" icon={<SmallCloseIcon />} position="absolute" top="1" right="1" aria-label={t.remove} onClick={() => removeExistingMedia(idx)} colorScheme="red" />
                  </Box>
                ))}

                {form.supportFiles.map((file, idx) => (
                  <Box
                    key={idx}
                    position="relative"
                    w="80px"
                    h="80px"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    overflow="hidden"
                  >
                    <Image src={URL.createObjectURL(file)} objectFit="cover" w="full" h="full" fallbackSrc="https://via.placeholder.com/180" />
                    <IconButton size="xs" icon={<SmallCloseIcon />} position="absolute" top="1" right="1" aria-label={t.remove} onClick={() => removeFile(idx)} colorScheme="red" />
                  </Box>
                ))}
              </HStack>
              <Input type="file" multiple ref={supportInputRef} onChange={handleFileChange} display="none" />
              <FormErrorMessage>{t.minOneImage}</FormErrorMessage>
            </FormControl>

            <Button mt={4} onClick={handleSubmit} isLoading={submitLoading} colorScheme="brand" bg="brand.500" color="black">
              {editMode ? t.updateAd : t.createAd}
            </Button>
          </VStack>
        </Box>

        {/* Ads List */}
        <Box {...mobileOnly}>
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="md">{t.adsList}</Heading>
              <Button size="sm" onClick={onOpen}>{t.history}</Button>
            </Flex>

            {ads.length === 0 && <Text>{t.noAdsYet}</Text>}
            {ads.map((ad) => {
              const isPendingOrRejected = ["pending_review", "rejected"].includes(ad.status);
              return (
                <Box key={ad.id} bg={colorMode === "light" ? "white" : "gray.700"} p={4} borderRadius="md" borderWidth="1px">
                  <VStack align="stretch" spacing={3}>
                    <Flex justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Switch
                          isChecked={ad.status === "active"}
                          onChange={() => toggleStatus(ad)}
                          isDisabled={isPendingOrRejected}
                        />
                        <Heading size="sm">{ad.title}</Heading>
                        <Badge colorScheme={ad.status === "active" ? "green" : ad.status === "pending_review" ? "orange" : "red"}>
                          {ad.status === "pending_review" ? t.inReview : ad.status}
                        </Badge>
                      </HStack>
                      <HStack>
                        <IconButton size="sm" icon={<EditIcon />} aria-label={t.edit} onClick={() => handleEdit(ad)} isDisabled={ad.status === "pending_review"} />
                        <IconButton size="sm" icon={<DeleteIcon />} aria-label={t.delete} onClick={() => handleDelete(ad.id)} />
                      </HStack>
                    </Flex>

                   {ad.status === "pending_review" && (
                        <Alert status="warning" borderRadius="md">
                          <AlertIcon /> {t.adPendingReview}
                        </Alert>
                      )}

                     {ad.status === "rejected" && (
                      <Alert status="error" borderRadius="md" alignItems="flex-start">
                        <AlertIcon mt={1} />
                        <Box>
                          <AlertTitle fontSize="sm" mb={1}>{t.rejectionReason}:</AlertTitle>

                          {ad.rejectReason && (
                            <AlertDescription fontSize="sm" mb={2}>
                              {ad.rejectReason}, {t.clickPencilToResubmit}
                            </AlertDescription>
                          )}

                          {/* ===== MEDIA REJECT WITH LIGHTBOX ===== */}
                          {(ad.rejectMedia || []).length > 0 && (
                            <HStack spacing={2} wrap="wrap" mt={1}>
                              {ad.rejectMedia.map((m, idx) => (
                                <Box
                                  key={idx}
                                  w={{ base: "120px", md: "150px" }}  // sama persis seperti Banner
                                  h={{ base: "120px", md: "150px" }}  // sama persis seperti Banner
                                  borderRadius="md"
                                  overflow="hidden"
                                  border="1px solid #ddd"
                                  position="relative"
                                  cursor="pointer"
                                  onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                                >
                                  <Image
                                    src={m.url}
                                    alt={`Reject Media ${idx}`}
                                    objectFit="cover"
                                    w="full"
                                    h="full"
                                  />
                                  <Badge
                                    position="absolute"
                                    bottom="1px"
                                    left="1px"
                                    fontSize="xs"
                                    colorScheme="red"
                                    borderRadius="md"
                                    px={1}
                                  >
                                    Bukti
                                  </Badge>
                                </Box>
                              ))}
                            </HStack>
                          )}

                          {/* ===== LIGHTBOX COMPONENT ===== */}
                          {lightboxOpen && (
                            <Modal isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} size="xl" isCentered>
                              <ModalOverlay />
                              <ModalContent bg="transparent" shadow="none">
                                <ModalCloseButton color="white" />
                                <Image
                                  src={ad.rejectMedia[lightboxIndex].url}
                                  alt={`Reject Media ${lightboxIndex}`}
                                  objectFit="contain"
                                  w="full"
                                  maxH="80vh"
                                  borderRadius="md"
                                />
                              </ModalContent>
                            </Modal>
                          )}
                        </Box>
                      </Alert>
                    )}
                    {ad.media && ad.media.length > 0 && (
                      <Box
                        position="relative"
                        w="100%"
                        h="180px"
                        overflow="hidden"
                        borderRadius="md"
                      >
                        {/* Background blur */}
                        <Image
                          src={ad.media[0]?.url}
                          alt="blur background"
                          position="absolute"
                          top="0"
                          left="0"
                          w="100%"
                          h="100%"
                          objectFit="cover"
                          filter="blur(20px)"
                          transform="scale(1.1)"
                        />

                        {/* Main image */}
                        <Image
                          src={ad.media[0]?.url}
                          alt={`${ad.title} cover`}
                          position="relative"
                          w="100%"
                          h="100%"
                          objectFit="contain"
                          borderRadius="md"
                        />
                      </Box>
                    )}
                    {ad.youtubeLink && <AspectRatio ratio={16 / 9}><iframe src={getEmbedLink(ad.youtubeLink)} allowFullScreen /></AspectRatio>}
                    <Flex align="center" justify="space-between">
                    <BoostButton 
                      adId={ad.id} 
                      currentStatus={ad.status} 
                      onClick={() => handleOpenBoost(ad.id)}
                    />

                    <PreviewAds 
                      adId={ad.id} 
                      status={ad.status} 
                    />
                  </Flex>
                  </VStack>
                </Box>
              );
            })}
          </VStack>
        </Box>
      </SimpleGrid>

      <AdHistoryDrawer isOpen={isOpen} onClose={onClose} loadHistory={loadHistory} />
      <BoostDrawer
      isOpen={isBoostOpen}
      onClose={onBoostClose}
      adId={selectedAdId}
      onSelectPackage={(pkg) => {
        setSelectedPackage(pkg);
        onBoostClose();
        onCheckoutOpen();
      }}
    />
      <BoostCheckout
      isOpen={isCheckoutOpen}
      onClose={onCheckoutClose}
      selectedBoost={selectedPackage}
      user={user}
      token={token}
    />
    </>
  );
}