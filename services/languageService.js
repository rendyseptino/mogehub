const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const GUEST_LANG_KEY = "guest_language";

// ===========================
// Detect preferred language (device)
// ===========================
export function detectDeviceLanguage() {
  if (typeof navigator === "undefined") return "id";
  const lang = navigator.language || navigator.userLanguage || "id";
  return lang.slice(0, 2);
}

// ===========================
// Guest language (localStorage)
// ===========================
export function getGuestLanguage() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_LANG_KEY);
}

export function setGuestLanguage(lang) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_LANG_KEY, lang);
}

export function clearGuestLanguage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_LANG_KEY);
}

// ===========================
// Ambil bahasa user login
// ===========================
export async function getUserLanguage() {
  try {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token");
    if (!token) return null;

    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Gagal ambil user");

    const data = await res.json();

    return data?.user?.language || null;
  } catch (err) {
    console.error("getUserLanguage error:", err);
    return null;
  }
}

// ===========================
// Update bahasa user login
// ===========================
export async function updateUserLanguage(lang) {
  try {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("token");
    if (!token) return false;

    const res = await fetch(`${BACKEND_URL}/auth/me/language`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ language: lang }),
    });

    if (!res.ok) return false;

    const data = await res.json();

    return data?.user?.language === lang;
  } catch (err) {
    console.error("updateUserLanguage error:", err);
    return false;
  }
}
