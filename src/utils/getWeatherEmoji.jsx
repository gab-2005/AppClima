// ========================= NIGHT CHECK =========================
export function isNightWithOffset(offsetInSeconds) {
  const offset = typeof offsetInSeconds === "number" ? offsetInSeconds : 0;

  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const cityTime = new Date(utc + offset * 1000);

  const hour = cityTime.getHours();
  return hour >= 18 || hour < 6;
}

// ========================= WEATHER EMOJI =========================
export function getWeatherEmoji(weatherCode, timezoneOffset, options = {}) {
  if (typeof weatherCode !== "number") return "❓";

  const isNight = isNightWithOffset(timezoneOffset);
  const nightMode = options.forceDay ? false : isNight;

  // ⛈️ Tempestade
  if ([95, 96, 99].includes(weatherCode)) return "⛈️";

  // 🌧️ / 🌦️ Chuva (independente de mm/h)
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode))
    return nightMode ? "🌧️" : "🌦️";

  // ❄️ Neve
  if ([71, 73, 75, 77].includes(weatherCode)) return "❄️";

  // 🌫️ Névoa
  if ([45, 48].includes(weatherCode)) return "☁️";

  // ☁️ Parcialmente nublado
  if (weatherCode === 3) return nightMode ? "🌕" : "🌤️";

  // 🌤️ Poucas nuvens
  if (weatherCode === 2) return nightMode ? "🌕" : "🌤️";

  // ☀️ Céu limpo
  if (weatherCode === 0 || weatherCode === 1)
    return nightMode ? "🌕" : "☀️";

  // fallback seguro
  return "❓";
}
