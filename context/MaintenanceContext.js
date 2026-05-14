"use client";

import { createContext, useContext, useState, useEffect } from "react";

const MaintenanceContext = createContext();

export const useMaintenance = () => useContext(MaintenanceContext);

export const MaintenanceProvider = ({ children }) => {
  const [activeMaintenance, setActiveMaintenance] = useState(null);

  useEffect(() => {
    const fetchActiveMaintenance = async () => {
      try {
        const res = await fetch("https://api.mogehub.com/api/maintenance/active");
        const data = await res.json();
        setActiveMaintenance(data.maintenance || null);
      } catch (err) {
        console.error("Failed to fetch active maintenance:", err);
      }
    };

    fetchActiveMaintenance();

    // Optional: refresh tiap 5 menit
    const interval = setInterval(fetchActiveMaintenance, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MaintenanceContext.Provider value={{ activeMaintenance }}>
      {children}
    </MaintenanceContext.Provider>
  );
};