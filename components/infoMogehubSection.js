"use client";

import React from "react";
import {
  Box,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
  Container,
} from "@chakra-ui/react";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

const translations = { en, id };

export default function InfoMogehubSection() {
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  // 🎨 Theme colors (premium SaaS feel)
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subText = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box w="100%" py={14} bg={bg}>
      <Container maxW="1000px">
        
        {/* ================= TITLE ================= */}
        <Heading
          fontSize={{ base: "2xl", md: "3xl" }}
          mb={4}
          color={textColor}
          textAlign="center"
        >
          {t.mogehubTitle ||
            "MogeHub - Big Bike Platform di Indonesia"}
        </Heading>

        {/* ================= DESCRIPTION ================= */}
        <Text
          fontSize={{ base: "md", md: "lg" }}
          color={subText}
          textAlign="center"
          mb={10}
          lineHeight="1.8"
        >
          {t.mogehubDescription ||
            "MogeHub adalah platform periklanan dan forum komunitas untuk para pecinta motor gede (Moge) di Indonesia. Di sini pengguna dapat menjual, membeli, dan mempromosikan motor, sparepart, serta layanan terkait dengan mudah. Selain itu, MogeHub juga menjadi tempat diskusi dan berbagi informasi antar rider dari seluruh Indonesia."}
        </Text>

        {/* ================= FEATURES TITLE ================= */}
        <Heading
          fontSize={{ base: "xl", md: "2xl" }}
          mb={6}
          color={textColor}
          textAlign="center"
        >
          {t.mogehubFeaturesTitle || "Fitur yang tersedia di MogeHub"}
        </Heading>

        {/* ================= ACCORDION ================= */}
        <Accordion allowToggle>
          
          {/* SEARCH */}
          <AccordionItem borderColor={borderColor}>
            <h2>
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left">
                  {t.featureSearchTitle || "Fitur Pencarian"}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={subText}>
              {t.featureSearchDesc ||
                "Fitur pencarian di MogeHub memungkinkan pengguna menemukan motor, sparepart, dan iklan dengan cepat dan akurat berdasarkan keyword, kategori, harga, dan lokasi."}
            </AccordionPanel>
          </AccordionItem>

          {/* FILTER */}
          <AccordionItem borderColor={borderColor}>
            <h2>
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left">
                  {t.featureFilterTitle || "Fitur Filter Pencarian"}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={subText}>
              {t.featureFilterDesc ||
                "Pengguna dapat menyaring hasil pencarian berdasarkan kategori, kondisi barang, harga, dan lokasi untuk mendapatkan hasil yang lebih relevan."}
            </AccordionPanel>
          </AccordionItem>

          {/* PRODUCT ADS */}
          <AccordionItem borderColor={borderColor}>
            <h2>
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left">
                  {t.featureProductAdsTitle || "Fitur Periklanan Produk"}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={subText}>
              {t.featureProductAdsDesc ||
                "Pengguna dapat membuat iklan untuk motor, sparepart, atau jasa dengan mudah, lengkap dengan gambar, deskripsi, harga, dan lokasi."}
            </AccordionPanel>
          </AccordionItem>

          {/* BANNER ADS */}
          <AccordionItem borderColor={borderColor}>
            <h2>
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left">
                  {t.featureBannerAdsTitle || "Fitur Iklan Banner"}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={subText}>
              {t.featureBannerAdsDesc ||
                "Fitur ini memungkinkan pengguna atau brand untuk memasang iklan banner di halaman utama agar lebih mudah menjangkau audiens MogeHub."}
            </AccordionPanel>
          </AccordionItem>

          {/* SUBSCRIPTION */}
            <AccordionItem borderColor={borderColor}>
            <h2>
                <AccordionButton py={4}>
                <Box flex="1" textAlign="left">
                    {t.featureSubscriptionTitle || "Fitur Paket Berlangganan"}
                </Box>
                <AccordionIcon />
                </AccordionButton>
            </h2>

            <AccordionPanel pb={4} color={subText}>
                {t.featureSubscriptionDesc ||
                "MogeHub menyediakan fitur paket berlangganan yang memungkinkan pengguna membuat iklan lebih banyak, mulai dari beberapa posting hingga tanpa batas (unlimited). Dengan berlangganan, pengguna mendapatkan fleksibilitas lebih besar untuk mengembangkan bisnis atau penjualan mereka di platform MogeHub."}
            </AccordionPanel>
            </AccordionItem>

            {/* BOOST ADS */}
<AccordionItem borderColor={borderColor}>
  <h2>
    <AccordionButton py={4}>
      <Box flex="1" textAlign="left">
        {t.featureBoostTitle || "Fitur Iklan Boost"}
      </Box>
      <AccordionIcon />
    </AccordionButton>
  </h2>

  <AccordionPanel pb={4} color={subText}>
    {t.featureBoostDesc ||
      "Fitur Boost memungkinkan pengguna meningkatkan visibilitas iklan agar tampil di posisi teratas dan mendapatkan lebih banyak perhatian dari calon pembeli. Iklan yang di-boost akan diprioritaskan dalam tampilan sehingga peluang transaksi menjadi lebih tinggi."}
  </AccordionPanel>
</AccordionItem>

{/* LOCATION BASED */}
<AccordionItem borderColor={borderColor}>
  <h2>
    <AccordionButton py={4}>
      <Box flex="1" textAlign="left">
        {t.featureLocationTitle || "Fitur Lokasi Iklan Terdekat"}
      </Box>
      <AccordionIcon />
    </AccordionButton>
  </h2>

  <AccordionPanel pb={4} color={subText}>
    {t.featureLocationDesc ||
      "MogeHub menampilkan iklan berdasarkan lokasi pengguna, sehingga produk yang muncul akan lebih relevan dan dekat secara geografis. Sistem ini membantu pengguna menemukan barang atau motor yang berada di sekitar mereka untuk mempercepat proses transaksi."}
  </AccordionPanel>
</AccordionItem>

          {/* COMMUNITY */}
          <AccordionItem borderColor={borderColor}>
            <h2>
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left">
                  {t.featureForumTitle || "Fitur Forum Komunitas"}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={subText}>
              {t.featureForumDesc ||
                "Forum komunitas memungkinkan pengguna berdiskusi, berbagi pengalaman touring, review motor, hingga tips perawatan motor besar."}
            </AccordionPanel>
          </AccordionItem>

          {/* FAVORITE */}
          <AccordionItem borderColor={borderColor}>
            <h2>
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left">
                  {t.featureFavoriteTitle || "Fitur Favorite"}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={subText}>
              {t.featureFavoriteDesc ||
                "Pengguna dapat menyimpan iklan atau postingan favorit untuk diakses kembali dengan mudah di lain waktu."}
            </AccordionPanel>
          </AccordionItem>

          {/* TRANSACTION */}
          <AccordionItem borderColor={borderColor}>
            <h2>
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left">
                  {t.featureTransactionTitle ||
                    "Transaksi Langsung Penjual & Pembeli"}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} color={subText}>
              {t.featureTransactionDesc ||
                "MogeHub tidak memproses pembayaran, namun mempertemukan penjual dan pembeli secara langsung melalui telepon atau WhatsApp untuk transaksi yang lebih cepat dan aman."}
            </AccordionPanel>
          </AccordionItem>

        </Accordion>
      </Container>
    </Box>
  );
}