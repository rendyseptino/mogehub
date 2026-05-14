export const timeAgo = (date, language = "en") => {
  if (!date) return "";

  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const map = {
    en: {
      year: "year",
      month: "month",
      day: "day",
      hour: "hour",
      minute: "minute",
      ago: "ago",
      just: "just now",
    },
    id: {
      year: "tahun",
      month: "bulan",
      day: "hari",
      hour: "jam",
      minute: "menit",
      ago: "lalu",
      just: "baru saja",
    },
  };

  const t = map[language] || map.en;

  const intervals = [
    { key: "year", seconds: 31536000 },
    { key: "month", seconds: 2592000 },
    { key: "day", seconds: 86400 },
    { key: "hour", seconds: 3600 },
    { key: "minute", seconds: 60 },
  ];

  for (const i of intervals) {
    const interval = Math.floor(seconds / i.seconds);

    if (interval >= 1) {
      return language === "id"
        ? `${interval} ${t[i.key]} ${t.ago}`
        : `${interval} ${t[i.key]}${interval > 1 ? "s" : ""} ${t.ago}`;
    }
  }

  return t.just;
};

export const memberSince = (date, language = "en") => {
  if (!date) return "";

  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const map = {
    en: {
      year: "year",
      month: "month",
      day: "day",
      ago: "ago",
      just: "just now",
      prefix: "Member since",
    },
    id: {
      year: "tahun",
      month: "bulan",
      day: "hari",
      ago: "lalu",
      just: "baru saja",
      prefix: "Bergabung sejak",
    },
  };

  const t = map[language] || map.en;

  const intervals = [
    { key: "year", seconds: 31536000 },
    { key: "month", seconds: 2592000 },
    { key: "day", seconds: 86400 },
  ];

  for (const i of intervals) {
    const interval = Math.floor(seconds / i.seconds);

    if (interval >= 1) {
      return language === "id"
        ? `${t.prefix} ${interval} ${t[i.key]} ${t.ago}`
        : `${t.prefix} ${interval} ${t[i.key]}${interval > 1 ? "s" : ""} ${t.ago}`;
    }
  }

  return `${t.prefix} ${t.just}`;
};