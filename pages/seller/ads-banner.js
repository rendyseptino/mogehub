import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  useColorMode,
  useToast,
  IconButton,
  Image,
  Badge,
  Spinner,
  Textarea, 
  FormControl,
  FormErrorMessage,
  Switch,
  Alert,
  AlertIcon,
  useDisclosure,
  Modal,              
  ModalOverlay,       
  ModalContent,       
  ModalBody,          
  ModalCloseButton,   
  Select,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef, useCallback } from "react";

// ==== IMPORT COMPONENTS ====
import AdHistoryDrawer from "../../components/ads/AdHistoryDrawer";
import BannerAdsHelp from "@/components/bannerHelp";
import PreviewBanner from "@/components/previewBanner";
import BannerPreviewCompare from "@/components/BannerPreviewCompare";

// ================= IMPORT LANGUAGE CONTEXT =================
import { useLanguageContext } from "../../context/LanguageContext";
import en from "../../locales/en.json";
import id from "../../locales/id.json";
const translations = { en, id };

const API = `${process.env.NEXT_PUBLIC_API_URL}/seller`;

export default function AdsBannerPage() {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const fileRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ===== USE LANGUAGE CONTEXT =====
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [token, setToken] = useState(null);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [existingImage, setExistingImage] = useState(null);
  
  const [form, setForm] = useState({
    categoryId: "",
    subcategoryId: "",
    title: "",
    city: "",
    linkUrl: "",
    startDate: "",
    endDate: "",
    file: null,
    phone: "",          // <--- TAMBAH INI
    description: "",
  });



  const [useDate, setUseDate] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

const {
  isOpen: isOpenError,
  onOpen: onOpenError,
  onClose: onCloseError,
} = useDisclosure();


  // =================== COMPONENT LIGHTBOX ===================
function RejectMediaLightbox({ rejectMedia, t }) {
  const [lightboxIndex, setLightboxIndex] = useState(null); // null = tutup
  const onClose = () => setLightboxIndex(null);

  return (
    <>
      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
        {rejectMedia.map((m, idx) => (
          <Box key={idx} position="relative">
            <Text
              position="absolute"
              top="2"
              left="2"
              bg="red.500"
              color="white"
              fontSize="xs"
              px={1}
              borderRadius="sm"
              zIndex={1}
            >
              {t.rejectedLabel || "Rejected"}
            </Text>
            <Image
              src={m.url}
              alt={`Rejected Media ${idx + 1}`}
              w="100%"
              h="100px"
              objectFit="cover"
              borderRadius="md"
              border="1px solid red"
              cursor="pointer"
              onClick={() => setLightboxIndex(idx)}
            />
          </Box>
        ))}
      </SimpleGrid>

      {lightboxIndex !== null && (
        <Modal isOpen={true} onClose={onClose} size="xl" isCentered>
          <ModalOverlay />
          <ModalContent bg="transparent" boxShadow="none">
            <ModalCloseButton color="white" />
            <ModalBody p={0}>
              <Image
                src={rejectMedia[lightboxIndex].url}
                alt={`Rejected Media ${lightboxIndex + 1}`}
                w="100%"
                maxH="80vh"
                objectFit="contain"
                borderRadius="md"
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

  // ================= TOKEN =================
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tkn = localStorage.getItem("token");
      if (tkn) setToken(tkn);
    }
  }, []);

  // ================= FETCH MASTER DATA =================
  useEffect(() => {
    const fetchMaster = async () => {
      if (!token) return;
      try {
        const [catRes, cityRes] = await Promise.all([
          fetch(`${API}/banners/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/cities`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!catRes.ok || !cityRes.ok)
          throw new Error(t.failedFetchMaster);

        const catData = await catRes.json();
        const cityData = await cityRes.json();

        setCategories(catData || []);
        setCities(cityData || []);
      } catch (e) {
        console.error("Fetch master data error:", e);
        toast({ title: t.failedFetchMaster, status: "error" });
      }
    };

    fetchMaster();
  }, [token, t, toast]);

  // ================= FETCH BANNERS =================
  const fetchBanners = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/banners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(t.failedFetchBanners);
      const data = await res.json();

      setBanners(data.banners || []);
    } catch (e) {
      console.error("Fetch banners error:", e);
      toast({ title: t.failedFetchBanners, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [token]);

  // ================= HISTORY =================
  const loadHistory = useCallback(async () => {
    if (!token) return [];
    try {
      const res = await fetch(`${API}/ads/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || t.failedFetchHistory);
      return data.history || [];
    } catch (e) {
      toast({ title: e.message, status: "error" });
      return [];
    }
  }, [token, toast, t]);

  // ================= FORM HANDLERS =================
  const clearError = (name) =>
    setErrors((prev) => {
      const n = { ...prev };
      delete n[name];
      return n;
    });

  const handleParentChange = (e) => {
    const parentId = e.target.value;
    setSelectedParent(parentId);
    setForm((p) => ({ ...p, categoryId: parentId, subcategoryId: "" }));
    clearError("categoryId");
    clearError("subcategoryId");
    const parentCat = categories.find((c) => c.id === Number(parentId));
    setSubcategories(parentCat?.sub || []);
  };

  const handleSubChange = (e) => {
    setForm((p) => ({ ...p, subcategoryId: e.target.value }));
    clearError("subcategoryId");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    clearError(name);
  };

  const handleImageUpload = (file) => {
  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.width;
      const height = img.height;

      const ratio = width / height;
      const expectedRatio = 1200 / 275;
      const tolerance = 0.1;

      if (width < 1200 || height < 275) {
        resolve(t.imageMinSize);
        return;
      }

      if (Math.abs(ratio - expectedRatio) > tolerance) {
        resolve(t.imageRatio);
        return;
      }

      resolve(null); // ✅ valid
    };

    img.src = objectUrl;
  });
};
  const handleFileChange = async (e) => {
  const f = e.target.files?.[0];
  if (!f) return;

  const error = await handleImageUpload(f);

  if (error) {
    setErrorMessage(error);
    onOpenError();

    if (fileRef.current) fileRef.current.value = null;
    return;
  }

  setForm((p) => ({ ...p, file: f }));
  clearError("file");
};

const clearImage = () => {
  setForm((p) => ({ ...p, file: null }));
  setExistingImage(null);
  if (fileRef.current) fileRef.current.value = null;
};


  const validate = () => {
    const e = {};
    if (!form.categoryId) e.categoryId = true;
    if (!form.subcategoryId) e.subcategoryId = true;
    if (!form.title) e.title = true;
    if (!form.city) e.city = true;
    if (!form.phone) e.phone = true;              
    if (!form.description) e.description = true;  

    const currentBanner = banners.find((b) => b.id === editId);

    if (!editMode && !form.file) e.file = true;

    if (
      editMode &&
      !form.file &&
      !(currentBanner?.imageUrl || currentBanner?.status === "rejected")
    )
      e.file = true;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast({
        title: t.fillRequiredFields,
        status: "error",
        duration: 2000,
      });
      return;
    }

    setSubmitLoading(true);

    try {
      const fd = new FormData();
      fd.append("categoryId", form.categoryId);
      fd.append("subcategoryId", form.subcategoryId);
      fd.append("title", form.title);
      fd.append("phone", form.phone);
      fd.append("description", form.description);
      fd.append("city", form.city);
      fd.append("linkUrl", form.linkUrl || "");
      fd.append("startDate", form.startDate || "");
      fd.append("endDate", form.endDate || "");
      if (form.file) fd.append("media", form.file);

      const url = editMode
        ? `${API}/banners/${editId}`
        : `${API}/banners`;

      const method = editMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data?.error || t.failedSaveBanner);

      toast({
        title: editMode ? t.bannerUpdated : t.bannerCreated,
        status: "success",
        duration: 2000,
      });

      await fetchBanners();
      resetForm();
    } catch (e) {
      toast({ title: e.message, status: "error" });
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      categoryId: "",
      subcategoryId: "",
      title: "",
      city: "",
      linkUrl: "",
      startDate: "",
      endDate: "",
      file: null,
      phone: "",        
      description: "",  
    });

    setExistingImage(null);
    setUseDate(false);
    setSelectedParent("");
    setSubcategories([]);
    setErrors({});
    setEditMode(false);
    setEditId(null);
    if (fileRef.current) fileRef.current.value = null;
  };

  const handleEdit = (b) => {
    const parentCat = categories.find((c) =>
      c.sub.some((s) => s.id === b.subcategoryId)
    );

    setSelectedParent(parentCat?.id?.toString() || "");
    setSubcategories(parentCat?.sub || []);

    setForm({
      categoryId: b.categoryId?.toString() || "",
      subcategoryId: b.subcategoryId?.toString() || "",
      title: b.title || "",
      city: b.city || "",
      linkUrl: b.linkUrl || "",
      startDate: b.startDate?.slice(0, 10) || "",
      endDate: b.endDate?.slice(0, 10) || "",
      file: null,
      phone: b.phone || "",            
      description: b.description || "",
    });

    setExistingImage(b.imageUrl || null);

    const hasDate = !!(b.startDate && b.endDate);
setUseDate(hasDate);

    setEditMode(true);
    setEditId(b.id);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const res = await fetch(`${API}/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data?.error || t.failedDeleteBanner);

      toast({ title: t.bannerDeleted, status: "success" });
      await fetchBanners();
    } catch (e) {
      toast({ title: e.message, status: "error" });
    }
  };

  if (loading)
    return (
      <Flex justify="center" py={10}>
        <Spinner />
      </Flex>
    );

  return (
    <>
      {/* ✅ FIX UTAMA – DESKTOP 2 KOLOM */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} alignItems="start">
        {/* FORM */}
        <Box
          bg={colorMode === "light" ? "white" : "gray.700"}
          p={6}
          borderRadius="md"
          borderWidth="1px"
        >
          <VStack spacing={4} align="stretch">
            <Flex align="center" gap={2}>
            <Heading size="md">
              {editMode ? t.editBanner : t.createBanner}
            </Heading>

            <BannerAdsHelp />
          </Flex>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              {t.bannerInfo}
            </Alert>

            <FormControl isInvalid={errors.categoryId} isRequired>
              <Select
                placeholder={t.selectParent}
                value={selectedParent}
                onChange={handleParentChange}
                focusBorderColor="#90cdf4"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{t.requiredField}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.subcategoryId} isRequired>
              <Select
                placeholder={t.selectSub}
                value={form.subcategoryId}
                onChange={handleSubChange}
                focusBorderColor="#90cdf4"
                isDisabled={!subcategories.length}
              >
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{t.requiredField}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.title} isRequired>
              <Input
                placeholder={t.bannerTitle}
                name="title"
                value={form.title}
                onChange={handleInputChange}
                focusBorderColor="#90cdf4"
              />
              <FormErrorMessage>{t.requiredField}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.description} isRequired>
            <Textarea
              placeholder={t.bannerDescription} // update locale key untuk required label
              name="description"
              value={form.description}
              onChange={handleInputChange}
              focusBorderColor="#90cdf4"
              rows={4}
            />
            <FormErrorMessage>{t.requiredField}</FormErrorMessage>
          </FormControl>

            <FormControl isInvalid={errors.phone} isRequired>
            <Input
              placeholder={t.bannerPhone} // update locale key untuk required label
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              focusBorderColor="#90cdf4"
            />
            <FormErrorMessage>{t.requiredField}</FormErrorMessage>
          </FormControl>

            <FormControl isInvalid={errors.city} isRequired>
              <Select
                placeholder={t.selectCity}
                name="city"
                value={form.city}
                onChange={handleInputChange}
                focusBorderColor="#90cdf4"
              >
                {cities.map((prov) => (
                  <optgroup key={prov.province} label={prov.province}>
                    {prov.cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
              <FormErrorMessage>{t.requiredField}</FormErrorMessage>
            </FormControl>

            <Input
              placeholder={t.bannerLinkOptional}
              name="linkUrl"
              value={form.linkUrl}
              onChange={handleInputChange}
              focusBorderColor="#90cdf4"
            />

            <FormControl>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium">
              {t.useDateLabel || "Ingin menggunakan tanggal?"}
            </Text>

            <Switch
              isChecked={useDate}
              onChange={(e) => {
                const checked = e.target.checked;
                setUseDate(checked);

                // kalau OFF → reset tanggal
                if (!checked) {
                  setForm((p) => ({
                    ...p,
                    startDate: "",
                    endDate: "",
                  }));
                }
              }}
            />
          </HStack>
        </FormControl>

            {useDate && (
              <HStack>
                <FormControl>
                  <Text mb={1} fontSize="sm" fontWeight="medium">
                    {t.startDateLabel || "Tanggal Mulai"}
                  </Text>
                  <Input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleInputChange}
                    focusBorderColor="#90cdf4"
                  />
                </FormControl>

                <FormControl>
                  <Text mb={1} fontSize="sm" fontWeight="medium">
                    {t.endDateLabel || "Tanggal Berakhir"}
                  </Text>
                  <Input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleInputChange}
                    focusBorderColor="#90cdf4"
                  />
                </FormControl>
              </HStack>
            )}

            <FormControl isInvalid={errors.file} isRequired>
              <Input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={handleFileChange}
                focusBorderColor="#90cdf4"
              />
              <FormErrorMessage>{t.requiredField}</FormErrorMessage>
            </FormControl>

            {(form.file || existingImage) && (
          <Box w="fit-content">
          
          {/* HEADER BAR (BADGE + DELETE SEJAJAR) */}
          <Flex justify="space-between" align="center" mb={2}>
            
            <Badge colorScheme="blue">
              {t.desktopPreview}
            </Badge>

            <IconButton
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              onClick={clearImage}
            />
          </Flex>

          {/* IMAGE */}
          <Box>
            <Image
              src={form.file ? URL.createObjectURL(form.file) : existingImage}
              maxH="180px"
              objectFit="cover"
              borderRadius="md"
            />
          </Box>

        </Box>
        )}

          {/* 🔥 PREVIEW COMPARISON (TEMPAT PALING BENAR) */}
{(form.file || existingImage) && (
  <BannerPreviewCompare
    file={form.file}
    existingImage={existingImage}
  />
)}

            <HStack spacing={3} mt={10}>
            <Button
              flex={1}
              onClick={handleSubmit}
              isLoading={submitLoading}
              colorScheme="brand"
              bg="brand.500"
              color="black"
            >
              {editMode ? t.updateBanner : t.createBanner}
            </Button>

            {editMode && (
              <Button
                flex={1}
                variant="outline"
                colorScheme="gray"
                onClick={resetForm}
              >
                {t.cancelEdit || "Cancel"}
              </Button>
            )}
          </HStack>
          </VStack>
        </Box>

        {/* LIST */}
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="md">{t.bannerList}</Heading>
            <Button size="sm" onClick={onOpen}>
              {t.history}
            </Button>
          </Flex>

          {banners.length === 0 && <Text>{t.noBanners}</Text>}

          {banners.map((b) => (
            <Box
              key={b.id}
              bg={colorMode === "light" ? "white" : "gray.700"}
              p={4}
              borderRadius="md"
              borderWidth="1px"
            >
              <VStack align="stretch" spacing={3}>
                <Flex justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Switch
                        isChecked={b.status === "active"}
                        isDisabled={
                          b.status === "pending_review" ||
                          b.status === "rejected"
                        }
                        onChange={() => {
                          const newStatus =
                            b.status === "active" ? "inactive" : "active";

                          fetch(`${API}/banners/${b.id}/status`, {
                            method: "PATCH",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ status: newStatus }),
                          })
                            .then((r) =>
                              r.json().then((d) => {
                                if (!r.ok) {
                                  // 🔥 HANDLE KHUSUS QUOTA HABIS
                                  if (d?.isQuotaExceeded) {
                                    toast({
                                      title: "Quota iklan sudah habis",
                                      description:
                                        "Silahkan upgrade paket untuk tambah quota atau hapus iklan lain untuk mengaktifkan banner ini.",
                                      status: "info",
                                      duration: 3000,
                                      isClosable: true,
                                    });
                                    return; // ❌ STOP, jangan lanjut update state
                                  }

                                  throw new Error(
                                    d?.error || t.failedUpdateStatus
                                  );
                                }

                                // ✅ UPDATE STATE KALAU SUKSES
                                setBanners((prev) =>
                                  prev.map((ban) =>
                                    ban.id === b.id
                                      ? { ...ban, status: newStatus }
                                      : ban
                                  )
                                );

                                toast({
                                  title: `${t.statusUpdated} ${newStatus}`,
                                  status: "success",
                                  duration: 2000,
                                  isClosable: true,
                                });
                              })
                            )
                            .catch((e) =>
                              toast({ title: e.message, status: "error" })
                            );
                        }}
                      />

                    <Heading size="sm">{b.title}</Heading>

                    <Badge
                      colorScheme={
                        b.status === "active"
                          ? "green"
                          : b.status === "pending_review"
                          ? "yellow"
                          : "red"
                      }
                    >
                      {b.status === "pending_review"
                        ? t.inReview
                        : b.status}
                    </Badge>
                  </HStack>

                  <HStack>
                    <IconButton
                      size="sm"
                      icon={<EditIcon />}
                      aria-label="edit"
                      onClick={() => handleEdit(b)}
                    />
                    <IconButton
                      size="sm"
                      icon={<DeleteIcon />}
                      aria-label="delete"
                      onClick={() => handleDelete(b.id)}
                    />
                  </HStack>
                </Flex>

               {b.status === "rejected" && (
                <VStack spacing={2} align="stretch">
                  {b.rejectReason && (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      {t.rejectedByAdmin} {b.rejectReason}
                    </Alert>
                  )}

                  {b.rejectMedia && b.rejectMedia.length > 0 && (
                    <RejectMediaLightbox rejectMedia={b.rejectMedia} t={t} />
                  )}
                </VStack>
              )}
                {b.imageUrl && ( <Image src={b.imageUrl} alt={b.title} w="100%" h="160px" objectFit="cover" borderRadius="md" /> )}

                <Flex justify="space-between" align="center" mt={2}>
  
                {/* LINK */}
                {b.linkUrl && (
                  <Text fontSize="sm" color="gray.500" isTruncated maxW="60%">
                    Link: {b.linkUrl}
                  </Text>
                )}

                {/* PREVIEW BUTTON */}
                <PreviewBanner bannerId={b.id} />
                </Flex>
              </VStack>
            </Box>
          ))}
        </VStack>
      </SimpleGrid>

      <AdHistoryDrawer
        isOpen={isOpen}
        onClose={onClose}
        loadHistory={loadHistory}
      />
      <Modal isOpen={isOpenError} onClose={onCloseError} isCentered>
  <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />

  <ModalContent borderRadius="xl">
    <ModalCloseButton />

    <ModalBody py={8} textAlign="center">
      <Text fontSize="lg" fontWeight="bold" mb={2}>
        {t.invalidImageTitle}
      </Text>

      <Text color="gray.500">
        {errorMessage}
      </Text>

      <Button
        mt={6}
        bg="brand.500"
        color="black"
        _hover={{ bg: "brand.600" }}
        onClick={onCloseError}
      >
        OK
      </Button>
    </ModalBody>
  </ModalContent>
</Modal>
    </>
  );
}