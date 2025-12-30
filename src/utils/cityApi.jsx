export async function fetchCitySuggestions(query) {
  if (!query) return [];

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=pt`
    );
    const data = await response.json();
    return data.results || [];
  } catch (err) {
    console.log("Erro fetchCitySuggestions:", err.message);
    return [];
  }
}
