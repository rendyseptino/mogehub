"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  useColorMode,
  useToast,
  Spinner,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Tooltip,
  InputGroup,
  InputLeftElement,
  Select,
} from "@chakra-ui/react";

import { useRouter } from "next/router";
import { SearchIcon, DownloadIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";

import { mobileAndTabletPadding } from "../../utils/responsive";
import { useLanguageContext } from "../../context/LanguageContext";
import en from "../../locales/en.json";
import id from "../../locales/id.json";

// IMPORT UTILS RESPONSIVE
import { isMobileCard, isTabletCard, isDesktopCard } from "../../utils/responsiveCard";

import AdminRejectDrawer from "../../components/AdminRejectDrawer";

const translations = { en, id };
const backendUrl = process.env.NEXT_PUBLIC_API_URL;
const s3BucketUrl = "https://mogehub-uploads.s3.ap-southeast-1.amazonaws.com";

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export default function AdsApproval() {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { isOpen: lightboxOpen, onOpen: openLightbox, onClose: closeLightbox } = useDisclosure();
  const { isOpen: drawerOpen, onOpen: openDrawer, onClose: closeDrawer } = useDisclosure();

  const [lightboxSrc, setLightboxSrc] = useState("");
  const [selectedAd, setSelectedAd] = useState(null);
  const [selectedType, setSelectedType] = useState("ads");

  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const isAdminUser = currentUser?.type === "admin" || currentUser?.email === "admin@mogehub.com";
  const isModeratorUser = currentUser?.type === "moderator";

  const canApproveReject = (user) => {
  if (!user) return false;
  return ["admin", "editor", "staff_iklan"].includes(user.type);
};


  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [ads, setAds] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [activeTab, setActiveTab] = useState("ads");

  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const resolveMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("s3://")) return `${s3BucketUrl}${url.replace(/^s3:\/\/[^/]+/, "")}`;
    if (url.startsWith("/uploads")) return `${backendUrl}${url}`;
    return url;
  };

  // FETCH ADS
const fetchAds = async () => {
  setLoadingAds(true);
  const token = getAuthToken();
  if (!token) {
    toast({ title: "Session berakhir, login dulu bro!", status: "error" });
    router.push("/login");
    return;
  }

  try {
    const res = await fetch(`${backendUrl}/admin/ads/all`, {
      headers: { Authorization: `Bearer ${token}` }, // 🔑 token wajib
    });
    if (!res.ok) {
      if (res.status === 401) {
        toast({ title: "Session berakhir, login dulu bro!", status: "error" });
        localStorage.removeItem("token");
        router.push("/login");
      }
      throw new Error(t.fetchAdsFailed || "Gagal fetch ads");
    }
    const data = await res.json();
    const normalized = (data.data || []).map(ad => ({
      ...ad,
      media: (ad.media || []).map(m => ({ ...m, resolvedUrl: resolveMediaUrl(m.url) })),
      rejectMedia: (ad.rejectMedia || []).map(m => ({ ...m, resolvedUrl: resolveMediaUrl(m.url) })),
    }));
    setAds(normalized);
  } catch (err) {
    toast({ title: t.error || "Error", description: err.message, status: "error", duration: 3000, isClosable: true });
  } finally { setLoadingAds(false); }
};


  // FETCH BANNERS
