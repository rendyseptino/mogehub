"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

  const modalBg = useColorModeValue("white", "gray.800");
  const modalText = useColorModeValue("gray.800", "white");
  const btnBg = useColorModeValue("red.500", "red.400");
  const btnHover = useColorModeValue("red.600", "red.500");

  // ======================= INITIAL LOAD =======================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsSuspendModalOpen(parsedUser.isSuspended || false);
    } else {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setIsSuspendModalOpen(false);
    }

    setLoading(false);
  }, []);

  // tambahkan di dalam UserProvider
const updateAvatar = (newUrl) => {
  setUser((prev) => {
    if (!prev) return prev;
    const updated = { ...prev, profilePhoto: newUrl };
    localStorage.setItem("user", JSON.stringify(updated));
    return updated;
  });
};

  // ======================= LOGIN / LOGOUT =======================
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    if (token) localStorage.setItem("token", token);
    setIsSuspendModalOpen(userData.isSuspended || false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsSuspendModalOpen(false);
    window.location.href = "/";
  };

  const isLoggedIn = () => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  };

  // ======================= CHECK SUSPEND / AUTO UPDATE =======================
  useEffect(() => {
    const checkSuspend = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));

          if (data.user.isSuspended) setIsSuspendModalOpen(true);
          else setIsSuspendModalOpen(false);
        }
      } catch (err) {
        console.error("[DEBUG] checkSuspend ERROR:", err);
      }
    };

    checkSuspend();
    const interval = setInterval(checkSuspend, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        isLoggedIn,
        isSuspendModalOpen,
        setIsSuspendModalOpen,
        updateAvatar,
      }}
    >
      {children}

      {/* ======================= SUSPEND MODAL ======================= */}
      <Modal
        isOpen={isSuspendModalOpen}
        onClose={() => {}}
        isCentered
        closeOnOverlayClick={false}
        closeOnEsc={false}
      >
        <ModalOverlay />
        <ModalContent
          bg={modalBg}
          color={modalText}
          borderRadius="2xl"
          p={6}
          minW={{ base: "90%", md: "450px" }}
          minH="200px"
        >
          <ModalHeader textAlign="center" fontSize="2xl">
            ⚠️ Akun Anda Disuspend
          </ModalHeader>
          <ModalBody>
            <Text textAlign="center" fontSize="md">
              Maaf, akun Anda sedang disuspend. Hubungi{" "}
              <Text as="span" fontWeight="bold">
                support@mogehub.com
              </Text>{" "}
              untuk bantuan.
            </Text>
          </ModalBody>
          <ModalFooter justifyContent="center">
            <Button
              colorScheme="red"
              bg={btnBg}
              _hover={{ bg: btnHover }}
              onClick={logout}
              size="lg"
              px={8}
              py={4}
            >
              Logout
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);