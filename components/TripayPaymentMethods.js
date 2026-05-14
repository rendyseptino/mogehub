import {
  Box,
  Grid,
  Image,
  Text,
  Spinner,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function TripayPaymentMethods({ selected, onSelect }) {
  const { colorMode } = useColorMode();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/checkout/payment-channels`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setChannels(data);
        } else if (Array.isArray(data?.data)) {
          setChannels(data.data);
        } else {
          setChannels([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setChannels([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />;

  if (!channels || channels.length === 0) {
    return (
      <Text fontSize="sm" color="gray.500">
        Metode pembayaran tidak tersedia
      </Text>
    );
  }

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={3}>
      {channels.map((ch) => {
        const isSelected = selected === ch.code;

        return (
          <Box
            key={ch.code}
            borderWidth="1px"
            borderRadius="lg"
            p={3}
            cursor="pointer"
           bg={
            isSelected
                ? "#90cdf4"
                : colorMode === "dark"
                ? "whiteAlpha.50"
                : "transparent"
            }
            color={isSelected ? "black" : "inherit"}
            borderColor={
                isSelected
                    ? "#90cdf4"
                    : colorMode === "dark"
                    ? "gray.600"
                    : "gray.200"
                }
            onClick={() => onSelect(ch.code)}
            transition="all 0.2s ease"
            _hover={{
            transform: "scale(1.03)",
            borderColor: isSelected
                ? "#90cdf4"
                : colorMode === "dark"
                ? "gray.500"
                : "gray.300",
            }}
          >
            <Image src={ch.icon_url} alt={ch.name} h="30px" mb={2} />
            <Text fontSize="sm" fontWeight={isSelected ? "bold" : "normal"}>
              {ch.name}
            </Text>
          </Box>
        );
      })}
    </Grid>
  );
}