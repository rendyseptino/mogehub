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
  SimpleGrid,
  useColorMode,
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
  FormErrorMessage,
  Divider,
  Alert,
  AlertIcon,
  useDisclosure,
} from "@chakra-ui/react";
import { SmallCloseIcon, EditIcon, DeleteIcon, AddIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef, useCallback } from "react";
import AdHistoryDrawer from "@/components/ads/AdHistoryDrawer";

const API = `${process.env.NEXT_PUBLIC_API_URL}/seller`;

export default function AdsPage() {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const supportInputRef = useRef(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const [form, setForm] = useState({
    categoryId: "",
    subcategoryId: "",
    title: "",
    description: "",
    type: "",
    price: "",
    currency: "Rp",
    city: "",
    rentalStart: "",
    rentalEnd: "",
    youtubeLink: "",
    supportFiles: [],
    status: "active",
    cc: "",
  });

  const [existingMedia, setExistingMedia] = useState([]);
  const [removedMediaIds, setRemovedMediaIds] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("user");
      const t = localStorage.getItem("token");
      if (u) setUser(JSON.parse(u));
      if (t) setToken(t);
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
        const withVersion = (data.ads || []).map((ad) => ({ ...ad, _v: Date.now() }));
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

    const res = await fetch(`${API}/ads/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Gagal ambil history");
    }

    return data.history || [];
  }, [token]);

  const clearError = (name) => {
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const n = { ...prev };
      delete n[name];
      return n;
    });
  };

  const handleCategoryChange = (e) => {
    const id = e.target.value;
    setForm((prev) => ({ ...prev, categoryId: id, subcategoryId: "" }));
    clearError("categoryId");
    const cat = categories.find((c) => c.id === Number(id));
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

  const removeExistingMedia = (mediaId) => {
    setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
    setRemovedMediaIds((prev) => [...prev, mediaId]);
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
    if (form.type === "sewa") {
      if (!form.rentalStart) e.rentalStart = true;
      if (!form.rentalEnd) e.rentalEnd = true;
    }
    if (isMotorCategory) {
      if (!form.cc || Number(form.cc) < 500) e.cc = true;
    }
    if (!editMode && form.supportFiles.length === 0) e.supportFiles = true;
    if (editMode && form.supportFiles.length === 0 && existingMedia.length === 0) e.supportFiles = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast({ title: "Lengkapi semua field wajib", status: "error", duration: 2000, isClosable: true });
      return;
    }

    if (isMotorCategory && Number(form.cc) < 500) {
      toast({ title: "CC minimal 500", status: "error" });
      return;
    }

    if (!user || !token) {
      toast({ title: "Login dulu", status: "error" });
      return;
    }

    setSubmitLoading(true);
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === "supportFiles") form.supportFiles.forEach((f) => formData.append("media", f));
      else formData.append(key, form[key] ?? "");
    });
    if (removedMediaIds.length > 0) formData.append("removedMediaIds", JSON.stringify(removedMediaIds));

    const cleanFaqs = (faqs || [])
      .filter((f) => f.question?.trim() && f.answer?.trim())
      .map((f, i) => ({ question: f.question.trim(), answer: f.answer.trim(), order: i }));

    if (cleanFaqs.length > 0) formData.append("faqs", JSON.stringify(cleanFaqs));

    try {
      const url = editMode ? `${API}/ads/${editId}` : `${API}/ads`;
      const method = editMode ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal simpan iklan");

      toast({
        title: editMode ? "Iklan berhasil diupdate" : "Iklan berhasil dibuat",
        description: editMode || data?.ad?.status === "pending_review" ? "Menunggu review admin" : undefined,
        status: "success",
        duration: 2000,
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
    setForm({ categoryId: "", subcategoryId: "", title: "", description: "", type: "", price: "", currency: "Rp", city: "", rentalStart: "", rentalEnd: "", youtubeLink: "", supportFiles: [], status: "active", cc: "" });
    setExistingMedia([]);
    setRemovedMediaIds([]);
    setFaqs([]);
    setErrors({});
    setEditMode(false);
    setEditId(null);
    setSubcategories([]);
  };

  const addFaq = () => setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  const updateFaq = (index, key, value) => setFaqs((prev) => { const c = [...prev]; c[index][key] = value; return c; });
  const removeFaq = (index) => setFaqs((prev) => prev.filter((_, i) => i !== index));

  const handleEdit = (ad) => {
    setForm({
      categoryId: ad.categoryId?.toString() || "",
      subcategoryId: ad.subcategoryId?.toString() || "",
      title: ad.title || "",
      description: ad.description || "",
      type: ad.type || "",
      price: ad.price || "",
      currency: ad.currency || "Rp",
      city: ad.city || "",
      rentalStart: ad.rentalStart ? ad.rentalStart.slice(0, 10) : "",
      rentalEnd: ad.rentalEnd ? ad.rentalEnd.slice(0, 10) : "",
      youtubeLink: ad.youtubeLink || "",
      supportFiles: [],
      status: ad.status || "active",
      cc: ad.cc ? String(ad.cc) : "",
    });

    const cat = categories.find((c) => c.id === ad.categoryId);
    setSubcategories(cat ? cat.subcategories || cat.sub || [] : []);
    setExistingMedia(ad.media || []);
    setRemovedMediaIds([]);
    setFaqs(Array.isArray(ad.faqs) ? ad.faqs.map((f) => ({ question: f.question || "", answer: f.answer || "" })) : []);
    setErrors({});
    setEditMode(true);
    setEditId(ad.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus iklan ini?")) return;
    try {
      const res = await fetch(`${API}/ads/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal hapus iklan");
      toast({ title: "Iklan dihapus", status: "success" });
      await fetchAds();
    } catch (e) {
      toast({ title: e.message, status: "error" });
    }
  };

  const toggleStatus = async (ad) => {
    if (["pending_review", "rejected"].includes(ad.status)) return;
    const newStatus = ad.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`${API}/ads/${ad.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: newStatus }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal update status");
      await fetchAds();
    } catch (e) {
      toast({ title: e.message, status: "error" });
    }
  };

  if (loading) return (<Flex justify="center" py={10}><Spinner /></Flex>);

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box bg={colorMode === "light" ? "white" : "gray.900"} p={6} borderRadius="md" shadow="sm" borderWidth="1px">
          <VStack spacing={4} align="stretch">
            <Heading size="md">{editMode ? "Edit Iklan" : "Buat Iklan Produk Baru"}</Heading>

            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              Paket Basic: Iklan akan di review admin terlebih dahulu. Paket berbayar: Iklan akan tampil langsung.
            </Alert>

            <FormControl isInvalid={errors.categoryId} isRequired>
              <Select placeholder="Pilih kategori" value={form.categoryId} onChange={handleCategoryChange}>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </Select>
              <FormErrorMessage>Kategori wajib</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.subcategoryId} isRequired>
              <Select placeholder="Pilih sub kategori" name="subcategoryId" value={form.subcategoryId} onChange={handleInputChange} isDisabled={!subcategories.length}>
                {subcategories.map((sub) => (<option key={sub.id} value={sub.id}>{sub.name}</option>))}
              </Select>
              <FormErrorMessage>Sub kategori wajib</FormErrorMessage>
            </FormControl>

            {isMotorCategory && (
              <FormControl isInvalid={errors.cc} isRequired>
                <Input placeholder="CC mesin (minimal 500)" name="cc" value={form.cc} onChange={handleCcChange} />
                <FormErrorMessage>CC minimal 500</FormErrorMessage>
              </FormControl>
            )}

            <FormControl isInvalid={errors.title} isRequired>
              <Input placeholder="Judul" name="title" value={form.title} onChange={handleInputChange} />
              <FormErrorMessage>Judul wajib</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.description} isRequired>
              <Textarea placeholder="Deskripsi" name="description" value={form.description} onChange={handleInputChange} />
              <FormErrorMessage>Deskripsi wajib</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.type} isRequired>
              <Select placeholder="Tipe" name="type" value={form.type} onChange={handleInputChange}>
                <option value="jual">Jual</option>
                <option value="sewa">Sewa</option>
              </Select>
              <FormErrorMessage>Tipe wajib</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.price} isRequired>
              <Input placeholder="Harga" type="number" name="price" value={form.price} onChange={handleInputChange} />
              <FormErrorMessage>Harga wajib</FormErrorMessage>
            </FormControl>

            <FormControl>
              <Select name="currency" value={form.currency} onChange={handleInputChange}>
                <option value="Rp">Rp</option>
                <option value="$">$</option>
              </Select>
            </FormControl>

            <FormControl isInvalid={errors.city} isRequired>
              <Select placeholder="Pilih kota" name="city" value={form.city} onChange={handleInputChange}>
                {indonesiaCities.map((prov) => (
                  <optgroup key={prov.province} label={prov.province}>
                    {prov.cities.map((city) => (<option key={city} value={city}>{city}</option>))}
                  </optgroup>
                ))}
              </Select>
              <FormErrorMessage>Kota wajib</FormErrorMessage>
            </FormControl>

            {form.type === "sewa" && (
              <>
                <FormControl isInvalid={errors.rentalStart} isRequired>
                  <Input type="date" name="rentalStart" value={form.rentalStart} onChange={handleInputChange} />
                  <FormErrorMessage>Tanggal mulai wajib</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.rentalEnd} isRequired>
                  <Input type="date" name="rentalEnd" value={form.rentalEnd} onChange={handleInputChange} />
                  <FormErrorMessage>Tanggal akhir wajib</FormErrorMessage>
                </FormControl>
              </>
            )}

            <Input placeholder="Link Video YouTube Produk (opsional)" name="youtubeLink" value={form.youtubeLink} onChange={handleInputChange} />
            {form.youtubeLink && <AspectRatio ratio={16 / 9}><iframe src={getEmbedLink(form.youtubeLink)} allowFullScreen /></AspectRatio>}

            <Divider />

            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Heading size="sm">FAQ Iklan (Opsional)</Heading>
                <IconButton size="sm" icon={<AddIcon />} aria-label="add faq" onClick={addFaq} />
              </HStack>
              {faqs.length === 0 && <Text fontSize="sm" color="gray.500">Tidak ada FAQ</Text>}
              {faqs.map((faq, idx) => (
                <Box key={idx} borderWidth="1px" borderRadius="md" p={3}>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="semibold" fontSize="sm">FAQ #{idx + 1}</Text>
                    <IconButton size="xs" icon={<DeleteIcon />} aria-label="hapus faq" onClick={() => removeFaq(idx)} />
                  </HStack>
                  <Input mb={2} placeholder="Pertanyaan cth: Bisa Nego?" value={faq.question} onChange={(e) => updateFaq(idx, "question", e.target.value)} />
                  <Textarea placeholder="Jawaban cth: Bisa" value={faq.answer} onChange={(e) => updateFaq(idx, "answer", e.target.value)} />
                </Box>
              ))}
            </VStack>

            <FormControl isInvalid={errors.supportFiles} isRequired>
              <HStack mt={2} spacing={2} wrap="wrap">
                <Box onClick={triggerFileInput} cursor="pointer" w="80px" h="80px" border="2px dashed" borderColor="gray.400" borderRadius="md" display="flex" alignItems="center" justifyContent="center" fontSize="sm">Add</Box>

                {existingMedia.map((m) => (
                  <Box key={m.id} position="relative" w="80px" h="80px" border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
                    <Image src={m.signedUrl || "https://via.placeholder.com/180"} objectFit="cover" w="full" h="full" />
                    <IconButton size="xs" icon={<SmallCloseIcon />} position="absolute" top="1" right="1" aria-label="remove" onClick={() => removeExistingMedia(m.id)} colorScheme="red" />
                  </Box>
                ))}

                {form.supportFiles.map((file, idx) => (
                  <Box key={idx} position="relative" w="80px" h="80px" border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
                    <Image src={URL.createObjectURL(file)} objectFit="cover" w="full" h="full" />
                    <IconButton size="xs" icon={<SmallCloseIcon />} position="absolute" top="1" right="1" aria-label="remove" onClick={() => removeFile(idx)} colorScheme="red" />
                  </Box>
                ))}
              </HStack>

              <Input type="file" multiple ref={supportInputRef} onChange={handleFileChange} display="none" />
              <FormErrorMessage>Minimal 1 gambar</FormErrorMessage>
            </FormControl>

            <Button onClick={handleSubmit} isLoading={submitLoading} colorScheme="brand" bg="brand.500" color="black">
              {editMode ? "Update Iklan" : "Buat Iklan"}
            </Button>
          </VStack>
        </Box>

        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="md">Daftar Iklan</Heading>
            <Button size="sm" onClick={onOpen}>History</Button>
          </Flex>

          {ads.length === 0 && <Text>Belum ada iklan produk di buat</Text>}
          {ads.map((ad) => {
            const isPendingOrRejected = ["pending_review", "rejected"].includes(ad.status);
            return (
              <Box key={ad.id} bg={colorMode === "light" ? "white" : "gray.900"} p={4} borderRadius="md" borderWidth="1px">
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                     <Switch
  isChecked={ad.status === "active"}
  onChange={async () => {
    const newStatus = ad.status === "active" ? "inactive" : "active";

    try {
      const res = await fetch(`${API}/ads/${ad.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal update status");

      toast({
        title: `Iklan sekarang ${newStatus}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      // Update state lokal supaya toggle langsung berubah tanpa reload full
      setAds((prev) =>
        prev.map((a) => (a.id === ad.id ? { ...a, status: newStatus } : a))
      );
    } catch (e) {
      toast({ title: e.message, status: "error" });
    }
  }}
  isDisabled={["pending_review", "rejected"].includes(ad.status)}
/>

                      <Heading size="sm">{ad.title}</Heading>
                      <Badge colorScheme={ad.status === "active" ? "green" : ad.status === "pending_review" ? "orange" : "red"}>
                        {ad.status === "pending_review" ? "Dalam Review" : ad.status}
                      </Badge>
                    </HStack>
                    <HStack>
                      <IconButton size="sm" icon={<EditIcon />} aria-label="edit" onClick={() => handleEdit(ad)} isDisabled={ad.status === "pending_review"} />
                      <IconButton size="sm" icon={<DeleteIcon />} aria-label="delete" onClick={() => handleDelete(ad.id)} />
                    </HStack>
                  </Flex>

                  {ad.status === "pending_review" && (
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon /> Iklan ini sedang menunggu review admin.
                    </Alert>
                  )}

                  {ad.status === "rejected" && (
                    <Alert status="error" borderRadius="md" alignItems="flex-start">
                      <AlertIcon mt={1} />
                      <Box>
                        <AlertTitle fontSize="sm" mb={1}>
                          ALASAN PENOLAKAN:
                        </AlertTitle>

                        {ad.rejectReason && (
                          <AlertDescription fontSize="sm">
                            {ad.rejectReason}, Silakan Klik Icon Pensil Untuk Submit Ulang.
                          </AlertDescription>
                        )}
                      </Box>
                    </Alert>
                  )}

                  {ad.media && ad.media.length > 0 && (
                    <Image src={ad.media[0].signedUrl} alt={ad.title} w="100%" h="180px" objectFit="cover" borderRadius="md" />
                  )}

                  <Text fontSize="sm">{ad.description}</Text>
                  {ad.youtubeLink && <AspectRatio ratio={16 / 9}><iframe src={getEmbedLink(ad.youtubeLink)} allowFullScreen /></AspectRatio>}
                </VStack>
              </Box>
            );
          })}
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
