// ========================= IMPORTS =========================
import {
  View,
  StatusBar,
  StyleSheet,
  Animated,
  Linking,
} from "react-native";
import Constants from "expo-constants";
import { useState, useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";

// Hooks
import { useLocation, LOCATION_STATUS } from "../hooks/useLocation";
import { useWeather } from "../hooks/useWeather";

// Utils / Storage
import { fetchCitySuggestions } from "../utils/cityApi";
import { getWeatherDescription } from "../utils/getWeatherDescription";
import {
  getWeatherEmoji,
  isNightWithOffset,
} from "../utils/getWeatherEmoji";
import {
  saveLastCity,
  getLastCity,
  saveRecentCities,
  getRecentCities,
  getSettings,
  saveSettings,
} from "../storage/weatherStorage";

// Components
import { HeaderLocation } from "../components/HeaderLocation";
import { SearchBox } from "../components/SearchBox";
import { SearchOverlay } from "../components/SearchOverlay";
import { MainWeatherCard } from "../components/MainWeatherCard";
import { WeatherGrid } from "../components/WeatherGrid";
import { DailyForecast } from "../components/DailyForecast";
import { WeatherLoading } from "../components/WeatherLoading";
import { WeatherError } from "../components/WeatherError";

// ========================= CONSTANTS =========================
const STATUS_BAR_HEIGHT = Constants.statusBarHeight;

// ========================= COMPONENT =========================
export default function Home() {
  // --------------------- HOOKS DE ESTADO ---------------------
  const { status, locationLabel } = useLocation();
  const [city, setCity] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [recentCities, setRecentCities] = useState([]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [unit, setUnit] = useState("celsius");

  // --------------------- REFERÊNCIAS ------------------------
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);
  const blurTimeout = useRef(null);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const suggestionsScale = useRef(new Animated.Value(0.9)).current;

  // --------------------- HOOK DE CLIMA ----------------------
  const {
    weather,
    loading,
    error,
    searchedCity,
    fetchWeatherByCoords,
    fetchWeatherByCity,
    fetchWeatherByCoordsWithCity,
    clearSearch,
  } = useWeather();

  // --------------------- VARIÁVEIS DERIVADAS ----------------
  const weatherEmoji = getWeatherEmoji(weather?.weathercode, weather?.timezone_offset);
  const weatherDescription = weather
    ? getWeatherDescription(weather.weathercode, weather?.timezone_offset)
    : "";
  const todayDaily = weather?.daily?.find(
    (d) => new Date(d.date).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
  );

  const hasSuggestions = citySuggestions.length > 0 || isLoadingSuggestions || showEmptyState;
  const isSearchActive = isInputFocused || hasSuggestions;
  const showRecentCities = isInputFocused && city.length === 0 && recentCities.length > 0;

  // --------------------- USEEFFECTS -------------------------
  // Carrega configurações, últimas cidades e clima inicial
  useEffect(() => {
    async function loadAppData() {
      const settings = await getSettings();
      if (settings?.unit) setUnit(settings.unit);

      const storedRecent = await getRecentCities();
      if (storedRecent.length) setRecentCities(storedRecent);

      const lastCity = await getLastCity();
      if (lastCity) {
        fetchWeatherByCity(lastCity.name, settings?.unit || "celsius");
      } else if (status === LOCATION_STATUS.GRANTED) {
        fetchWeatherByCoords(settings?.unit || "celsius");
      }
    }

    loadAppData();
  }, [status]);

  // Busca clima automático quando permissão de localização concedida
  useEffect(() => {
    if (status === LOCATION_STATUS.GRANTED && !searchedCity) {
      fetchWeatherByCoords(unit);
    }
  }, [status, unit]);

  // Animação do overlay
  useEffect(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: isSearchActive ? 1 : 0,
        duration: isSearchActive ? 300 : 200,
        useNativeDriver: true,
      }),
      Animated.spring(suggestionsScale, {
        toValue: isSearchActive ? 1 : 0.9,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isSearchActive]);

  // Limpeza de timers
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (blurTimeout.current) clearTimeout(blurTimeout.current);
    };
  }, []);

  // --------------------- FUNÇÕES ---------------------------
  const addRecentCity = (cityObj) => {
    setRecentCities((prev) => {
      const filtered = prev.filter((c) => c.name !== cityObj.name);
      const updated = [cityObj, ...filtered].slice(0, 5);
      saveRecentCities(updated);
      return updated;
    });
  };

  const closeSearchUI = () => {
    setCitySuggestions([]);
    setIsLoadingSuggestions(false);
    setShowEmptyState(false);
    setIsInputFocused(false);
    inputRef.current?.blur();
  };

  const handleCityChange = (text) => {
    setCity(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!text.trim()) {
      setCitySuggestions([]);
      setIsLoadingSuggestions(false);
      setShowEmptyState(false);
      return;
    }

    setIsLoadingSuggestions(true);
    setShowEmptyState(false);

    debounceTimer.current = setTimeout(async () => {
      try {
        const suggestions = await fetchCitySuggestions(text);
        if (suggestions?.length > 0) {
          setCitySuggestions(suggestions);
          setShowEmptyState(false);
        } else {
          setCitySuggestions([]);
          setShowEmptyState(true);
        }
      } catch {
        setCitySuggestions([]);
        setShowEmptyState(true);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);
  };
  const handleSelectSuggestion = (suggestion) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  // Se a cidade clicada já está sendo exibida, só fecha overlay
  if (suggestion.name === searchedCity) {
    setCity(suggestion.name);
    closeSearchUI();
    return;
  }

  addRecentCity(suggestion);
  saveLastCity(suggestion); // salva a última cidade

  setCity(suggestion.name);

  const cityName = suggestion.name;
  const { latitude, longitude, admin1, country } = suggestion;
  closeSearchUI();

  // Dispara fetch só se for uma cidade nova
  if (latitude && longitude) {
    fetchWeatherByCoordsWithCity(
      latitude,
      longitude,
      cityName,
      admin1,
      country
    );
  } else {
    fetchWeatherByCity(cityName);
  }
};
  const handleSearch = () => {
    if (!city.trim()) return;
    const cityObj = { name: city };
    addRecentCity(cityObj);
    saveLastCity(cityObj);
    closeSearchUI();
    fetchWeatherByCity(city);
  };

  const handleChangeUnit = (value) => {
    setUnit(value);
    saveSettings({ unit: value });
  };

  const handleClearSearch = () => {
    setCity("");
    closeSearchUI();
    clearSearch();
  };

  const handleCloseOverlay = () => {
    closeSearchUI();
  };

  const handleSelectDay = (_, index) => {
    Haptics.selectionAsync();
    setActiveDayIndex(index);
  };

  const isNight = isNightWithOffset(weather?.timezone_offset);

  // --------------------- RENDER ---------------------------
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* HEADER */}
      <HeaderLocation
        status={status}
        searchedCity={searchedCity}
        locationLabel={locationLabel}
        weather={weather}
        unit={unit}
        onChangeUnit={handleChangeUnit}
        onRefreshLocation={
          status === LOCATION_STATUS.GRANTED
            ? () => fetchWeatherByCoords(unit)
            : () => Linking.openSettings()
        }
        onClearSearch={handleClearSearch}
      />

      {/* INPUT DE BUSCA */}
      <SearchBox
        city={city}
        inputRef={inputRef}
        onChangeCity={handleCityChange}
        onSearch={handleSearch}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => {
            if (!citySuggestions.length && !isLoadingSuggestions && !showEmptyState) {
              setIsInputFocused(false);
            }
          }, 200);
        }}
      />

      {/* OVERLAY DE SUGESTÕES */}
      <SearchOverlay
        isVisible={isSearchActive}
        overlayOpacity={overlayOpacity}
        suggestionsScale={suggestionsScale}
        citySuggestions={citySuggestions}
        recentCities={recentCities}
        isLoading={isLoadingSuggestions}
        showEmptyState={showEmptyState}
        showRecentCities={showRecentCities}
        onSelectSuggestion={handleSelectSuggestion}
        onClose={handleCloseOverlay}
      />

      {/* CLIMA PRINCIPAL */}
      <View style={styles.main}>
        {loading && <WeatherLoading />}
        {!loading && error && (
          <WeatherError
            message={error}
            onRetry={() =>
              searchedCity ? fetchWeatherByCity(searchedCity) : fetchWeatherByCoords()
            }
          />
        )}
        {!loading && !error && weather && (
          <>
            <MainWeatherCard weather={weather} isNight={isNight} unit={unit} />
            <WeatherGrid weather={weather} unit={unit} />
          </>
        )}
      </View>

      {/* PREVISÃO DIÁRIA */}
      {!loading && !error && weather?.daily?.length > 0 && (
        <DailyForecast
          weather={weather}
          activeDayIndex={activeDayIndex}
          onSelectDay={handleSelectDay}
          unit={unit}
        />
      )}
    </View>
  );
}

// ========================= STYLES =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: STATUS_BAR_HEIGHT,
  },
  main: {
    flex: 1,
  },
});