const fetchBanners = async () => {
  setLoadingBanners(true);
  const token = getAuthToken();
  if (!token) {
    toast({ title: "Session berakhir, login dulu bro!", status: "error" });
    router.push("/login");
    return;
  }

  try {
    const res = await fetch(`${backendUrl}/admin/banners/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      if (res.status === 401) {
        toast({ title: "Session berakhir, login dulu bro!", status: "error" });
        localStorage.removeItem("token");
        router.push("/login");
      }
      throw new Error(t.fetchBannersFailed || "Gagal fetch banners");
    }
    const data = await res.json();
    const normalized = (data.data || []).map(b => ({
      ...b,
      media: [{ resolvedUrl: resolveMediaUrl(b.imageUrl) }],
      rejectMedia: (b.rejectMedia || []).map(m => ({ ...m, resolvedUrl: resolveMediaUrl(m.url) })),
    }));
    setBanners(normalized);
  } catch (err) {
    toast({ title: t.error || "Error", description: err.message, status: "error", duration: 3000, isClosable: true });
  } finally { setLoadingBanners(false); }
};

  // USEEFFECT
useEffect(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) setCurrentUser(JSON.parse(userStr));

  // 🔑 PENTING: panggil fetch **setelah token ada**
  const token = getAuthToken();
  if (token) {
    fetchAds();
    fetchBanners();
  } else {
    router.push("/login");
  }
}, []);

  useEffect(() => {
    fetchAds();
    fetchBanners();
  }, []);

  const updateItemStatus = (type, id, status) => {
    if (type === "ads") setAds(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    else setBanners(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const canEdit = canApproveReject(currentUser);

  const handleApprove = async (type, id) => {
  const token = getAuthToken();
  if (!token) {
    toast({ title: "Session berakhir, login dulu bro!", status: "error" });
    router.push("/login");
    return;
  }

  try {
    const res = await fetch(`${backendUrl}/admin/${type}/${id}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🔥 ini kunci fix
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        toast({ title: "Session berakhir, login dulu bro!", status: "error" });
        localStorage.removeItem("token");
        router.push("/login");
      }
      throw new Error(t.approveFailed || "Gagal approve");
    }

    updateItemStatus(type, id, "active");
    toast({
      title: t.success || "Berhasil",
      description: `${type === "ads" ? t.ad : t.banner} ${t.approved}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } catch (err) {
    toast({ title: t.error || "Error", description: err.message, status: "error", duration: 3000, isClosable: true });
  }
};

  const openRejectDrawer = (item, type) => {
    setSelectedAd(item);
    setSelectedType(type);
    openDrawer();
  };

  const handleItemRejected = (updatedItem, type) => {
    const normalized = {
      ...updatedItem,
      media: (updatedItem.media || []).map(m => ({ ...m, resolvedUrl: resolveMediaUrl(m.url) })),
      rejectMedia: (updatedItem.rejectMedia || []).map(m => ({ ...m, resolvedUrl: resolveMediaUrl(m.url) })),
    };
    if (type === "ads") setAds(prev => prev.map(a => a.id === updatedItem.id ? normalized : a));
    else setBanners(prev => prev.map(a => a.id === updatedItem.id ? normalized : a));
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "file";
    link.click();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending_review": return <Badge colorScheme="yellow">{t.pendingReview || "Pending Review"}</Badge>;
      case "active": return <Badge colorScheme="green">{t.active || "Active"}</Badge>;
      case "rejected": return <Badge colorScheme="red">{t.rejected || "Rejected"}</Badge>;
      case "inactive": return <Badge colorScheme="gray">Inactive</Badge>;
      default: return <Badge colorScheme="gray">Inactive</Badge>;
    }
  };

  const filterItems = (items) => {
    return items.filter(item => {
      const q = searchQuery.toLowerCase();
      const title = (item.title || item.name || "").toLowerCase();
      const seller = (item.seller?.username || "").toLowerCase();
      const status = (item.status || "inactive").toLowerCase();
      return (title.includes(q) || seller.includes(q)) && (statusFilter ? status === statusFilter : true);
    });
  };

  const paginateItems = (items) => {
    const filtered = filterItems(items);
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return { paginated: filtered.slice(start, start + ITEMS_PER_PAGE), totalPages };
  };

  const renderList = (items, type) => {
    const { paginated, totalPages } = paginateItems(items);

    if (isMobileCard()) {
      return (
        <VStack spacing={4}>
          {paginated.map((item, idx) => (
            <Box key={item.id} p={4} borderWidth="1px" borderRadius="md" shadow="md">
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="bold">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}. {item.title || item.name}</Text>
                {getStatusBadge(item.status)}
              </Flex>
              <Text mb={1}><b>{t.seller || "Seller"}:</b> {item.seller?.username || t.unknown || "Unknown"}</Text>
              <Text mb={1}><b>{t.categorySubcategory || "Category / Subcategory"}:</b> {item.category?.name || ""} / {item.subcategory?.name || ""}</Text>
              <HStack spacing={2} wrap="wrap" mb={2}>
                {item.media?.map((m, index) => (
                  <Box key={index} position="relative">
                    <Image
                      src={m.resolvedUrl}
                      alt="media"
                      boxSize="60px"
                      objectFit="cover"
                      borderRadius="md"
                      cursor="pointer"
                      onClick={() => { setLightboxSrc(m.resolvedUrl); openLightbox(); }}
                    />
                    <Button size="xs" colorScheme="blue" position="absolute" top="0" right="0" onClick={() => downloadFile(m.resolvedUrl, `media_${index}.jpg`)}>
                      <DownloadIcon boxSize={3} />
                    </Button>
                  </Box>
                ))}
              </HStack>
              {item.status === "pending_review" && (
                <HStack spacing={2}>
                  <Tooltip label={!canEdit ? "Admin / Editor / Staff Iklan only" : ""} hasArrow>
                  <Button
                    size="sm"
                    colorScheme={canEdit ? "green" : "gray"}
                    onClick={() => handleApprove(type, item.id)}
                    isDisabled={!canEdit}
                  >
                    {t.approve || "Approve"}
                  </Button>

                  <Button
                    size="sm"
                    colorScheme={canEdit ? "red" : "gray"}
                    onClick={() => openRejectDrawer(item, type)}
                    isDisabled={!canEdit}
                  >
                    {t.reject || "Reject"}
                  </Button>
                </Tooltip>
                </HStack>
              )}
            </Box>
          ))}
        </VStack>
      );
    } else if (isTabletCard() || isDesktopCard()) {
      return (
        <Box overflowX="auto">
          <Box as="table" width="full" minWidth="900px" borderWidth="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"} borderRadius="md">
            <Box as="thead" bg={colorMode === "light" ? "gray.100" : "gray.700"}>
              <Box as="tr">
                <Box as="th" p={2} textAlign="left">No</Box>
                <Box as="th" p={2} textAlign="left">{t.title || "Title"}</Box>
                <Box as="th" p={2} textAlign="left">{t.seller || "Seller"}</Box>
                <Box as="th" p={2} textAlign="left">{t.categorySubcategory || "Category / Subcategory"}</Box>
                <Box as="th" p={2} textAlign="left">{t.media || "Media"}</Box>
                <Box as="th" p={2} textAlign="left">{t.status || "Status"}</Box>
                <Box as="th" p={2} textAlign="left">{t.action || "Action"}</Box>
              </Box>
            </Box>
            <Box as="tbody">
              {paginated.map((item, idx) => (
                <Box as="tr" key={item.id} borderTop="1px solid" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                  <Box as="td" p={2}>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</Box>
                  <Box as="td" p={2}>{item.title || item.name}</Box>
                  <Box as="td" p={2}>{item.seller?.username || t.unknown || "Unknown"}</Box>
                  <Box as="td" p={2}>{item.category?.name || ""} / {item.subcategory?.name || ""}</Box>
                  <Box as="td" p={2}>
                    <HStack spacing={2} wrap="wrap">
                      {item.media?.map((m, index) => (
                        <Box key={index} position="relative">
                          <Image
                            src={m.resolvedUrl}
                            alt="media"
                            boxSize="60px"
                            objectFit="cover"
                            borderRadius="md"
                            cursor="pointer"
                            onClick={() => { setLightboxSrc(m.resolvedUrl); openLightbox(); }}
                          />
                          <Button size="xs" colorScheme="blue" position="absolute" top="0" right="0" onClick={() => downloadFile(m.resolvedUrl, `media_${index}.jpg`)}>
                            <DownloadIcon boxSize={3} />
                          </Button>
                        </Box>
                      ))}
                    </HStack>
                  </Box>
                  <Box as="td" p={2}>{getStatusBadge(item.status)}</Box>
                  <Box as="td" p={2}>
                    <HStack spacing={1}>
                      {item.status === "pending_review" && (
                        <>
                          <Tooltip label={!canEdit ? "Admin / Editor / Staff Iklan only" : ""} hasArrow>
                          <Button
                              size="sm"
                              colorScheme={canEdit ? "green" : "gray"}
                              onClick={() => handleApprove(type, item.id)}
                              isDisabled={!canEdit}
                            >
                              {t.approve || "Approve"}
                            </Button>
                          </Tooltip>

                          <Tooltip label={!canEdit ? "Admin / Editor / Staff Iklan only" : ""} hasArrow>
                            <Button
                              size="sm"
                              colorScheme={canEdit ? "red" : "gray"}
                              onClick={() => openRejectDrawer(item, type)}
                              isDisabled={!canEdit}
                            >
                              {t.reject || "Reject"}
                            </Button>
                        </Tooltip>
                        </>
                      )}
                    </HStack>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      );
    }
  };

  return (
    <Box p={mobileAndTabletPadding}>
      <Heading size="lg" mb={4}>{t.adminAdsBannersApproval || "Admin Ads & Banners Approval"}</Heading>
      <HStack mb={4}>
        <Button colorScheme={activeTab === "ads" ? "green" : "gray"} onClick={() => setActiveTab("ads")}>{t.ads || "Ads"}</Button>
        <Button colorScheme={activeTab === "banners" ? "green" : "gray"} onClick={() => setActiveTab("banners")}>{t.banners || "Banners"}</Button>
      </HStack>

      <Flex gap={2} mb={4} wrap="wrap">
        <InputGroup flex="1">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder={t.searchAds || "Search ads/banners..."}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </InputGroup>

        <Select w={{ base: "150px", md: "200px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">{t.all || "All"}</option>
          <option value="pending_review">{t.pendingReview || "Pending Review"}</option>
          <option value="active">{t.active || "Active"}</option>
          <option value="rejected">{t.rejected || "Rejected"}</option>
        </Select>
      </Flex>

      {activeTab === "ads"
        ? loadingAds ? <Spinner /> : renderList(ads, "ads")
        : loadingBanners ? <Spinner /> : renderList(banners, "banners")}

      {/* PAGINATION */}
      <HStack mt={4} spacing={2} justify="center">
        {Array.from({ length: Math.ceil(filterItems(activeTab === "ads" ? ads : banners).length / ITEMS_PER_PAGE) }, (_, i) => (
          <Button key={i} size="sm" colorScheme={i + 1 === currentPage ? "green" : "gray"} onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
        ))}
      </HStack>

      {/* LIGHTBOX */}
      <Modal isOpen={lightboxOpen} onClose={closeLightbox} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={4}>
            <Image src={lightboxSrc} alt="Preview" width="100%" borderRadius="md" />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* DRAWER */}
      <AdminRejectDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        ad={selectedAd}
        type={selectedType}
        onRejected={handleItemRejected}
      />
    </Box>
  );
}