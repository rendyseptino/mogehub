// frontend: /utils/facebookLogin.js

// ===== HANDLER UNTUK REDIRECT LOGIN FACEBOOK =====
export const handleFacebookLogin = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;

  window.open(
    `${url}/auth/facebook?redirect=stay&origin=${window.location.origin}`,
    "facebookLogin",
    "width=500,height=600"
  );
};

// ===== HANDLE CALLBACK FACEBOOK PAS REDIRECT =====
export const processFacebookCallback = async (query, login, router) => {
  const { token } = query;
  if (!token) return;

  try {
    // ambil user info dari backend pake token
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api.mogehub.com"}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.ok && data.user) {
      login(data.user); // ✅ update UserContext
      localStorage.setItem("token", token);
      router.replace("/seller/dashboard");
    }
  } catch (err) {
    console.error("Facebook callback error:", err);
  }
};