export function isNightWithOffset(offsetInSeconds) {
  if (offsetInSeconds === undefined || offsetInSeconds === null) {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  }
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const cityTime = new Date(utc + offsetInSeconds * 1000);
  const hour = cityTime.getHours();
  return hour >= 18 || hour < 6;
}

export function getWeatherEmoji(weatherCode, timezoneOffset, options = {}) {
  // garante que o timezoneOffset sempre será um número válido
  const offset = typeof timezoneOffset === "number" ? timezoneOffset : 0;
  const isNight = isNightWithOffset(offset);

  // Se for forçar dia, ignora a noite
  const nightMode = options.forceDay ? false : isNight;

  if ([95, 96, 99].includes(weatherCode)) return "⛈️";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode))
    return nightMode ? "🌧️" : "🌦️";
  if ([71, 73, 75, 77].includes(weatherCode)) return "❄️";
  if ([45, 48].includes(weatherCode)) return "🌫️";
  if (weatherCode === 3) return nightMode ? "🌕" : "🌤️";
  if (weatherCode === 1) return nightMode ? "🌕" : "☀️";
  if (weatherCode === 2) return nightMode ? "🌕" : "🌤️";
  if (weatherCode === 0) return nightMode ? "🌕" : "☀️";

  // fallback final só se realmente não tiver código
  return "❄️";
}
