"use client";

import {
  Box,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  VStack,
  HStack,
  Input,
  Text,
  Image,
  Checkbox,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

const backendUrl = process.env.NEXT_PUBLIC_API_URL;

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export default function AdminRejectDrawer({ isOpen, onClose, ad, type = "ads", onRejected }) {
  const toast = useToast();

  const [reason, setReason] = useState("");
  const [selectedUserMedia, setSelectedUserMedia] = useState([]);
  const [rejectFiles, setRejectFiles] = useState([]);
  const [rejectPreviews, setRejectPreviews] = useState([]);

  useEffect(() => {
    // reset saat drawer dibuka
    if (isOpen) {
      setReason("");
      setSelectedUserMedia([]);
      setRejectFiles([]);
      setRejectPreviews([]);
    }
  }, [isOpen, ad]);

  // bersihkan object URLs biar memory browser tidak bocor
  useEffect(() => {
    return () => {
      rejectPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [rejectPreviews]);

  const handleCheckboxChange = (index, checked) => {
    setSelectedUserMedia((prev) => {
      const copy = [...prev];
      if (checked) {
        if (!copy.includes(index)) copy.push(index);
      } else {
        const idx = copy.indexOf(index);
        if (idx > -1) copy.splice(idx, 1);
      }
      return copy;
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setRejectFiles(files);

    // buat preview URL lokal
    const previews = files.map((file) => URL.createObjectURL(file));
    setRejectPreviews(previews);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({ title: "Alasan wajib diisi", status: "error", duration: 3000, isClosable: true });
      return;
    }

    const formData = new FormData();
    formData.append("reason", reason);

    // upload file dari komputer
    rejectFiles.forEach((file) => formData.append("files", file));

    // gunakan media user
    selectedUserMedia.forEach((index) => formData.append("userMediaIndexes", index));

    try {
      const token = getAuthToken();
        if (!token) {
          toast({ title: "Session berakhir, login dulu bro!", status: "error", duration: 3000 });
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        const res = await fetch(`${backendUrl}/admin/${type}/${ad.id}/reject`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`, // 🔥 tambahin ini
          },
          body: formData,
        });
      if (!res.ok) throw new Error(`Gagal reject ${type}`);

      const data = await res.json();
      toast({ title: "Berhasil", description: `${type === "ads" ? "Ad" : "Banner"} berhasil direject`, status: "success", duration: 3000 });
      onRejected(data.ad || data.banner, type);
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: err.message, status: "error", duration: 3000 });
    }
  };

  if (!ad) return null;

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Reject {type === "ads" ? "Ad" : "Banner"}: {ad.title || ad.name}</DrawerHeader>
        <DrawerBody>
          <VStack spacing={4} align="stretch">
            {/* Alasan Penolakan */}
            <Box>
              <Text mb={1}>Alasan Penolakan:</Text>
              <Input
                placeholder="Masukkan alasan penolakan"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Box>

            {/* Media dari user */}
            {ad.media && ad.media.length > 0 && (
              <Box>
                <Text mb={2}>Pilih media sebagai bukti penolakan:</Text>
                <HStack spacing={2} wrap="wrap">
                  {ad.media.map((m, idx) => (
                    <VStack key={idx} w="100px">
                      <Image
                        src={m.resolvedUrl || m.url}
                        alt={`Media ${idx}`}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                        border="1px solid #ddd"
                      />
                      <Checkbox
                        size="sm"
                        isChecked={selectedUserMedia.includes(idx)}
                        onChange={(e) => handleCheckboxChange(idx, e.target.checked)}
                      >
                        Gunakan gambar
                      </Checkbox>
                    </VStack>
                  ))}
                </HStack>
              </Box>
            )}

            {/* Upload file dari komputer */}
            <Box>
              <Text mb={1}>Upload file dari komputer:</Text>
              <Input type="file" multiple onChange={handleFileChange} />
            </Box>

            {/* Preview file baru */}
            {rejectPreviews.length > 0 && (
              <Box>
                <Text mb={2}>Preview file upload:</Text>
                <HStack spacing={2} wrap="wrap">
                  {rejectPreviews.map((src, idx) => (
                    <Image
                      key={idx}
                      src={src}
                      alt={`File ${idx}`}
                      boxSize="100px"
                      objectFit="cover"
                      borderRadius="md"
                      border="1px solid #ddd"
                    />
                  ))}
                </HStack>
              </Box>
            )}

            <Button colorScheme="red" onClick={handleSubmit}>
              Confirm Reject
            </Button>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}