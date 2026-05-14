import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  Box,
  Flex,
  Image,
  Text,
  Badge,
  Stack,
  HStack,
  Link,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import {
  isMobileCard,
  isTabletCard,
  isLargeTabletCard,
  isDesktopCard,
} from "../../utils/responsiveCard";
import { ArrowBackIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@chakra-ui/icons";
import { FaInstagram, FaFacebook, FaYoutube, FaTwitter, FaTiktok, FaRegShareSquare } from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { GoGlobe } from "react-icons/go";
import { HiChatBubbleOvalLeftEllipsis } from "react-icons/hi2";

import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import AdMapReadOnly from "../../components/AdMapReadOnly"; // <--- READ-ONLY MAP
import MobileStickyContact from "../../components/MobileStickyContact";
import SellerDetailAccordion from "../../components/SellerDetailAccordion";
import { getMarketplaceIcon } from "../../utils/marketplaceIcons"; // sesuaikan path
import HomeIcon from "@/components/homeIcon";
import { FaQrcode } from "react-icons/fa6";
import { PiSpeedometer, PiEngine } from "react-icons/pi";
import { TbLicense } from "react-icons/tb";
import { MdOutlinePermPhoneMsg } from "react-icons/md";

import { Avatar } from "@chakra-ui/react";
import VerifiedBadge from "../../components/VerifiedBadge";
import DividerLines from "../../components/DividerLines";
import AdReport from "../../components/AdReport";
import JoinDiscussion from "../../components/JoinDiscussion";
import WishlistAd from "../../components/WishlistAd";
import SimilarAds from "@/components/similarAds";
import AnchorButton from "@/components/AnchorButton";
import { useLanguageContext } from "../../context/LanguageContext";
import en from "../../locales/en.json";
import id from "../../locales/id.json";



import SafeTransactionTips from "../../components/SafeTransactionTips";


const translations = { en, id };

export default function AdDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [desktopView, setDesktopView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isLargeTablet, setIsLargeTablet] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ===== MAP DATA =====
  const [mapData, setMapData] = useState({
    latitude: null,
    longitude: null,
    city: "",
    addressDetail: "",
  });

  // ===== SOCIAL ICON =====
  const getSocialIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "instagram": return <FaInstagram />;
      case "facebook": return <FaFacebook />;
      case "twitter":
      case "x": return <FaTwitter />;
      case "youtube": return <FaYoutube />;
      case "tiktok": return <FaTiktok />;
      default: return null;
    }
  };

  useEffect(() => {
  const checkView = () => {
    setDesktopView(isDesktopCard());
    setIsMobile(isMobileCard());
    setIsTablet(isTabletCard());
    setIsLargeTablet(isLargeTabletCard());
  };

  checkView();

  window.addEventListener("resize", checkView);

  return () => window.removeEventListener("resize", checkView);
}, []);

  useEffect(() => {
  if (!id) return;

  const fetchAdDetail = async () => {
    try {
      setLoading(true);
      setMapReady(false); 

      const res = await fetch(`https://api.mogehub.com/api/ad/${id}`);
      const data = await res.json();
      setAd(data.ad);

      setMapData({
        latitude: data.ad.lat,
        longitude: data.ad.lng,
        city: data.ad.city || "",
        addressDetail: data.ad.addressDetail || "",
      });

      
      setTimeout(() => {
        setMapReady(true);
      }, 100);

    } catch (err) {
      console.error("Failed to fetch ad detail:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchAdDetail();
}, [id]);

  const bg = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const sectionBg = useColorModeValue("gray.100", "gray.700");
  const brandBg = useColorModeValue("brand.500", "brand.500");
  const kmIconColor = useColorModeValue("#ed8936", "#f6ad55"); // orange
  const ccIconColor = useColorModeValue("#e53e3e", "#fc8181"); // red
  const licenseIconColor = useColorModeValue("#38a169", "#68d391"); // green
  const phoneIconColor = useColorModeValue("#3182ce", "#63b3ed"); // blue
  const faqIconColor = useColorModeValue("#805ad5", "#b794f4"); // purple
  const adNumberColor = useColorModeValue("black", "white");
  const dividerColor = useColorModeValue("gray.300", "gray.600");
  const separatorColor = useColorModeValue(
  "gray.200",
  "whiteAlpha.300"
);
  const phoneGradient = useColorModeValue(
  "linear(to-r, #ff7f00, blue)",
  "linear(to-r, #90cdf4, #ceff00)"
);
  const glassBg = useColorModeValue(
  "rgba(255,255,255,0.7)",
  "rgba(255,255,255,0.04)"
);

const glassBorder = useColorModeValue(
  "gray.200",
  "whiteAlpha.100"
);

const glassShadow = useColorModeValue(
  "0 4px 20px rgba(0,0,0,0.04)",
  "0 4px 20px rgba(0,0,0,0.25)"
);
  const timeAgo = (date) => {
    if (!date) return "";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = { year: 31536000, month: 2592000, day: 86400, hour: 3600, minute: 60 };
    for (const key in intervals) {
      const interval = Math.floor(seconds / intervals[key]);
      if (interval >= 1) return `${interval} ${key}${interval > 1 ? "s" : ""}`;
    }
    return "just now";
  };

  if (loading)
    return (
      <Flex minH="100vh" bg={bg} align="center" justify="center">
        <LoadingSpinner />
      </Flex>
    );

  if (!ad)
    return (
      <Flex minH="100vh" direction="column" bg={bg} p={4}>
        <Text>{t["ad_not_found"] || "Ad not found"}</Text>
        <Footer />
      </Flex>
    );

  const mediaItems = Array.isArray(ad.media) ? ad.media : [];

  const openLightbox = (index) => { setLightboxIndex(index); setLightboxOpen(true); };
  const prevLightbox = () => setLightboxIndex((prev) => prev === 0 ? mediaItems.length - 1 : prev - 1);
  const nextLightbox = () => setLightboxIndex((prev) => prev === mediaItems.length - 1 ? 0 : prev + 1);
  const handleTouchStart = (e) => (touchStartX.current = e.changedTouches[0].screenX);
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    if (touchStartX.current - touchEndX.current > 50) nextLightbox();
    if (touchEndX.current - touchStartX.current > 50) prevLightbox();
  };

  // ===== CHECK LOGIN =====
  const isLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("token");

  return (
<Flex
  direction="column"
  bg={bg}
  minH="100vh"
  w="100vw"
  pb={isMobile || isTablet || isLargeTablet ? "64px" : "0px"}
>
      <Head><title>{ad.title} | MogeHub</title></Head>

      <Flex
      p={4}
      align="center"
      justify="space-between"
    >
      {/* LEFT: BACK */}
      <IconButton
        icon={<ArrowBackIcon />}
        aria-label={t.back}
        onClick={() => router.back()}
      />

      {/* RIGHT: HOME */}
      <HomeIcon />
      <AnchorButton />
    </Flex>

      

      <Flex direction={desktopView ? "row" : "column"} w="100%" gap={desktopView ? 12 : 4} px={desktopView ? 10 : 2}>

       {/* LEFT SIDE */}
<Box
  flex={1}
  w="100%"
  p={desktopView ? 4 : 2}
  position="relative"
  onTouchStart={!desktopView ? handleTouchStart : undefined}
  onTouchEnd={!desktopView ? handleTouchEnd : undefined}
  display="flex"
  flexDirection="column"
  alignItems="flex-start"
>
  {/* ===== CITY PIN ===== */}
  {desktopView && mapData.city && (
  <Flex align="center" gap={2} mb={2} justify="flex-start" w="100%">
    <LuMapPin size={20} />
    <Text fontSize="md" fontWeight="semibold">{mapData.city}</Text>
  </Flex>
)}

  {/* ===== THUMBNAIL ===== */}
{mediaItems.length > 0 && (
  <Box
    mb={2}
    w="100%"
    maxW={desktopView ? "700px" : "100%"}
    display="flex"
    flexDirection="column"
    alignItems="center"
    mx={0}
  >
    
    {/* ===== MOBILE HEADER (TETAP DI ATAS IMAGE) ===== */}
    {!desktopView && (
      <Flex
        w="100%"
        justify="space-between"
        align="flex-start"
        mb={2}
        px={1}
      >
        <Text
          fontSize="lg"
          fontWeight="bold"
          color={textColor}
          flex="1"
          pr={2}
        >
          {ad.title}
        </Text>

        {mapData.city && (
          <Flex align="center" gap={1} flexShrink={0}>
            <LuMapPin size={18} />
            <Text fontSize="sm" fontWeight="semibold">
              {mapData.city}
            </Text>
          </Flex>
        )}
      </Flex>
    )}

    {/* 🔥 WRAPPER IMAGE */}
    <Box position="relative" w="100%">

      {/* IMAGE */}
      <Image
        src={mediaItems[0].url}
        alt={ad.title}
        borderRadius={desktopView ? "8px" : "md"}
        w="100%"
        maxW="100%"
        maxH={desktopView ? "550px" : "none"}
        objectFit={desktopView ? "cover" : "contain"}
        cursor="pointer"
        onClick={() => openLightbox(0)}
      />

      {/* 🔥 BADGE — FIX DI DALAM IMAGE */}
      {ad.isBoosted && (
        <HStack
          position="absolute"
          top="10px"
          right="10px"
          bg="rgba(50,50,50,0.6)"
          px={2}
          py={1}
          borderRadius="md"
          spacing={1}
          align="center"
          zIndex={5}
        >
          <GoGlobe size={14} color="white" />
          <Text fontSize="xs" fontWeight="bold" color="white">
            Sponsored
          </Text>
        </HStack>
      )}

    </Box>

    {/* NOMOR IKLAN */}
    <Text
      fontSize="sm"
      mt={2}
      color={adNumberColor}
    >
      {t.ad_number}: {ad.id}
    </Text>

  </Box>
)}


  {/* ===== GRID GALLERY ===== */}
  {mediaItems.length > 1 && (
    <Flex
      gap={2}
      overflowX="auto"
      mt={2}
      flexWrap="wrap"
      w="100%"
      justify="flex-start"
    >
      {mediaItems.map((m, idx) => (
        <Box
          key={idx}
          flex="0 0 auto"
          w={{ base: "120px", md: "200px" }}
          h={{ base: "80px", md: "120px" }}
          border={idx === lightboxIndex ? "3px solid white" : "1px solid gray"}
          borderRadius="md"
          cursor="pointer"
          onClick={() => openLightbox(idx)}
        >
          <Image
            src={m.url}
            alt={`${ad.title} ${idx}`}
            w="100%"
            h="100%"
            objectFit="cover"
            borderRadius="md"
          />
        </Box>
      ))}
    </Flex>
  )}
  {/* ===== WISHLIST CENTER LINE ===== */}
<Flex
  align="center"
  w="100%"
  mt={{ base: 8, md: 10 }}
  mb={{ base: 5, md: 6 }}

>
  <Box flex="1" h="1px" bg={dividerColor} />

  <Box mx={3}>
    <WishlistAd adId={ad.id} />
  </Box>

 <Box flex="1" h="1px" bg={dividerColor} />
</Flex>

{/* ===== DESCRIPTION DESKTOP ONLY ===== */}
{desktopView && ad.description && (
  <Box
    mt={6}
    w="100%"
    maxW="700px"
    p={5}
    borderRadius="xl"
    bg={glassBg}
    
    backdropFilter="blur(10px)"
    border="1px solid"
    borderColor={glassBorder}
    boxShadow={glassShadow}
    
  >
    <Text
      fontSize="lg"
      fontWeight="bold"
      mb={3}
      color={textColor}
    >
      {t.description || "Description"}
    </Text>

    <Text
      fontSize="md"
      color={textColor}
      lineHeight="tall"
      whiteSpace="pre-wrap"
    >
      {ad.description}
    </Text>
  </Box>
)}

{/* ===== FAQ DESKTOP ONLY ===== */}
{desktopView && ad.faqs && ad.faqs.length > 0 && (
  <Box
    mt={6}
    w="100%"
    maxW="700px"
  >
    <HStack mb={3} spacing={2}>
    <Flex
      w="32px"
      h="32px"
      align="center"
      justify="center"
      >
      <FaQrcode color={faqIconColor} size={16} />
    </Flex>

    <Text
      fontSize="lg"
      fontWeight="bold"
      color={textColor}
    >
      {t.faq}
    </Text>
  </HStack>

    <Accordion allowToggle>
      {ad.faqs.map((faq, idx) => (
        <AccordionItem
          key={idx}
          border="none"
          mb={2}
        >
          <AccordionButton
            bg={useColorModeValue(
              "rgba(255,255,255,0.7)",
              "rgba(255,255,255,0.04)"
            )}
            backdropFilter="blur(10px)"
            borderRadius="xl"
            border="1px solid"
            borderColor={useColorModeValue(
              "gray.200",
              "whiteAlpha.100"
            )}
            py={4}
          >
            <Box
              flex="1"
              textAlign="left"
              fontWeight="semibold"
            >
              {faq.question}
            </Box>

            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel pb={4}>
            {faq.answer}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  </Box>
)}

</Box>

 {/* VERTICAL + HORIZONTAL LINE */}
  <DividerLines desktopView={desktopView} />

        {/* RIGHT SIDE */}
        <Box flex={1} w={desktopView ? "30%" : "100%"} p={desktopView ? 4 : 2}>
          <Stack spacing={4}>
            {/* ===== TITLE + SHARE BUTTON ===== */}
            <Flex w="100%" align="flex-start" justify="space-between" gap={2}>

              {/* TITLE (DESKTOP ONLY) */}
              {desktopView && (
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={textColor}
                  flex="1"
                >
                  {ad.title}
                </Text>
              )}
  
              

              {/* SHARE BUTTON FOR DESKTOP/TABLET */}
            {desktopView && (
              <IconButton
                icon={<FaRegShareSquare />}
                aria-label="Share"
                size="lg"
                borderRadius="md"
                bg="#90cdf4"        // pake warna custom
                color="black"        
                _hover={{ bg: "#6bb8e6" }} // hover lebih gelap dikit
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: ad.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert(t.copied);
                  }
                }}
              />
            )}
            </Flex>

            {/* ===== BADGES ===== */}
            <Flex wrap="wrap" gap={2}>
              {ad.status && <Badge colorScheme={ad.status === "active" ? "green" : "red"}>{ad.status.toUpperCase()}</Badge>}
              {ad.category?.name && <Badge>{ad.category.name}</Badge>}
              {ad.subcategory?.name && <Badge>{ad.subcategory.name}</Badge>}
            </Flex>

            {ad.price && <Text fontSize="xl" fontWeight="semibold" color={textColor}>{ad.currency} {ad.price.toLocaleString()}</Text>}

            
            {/* ===== DESCRIPTION MOBILE ONLY ===== */}
            {!desktopView && ad.description && (
              <Box>
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  mb={2}
                  color={textColor}
                >
                  {t.description || "Description"}
                </Text>

                <Text
                  fontSize="md"
                  fontWeight="medium"
                  color={textColor}
                  lineHeight="tall"
                  whiteSpace="pre-wrap"
                >
                  {ad.description}
                </Text>
              </Box>
            )}
                        

            {/* ===== YEAR ===== */}
            {ad.year && (
              <Box>
                <Text fontSize="sm" color="gray.500">
                 {t.year}
                </Text>
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  {ad.year}
                </Text>
              </Box>
            )}

            {/* ===== KM ===== */}
            {ad.km && (
              <Box>
              <HStack spacing={2} mb={1}>
                <Flex
                  w="28px"
                  h="28px"
                  align="center"
                  justify="center"
                 >
                  <PiSpeedometer color={kmIconColor} size={18} />
                </Flex>

                <Text fontSize="sm" color="gray.500">
                  KM
                </Text>
              </HStack>

              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                {ad.km.toLocaleString()} KM
              </Text>
            </Box>
            )}

            {/* ===== CC ===== */}
            {ad.cc && (
              <Box>
            <HStack spacing={2} mb={1}>
              <Flex
                w="28px"
                h="28px"
                align="center"
                justify="center"
                >
                <PiEngine color={ccIconColor} size={18} />
              </Flex>

              <Text fontSize="sm" color="gray.500">
                CC
              </Text>
            </HStack>

            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              {ad.cc.toLocaleString()} CC
            </Text>
          </Box>
            )}

            {/* ===== LICENSE ===== */}
            {ad.license && (
              <Box mt={4} p={3} bg={sectionBg} borderRadius="md">
              <HStack spacing={2} mb={2}>
                <Flex
                  w="30px"
                  h="30px"
                  align="center"
                  justify="center"
                  >
                  <TbLicense color={licenseIconColor} size={18} />
                </Flex>

                <Text fontSize="sm" fontWeight="semibold">
                  {t.license}
                </Text>
              </HStack>

              <Text fontSize="md" fontWeight="semibold" color={textColor}>
                {ad.license === "full_paper" ? "Full Paper" : "No Paper"}
              </Text>
            </Box>
            )}

            {/* ===== RENT LABEL + RENTAL INFO ===== */}
            {(ad.rentalStart && ad.rentalEnd) || ad.rentalDuration ? (
              <Box
                p={3}
                bg={useColorModeValue("blue.50", "blue.900")}
                borderRadius="md"
              >
                {/* LABEL */}
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color={useColorModeValue("blue.600", "blue.300")}
                  mb={1}
                >
                  {t.rent}
                </Text>

                {/* CONTENT */}
                {(ad.rentalStart && ad.rentalEnd) ? (
                  <>
                    <Text fontSize="sm" color="gray.500">{t.rental_date}</Text>
                    <Text fontSize="md" fontWeight="semibold" color={textColor}>
                      {new Date(ad.rentalStart).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(ad.rentalEnd).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text fontSize="sm" color="gray.500">{t.duration}</Text>
                    <Text fontSize="md" fontWeight="semibold" color={textColor}>
                      {ad.rentalDuration} hari
                    </Text>
                  </>
                )}
              </Box>
            ) : null}

            {/* PHONE */}
            {ad.phone && (
              <Box>
              <HStack spacing={2} mb={1}>
                <Flex
                  w="30px"
                  h="30px"
                  align="center"
                  justify="center"
                  >
                  <MdOutlinePermPhoneMsg color={phoneIconColor} size={18} />
                </Flex>

                <Text fontSize="sm" color="gray.500">
                  {t["phone"] || "Phone"}
                </Text>
              </HStack>

              <Text
                fontSize="2xl"
                fontWeight="bold"
                bgGradient={phoneGradient}
                bgClip="text"
              >
                {ad.phone}
              </Text>
            </Box>
            )}

            {/* FULL ADDRESS */}
            <Box mt={4} p={3} bg={sectionBg} borderRadius="md">
              <Text fontSize="sm" fontWeight="semibold" mt={2}>{t.address_detail}</Text>
              <Text fontSize="md">{mapData.addressDetail || "-"}</Text>
            </Box>

            
          {/* JOIN DISCUSSION */}
          <Flex justify="center" mt={4} mb={2}>
            <HStack
              cursor="pointer"
              onClick={onOpen}
              px={4}
              py={2}
              borderRadius="full"
              bg={brandBg}
              spacing={2}
              _hover={{ opacity: 0.85, transform: "scale(1.03)" }}
              transition="0.2s"
            >
              <HiChatBubbleOvalLeftEllipsis size={18} color="black" />
              
              <Text fontSize="sm" fontWeight="semibold" color="black">
                {t.join_discussion}
              </Text>
            </HStack>
          </Flex>

            {/* READ-ONLY MAP */}
            <Box mt={4} borderRadius="md" overflow="hidden">
              {mapReady && (
              <AdMapReadOnly
                lat={mapData.latitude}
                lng={mapData.longitude}
                isLoggedIn={isLoggedIn}
              />
            )}
            </Box>

            
            {/* FAQ MOBILE ONLY */}
            {!desktopView && ad.faqs && ad.faqs.length > 0 && (
              <Box mt={4}>
                <HStack mb={2} spacing={2}>
                <Flex
                  w="32px"
                  h="32px"
                  align="center"
                  justify="center"
                  >
                  <FaQrcode color={faqIconColor} size={16} />
                </Flex>

                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color={textColor}
                >
                  {t.faq}
                </Text>
              </HStack>
                <Accordion allowToggle>
                  {ad.faqs.map((faq, idx) => (
                    <AccordionItem key={idx} border="none">
                      <AccordionButton bg={sectionBg} borderRadius="md" mb={2}>
                        <Box flex="1" textAlign="left" fontWeight="semibold">{faq.question}</Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>{faq.answer}</AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Box>
            )}

            {/* YOUTUBE EMBED */}
            {(ad.youtubeEmbed || ad.youtubeLink) && (
              <Box mt={4}>
                <iframe
                  width="100%"
                  height="315"
                  src={ad.youtubeEmbed || ad.youtubeLink.replace("watch?v=", "embed/")}
                  title="YouTube video"
                  frameBorder="0"
                  allowFullScreen
                  style={{ borderRadius: '8px' }}
                />
              </Box>
            )}

            

            {/* SELLER */}
        <SellerDetailAccordion ad={ad} timeAgo={timeAgo} />

        {/* MARKETPLACE */}

        {ad.marketplace && Array.isArray(ad.marketplace) && ad.marketplace.length > 0 && (
        <Box mt={4}>
          <Text fontSize="sm" fontWeight="semibold" mb={2}>Marketplace</Text> {/* Label */}
          <HStack spacing={3}>
            {ad.marketplace.map((m, idx) => {
              const marketplaceKey = (m.type || m.name || "").toLowerCase();
              const Icon = getMarketplaceIcon(marketplaceKey);
              if (!Icon) return null; // skip kalo icon ga ada
              return (
                <Link
                  key={idx}
                  href={m.url}
                  isExternal
                  _hover={{ opacity: 0.8 }}
                >
                  <Icon size={32} /> {/* icon */}
                </Link>
              );
            })}
          </HStack>
        </Box>
      )}

      {/* DIVIDER */}
      <Box
        mt={5}
        mb={4}
        borderTop="1px solid"
        borderColor={separatorColor}
      />

      {/* AD REPORT */}
      <AdReport adId={ad.id} />

        <SafeTransactionTips />
        </Stack>
        </Box>
        </Flex>

        
       {/* 🔥 MOBILE: tetap di bawah (default behavior) */}
{!desktopView && (
  <SimilarAds adId={ad.id} />
)}

{/* 🔥 DESKTOP: pindah ke full width bawah layout */}
{desktopView && (
  <Box mt={10} px={10} w="100%">
    <SimilarAds adId={ad.id} />
  </Box>
)}

        {!desktopView && (
          <MobileStickyContact
            phone={ad.phone}
            username={ad.username}
            adTitle={ad.title}
          />
        )}

        <Footer />
        <JoinDiscussion
        isOpen={isOpen}
        onClose={onClose}
        adId={ad.id}
        adTitle={ad.title}
        media={ad.media}
      />
      {/* LIGHTBOX */}
      {lightboxOpen && mediaItems.length > 0 && (
        <Box
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          bg="blackAlpha.900"
          zIndex={3000}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={4}
          overflowY="auto"
        >
          <IconButton
            icon={<CloseIcon />}
            aria-label="Close"
            position="absolute"
            top={4}
            right={4}
            onClick={() => setLightboxOpen(false)}
            color="white"
            bg="blackAlpha.600"
          />

          <Box
            maxW="95%"
            mb={2}
            position="relative"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={mediaItems[lightboxIndex].url}
              alt={ad.title}
              w="100%"
              maxH="75vh"
              objectFit="contain"
              borderRadius="md"
            />

            {mediaItems.length > 1 && (
              <>
                <IconButton
                  icon={<ChevronLeftIcon boxSize={12} />}
                  aria-label="Prev"
                  position="absolute"
                  top="50%"
                  left="0"
                  transform="translate(10%, -50%)"
                  onClick={prevLightbox}
                  color="white"
                  bg="blackAlpha.600"
                  size="lg"
                  borderRadius="full"
                  _hover={{ bg: "blackAlpha.700", transform: "translate(10%, -50%) scale(1.2)" }}
                  transition="all 0.2s"
                />
                <IconButton
                  icon={<ChevronRightIcon boxSize={12} />}
                  aria-label="Next"
                  position="absolute"
                  top="50%"
                  right="0"
                  transform="translate(-10%, -50%)"
                  onClick={nextLightbox}
                  color="white"
                  bg="blackAlpha.600"
                  size="lg"
                  borderRadius="full"
                  _hover={{ bg: "blackAlpha.700", transform: "translate(-10%, -50%) scale(1.2)" }}
                  transition="all 0.2s"
                />
              </>
            )}
          </Box>

          <Text color="white" mt={2} fontSize="lg" fontWeight="bold" textAlign="center">
            {ad.title} ({lightboxIndex + 1}/{mediaItems.length})
          </Text>

          <Flex mt={4} gap={2} wrap="wrap" justify="center">
            {mediaItems.map((m, idx) => (
              <Box
                key={idx}
                w={{ base: "60px", md: "80px" }}
                h={{ base: "60px", md: "80px" }}
                border={idx === lightboxIndex ? "3px solid #90cdf4" : "1px solid #90cdf4"}
                borderRadius="md"
                cursor="pointer"
                onClick={() => setLightboxIndex(idx)}
                transition="all 0.2s"
                _hover={{ transform: "scale(1.05)", borderColor: "#90cdf4" }}
              >
                <Image
                  src={m.url}
                  alt={`${ad.title}-${idx}`}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  borderRadius="md"
                />
              </Box>
            ))}
          </Flex>
        </Box>
      )}
    </Flex>
  );
}