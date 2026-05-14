"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Box,
  Image,
  Text,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Button,
  Link as ChakraLink,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoadingSpinner from "../../components/LoadingSpinner";
import MobileStickyContact from "../../components/MobileStickyContact";
import {
  isDesktopCard,
  isMobileCard,
  isTabletCard,
  isLargeTabletCard,
} from "../../utils/responsiveCard";
import DotLoader from "../../components/DotLoader";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
import { Icon, HStack } from "@chakra-ui/react";

import { FiMapPin } from "react-icons/fi";
import { TbCategory, TbCategoryPlus } from "react-icons/tb";
import { IoEyeSharp } from "react-icons/io5";
import { MdOutlineDateRange } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa6";
const translations = { en, id };


export default function AdBannerDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpenLightbox, setIsOpenLightbox] = useState(false);
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
    

  const bgSellerBox = useColorModeValue("gray.100", "gray.700");
  const textSeller = useColorModeValue("black", "white");
  const textMain = useColorModeValue("black", "white");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const badgeColorScheme = useColorModeValue("blue", "teal");
  const dotColor = useColorModeValue("#90cdf4", "brand.500");
  const pocketBg = useColorModeValue("teal.400", "brand.500");
const pocketOpacity = useColorModeValue(1, 0.82);

const glowBg = useColorModeValue(
  "radial-gradient(circle at top, rgba(45,212,191,0.25), transparent 65%)",
  "radial-gradient(circle at top, rgba(255,255,255,0.06), transparent 65%)"
);

const imageCardBg = useColorModeValue("white", "gray.800");

const imageCardBorder = useColorModeValue(
  "gray.200",
  "whiteAlpha.200"
);

const phoneGradient = useColorModeValue(
  "linear(to-r, teal.400, blue.500)",
  "linear(to-r, teal.200, blue.300)"
);

  const [desktopView, setDesktopView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isLargeTablet, setIsLargeTablet] = useState(false);

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

    const fetchBanner = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.mogehub.com/api/ad-banner/${id}`);
        const data = await res.json();
        setBanner(data);

        await fetch(`https://api.mogehub.com/api/ad-banner/${id}/view`, {
          method: "PATCH",
        });

        const updatedRes = await fetch(`https://api.mogehub.com/api/ad-banner/${id}`);
        const updatedData = await updatedRes.json();
        setBanner(updatedData);
      } catch (err) {
        console.error("Failed to fetch banner detail:", err);
        setBanner(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [id]);

  if (loading) {
  

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Box flex="1" display="flex" justifyContent="center" alignItems="center" mt={24} mb={10}>
        <DotLoader size={22} color={dotColor} />
      </Box>
      <Footer />
    </Box>
  );
}

