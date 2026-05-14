// components/MaintenanceMode.js
"use client";

import { useEffect, useState, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  VStack,
  Text,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import { GrVmMaintenance } from "react-icons/gr";
import { useUser } from "../context/UserContext";

export default function MaintenanceMode() {
  const [maintenance, setMaintenance] = useState(null);
  const [countdown, setCountdown] = useState("");
  const controllerRef = useRef(null);
  const { user } = useUser();

  const whitelistEmails = ["rendyseptinoo@gmail.com", "admin@mogehub.com"];

  useEffect(() => {
    if (!navigator.onLine) return;

    if (user?.email && whitelistEmails.includes(user.email)) {
      setMaintenance(null);
      return;
    }

    const fetchMaintenance = async () => {
      if (controllerRef.current) controllerRef.current.abort();
      controllerRef.current = new AbortController();
      const signal = controllerRef.current.signal;

      try {
        const res = await fetch("https://api.mogehub.com/api/maintenance/active", {
          cache: "no-store",
          signal,
        });
        const data = await res.json();

        if (data?.maintenance) {
          setMaintenance(data.maintenance);
        } else {
          setMaintenance(null);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        setMaintenance(null);
      }
    };

    fetchMaintenance();
    const interval = setInterval(fetchMaintenance, 30000);

    return () => {
      clearInterval(interval);
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [user]);

  // countdown
  useEffect(() => {
    if (!maintenance) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(maintenance.startDate);
      const end = new Date(maintenance.endDate);

      let diff;
      let label;

      if (now < start) {
        diff = start - now;
        label = "Maintenance Dimulai Dalam";
      } else if (now >= start && now <= end) {
        diff = end - now;
        label = "Maintenance Berakhir Dalam";
      } else {
        diff = 0;
        label = "Maintenance Selesai";
      }

      if (diff <= 0) {
        setCountdown("00:00:00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${label}: ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [maintenance]);

  if (!maintenance) return null;

  const descColor = useColorModeValue("gray.800", "white");

  const formatIndoDate = (isoDate) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => {}}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent
        maxW="400px"
        p={6}
        borderRadius="md"
        textAlign="center"
        zIndex={9999}
      >
        <ModalHeader>
          <GrVmMaintenance size={48} style={{ margin: "0 auto" }} />
        </ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <Text fontSize="2xl" fontWeight="bold">
              {maintenance.title}
            </Text>
            <Text fontSize="md" color={descColor}>
              {maintenance.description}
            </Text>
            <VStack spacing={2}>
              <Text fontSize="lg" fontWeight="semibold">
                Mulai Maintenance:{" "}
                <Badge colorScheme="teal">{formatIndoDate(maintenance.startDate)}</Badge>
              </Text>
              <Text fontSize="lg" fontWeight="semibold">
                Selesai Maintenance:{" "}
                <Badge colorScheme="teal">{formatIndoDate(maintenance.endDate)}</Badge>
              </Text>
            </VStack>
            {countdown && (
              <Text fontSize="xl" fontWeight="bold" mt={4} color="teal.500">
                {countdown}
              </Text>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}