"use client";

import { Box, Spinner } from "@chakra-ui/react";

export default function LoadingSpinner() {
  return (
    <Box
      w="100%"
      py={10}
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Spinner color="#90cdf4" borderWidth="4px" size="lg" />
    </Box>
  );
}