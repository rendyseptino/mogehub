import { HStack, Text } from "@chakra-ui/react";
import { MdVerified } from "react-icons/md";

export default function VerifiedBadge({ show, size = 15 }) {
  if (!show) return null;

  return (
    <HStack spacing={1} display="inline-flex">
      <MdVerified color="#1DA1F2" size={size} />
    </HStack>
  );
}