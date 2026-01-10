// React
import { useState, useEffect, useRef } from "react";

// React Native
import { AppState } from "react-native";

// Expo
import * as Location from "expo-location";

// Serviços externos
import { getWeatherByCoords, getWeatherByCity } from "../../services/weatherAPI";

/**
 * useWeather
 *
 * Papel do hook:
 * - Gerenciar estado do clima
 * - Buscar clima por cidade ou coordenadas
 * - Atualizar automaticamente em intervalos
 * - Lidar com erros e loading
 *
 * Uso com o Home:
 * - Home consome: weather, loading, error, searchedCity
 * - Home dispara: fetchWeatherByCoords, fetchWeatherByCity, fetchWeatherByCoordsWithCity
 * - Home chama clearSearch para resetar
 */
export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedCity, setSearchedCity] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);

  const updateIntervalRef = useRef(null);
  const appState = useRef(AppState.currentState);

  /**
   * Atualiza o clima baseado em coordenadas
   */
  const updateWeather = async (lat, lon) => {
    if (!lat || !lon || !weather) return;

    try {
      const data = await getWeatherByCoords(lat, lon);
      if (data) setWeather((prev) => ({ ...prev, ...data }));
    } catch (err) {
      console.log("Erro ao atualizar clima:", err.message);
    }
  };

  /**
   * Limpa o intervalo de atualização automática
   */
  const clearAutoUpdate = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  };

  /**
   * Inicia atualização automática a cada 1 hora
   */
  const startAutoUpdate = (lat, lon) => {
    clearAutoUpdate();
    setCurrentCoords({ lat, lon });
    updateIntervalRef.current = setInterval(
      () => updateWeather(lat, lon),
      60 * 60 * 1000
    );
  };

  /**
   * Busca o clima por nome de cidade
   */
  const fetchWeatherByCity = async (city) => {
    if (!city) return;

    try {
      setLoading(true);
      setError(null);

      const data = await getWeatherByCity(city);

      if (data) {
        setWeather(data);
        setSearchedCity(data.cityName || city);

        if (data.latitude && data.longitude) {
          startAutoUpdate(data.latitude, data.longitude);
        }
      } else {
        setError("Cidade não encontrada ou erro ao buscar o clima.");
      }
    } catch {
      setError("Erro ao buscar o clima.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca o clima pela localização atual do usuário
   */
  const fetchWeatherByCoords = async () => {
    try {
      setLoading(true);
      setError(null);
      setSearchedCity(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permissão de localização negada.");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });

      const { latitude, longitude } = location.coords;
      const data = await getWeatherByCoords(latitude, longitude);

      if (data) {
        setWeather(data);
        startAutoUpdate(latitude, longitude);
      } else {
        setError("Não foi possível obter o clima.");
      }
    } catch (err) {
      console.log("Erro ao buscar clima por coordenadas:", err.message);
      setError("Erro ao buscar o clima.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca clima por coordenadas específicas e adiciona info da cidade
   */
  const fetchWeatherByCoordsWithCity = async (
    lat,
    lon,
    cityName,
    admin1,
    country
  ) => {
    if (!lat || !lon) return;

    try {
      setLoading(true);
      setError(null);

      const data = await getWeatherByCoords(lat, lon);

      if (data) {
        setWeather({
          ...data,
          cityName: cityName || "Cidade desconhecida",
          region: admin1 || null,
          country: country || null,
          latitude: lat,
          longitude: lon,
        });
        setSearchedCity(cityName);
        startAutoUpdate(lat, lon);
      } else {
        setError("Não foi possível obter o clima.");
      }
    } catch (err) {
      console.log("Erro ao buscar clima por coordenadas:", err.message);
      setError("Erro ao buscar o clima.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpa a cidade pesquisada e tenta buscar pelo GPS
   */
  const clearSearch = () => {
    setSearchedCity(null);
    fetchWeatherByCoords();
  };

  /**
   * Atualiza clima ao voltar para o foreground
   */
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          if (currentCoords && weather) {
            updateWeather(currentCoords.lat, currentCoords.lon);
          }
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription?.remove();
      clearAutoUpdate();
    };
  }, [currentCoords, weather]);

  /**
   * Limpeza final ao desmontar o hook
   */
  useEffect(() => {
    return () => clearAutoUpdate();
  }, []);

  /**
   * Retorno do hook para Home:
   * - estados: weather, loading, error, searchedCity
   * - ações: fetchWeatherByCoords, fetchWeatherByCity, fetchWeatherByCoordsWithCity, clearSearch
   */
  return {
    weather,
    loading,
    error,
    searchedCity,
    fetchWeatherByCoords,
    fetchWeatherByCity,
    fetchWeatherByCoordsWithCity,
    clearSearch,
  };
}
