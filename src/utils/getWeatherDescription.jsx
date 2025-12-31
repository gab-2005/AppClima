import { isNightWithOffset } from "./getWeatherEmoji";


// ========================= WEATHER DESCRIPTION =========================
const weatherDescriptions = {
  0: { day: "Céu limpo", night: "Céu limpo" },
  1: { day: "Principalmente limpo", night: "Principalmente limpo" },
  2: { day: "Poucas nuvens", night: "Poucas nuvens" },
  3: { day: "Parcialmente nublado", night: "Parcialmente nublado" },
  45: { day: "Névoa", night: "Névoa" },
  48: { day: "Névoa com gelo", night: "Névoa com gelo" },
  51: { day: "Chuva fraca", night: "Chuva fraca" },
  53: { day: "Chuva moderada", night: "Chuva moderada" },
  55: { day: "Chuva intensa", night: "Chuva intensa" },
  61: { day: "Chuva leve", night: "Chuva leve" },
  63: { day: "Chuva moderada", night: "Chuva moderada" },
  65: { day: "Chuva forte", night: "Chuva forte" },
  66: { day: "Chuva congelante fraca", night: "Chuva congelante fraca" },
  67: { day: "Chuva congelante forte", night: "Chuva congelante forte" },
  71: { day: "Neve fraca", night: "Neve fraca" },
  73: { day: "Neve moderada", night: "Neve moderada" },
  75: { day: "Neve intensa", night: "Neve intensa" },
  77: { day: "Granizo", night: "Granizo" },
  80: { day: "Chuva fraca", night: "Chuva fraca" },
  81: { day: "Chuva moderada", night: "Chuva moderada" },
  82: { day: "Chuva forte", night: "Chuva forte" },
  95: { day: "Tempestade leve", night: "Tempestade leve" },
  96: { day: "Tempestade com granizo", night: "Tempestade com granizo" },
  99: { day: "Tempestade intensa", night: "Tempestade intensa" },
};

export function getWeatherDescription(weatherCode, timezoneOffset, options = {}) {
  const isNight = isNightWithOffset(timezoneOffset);
  const nightMode = options.forceDay ? false : isNight;

  if (!weatherDescriptions.hasOwnProperty(weatherCode)) return "Desconhecido";

  return nightMode ? weatherDescriptions[weatherCode].night : weatherDescriptions[weatherCode].day;
}



