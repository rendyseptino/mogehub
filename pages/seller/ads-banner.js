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
  FormControl,
  FormErrorMessage,
  Switch,
  Alert,
  AlertIcon,
  useDisclosure,
  Select,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef, useCallback } from "react";

// ==== IMPORT COMPONENTS ====
import AdHistoryDrawer from "../../components/ads/AdHistoryDrawer";

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
  const [form, setForm] = useState({
    categoryId: "",
    subcategoryId: "",
    title: "",
    city: "",
    linkUrl: "",
    startDate: "",
    endDate: "",
    file: null,
  });

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

      // ⬅️ imageUrl SUDAH SIGNED URL DARI BACKEND
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

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setForm((p) => ({ ...p, file: f }));
    clearError("file");
  };

  const validate = () => {
    const e = {};
    if (!form.categoryId) e.categoryId = true;
    if (!form.subcategoryId) e.subcategoryId = true;
    if (!form.title) e.title = true;
    if (!form.city) e.city = true;

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
    });
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
    });

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
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* FORM */}
        <Box
          bg={colorMode === "light" ? "white" : "gray.900"}
          p={6}
          borderRadius="md"
          borderWidth="1px"
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md">
              {editMode ? t.editBanner : t.createBanner}
            </Heading>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              {t.bannerInfo}
            </Alert>

            <FormControl isInvalid={errors.categoryId} isRequired>
              <Select
                placeholder={t.selectParent}
                value={selectedParent}
                onChange={handleParentChange}
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
              />
              <FormErrorMessage>{t.requiredField}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.city} isRequired>
              <Select
                placeholder={t.selectCity}
                name="city"
                value={form.city}
                onChange={handleInputChange}
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
            />

            <HStack>
              <FormControl>
                <Input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl>
                <Input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleInputChange}
                />
              </FormControl>
            </HStack>

            <FormControl isInvalid={errors.file} isRequired>
              <Input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={handleFileChange}
              />
              <FormErrorMessage>{t.requiredField}</FormErrorMessage>
            </FormControl>

            {form.file && (
              <Image
                src={URL.createObjectURL(form.file)}
                maxH="180px"
                objectFit="cover"
                borderRadius="md"
              />
            )}

            <Button
              onClick={handleSubmit}
              isLoading={submitLoading}
              colorScheme="brand"
              bg="brand.500"
              color="black"
            >
              {editMode ? t.updateBanner : t.createBanner}
            </Button>
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
              bg={colorMode === "light" ? "white" : "gray.900"}
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
                              if (!r.ok)
                                throw new Error(
                                  d?.error || t.failedUpdateStatus
                                );

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

                {b.status === "rejected" && b.rejectReason && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {t.rejectedByAdmin} {b.rejectReason}
                  </Alert>
                )}

                {/* ✅ FIX UTAMA – PAKAI SIGNED URL LANGSUNG */}
                {b.imageUrl && (
                  <Image
                    src={b.imageUrl}
                    alt={b.title}
                    w="100%"
                    h="160px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                )}

                {b.linkUrl && (
                  <Text fontSize="sm" color="gray.500">
                    Link: {b.linkUrl}
                  </Text>
                )}
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
    </>
  );
}