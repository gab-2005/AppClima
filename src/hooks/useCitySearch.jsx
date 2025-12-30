import { useState, useRef } from "react";
import { fetchCitySuggestions } from "../utils/cityApi";

export function useCitySearch() {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounce = useRef(null);

  const onChange = (text) => {
    setCity(text);
    if (debounce.current) clearTimeout(debounce.current);

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

  const clear = () => {
    setCity("");
    setSuggestions([]);
    setLoading(false);
    setEmpty(false);
    setFocused(false);
  };

  return { city, suggestions, loading, empty, focused, setFocused, onChange, clear, setSuggestions };
}
