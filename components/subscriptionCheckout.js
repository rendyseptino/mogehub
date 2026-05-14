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
import { FaCartShopping } from "react-icons/fa6";
import TripayPaymentMethods from "./TripayPaymentMethods";
import { Image as ChakraImage } from "@chakra-ui/react";
import { FaLock } from "react-icons/fa";
import NotLoginSubscription from "./notLoginSubscription";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

const API = process.env.NEXT_PUBLIC_API_URL;

export default function SubscriptionCheckout({
  isOpen,
  onClose,
  selectedPackage,
  user,
  token,
  onSuccess,
}) {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  // sync user phone tiap open drawer
  useEffect(() => {
    if (isOpen) {
      setPhone(user?.phone || "");
      setPaymentMethod(""); 
    }
  }, [isOpen, user]);

  const handleConfirm = async () => {
  try {
    // 🔥 VALIDASI PAYMENT METHOD
    if (!paymentMethod) {
      toast({
        title: t.checkout_payment_required,
        status: "warning",
        duration: 3000,
      });
      return;
    }

    // 🔥 VALIDASI PHONE WAJIB
    if (!phone || phone.trim() === "") {
      toast({
        title: t.checkout_phone_required,
        description: t.checkout_phone_required_desc,
        status: "error",
        duration: 3000,
      });
      return;
    }

    // 🔥 OPTIONAL: VALIDASI FORMAT NOMOR (INDONESIA)
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    if (!phoneRegex.test(phone)) {
      toast({
         title: t.checkout_phone_invalid,
         description: t.checkout_phone_invalid_desc,
        status: "error",
        duration: 3000,
      });
      return;
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
        amount: selectedPackage?.price || 0,
        method: paymentMethod,
        type: "SUBSCRIPTION",
        phone: phone, // 🔥 PENTING: KIRIM PHONE KE BACKEND
        items: [
          {
            name: `Subscription ${selectedPackage?.plan}`,
            price: selectedPackage?.price || 0,
            quantity: 1,
          },
        ],
      }),
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error("Server bukan JSON: " + text.slice(0, 100));
    }

    if (!res.ok) {
      throw new Error(t.checkout_failed);
    }

    if (!data?.data?.reference) {
  throw new Error(t.checkout_reference_not_found);
}

// 🔥 DIRECT KE HALAMAN KITA
window.location.href = `/payment/${data.data.reference}`;

  } catch (err) {
    console.error(err);

    toast({
      title: t.checkout_failed,
      description: err.message,
      status: "error",
      duration: 4000,
    });

  } finally {
    setLoading(false);
  }
};

  if (!selectedPackage) return null;

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="md"
    >
      <DrawerOverlay />

      <DrawerContent
        bg={colorMode === "light" ? "white" : "gray.900"}
      >
        <DrawerCloseButton />

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

          <Text fontSize="lg" fontWeight="bold">
            {t.checkout_title}
          </Text>
        </VStack>
      </DrawerHeader>

        <DrawerBody>
  {!user || !token ? (
    <NotLoginSubscription
  onLoginSuccess={() => {
  localStorage.setItem("reopenCheckout", "true");
  localStorage.setItem("selectedPackage", JSON.stringify(selectedPackage)); 

  setTimeout(() => {
    window.location.reload();
  }, 300);
}}
/>
  ) : (
    <VStack align="stretch" spacing={5} mt={4}>
      
      {/* PACKAGE INFO */}
      <Box>
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            {selectedPackage.plan}
          </Text>

          {selectedPackage.plan === "Deluxe" && (
            <Badge colorScheme="purple">{t.checkout_recommended}</Badge>
          )}
        </HStack>

        <Text fontSize="2xl" fontWeight="bold" mt={2}>
          {selectedPackage.price === 0
            ? "Gratis"
            : `Rp ${selectedPackage.price.toLocaleString("id-ID")}`}
        </Text>

        <Text fontSize="sm" color="gray.500">
          {selectedPackage.duration}
        </Text>
      </Box>

            <Divider />

            {/* USER INFO */}
            <Box>
              <Text fontWeight="bold" mb={2}>
                {t.checkout_user_info}
              </Text>

              <VStack align="stretch" spacing={3}>
                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Username
                  </Text>
                  <Text fontWeight="bold">{user?.username}</Text>
                </Box>

                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Email
                  </Text>
                  <Text fontWeight="bold">{user?.email}</Text>
                </Box>

                <FormControl isRequired>
                  <FormLabel fontSize="xs"> {t.checkout_phone_label}</FormLabel>
                  <Input
                    placeholder={t.checkout_phone_placeholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            
            {/* PAYMENT */}
            <Box>
              <Text fontWeight="bold" mb={2}>
                {t.checkout_payment_title}
              </Text>

              <TripayPaymentMethods
                selected={paymentMethod}
                onSelect={(code) => setPaymentMethod(code)}
              />
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
                {t.checkout_secure}
              </Text>
            </HStack>

           <Text
            fontSize="sm"
            mt={2}
            color={useColorModeValue("gray.500", "gray.300")}
          >
            {t.checkout_secure_desc}
          </Text>
          </Box>
          <Divider />

            {/* ACTION */}
            <Button
              size="lg"
              isLoading={loading}
              onClick={handleConfirm}
              bg="brand.500"
              color="black"
              _hover={{ bg: "brand.600" }}
              _active={{ bg: "brand.700" }}
              leftIcon={<FaCartShopping />}
            >
              {t.checkout_confirm}
            </Button>

            <Button variant="ghost" onClick={onClose}>
              {t.checkout_cancel}
            </Button>
          </VStack>
           )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}