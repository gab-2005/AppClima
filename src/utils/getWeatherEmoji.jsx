import { Ionicons } from "@expo/vector-icons";
// ========================= NIGHT CHECK =========================
export function isNightWithOffset(offsetInSeconds) {
  const offset = typeof offsetInSeconds === "number" ? offsetInSeconds : 0;

  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const cityTime = new Date(utc + offset * 1000);

  const hour = cityTime.getHours();
  return hour >= 18 || hour < 6;
}

export function getDayNightEmoji(timezoneOffset) {
  const isNight = isNightWithOffset(timezoneOffset);
  return isNight ? "moon-outline" : "sunny-outline"; // Lua à noite, Sol de dia
}

// ========================= WEATHER EMOJI =========================
const weatherEmojis = {
  0: { day: "☀️", night: "🌕" },       // Céu limpo
  1: { day: "☀️", night: "🌕" },       // Principalmente limpo
  2: { day: "🌤️", night: "🌙" },       // Poucas nuvens
  3: { day: "☁️", night: "☁️" },       // Parcialmente nublado
  45: { day: "🌫️", night: "🌫️" },     // Névoa
  48: { day: "🌫️", night: "🌫️" },     // Névoa com gelo
  51: { day: "🌦️", night: "☁️" },     // Chuva fraca (garoa)
  53: { day: "🌦️", night: "🌧️" },     // Chuva moderada (garoa)
  55: { day: "🌦️", night: "🌧️" },     // Chuva intensa (garoa)
  61: { day: "🌦️", night: "☁️" },     // Chuva leve
  63: { day: "🌦️", night: "🌧️" },     // Chuva moderada
  65: { day: "🌦️", night: "🌧️" },     // Chuva forte
  66: { day: "🌧️", night: "☁️" },     // Chuva congelante fraca
  67: { day: "🌧️", night: "🌧️" },     // Chuva congelante forte
  71: { day: "❄️", night: "❄️" },     // Neve fraca
  73: { day: "❄️", night: "❄️" },     // Neve moderada
  75: { day: "❄️", night: "❄️" },     // Neve intensa
  77: { day: "❄️", night: "❄️" },     // Granizo
  80: { day: "☁️", night: "☁️" },     // Chuva fraca
  81: { day: "🌦️", night: "🌧️" },     // Chuva moderada
  82: { day: "🌦️", night: "🌧️" },     // Chuva forte
  95: { day: "🌦️", night: "☁️" },     // Tempestade leve
  96: { day: "🌤️", night: "☁️" },     // Tempestade com granizo
  99: { day: "⛈️", night: "⛈️" }      // Tempestade intensa
};

export function getWeatherEmoji(weatherCode, timezoneOffset, options = {}) {
  const isNight = isNightWithOffset(timezoneOffset);
  const nightMode = options.forceDay ? false : isNight;

  if (!weatherEmojis.hasOwnProperty(weatherCode)) return "❓";

  return nightMode ? weatherEmojis[weatherCode].night : weatherEmojis[weatherCode].day;
}
