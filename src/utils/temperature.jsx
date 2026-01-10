// ========================= TEMPERATURE UTILS =========================
/**
 * formatTemperature
 *
 * Papel da função:
 * - Formata a temperatura para exibição com unidade adequada (Celsius ou Fahrenheit)
 * - Retorna "--" se valor for null ou undefined
 *
 * Parâmetros:
 * - temp: número | null | undefined → temperatura a ser formatada
 * - unit: string → "celsius" ou "fahrenheit"
 *
 * Retorno:
 * - string → temperatura arredondada + unidade ("23°C" ou "74°F")
 *
 * Uso:
 * - MainWeatherCard, WeatherGrid, DailyForecast chamam para exibir valores
 */
export function formatTemperature(temp, unit) {
  if (temp == null) return "--"; // valor ausente

  if (unit === "fahrenheit") {
    const f = (temp * 9) / 5 + 32;
    return `${Math.round(f)}°F`;
  }

  return `${Math.round(temp)}°C`;
}
