import { useState, useEffect, useRef } from "react";
import { AppState } from "react-native";
import * as Location from "expo-location";
import { getWeatherByCoords, getWeatherByCity } from "../../services/weatherAPI";

export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedCity, setSearchedCity] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);
  const updateIntervalRef = useRef(null);
  const appState = useRef(AppState.currentState);

  const updateWeather = async (lat, lon) => {
    if (!lat || !lon || !weather) return;
    try {
      const data = await getWeatherByCoords(lat, lon);
      if (data) {
        setWeather((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.log("Erro ao atualizar clima:", err.message);
    }
  };

  const clearAutoUpdate = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  };

  const startAutoUpdate = (lat, lon) => {
    clearAutoUpdate();
    setCurrentCoords({ lat, lon });
    updateIntervalRef.current = setInterval(() => updateWeather(lat, lon), 60 * 60 * 1000);
  };

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
    } catch (err) {
      setError("Erro ao buscar o clima.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoordsWithCity = async (lat, lon, cityName, admin1, country) => {
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

  const clearSearch = () => {
    setSearchedCity(null);
    fetchWeatherByCoords();
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        if (currentCoords && weather) {
          updateWeather(currentCoords.lat, currentCoords.lon);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
      clearAutoUpdate();
    };
  }, [currentCoords, weather]);

  useEffect(() => {
    return () => clearAutoUpdate();
  }, []);

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
