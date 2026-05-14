"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Input,
  Button,
  VStack,
  Heading,
  SimpleGrid,
  Text,
  useToast,
  Tooltip,
  Badge,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { GrVmMaintenance } from "react-icons/gr";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

// 🔥 FIX SSR TIPTAP
const TipTapEditor = dynamic(() => import("../../components/TipTapEditor"), { ssr: false });

// 🔥 GET TOKEN (SAFE)
const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export default function MaintenanceMode() {
  const [maintenances, setMaintenances] = useState([]);
  const [activeMaintenance, setActiveMaintenance] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;

  const toast = useToast();
  const router = useRouter();
  const API_ADMIN = "https://api.mogehub.com/admin/maintenance";
  const API_PUBLIC_ACTIVE = "https://api.mogehub.com/api/maintenance/active";


  const [currentUser, setCurrentUser] = useState(null);
  const isAdminUser = currentUser?.type === "admin";


  useEffect(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) setCurrentUser(JSON.parse(userStr));
}, []);


  const brandColor = useColorModeValue("brand.500", "brand.500");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("black", "white");
  const descColor = useColorModeValue("gray.600", "gray.300");

  const checkAuth = () => {
    const token = getAuthToken();
    if (!token) {
      toast({ title: t.maintenance_login_required, status: "error" });
      router.push("/login");
      return false;
    }
    return true;
  };

  // ================= FETCH ALL =================
  const fetchMaintenances = async () => {
    if (!checkAuth()) return;
    try {
      const token = getAuthToken();
      const res = await fetch(API_ADMIN, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.maintenance_fetch_failed);
      setMaintenances(data.maintenances || []);
    } catch (err) {
      console.error(err);
      toast({ title: err.message, status: "error" });
    }
  };

  // ================= FETCH ACTIVE =================
  const fetchActive = async () => {
    try {
      const res = await fetch(API_PUBLIC_ACTIVE);
      const data = await res.json();
      setActiveMaintenance(data.maintenance || null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMaintenances();
    fetchActive();
  }, []);

  // ================= CREATE / UPDATE =================
const handleSubmit = async () => {
  if (!checkAuth()) return;
  if (!title || !description || !startDate || !endDate) {
    toast({ title: t.maintenance_required_fields, status: "warning" });
    return;
  }

  try {
    const token = getAuthToken();

    // 🔹 FIX: parse datetime-local sebagai local time tanpa shift
    const startLocal = new Date(startDate);
    const endLocal = new Date(endDate);

    const cleanDescription = description.replace(/<\/?[^>]+(>|$)/g, "").trim();

    const payload = {
      title,
      description: cleanDescription,
      startDate: startLocal.toISOString(),
      endDate: endLocal.toISOString(),
    };

    const res = await fetch(editingId ? `${API_ADMIN}/${editingId}` : API_ADMIN, {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t.maintenance_submit_failed);

    toast({
      title: editingId ? t.maintenance_updated : t.maintenance_created,
      status: "success",
    });

    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setEditingId(null);
    fetchMaintenances();
    fetchActive();
  } catch (err) {
    console.error(err);
    toast({ title: err.message, status: "error" });
  }
};

  // ================= EDIT =================
  const handleEdit = (maintenance) => {
    setEditingId(maintenance.id);
    setTitle(maintenance.title);
    setDescription(maintenance.description);
    setStartDate(new Date(maintenance.startDate).toISOString().slice(0, 16));
    setEndDate(new Date(maintenance.endDate).toISOString().slice(0, 16));
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!checkAuth()) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_ADMIN}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.maintenance_delete_failed);
      toast({ title: t.maintenance_deleted, status: "success" });
      fetchMaintenances();
      fetchActive();
    } catch (err) {
      console.error(err);
      toast({ title: err.message, status: "error" });
    }
  };

  return (
    <Box>
      <Heading mb={6}>{t.maintenance_page_title}</Heading>

      {activeMaintenance && (
        <Box
          mb={6}
          p={4}
          borderRadius="md"
          bg={cardBg}
          borderWidth="1px"
          borderColor={brandColor}
          display="flex"
          alignItems="center"
        >
          <GrVmMaintenance size={36} color={brandColor} />
          <Box ml={4}>
            <Text fontWeight="bold" color={textColor}>
              {t.maintenance_active_label}:
            </Text>
            <HStack spacing={2} mt={1}>
              <Badge colorScheme="teal" variant="subtle">
                {t.common_active}
              </Badge>
              <Text fontWeight="semibold" color={textColor}>
                {activeMaintenance.title}
              </Text>
            </HStack>
            <Text fontSize="sm" color={descColor}>
              {new Date(activeMaintenance.startDate).toLocaleString()} -{" "}
              {new Date(activeMaintenance.endDate).toLocaleString()}
            </Text>
            <Text mt={1} color={descColor}>
              {activeMaintenance.description}
            </Text>
          </Box>
        </Box>
      )}

      <VStack spacing={4} align="stretch" mb={10}>
        <Input placeholder={t.maintenance_title_placeholder} value={title} onChange={(e) => setTitle(e.target.value)} />

        <Box borderWidth="1px" borderRadius="lg" p={3}>
          <TipTapEditor content={description} onUpdate={setDescription} />
        </Box>

       <Box>
        <Text fontWeight="semibold" mb={1}>
          {t.maintenance_start_label}
        </Text>
        <Input
          type="datetime-local"
          placeholder={t.maintenance_start_placeholder}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </Box>

      <Box>
        <Text fontWeight="semibold" mb={1}>
          {t.maintenance_end_label}
        </Text>
        <Input
          type="datetime-local"
          placeholder={t.maintenance_end_placeholder}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </Box>

        <Tooltip label={!isAdminUser ? t.common_admin_only : ""} hasArrow>
        <Button
          onClick={handleSubmit}
          borderRadius="full"
          bg={brandColor}
          color="black"
          leftIcon={<GrVmMaintenance />}
          _hover={{ opacity: 0.8 }}
          isDisabled={!isAdminUser} // 🔹 disable kalau bukan admin
        >
          {editingId ? t.maintenance_update_button : t.maintenance_create_button}
        </Button>
      </Tooltip>
      </VStack>

      <Heading size="md" mb={4}>
        {t.maintenance_list_title}
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {maintenances.map((m) => (
          <Box key={m.id} borderWidth="1px" borderRadius="lg" p={4} bg={cardBg} borderColor={brandColor}>
            <HStack spacing={2}>
              <GrVmMaintenance color={brandColor} />
              <Text fontWeight="bold" color={textColor}>
                {m.title}
              </Text>
              {new Date(m.startDate) <= new Date() && new Date(m.endDate) >= new Date() && (
                <Badge colorScheme="teal" ml="auto">
                 {t.common_active}
                </Badge>
              )}
            </HStack>
            <Text fontSize="sm" color={descColor}>
              {new Date(m.startDate).toLocaleString()} - {new Date(m.endDate).toLocaleString()}
            </Text>
            <Text mt={2} color={descColor}>
              {m.description}
            </Text>
            <HStack mt={2}>
             <Tooltip label={!isAdminUser ? "Admin only" : ""} hasArrow>
              <Button
                size="sm"
                colorScheme={isAdminUser ? "yellow" : "gray"} // warna abu kalau bukan admin
                isDisabled={!isAdminUser} // disable kalau bukan admin
                color="black" // text tetap hitam
                onClick={() => handleEdit(m)}
              >
                {t.common_edit}
              </Button>
            </Tooltip>

            <Tooltip label={!isAdminUser ? "Admin only" : ""} hasArrow>
              <Button
                size="sm"
                colorScheme={isAdminUser ? "red" : "gray"} // warna abu kalau bukan admin
                isDisabled={!isAdminUser} // disable kalau bukan admin
                color="black" // text tetap hitam
                onClick={() => handleDelete(m.id)}
              >
                {t.common_delete}
              </Button>
            </Tooltip>
            </HStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}