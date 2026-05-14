export const sortAds = ({
  ads,
  sortBy,
  sortOrder,
  canUseNearby,
}) => {
  const sorted = [...ads];

  const isSortActive = !!sortBy;

  return sorted.sort((a, b) => {

    // =====================
    // BOOST ONLY IF NO SORT
    // =====================
    if (!isSortActive) {
      const scoreA = a.boost?.score || 0;
      const scoreB = b.boost?.score || 0;

      if (scoreB !== scoreA) return scoreB - scoreA;
    }

    // =====================
    // SORT MODE
    // =====================
    if (isSortActive) {

      const getValue = (ad) => {
        let val = ad?.[sortBy];

        if (val === null || val === undefined) return 0;

        if (typeof val === "string") {
          val = val.replace(/[^\d.-]/g, "");
        }

        const num = Number(val);
        return isNaN(num) ? 0 : num;
      };

      const valA = getValue(a);
      const valB = getValue(b);

      return sortOrder === "asc"
        ? valA - valB
        : valB - valA;
    }

    // =====================
    // NEARBY
    // =====================
    if (canUseNearby) {
      return (a.distance || Infinity) - (b.distance || Infinity);
    }

    // =====================
    // DEFAULT
    // =====================
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};