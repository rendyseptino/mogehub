import { Box } from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import HeroBanner from "../components/HeroBanner"; // import HeroBanner Swiper

export default function Home() {
  return (
    <Box>
      {/* Navbar tetap */}
      <Navbar />

      {/* Section 1: Hero Banner */}
      <HeroBanner />

      {/* Section selanjutnya bisa ditambah nanti: 
          - Quick Categories
          - Advertising Produk
          - Forum / Komunitas */}
    </Box>
  );
}
