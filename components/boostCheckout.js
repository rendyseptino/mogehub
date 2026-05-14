import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Box,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  Divider,
  Badge,
  useColorMode,
  useColorModeValue,
  useToast,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";

import { useState, useEffect } from "react";
import { FaBolt } from "react-icons/fa6";
import TripayPaymentMethods from "./TripayPaymentMethods";
import { Image as ChakraImage } from "@chakra-ui/react";
import { FaLock } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function BoostCheckout({
  isOpen,
  onClose,
  selectedBoost,
  user,
  token,
  onSuccess,
}) {
  const { colorMode } = useColorMode();
  const toast = useToast();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPhone(user?.phone || "");
      setPaymentMethod("");
    }
  }, [isOpen, user]);

  const handleConfirm = async () => {
    try {
      if (!paymentMethod) {
        return toast({
          title: "Pilih metode pembayaran",
          status: "warning",
        });
      }

      // 🔥 VALIDASI PHONE WAJIB
      if (!phone || phone.trim() === "") {
        return toast({
          title: "Nomor telepon wajib diisi",
          description: "Silakan isi nomor WhatsApp/telepon aktif",
          status: "error",
        });
      }

      // 🔥 VALIDASI FORMAT INDONESIA
      const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
      if (!phoneRegex.test(phone)) {
        return toast({
          title: "Format nomor tidak valid",
          description: "Contoh: 08123456789 atau +628123456789",
          status: "error",
        });
      }

      setLoading(true);

      const res = await fetch(`${API}/api/checkout/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          amount: selectedBoost?.price,
          method: paymentMethod,
          type: "BOOST_AD",
          phone,
          boost: {
            adId: selectedBoost?.adId,
            tier: selectedBoost?.tier,
          },
          items: [
            {
              name: `Boost ${selectedBoost?.tier}`,
              price: selectedBoost?.price,
              quantity: 1,
            },
          ],
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error);

      window.location.href = `/payment/${data.data.reference}`;
    } catch (err) {
      toast({
        title: "Gagal checkout boost",
        description: err.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedBoost) return null;

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent
  bg={useColorModeValue("white", "gray.900")}
  border="none"
>

        {/* ❌ CLOSE BUTTON */}
        <DrawerCloseButton />

        {/* 🔥 HEADER WITH LOGO */}
        <DrawerHeader borderBottomWidth="1px">
          <VStack align="flex-start" spacing={2}>
            <ChakraImage
              src={
                colorMode === "light"
                  ? "/mogehubmasterlight.png"
                  : "/mogehubmasterdark.png"
              }
              alt="Mogehub"
              h="40px"
              w="auto"
              objectFit="contain"
            />

            <Text fontWeight="bold">
              Boost Checkout
            </Text>
          </VStack>
        </DrawerHeader>

        {/* 🔥 DIVIDER BAWAH HEADER */}
        <Divider />

        <DrawerBody>
          <VStack spacing={5} align="stretch">

            {/* BOOST INFO */}
            <Box>
              <Text fontSize="lg" fontWeight="bold">
                BOOST {selectedBoost.tier}
              </Text>

              <Text fontSize="2xl" fontWeight="bold">
                Rp {selectedBoost.price.toLocaleString("id-ID")}
              </Text>

              <Badge colorScheme="purple">
                Boost Ad Ranking
              </Badge>
            </Box>

            <Divider />

            {/* USER INFO */}
            <Box>
              <Text fontWeight="bold" mb={2}>
                User Info
              </Text>

              <VStack align="stretch" spacing={3}>

                {/* USERNAME */}
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Username
                  </Text>
                  <Text fontWeight="bold">
                    {user?.username}
                  </Text>
                </Box>

                {/* EMAIL */}
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Email
                  </Text>
                  <Text fontWeight="bold">
                    {user?.email}
                  </Text>
                </Box>

                {/* PHONE */}
                <FormControl isRequired>
                  <FormLabel fontSize="xs">
                    Phone Number
                  </FormLabel>
                  <Input
                    placeholder="Masukkan nomor telepon"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </FormControl>

              </VStack>
            </Box>

            <Divider />

            <Box>
            <Text fontWeight="bold" mb={2}>
                Choose Payment Method & Continue
            </Text>

            <Box
                bg={useColorModeValue("gray.50", "gray.800")}
                borderRadius="lg"
                p={3}
            >
                <TripayPaymentMethods
                selected={paymentMethod}
                onSelect={setPaymentMethod}
                />
            </Box>
            </Box>

            <Divider />

            
            
                        <Box textAlign="center">
                        <HStack
                          justify="center"
                          spacing={2}
                          bg={colorMode === "light" ? "green.50" : "green.900"}
                          px={4}
                          py={2}
                          borderRadius="full"
                          display="inline-flex"
                          mx="auto"
                        >
                          <Box
                            color="green.400"
                            fontSize="22px"
                          >
                            <FaLock />
                          </Box>
            
                          <Text fontSize="md" fontWeight="bold" color="green.500">
                            Secure SSL Encrypted
                          </Text>
                        </HStack>
            
                       <Text
                        fontSize="sm"
                        mt={2}
                        color={useColorModeValue("gray.500", "gray.300")}
                      >
                        Your payment information is protected & encrypted
                      </Text>
                      </Box>
                      <Divider />

            <Button
                leftIcon={<FaBolt color="black" />}
                bg="brand.500"
                color="black"
                isLoading={loading}
                onClick={handleConfirm}
                _hover={{ bg: "brand.600" }}
                _active={{ bg: "brand.700" }}
                >
                Pay & Activate Boost
                </Button>

            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>

          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}