// context/LanguageContext.js
import { createContext, useContext, useState, useEffect } from "react";
import {
  getGuestLanguage,
  detectDeviceLanguage,
  getUserLanguage,
  setGuestLanguage,
  updateUserLanguage,
} from "../services/languageService";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("id");

  // Load initial language saat mount
  useEffect(() => {
    const init = async () => {
      let lang = await getUserLanguage(); // kalau login
      if (!lang) lang = getGuestLanguage() || detectDeviceLanguage(); // guest
      setLanguage(lang);
    };
    init();
  }, []);

  // Ganti bahasa
  const changeLanguage = async (lang) => {
    setLanguage(lang); // update state global
    setGuestLanguage(lang); // simpan guest di localStorage

    const token = localStorage.getItem("token");
    if (token) {
      // update ke server kalau login
      const success = await updateUserLanguage(lang);
      if (!success) console.error("Gagal update bahasa user di server");
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook biar gampang dipakai di komponen
export const useLanguageContext = () => useContext(LanguageContext);
