import { useState, useEffect, useRef } from "react";
import {
  detectDeviceLanguage,
  getGuestLanguage,
  setGuestLanguage,
  clearGuestLanguage,
  updateUserLanguage,
} from "../services/languageService";

import idLocale from "../locales/id.json";
import enLocale from "../locales/en.json";

const locales = {
  id: idLocale,
  en: enLocale,
};

const defaultLang = "id";
const availableLanguages = ["id", "en"];

export default function useLanguage(user) {
  const [language, setLanguageState] = useState(defaultLang);
  const [loading, setLoading] = useState(true);

  const isManuallyChanged = useRef(false);

  // =========================
  // INIT LANGUAGE
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function init() {
      let lang = defaultLang;

      // ======================
      // PRIORITY FIXED UNTUK USER LOGIN
      // ======================

      // 1️⃣ guest language / manual change (localStorage)
      const guestLang = getGuestLanguage();
      if (availableLanguages.includes(guestLang)) {
        lang = guestLang;
      }
      // 2️⃣ jika belum ada manual choice → user.language
      else if (user?.language && availableLanguages.includes(user.language)) {
        lang = user.language;
      }
      // 3️⃣ fallback device
      else {
        const device = detectDeviceLanguage();
        if (availableLanguages.includes(device)) {
          lang = device;
        }
      }

      // ✅ jangan timpa kalo user sudah klik manual
      if (!cancelled && !isManuallyChanged.current) {
        setLanguageState(lang);
      }

      if (!cancelled) setLoading(false);
    }

    // reset manual flag saat init
    isManuallyChanged.current = false;
    init();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.language]);

  // =========================
  // SYNC guest → user setelah login
  // =========================
  useEffect(() => {
    if (!user?.id) return;

    const guestLang = getGuestLanguage();

    if (
      guestLang &&
      availableLanguages.includes(guestLang) &&
      guestLang !== user.language
    ) {
      updateUserLanguage(guestLang)
        .then((ok) => {
          if (ok) {
            clearGuestLanguage();
            setLanguageState(guestLang); // 🔥 langsung update UI
          }
        })
        .catch(() => {});
    }
  }, [user?.id, user?.language]);

  // =========================
  // CHANGE LANGUAGE
  // =========================
  const changeLanguage = async (lang) => {
    if (!availableLanguages.includes(lang)) return;

    isManuallyChanged.current = true;
    setLanguageState(lang);

    // guest → simpan di localStorage
    if (!user?.id) {
      setGuestLanguage(lang);
      return;
    }

    // user login → patch ke backend
    try {
      await updateUserLanguage(lang);
    } catch (err) {
      console.error("update language error:", err);
    }
  };

  const t = locales[language] || locales[defaultLang];

  return {
    language,
    setLanguage: changeLanguage,
    loading,
    t,
    availableLanguages,
  };
}
