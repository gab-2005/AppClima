const round = (v, dec = 1) => Math.round(v * 10 ** dec) / 10;

function findCurrentHourIndex(hourlyTimes, timezoneOffset = 0) {
  const now = new Date();
  const localTime = new Date(now.getTime() + timezoneOffset * 1000);
  for (let i = 0; i < hourlyTimes.length; i++) {
    if (new Date(hourlyTimes[i]) >= localTime) return Math.max(0, i - 1);
  }
  return Math.max(0, hourlyTimes.length - 1);
}

export async function getWeatherByCoords(lat, lon) {
  try {
    const res = await fetch(
  `https://api.open-meteo.com/v1/forecast?forecast_days=15&latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,apparent_temperature,relativehumidity_2m,precipitation,dewpoint_2m,pressure_msl&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&temperature_unit=celsius&windspeed_unit=kmh&precipitation_unit=mm`
);

  

    if (!res.ok) throw new Error("Erro na API");

    const data = await res.json();
    if (!data.current_weather || !data.hourly || !data.daily) {
      throw new Error("Dados incompletos");
    }

    const tzOffset = data.utc_offset_seconds || 0;
    const idx = findCurrentHourIndex(data.hourly.time, tzOffset);
    const get = (arr) => arr?.[idx] ?? 0;

    // Previsão diária com weathercode correto
    const dailyForecast = data.daily.time.map((date, index) => ({
  date,
  weathercode: data.daily.weathercode[index],
  tempMax: round(data.daily.temperature_2m_max[index] ?? 0),
  tempMin: round(data.daily.temperature_2m_min[index] ?? 0),
  precipitation: round(data.daily.precipitation_sum[index] ?? 0),
  precipitationProbability: data.daily.precipitation_probability_max?.[index] ?? null,
}));


    return {
      // ===== CLIMA ATUAL =====
      temperature: round(
        get(data.hourly.temperature_2m) ||
          data.current_weather.temperature
      ),
      weathercode: data.current_weather.weathercode,
      windspeed: round(data.current_weather.windspeed),
      winddirection: data.current_weather.winddirection ?? null,
      apparent_temperature: round(
        get(data.hourly.apparent_temperature) ||
          data.current_weather.temperature
      ),
      humidity: Math.round(get(data.hourly.relativehumidity_2m) || 0),
      precipitation_hourly: round(get(data.hourly.precipitation)),
      precipitation: round(data.daily.precipitation_sum?.[0] ?? 0),
      tempMin: round(data.daily.temperature_2m_min?.[0] ?? 0),
      tempMax: round(data.daily.temperature_2m_max?.[0] ?? 0),
      precipitation_probability:
        data.daily.precipitation_probability_max?.[0] ?? null,
      pressure: data.hourly.pressure_msl?.[idx] ?? null,
      dewpoint: round(data.hourly.dewpoint_2m?.[idx] ?? 0),
      timezone_offset: tzOffset,
      _currentHourIndex: idx,

      // ===== PRÓXIMOS DIAS =====
      daily: dailyForecast, // 👈 array agora contém o weathercode de cada dia
    };
  } catch (err) {
    console.log("Erro getWeatherByCoords:", err.message);
    return null;
  }
}

export async function getWeatherByCity(city) {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city
      )}&count=10&language=pt`
    );

    if (!geoRes.ok) throw new Error("Erro na API de geolocalização");

    const geoData = await geoRes.json();
    if (!geoData.results?.length)
      throw new Error("Cidade não encontrada");

    const cityResult = geoData.results.find((r) =>
      ["PPL", "PPLC", "PPLA"].includes(r.feature_code)
    );

    if (!cityResult)
      throw new Error("Nenhuma cidade habitada encontrada");

    const { latitude, longitude, name, admin1, country } = cityResult;

    const weatherData = await getWeatherByCoords(latitude, longitude);
    if (!weatherData) return null;

    return {
      ...weatherData,
      cityName: name,
      region: admin1,
      country,
      latitude,
      longitude,
    };
  } catch (err) {
    console.log("Erro getWeatherByCity:", err.message);
    return null;
  }
}


