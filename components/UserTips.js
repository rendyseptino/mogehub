// FILE: components/UserTips.js
import {
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  VStack,
  Box,
  Button,
  useColorMode,
  HStack,
} from "@chakra-ui/react";
import { InfoOutlineIcon, StarIcon } from "@chakra-ui/icons";
import { useDisclosure } from "@chakra-ui/react";

export default function UserTips() {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const tips = [
    {
      title: "Tambah Produk",
      description:
        "Klik menu Produk → Tambah Produk baru dengan foto & detail lengkap.",
    },
    {
      title: "Cek Order",
      description:
        "Di halaman Orders, lihat transaksi terbaru dan status pembayaran.",
    },
    {
      title: "Gunakan Promo",
      description:
        "Menu Promo untuk membuat diskon atau voucher bagi user.",
    },
  ];

  return (
    <>
      {/* FLOATING TIPS BUBBLE 💡 */}
      <IconButton
        icon={<InfoOutlineIcon boxSize={5} />}
        aria-label="Tips"
        position="fixed"
        bottom="6"
        right="6"
        size="lg"
        borderRadius="full"
        onClick={onOpen}
        _hover={{ transform: "scale(1.05)" }}
        bgGradient="linear(to-br, blackAlpha.900, brand.500)"
        color="white"
      />

      {/* DRAWER FULL SCREEN TIPS */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        size={{ base: "full", md: "md" }}
        onClose={onClose}
      >
        <DrawerOverlay />
        <DrawerContent
          bgGradient="linear(to-b, whiteAlpha.800, brand.500Alpha.100)"
        >
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" fontSize="2xl" fontWeight="bold">
            Cara Pakai Dashboard
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={5} align="stretch">
              {tips.map((tip, index) => (
                <Box
                  key={index}
                  p={5}
                  borderRadius="xl"
                  bg={colorMode === "light" ? "whiteAlpha.900" : "gray.700"}
                >
                  <HStack spacing={3} align="start">
                    {/* Icon Star diganti warna sesuai mode */}
                    <StarIcon
                      w={3}
                      h={3}
                      mt={1}
                      color={colorMode === "light" ? "gray.400" : "brand.500"}
                    />
                    <Box flex="1">
                      {tip.title && (
                        <Box
                          fontWeight="semibold"
                          fontSize="md"
                          color={colorMode === "light" ? "gray.700" : "gray.200"}
                        >
                          {tip.title}
                        </Box>
                      )}
                      {tip.description && (
                        <Box
                          fontSize="sm"
                          color={colorMode === "light" ? "gray.500" : "gray.400"}
                        >
                          {tip.description}
                        </Box>
                      )}
                    </Box>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button onClick={onClose}>Tutup</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
