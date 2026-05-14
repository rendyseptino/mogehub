"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 🔥 ambil token & userId (sesuai sistem auth lu)
    const token = localStorage.getItem("token"); // atau getAuthToken()
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id;

    // 🔥 bikin socket SEKALI
    const socketIo = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
      auth: {
        token, // optional (kalau backend pake)
        tokenUserId: userId, // 🔥 WAJIB buat notif
      },
    });

    setSocket(socketIo);

    socketIo.on("connect", () => {
      console.log("✅ Socket connected:", socketIo.id);
    });

    socketIo.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });

    return () => {
      socketIo.disconnect();
      console.log("🔌 Socket disconnected");
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);