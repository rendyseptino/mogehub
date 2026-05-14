// frontend: /utils/googleHandler.js
import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";

export const handleGoogleLogin = async (backendUrl, router) => {
  try {
    // redirect ke backend Google login
    window.location.href = `${backendUrl}/auth/google`;
  } catch (err) {
    console.error(err);
  }
};

// ini buat dipanggil di /login useEffect
export const processGoogleCallback = async (query, login, router) => {
  const { token } = query;
  if (!token) return;

  // ambil user info dari backend pake token
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (res.ok && data.user) {
    login(data.user); // ✅ update userContext
    localStorage.setItem("token", token);
    router.replace("/seller/dashboard");
  }
};