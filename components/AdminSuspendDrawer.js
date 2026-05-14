"use client";

import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Textarea,
  useToast,
  Input,
  VStack,
  HStack,
  Box
} from "@chakra-ui/react";
import { useState } from "react";

export default function AdminSuspendDrawer({ isOpen, onClose, user, onSuspended }) {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Error",
        description: "Reason is required",
        status: "error",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User tidak valid",
        status: "error",
      });
      return;
    }

    const token = localStorage.getItem("token"); // Ambil token admin
    if (!token) {
      toast({
        title: "Error",
        description: "Session expired, please login again",
        status: "error",
      });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("reason", reason);
      if (file) formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${user.id}/suspend`,
        {
          method: "PATCH",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`, // ✅ header token
          },
        }
      );

      if (!res.ok) {
        if (res.status === 401) throw new Error("Session expired, please login again");
        throw new Error("Failed to suspend user");
      }

      const updated = await res.json();

      onSuspended({
        id: user.id,
        isSuspended: true,
        suspendReason: reason,
        suspendMedia: updated.suspendMedia || []
      });

      toast({
        title: "Success",
        description: "User suspended",
        status: "success",
      });

      setReason("");
      setFile(null);
      onClose();

    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>
          Suspend User: {user?.username || "-"}
        </DrawerHeader>

        <DrawerBody>
          <VStack spacing={4} align="stretch">
            <Textarea
              placeholder="Reason for suspension"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Box>
              <Input type="file" onChange={handleFileChange} />
            </Box>
          </VStack>
        </DrawerBody>

        <DrawerFooter>
          <HStack spacing={2}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleSubmit}
              isLoading={submitting}
            >
              Suspend
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}