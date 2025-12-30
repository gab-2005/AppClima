import { isNightWithOffset } from "./getWeatherEmoji";

export function getWeatherDescription(weatherCode, timezoneOffset) {
  const isNight = isNightWithOffset(timezoneOffset);

  if ([95, 96, 99].includes(weatherCode)) return "Tempestade";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) return isNight ? "Chuva à noite" : "Chuva";
  if ([71, 73, 75, 77].includes(weatherCode)) return "Neve";
  if ([45, 48].includes(weatherCode)) return "Névoa";
  if (weatherCode === 3) return isNight ? "Nublado à noite" : "Nublado";
  if (weatherCode === 1) return isNight ? "Poucas nuvens à noite" : "Poucas nuvens";
  if (weatherCode === 2) return isNight ? "Parcialmente nublado" : "Parcialmente nublado";
  if (weatherCode === 0) return isNight ? "Céu limpo à noite" : "Céu limpo";
  
  return isNight ? "Nublado à noite" : "Nublado";
}
