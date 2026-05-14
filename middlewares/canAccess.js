// mogehub/middlewares/canAccess.js

const permissionMap = {
  verification: {
    view: ["admin", "moderator"], // siapa yang bisa lihat halaman
    approve: ["admin"],            // siapa yang bisa approve
    reject: ["admin"],             // siapa yang bisa reject
  },
  // bisa ditambah page lain misal:
  // userRole: { view: ["admin"], edit: ["admin"] },
};

export const canAccess = (user, pageKey, action = "view") => {
  if (!user || !user.role) return false;
  return permissionMap[pageKey]?.[action]?.includes(user.role);
};