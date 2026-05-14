// utils/responsive.js

// tampil di mobile + iPad, hide desktop
export const mobileOnly = { base: "flex", lg: "none" };

// tampil di desktop, hide mobile + iPad
export const desktopOnly = { base: "none", lg: "flex" };

// contoh tambahan
export const mobileAndTabletFont = { base: "sm", lg: "md" };
export const mobileAndTabletPadding = { base: 4, lg: 8 };

// ================= MOBILE / TABLET CHECK =================
export const isMobileOrTablet = () => typeof window !== "undefined" && window.innerWidth < 1200;