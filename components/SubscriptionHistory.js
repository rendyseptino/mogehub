import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Box,
  Flex,
  Text,
  Button,
  VStack,
  Badge,
  Divider,
  useColorMode,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

export default function SubscriptionHistory({
  isOpen,
  onClose,
  data = [],
  title = "History Subscription",
}) {
  const { colorMode } = useColorMode();

  const [page, setPage] = useState(1);
  const perPage = 7;

  useEffect(() => {
    if (isOpen) setPage(1);
  }, [isOpen]);

  const totalPages = Math.ceil(data.length / perPage);

  const paginated = data.slice((page - 1) * perPage, page * perPage);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Selamanya";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="md"   // ✅ INI KUNCI UTAMA (SAMA KAYAK CHECKOUT)
    >
      <DrawerOverlay />

      <DrawerContent
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <DrawerCloseButton />

        <DrawerHeader borderBottomWidth="1px">
          {title}
        </DrawerHeader>

        <DrawerBody>
          <VStack spacing={4} align="stretch" mt={4}>
            {paginated.map((sub) => (
              <Box
                key={sub.id}
                p={4}
                borderRadius="md"
                bg={colorMode === "light" ? "gray.100" : "gray.700"}
              >
                <Flex justify="space-between" mb={1}>
                  <Text fontWeight="bold">{sub.plan}</Text>
                  <Badge colorScheme={sub.status === "active" ? "green" : "gray"}>
                    {sub.status}
                  </Badge>
                </Flex>

                <Text fontSize="sm">
                  {formatDate(sub.startDate)} -{" "}
                  {sub.endDate ? formatDate(sub.endDate) : "Selamanya"}
                </Text>
              </Box>
            ))}
          </VStack>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <>
              <Divider my={4} />

              <Flex justify="space-between" align="center">
                <Button
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  isDisabled={page === 1}
                >
                  Prev
                </Button>

                <Text fontSize="sm">
                  {page} / {totalPages}
                </Text>

                <Button
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(p + 1, totalPages))
                  }
                  isDisabled={page === totalPages}
                >
                  Next
                </Button>
              </Flex>
            </>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}