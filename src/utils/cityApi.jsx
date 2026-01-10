/**
 * fetchCitySuggestions
 *
 * Papel da função:
 * - Buscar sugestões de cidades a partir de um texto de pesquisa
 * - Retorna no máximo 5 resultados em português
 *
 * Uso com Home / SearchBox:
 * - Home chama esta função via useCitySearch ou diretamente
 * - Os resultados alimentam o estado de sugestões para exibição
 *
 * Retorno:
 * - Array de objetos de cidades (ou vazio se erro / query vazia)
 */
export async function fetchCitySuggestions(query) {
  if (!query) return []; // query vazia retorna array vazio imediatamente

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query
      )}&count=5&language=pt`
    );

    const data = await response.json();

    // Retorna array de resultados ou vazio se não houver resultados
    return data.results || [];
  } catch (err) {
    console.log("Erro fetchCitySuggestions:", err.message);
    return [];
  }
}
