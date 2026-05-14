// utils/responsiveCard.js
export const isMobileCard = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
};

export const isTabletCard = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 768 && window.innerWidth < 992;
};

// 🔥 TAMBAHAN BARU: TABLET BESAR / IPAD PRO / SMALL LAPTOP
export const isLargeTabletCard = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 992 && window.innerWidth < 1200;
};

export const isDesktopCard = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 1200;
};