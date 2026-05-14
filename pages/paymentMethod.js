"use client";
import Head from "next/head";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Divider,
  Spinner,
  Center,
  Button,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import TripayPaymentMethods from "@/components/TripayPaymentMethods";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
import { useRouter } from "next/router";
import { ArrowBackIcon } from "@chakra-ui/icons";
import Image from "next/image";

const translations = { en, id };
const API = process.env.NEXT_PUBLIC_API_URL;

export default function PaymentMethodPage() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");

  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  const backBorderColor = useColorModeValue("#90cdf4", "brand.500");
  const pageTitle =
  language === "en"
    ? "Payment Methods - MogeHub"
    : "Metode Pembayaran - MogeHub";

  const router = useRouter();

  const cardBg = useColorModeValue("white", "gray.800");
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.600", "gray.200"); // FIX DARK MODE ABU

  const logo =
    useColorModeValue(
      "/mogehubmasterlight.png",
      "/mogehubmasterdark.png"
    );

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API}/api/tripay/payment-methods`);
        const data = await res.json();

        setPaymentMethods(data?.data || []);
      } catch (err) {
        console.error("Failed load payment methods:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMethods();
  }, []);

  return (
    <Box bg={pageBg} minH="100vh" py={10}>
      <Container maxW="6xl">

        <Head>
        <title>{pageTitle}</title>
      </Head>

        {/* HEADER */}
        <VStack spacing={3} textAlign="center" mb={10}>

          {/* LOGO (REPLACE BADGE) */}
          <Box
            cursor="pointer"
            onClick={() => router.push("/")}
            _hover={{ transform: "scale(1.05)" }}
            transition="0.2s"
          >
            <Box
            cursor="pointer"
            onClick={() => router.push("/")}
            _hover={{ transform: "scale(1.05)" }}
            transition="0.2s"
          >
            <Image
              src={logo}
              alt="MogeHub"
              width={140}
              height={40}
              priority
              unoptimized
              loading="eager"
              decoding="async"
              style={{
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>
          </Box>

          <Heading size="xl">
            {t.payment_title}
          </Heading>

          <Text color={textColor} maxW="600px">
            {t.payment_subtitle}
          </Text>
        </VStack>

        {/* CONTENT CARD */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="2xl"
          boxShadow="lg"
          borderWidth="1px"
        >

          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              {t.payment_channels}
            </Text>

            {selected && (
              <Text fontSize="sm" color="green.400" fontWeight="bold">
                {selected}
              </Text>
            )}
          </HStack>

          <Divider mb={5} />

          {loading ? (
            <Center py={20}>
              <VStack>
                <Spinner size="lg" color="purple.400" />
                <Text color={textColor}>
                  {t.payment_loading}
                </Text>
              </VStack>
            </Center>
          ) : (
            <TripayPaymentMethods
              selected={selected}
              onSelect={(code) => setSelected(code)}
              methods={paymentMethods}
            />
          )}
        </Box>

        {/* FOOT NOTE */}
        <Text
          textAlign="center"
          mt={8}
          fontSize="sm"
          color={textColor}
        >
          {t.payment_footer}
        </Text>

        {/* BACK BUTTON */}
        <Center mt={8}>
          <Button
            leftIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            variant="outline"
            borderColor={backBorderColor}
            color={textColor}
            _hover={{
                bg: useColorModeValue("blue.50", "whiteAlpha.100"),
                borderColor: useColorModeValue("#63b3ed", "brand.400"),
            }}
            >
            {t.payment_back}
            </Button>
        </Center>

      </Container>
    </Box>
  );
}