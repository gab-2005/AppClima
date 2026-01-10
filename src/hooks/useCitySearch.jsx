// React
import { useState, useRef } from "react";

// Utils
import { fetchCitySuggestions } from "../utils/cityApi";

/**
 * useCitySearch
 *
 * Papel do hook:
 * - Centralizar toda a lógica de busca de cidades
 * - Controlar debounce da requisição
 * - Expor estados para UI (loading, vazio, foco)
 *
 * Uso em conjunto com o Home:
 * - O Home (ou componentes como SearchBox / SearchOverlay)
 *   consome este hook para:
 *   - controlar o input de cidade
 *   - buscar sugestões
 *   - exibir estados de loading e vazio
 *
 * O hook NÃO renderiza nada.
 * Ele apenas fornece estado e callbacks.
 */
export function useCitySearch() {
  // Texto digitado no input
  const [city, setCity] = useState("");

  // Lista de sugestões retornadas da API
  const [suggestions, setSuggestions] = useState([]);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [focused, setFocused] = useState(false);

  // Referência para controle de debounce
  const debounce = useRef(null);

  /**
   * Atualiza o texto digitado e dispara a busca com debounce
   */
  const onChange = (text) => {
    setCity(text);

    if (debounce.current) {
      clearTimeout(debounce.current);
    }

    // Se o texto estiver vazio, reseta os estados
    if (!text.trim()) {
      setSuggestions([]);
      setLoading(false);
      setEmpty(false);
      return;
    }

    setLoading(true);

    debounce.current = setTimeout(async () => {
      try {
        const res = await fetchCitySuggestions(text);
        setSuggestions(res || []);
        setEmpty(!res?.length);
      } catch {
        setSuggestions([]);
        setEmpty(true);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  /**
   * Limpa completamente o estado da busca
   */
  const clear = () => {
    setCity("");
    setSuggestions([]);
    setLoading(false);
    setEmpty(false);
    setFocused(false);
  };

  /**
   * Retorno do hook:
   * - Estados para renderização
   * - Callbacks para interação
   */
  return {
    city,
    suggestions,
    loading,
    empty,
    focused,

    setFocused,
    onChange,
    clear,

    // Mantido para permitir controle externo (ex: seleção manual)
    setSuggestions,
  };
}
