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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

const backendUrl = process.env.NEXT_PUBLIC_API_URL;
const s3BucketUrl = "https://mogehub-uploads.s3.ap-southeast-1.amazonaws.com";

export default function AdsApproval() {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [lightboxSrc, setLightboxSrc] = useState("");

  const [ads, setAds] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [activeTab, setActiveTab] = useState("ads");

  // ================= URL RESOLVER (SAMA PERSIS POLA PROFILE) =================
  const resolveMediaUrl = (url) => {
    if (!url) return "";

    // signed url / public url
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // s3://bucket/path
    if (url.startsWith("s3://")) {
      const path = url.replace(/^s3:\/\/[^/]+/, "");
      return `${s3BucketUrl}${path}`;
    }

    // local uploads
    if (url.startsWith("/uploads")) {
      return `${backendUrl}${url}`;
    }

    return url;
  };

  // ================= FETCH ADS =================
  const fetchAds = async () => {
    setLoadingAds(true);
    try {
      const res = await fetch(`${backendUrl}/admin/ads/pending`);
      if (!res.ok) throw new Error("Gagal fetch ads");
      const data = await res.json();

      const normalized = (data.data || []).map((ad) => ({
        ...ad,
        media: (ad.media || []).map((m) => ({
          ...m,
          resolvedUrl: resolveMediaUrl(m.url),
        })),
      }));

      setAds(normalized);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Gagal fetch ads",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingAds(false);
    }
  };

  // ================= FETCH BANNERS =================
  const fetchBanners = async () => {
    setLoadingBanners(true);
    try {
      const res = await fetch(`${backendUrl}/admin/banners/pending`);
      if (!res.ok) throw new Error("Gagal fetch banners");
      const data = await res.json();

      const normalized = (data.data || []).map((b) => ({
        ...b,
        resolvedImageUrl: resolveMediaUrl(b.imageUrl),
      }));

      setBanners(normalized);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Gagal fetch banners",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    fetchAds();
    fetchBanners();
  }, []);

  // ================= APPROVE / REJECT =================
  const updateItemStatus = (type, id, status) => {
    if (type === "ads") {
      setAds((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );
    } else {
      setBanners((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );
    }
  };

  const handleApprove = async (type, id) => {
    try {
      const res = await fetch(`${backendUrl}/admin/${type}/${id}/approve`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Gagal approve");

      updateItemStatus(type, id, "active");

      toast({
        title: "Berhasil",
        description: `${type === "ads" ? "Ad" : "Banner"} berhasil diapprove`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleReject = async (type, id) => {
    const reason = prompt("Masukkan alasan penolakan:");
    if (!reason) return;

    try {
      const res = await fetch(`${backendUrl}/admin/${type}/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Gagal reject");

      updateItemStatus(type, id, "rejected");

      toast({
        title: "Berhasil",
        description: `${type === "ads" ? "Ad" : "Banner"} berhasil direject`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // ================= STATUS BADGE =================
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending_review":
        return <Badge colorScheme="yellow">Pending Review</Badge>;
      case "active":
        return <Badge colorScheme="green">Active</Badge>;
      case "rejected":
        return <Badge colorScheme="red">Rejected</Badge>;
      default:
        return <Badge colorScheme="gray">Unknown</Badge>;
    }
  };

  // ================= RENDER LIST =================
  const renderList = (items, type) => (
    <Box overflowX="auto">
      <Box
        as="table"
        width="full"
        borderWidth="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        borderRadius="md"
      >
        <Box as="thead" bg={colorMode === "light" ? "gray.100" : "gray.700"}>
          <Box as="tr">
            <Box as="th" p={2}>No</Box>
            <Box as="th" p={2}>Title</Box>
            <Box as="th" p={2}>Seller</Box>
            <Box as="th" p={2}>Category / Subcategory</Box>
            <Box as="th" p={2}>Media</Box>
            <Box as="th" p={2}>Status</Box>
            <Box as="th" p={2}>Action</Box>
          </Box>
        </Box>

        <Box as="tbody">
          {items.map((item, idx) => (
            <Box
              as="tr"
              key={item.id}
              borderTop="1px solid"
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            >
              <Box as="td" p={2}>{idx + 1}</Box>
              <Box as="td" p={2}>{item.title || item.name}</Box>
              <Box as="td" p={2}>{item.seller?.username || "Unknown"}</Box>
              <Box as="td" p={2}>
                {item.category?.name || ""} / {item.subcategory?.name || ""}
              </Box>

              <Box as="td" p={2}>
                <HStack spacing={2}>
                  {type === "ads" && item.media?.length > 0 &&
                    item.media.map((m) => (
                      <Image
                        key={m.id}
                        src={m.resolvedUrl}
                        alt="media"
                        boxSize="50px"
                        objectFit="cover"
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => {
                          setLightboxSrc(m.resolvedUrl);
                          onOpen();
                        }}
                      />
                    ))}

                  {type === "banners" && item.resolvedImageUrl && (
                    <Image
                      src={item.resolvedImageUrl}
                      alt="banner"
                      boxSize="50px"
                      objectFit="cover"
                      borderRadius="md"
                      cursor="pointer"
                      onClick={() => {
                        setLightboxSrc(item.resolvedImageUrl);
                        onOpen();
                      }}
                    />
                  )}
                </HStack>
              </Box>

              <Box as="td" p={2}>{getStatusBadge(item.status)}</Box>

              <Box as="td" p={2}>
                <HStack spacing={1}>
                  {item.status === "pending_review" && (
                    <>
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => handleApprove(type, item.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleReject(type, item.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </HStack>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Lightbox */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={4}>
            <Image
              src={lightboxSrc}
              alt="Preview"
              width="100%"
              borderRadius="md"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );

  return (
    <Box p={4}>
      <Heading size="lg" mb={4}>
        Admin Ads & Banners Approval
      </Heading>

      <HStack mb={4}>
        <Button
          colorScheme={activeTab === "ads" ? "green" : "gray"}
          onClick={() => setActiveTab("ads")}
        >
          Ads
        </Button>
        <Button
          colorScheme={activeTab === "banners" ? "green" : "gray"}
          onClick={() => setActiveTab("banners")}
        >
          Banners
        </Button>
      </HStack>

      {activeTab === "ads"
        ? loadingAds
          ? <Spinner />
          : renderList(ads, "ads")
        : loadingBanners
          ? <Spinner />
          : renderList(banners, "banners")}
    </Box>
  );
}
