"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchActivities = async (token) => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data = await res.json();
      setActivities(data.activities || []);
      setUnreadCount(data.activities?.filter(a => !a.read).length || 0);
    } catch (err) {
      console.error("Activity fetch error:", err);
    }
  };

  const markAllRead = async (token) => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities/mark-read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to mark read");
      // update state locally
      setActivities(prev => prev.map(a => ({ ...a, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  return (
    <ActivityContext.Provider
      value={{ activities, fetchActivities, unreadCount, markAllRead }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => useContext(ActivityContext);