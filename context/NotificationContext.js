"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
import { useUser } from "@/context/UserContext";
import { playSound } from "@/utils/sound";
import { Howler } from "howler";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const socket = useSocket(); // 🔥 FIX: langsung ambil socket
  const { user } = useUser();
  const userId = user?.id;

  // Setting user
  const [enabled, setEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState("chat1.wav");
  const [volume, setVolume] = useState(0.5);

  // Runtime state
  const [unread, setUnread] = useState({});
  const [rooms, setRooms] = useState([]);

  // 🔥 seenMessages pake ref biar ga reset
  const seenMessagesRef = useRef(new Set());

  // 🔥 AUDIO UNLOCK (WAJIB BIAR BUNYI)
  useEffect(() => {
    const unlock = () => {
      try {
        Howler.ctx?.resume();
      } catch (e) {}

      window.removeEventListener("click", unlock);
    };

    window.addEventListener("click", unlock);
  }, []);

  // 🔹 Load settings dari backend
  const fetchSettings = async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("https://api.mogehub.com/api/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();

      setEnabled(data.enabled ?? true);
      setSelectedSound(data.selectedSound ?? "chat1.wav");
      setVolume(data.volume ?? 0.5);
    } catch (err) {
      console.error("❌ FETCH SETTINGS ERROR:", err.message);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);


  // 🔥 LISTEN UPDATE DARI ADMIN PANEL
useEffect(() => {
  const handler = () => {
    console.log("🔄 Notification settings updated (REALTIME)");
    fetchSettings();
  };

  window.addEventListener("notificationSettingsUpdated", handler);

  return () => {
    window.removeEventListener("notificationSettingsUpdated", handler);
  };
}, []);

  // 🔹 Socket listener
  useEffect(() => {
    if (!socket || !userId) {
      console.log("⛔ WAITING SOCKET / USER", { socket, userId });
      return;
    }

    console.log("🔥 Notification ACTIVE", { userId });

    const safePlaySound = () => {
      if (!enabled || !selectedSound) return;

      try {
        playSound(selectedSound, volume);
      } catch (err) {
        console.error("Sound play error:", err);

        // 🔥 fallback manual audio (biar pasti bunyi)
        try {
          const audio = new Audio(`/sounds/${selectedSound}`);
          audio.volume = volume;
          audio.play().catch(() => {});
        } catch (e) {}
      }
    };

    const handler = (data) => {
      const senderId = String(
        data?.message?.senderId ||
        data?.senderId ||
        data?.message?.sender?.id ||
        ""
      );

      const roomId = String(
        data?.roomId ||
        data?.message?.roomId ||
        ""
      );

      if (!data?.isNotif || !senderId || senderId === String(userId) || !roomId) return;

      const messageId =
        data?.message?.id ||
        `${roomId}-${senderId}-${data?.message?.createdAt || Date.now()}`;

      if (seenMessagesRef.current.has(messageId)) return;
      seenMessagesRef.current.add(messageId);

      // 🔊 SOUND (REALTIME)
      safePlaySound();

      // 🔥 UPDATE UNREAD
      setUnread((prev) => {
        const updated = {
          ...prev,
          [roomId]: (prev[roomId] || 0) + 1,
        };
        localStorage.setItem("chat-unread", JSON.stringify(updated));
        return updated;
      });
    };

    const broadcastHandler = (room) => {
      if (!room?.id) return;

      const normalizedRoom = {
        ...room,
        participants: (room.participants || []).map((p) => ({
          ...p,
          userId: p.userId ?? p.user?.id,
        })),
      };

      // 🔊 SOUND BROADCAST
      safePlaySound();

      setRooms((prev) => {
        if (!Array.isArray(prev)) return [normalizedRoom];
        if (prev.some((r) => r.id === normalizedRoom.id)) return prev;
        return [...prev, normalizedRoom];
      });

      const participantIds = normalizedRoom.participants.map((p) =>
        Number(p.userId)
      );

      if (participantIds.includes(Number(userId))) {
        setUnread((prev) => {
          const updated = {
            ...prev,
            [normalizedRoom.id]: (prev[normalizedRoom.id] || 0) + 1,
          };
          localStorage.setItem("chat-unread", JSON.stringify(updated));
          return updated;
        });
      }
    };

    socket.on("receiveMessage", handler);
    socket.on("newBroadcast", broadcastHandler);

    return () => {
      socket.off("receiveMessage", handler);
      socket.off("newBroadcast", broadcastHandler);
    };
  }, [socket, userId, enabled, selectedSound, volume]);

  

  return (
    <NotificationContext.Provider
      value={{
        enabled,
        setEnabled,
        selectedSound,
        setSelectedSound,
        volume,
        setVolume,
        unread,
        setUnread,
        rooms,
        setRooms,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};