if (!banner) {
  return (
    <Box
  minH="100vh"
  pb={isMobile || isTablet || isLargeTablet ? "64px" : "0px"}
>
      <Navbar />
      <Box mt={24} mb={10} maxW="800px" mx="auto" textAlign="center">
        <Text fontSize="xl" fontWeight="bold">{t.bannerNotFound}</Text>
        <Button mt={4} onClick={() => router.back()}>{t.goBack}</Button>
      </Box>
      <Footer />
    </Box>
  );
}

  return (
    <Box
    minH="100vh"
    pb={isMobile || isTablet || isLargeTablet ? "64px" : "0px"}
  >
      <Navbar />

      <Box maxW="1000px" mx="auto" mt={24} px={{ base: 4, md: 8 }} mb={12}>
        {/* ================= TITLE ================= */}
        <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" mb={4} color={textMain}>
          {banner.title}
        </Text>

       
       {/* ================= FULLWIDTH POCKET POLYGON SECTION ================= */}
<Box
  position="relative"
  w="100vw"
  left="50%"
  right="50%"
  ml="-50vw"
  mr="-50vw"
  mb={{ base: 16, md: 14 }}
  overflow="hidden"
>

  {/* BACKGROUND POCKET */}
  <Box
    position="absolute"
    top={0}
    left={0}
    w="100%"
    h={{ base: "120%", md: "125%" }}
    bg={pocketBg}
    opacity={pocketOpacity}
    zIndex={0}
    clipPath="
      polygon(
        0 0,
        100% 0,
        100% 78%,
        75% 92%,
        50% 100%,
        25% 92%,
        0 78%
      )
    "
  />

  {/* GLOW */}
  <Box
    position="absolute"
    top={0}
    left={0}
    w="100%"
    h="100%"
    bg={glowBg}
    zIndex={1}
  />

  {/* CONTENT */}
  <Box
    position="relative"
    maxW="1000px"
    mx="auto"
    px={{ base: 4, md: 8 }}
    py={{ base: 16, md: 20 }}
    zIndex={2}
  >

    <Box
  borderRadius="2xl"
  boxShadow="2xl"
  bg={imageCardBg}
  border="1px solid"
  borderColor={imageCardBorder}
  transform={desktopView ? "translateY(26px)" : "translateY(16px)"}
  transition="0.3s ease"
  _hover={{
    transform: desktopView
      ? "translateY(18px) scale(1.02)"
      : "translateY(10px) scale(1.02)",
  }}
  p={0}
  overflow="hidden"
>
  <Box
  w="100%"
  borderRadius="lg"
  overflow="hidden"
>
  <Image
    src={banner.imageUrl || "/placeholder.png"}
    alt={banner.title}
    w="100%"
    h={{ base: "180px", md: "270px" }}
    objectFit="cover"
    objectPosition="center"
    cursor="pointer"
    onClick={() => setIsOpenLightbox(true)}
    transition="0.2s ease"
    _hover={{ transform: "scale(1.02)" }}
  />
</Box>
</Box>
  </Box>
</Box>


        {/* ================= LINK URL ================= */}
        {banner.linkUrl && (
        <Flex justify="center" mb={4}>
          <Button
            as={ChakraLink}
            href={banner.linkUrl}
            isExternal
            size="md"
            bg="brand.500"
            color="black"
            _hover={{ bg: "brand.600" }}
            _active={{ bg: "brand.700" }}
          >
            {t.visitLink}
          </Button>
        </Flex>
      )}

        {/* ================= DESCRIPTION ================= */}
          {banner.description && (
            <Box mb={4}>
              {/* Label */}
              <Text color={textMain} fontWeight="medium" mb={1}>
               {t.descriptionLabel}
              </Text>
              {/* Konten deskripsi di bawah label */}
              <Text color={textMain}>
                {banner.description}
              </Text>
            </Box>
          )}
        {/* ================= PHONE ================= */}
        {banner.phone && (
          <Box mb={4}>
            <Text
              fontSize={{ base: "2xl", md: "4xl" }} // XL font, lebih gede di desktop
              fontWeight="bold"
              bgGradient={phoneGradient}
              bgClip="text"
            >
              {banner.phone}
            </Text>
          </Box>
        )}

        {/* ================= INFO DETAIL (CITY, CATEGORY, SUBCATEGORY, VIEWS) ================= */}
        <Box border="1px" borderColor={borderColor} p={4} borderRadius="md" mb={6}>
          <Flex
            wrap="wrap"
            gap={4}
            justify="space-between"
          >
            {banner.city && (
            <HStack>
              <Icon as={FiMapPin} color="teal.400" />
              <Text color={textMain}>
                {t.cityLabel}: {banner.city}
              </Text>
            </HStack>
          )}

          {banner.category && (
            <HStack>
              <Icon as={TbCategory} color="purple.400" />
              <Text color={textMain}>
                {t.categoryLabel}: {banner.category}
              </Text>
            </HStack>
          )}

          {banner.subcategory && (
            <HStack>
              <Icon as={TbCategoryPlus} color="pink.400" />
              <Text color={textMain}>
                {t.subcategoryLabel}: {banner.subcategory}
              </Text>
            </HStack>
          )}

          <HStack>
            <Icon as={IoEyeSharp} color="orange.400" />
            <Text color={textMain}>
              {t.viewsLabel}: {banner.views}
            </Text>
          </HStack>
            </Flex>
        </Box>

      
      {/* ================= DATES ================= */}
{(banner.startDate || banner.endDate) && (
  <Flex mb={6} gap={4} flexDirection={{ base: "column", md: "row" }}>
    
    {banner.startDate && (
      <Box flex="1">
        <Badge
        colorScheme={badgeColorScheme}
        px={4}
        py={2}
        w="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={2}
      >
        <Icon as={MdOutlineDateRange} />
        {t.startDateLabel}:{" "}
        {new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(banner.startDate))}
      </Badge>
      </Box>
    )}

    {banner.endDate && (
      <Box flex="1">
        <Badge
        colorScheme={badgeColorScheme}
        px={4}
        py={2}
        w="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={2} // 🔥 INI JARAK ICON & TEXT
      >
        <Icon as={MdOutlineDateRange} />
        {t.endDateLabel}:{" "}
        {new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(banner.endDate))}
      </Badge>
      </Box>
    )}

  </Flex>
)}
        {/* ================= MAP ================= */}
        {banner.lat && banner.lng && (
          <Box mb={6} borderRadius="xl" overflow="hidden">
            <iframe
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: "12px" }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps?q=${banner.lat},${banner.lng}&hl=es;z=14&output=embed`}
            />
          </Box>
        )}

        {/* ================= SELLER INFO ================= */}
        <Box mt={4} p={4} bg={bgSellerBox} borderRadius="lg">
          <HStack mb={2}>
          <Icon as={FaRegUser} />
          <Text fontWeight="bold" color={textSeller}>
            {t.sellerInfo}
          </Text>
        </HStack>
          <Flex direction={{ base: "column", md: "row" }} gap={4}>
            <HStack spacing={6} flexWrap="wrap">
            <Text color={textSeller}>
              {t.usernameLabel}: {banner.seller.username}
            </Text>

            <Text color={textSeller}>
              {t.verifiedLabel}: {banner.seller.verified ? t.yesVerified : t.noVerified}
            </Text>
          </HStack>
          </Flex>
        </Box>

        

        {/* ================= BACK BUTTON ================= */}
        <Button
          mt={6}
          onClick={() => router.back()}
          leftIcon={<FaArrowLeft />}
          bg="#90cdf4"
          color="black"
          _hover={{ bg: "#63b3ed" }}
          _active={{ bg: "#4299e1" }}
        >
          {t.back}
        </Button>
      </Box>

      {/* 🔥 LIGHTBOX MODAL TARO DI SINI */}
<Modal
  isOpen={isOpenLightbox}
  onClose={() => setIsOpenLightbox(false)}
  size="xl"
  isCentered
>
  <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(6px)" />

  <ModalContent bg="transparent" boxShadow="none">
    <ModalCloseButton color="white" />

    <ModalBody p={0} display="flex" justifyContent="center">
      <Image
        src={banner.imageUrl || "/placeholder.png"}
        alt={banner.title}
        maxH="85vh"
        objectFit="contain"
        borderRadius="lg"
      />
    </ModalBody>
  </ModalContent>
</Modal>

      <Footer />
      {!desktopView && (
        <MobileStickyContact
          phone={banner.phone}
          username={banner.seller.username}
          adTitle={banner.title}
        />
      )}
    </Box>
  );
}