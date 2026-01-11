// ========================= IMPORTS =========================
// React Native core
import {
  View,
  StatusBar,
  StyleSheet,
  Animated,
  Linking,  
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants"; // para statusBarHeight
import { useState, useEffect, useRef } from "react";
import * as Haptics from "expo-haptics"; // vibração tátil

// ========================= HOOKS =========================
import { useLocation, LOCATION_STATUS } from "../hooks/useLocation"; // hook de permissão de localização
import { useWeather } from "../hooks/useWeather"; // hook customizado para buscar o clima

// ========================= UTILS / STORAGE =========================
import { fetchCitySuggestions } from "../utils/cityApi"; // sugestões de cidades
import { getWeatherDescription } from "../utils/getWeatherDescription"; // descrição do clima
import { getWeatherEmoji, isNightWithOffset } from "../utils/getWeatherEmoji"; // emoji do clima + checa se é noite
import {
  saveLastCity,
  getLastCity,
  saveRecentCities,
  getRecentCities,
  getSettings,
  saveSettings,
} from "../storage/weatherStorage"; // armazenamento local (última cidade, recentes, configs)

// ========================= COMPONENTES =========================
import { HeaderLocation } from "../components/HeaderLocation";
import { SearchBox } from "../components/SearchBox";
import { SearchOverlay } from "../components/SearchOverlay";
import { MainWeatherCard } from "../components/MainWeatherCard";
import { WeatherGrid } from "../components/WeatherGrid";
import { DailyForecast } from "../components/DailyForecast";
import { WeatherLoading } from "../components/WeatherLoading";
import { WeatherError } from "../components/WeatherError";

// ========================= CONSTANTES =========================
const STATUS_BAR_HEIGHT = Constants.statusBarHeight; // altura da status bar do dispositivo

// ========================= COMPONENTE PRINCIPAL =========================
export default function Home() {
  // --------------------- ESTADO ---------------------
  const { status, locationLabel } = useLocation(); // status da localização e nome do local
  const [city, setCity] = useState(""); // cidade digitada no input
  const [citySuggestions, setCitySuggestions] = useState([]); // lista de sugestões da API
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false); // loading do input
  const [showEmptyState, setShowEmptyState] = useState(false); // mostrar "nenhuma cidade encontrada"
  const [isInputFocused, setIsInputFocused] = useState(false); // input focado
  const [recentCities, setRecentCities] = useState([]); // histórico de cidades recentes
  const [activeDayIndex, setActiveDayIndex] = useState(0); // dia ativo na previsão
  const [unit, setUnit] = useState("celsius"); // unidade de temperatura (°C ou °F)

  // --------------------- REFERÊNCIAS ---------------------
  const inputRef = useRef(null); // referência do TextInput
  const debounceTimer = useRef(null); // debounce para input
  const blurTimeout = useRef(null); // delay ao desfocar input
  const overlayOpacity = useRef(new Animated.Value(0)).current; // animação do overlay
  const suggestionsScale = useRef(new Animated.Value(0.9)).current; // animação de scale do overlay

  // --------------------- HOOK DE CLIMA ---------------------
  const {
    weather,
    loading,
    error,
    searchedCity,
    fetchWeatherByCoords,
    fetchWeatherByCity,
    fetchWeatherByCoordsWithCity,
    clearSearch,
  } = useWeather(); // funções e dados do hook de clima

  // --------------------- VARIÁVEIS DERIVADAS ---------------------
  const weatherEmoji = getWeatherEmoji(weather?.weathercode, weather?.timezone_offset); // emoji do clima atual
  const weatherDescription = weather
    ? getWeatherDescription(weather.weathercode, weather?.timezone_offset)
    : ""; // descrição do clima
  const todayDaily = weather?.daily?.find(
    (d) => new Date(d.date).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
  ); // previsão do "hoje" (sem considerar fuso ainda)

  const hasSuggestions = citySuggestions.length > 0 || isLoadingSuggestions || showEmptyState; // verifica se deve mostrar overlay
  const isSearchActive = isInputFocused || hasSuggestions; // overlay ativo
  const showRecentCities = isInputFocused && city.length === 0 && recentCities.length > 0; // mostra recentes se input vazio e focado

  // --------------------- USEEFFECTS -------------------------
  // 1️⃣ Carrega configurações, últimas cidades e clima inicial
  useEffect(() => {
    async function loadAppData() {
      const settings = await getSettings();
      if (settings?.unit) setUnit(settings.unit); // aplica unidade salva

      const storedRecent = await getRecentCities();
      if (storedRecent.length) setRecentCities(storedRecent); // carrega cidades recentes

      const lastCity = await getLastCity();
      if (lastCity) {
        fetchWeatherByCity(lastCity.name, settings?.unit || "celsius"); // busca clima da última cidade
      } else if (status === LOCATION_STATUS.GRANTED) {
        fetchWeatherByCoords(settings?.unit || "celsius"); // busca clima da localização atual
      }
    }

    loadAppData();
  }, [status]);

  // 2️⃣ Atualiza clima automático quando permissão de localização concedida
  useEffect(() => {
    if (status === LOCATION_STATUS.GRANTED && !searchedCity) {
      fetchWeatherByCoords(unit);
    }
  }, [status, unit]);

  // 3️⃣ Animação do overlay (abrir/fechar)
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

  // 4️⃣ Limpeza de timers (debounce e blur)
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (blurTimeout.current) clearTimeout(blurTimeout.current);
    };
  }, []);

  // --------------------- FUNÇÕES ---------------------------
  // Adiciona cidade ao histórico recente e salva no storage
  const addRecentCity = (cityObj) => {
    setRecentCities((prev) => {
      const filtered = prev.filter((c) => c.name !== cityObj.name); // remove duplicadas
      const updated = [cityObj, ...filtered].slice(0, 5); // mantém máximo 5
      saveRecentCities(updated); // salva localmente
      return updated;
    });
  };

  // Fecha UI de busca
  const closeSearchUI = () => {
    setCitySuggestions([]);
    setIsLoadingSuggestions(false);
    setShowEmptyState(false);
    setIsInputFocused(false);
    inputRef.current?.blur();
  };

  // Busca sugestões ao digitar na caixa de pesquisa
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

    // Debounce: espera 300ms após digitar antes de chamar API
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

  // Seleção de uma cidade da lista de sugestões
  const handleSelectSuggestion = (suggestion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // feedback tátil

    if (suggestion.name === searchedCity) {
      setCity(suggestion.name);
      closeSearchUI();
      return;
    }

    addRecentCity(suggestion); // adiciona aos recentes
    saveLastCity(suggestion); // salva a última cidade

    setCity(suggestion.name);

    const { latitude, longitude, name: cityName, admin1, country } = suggestion;
    closeSearchUI();

    if (latitude && longitude) {
      fetchWeatherByCoordsWithCity(latitude, longitude, cityName, admin1, country);
    } else {
      fetchWeatherByCity(cityName);
    }
  };

  // Executa busca manual ao pressionar botão
// Executa busca manual ao pressionar botão
const handleSearch = () => {
  if (!city.trim()) return; // não faz nada se input vazio

  // Pega a primeira sugestão se houver
  const firstSuggestion = citySuggestions[0];

  const cityObj = firstSuggestion
    ? firstSuggestion // usa todos os dados da sugestão
    : { name: city, admin1: "", country: "" }; // fallback se não houver sugestão

  // Adiciona aos recentes e salva última cidade
  addRecentCity(cityObj);
  saveLastCity(cityObj);

  // Fecha overlay e limpa UI
  closeSearchUI();

  // Faz a requisição de clima
  if (cityObj.latitude && cityObj.longitude) {
    fetchWeatherByCoordsWithCity(
      cityObj.latitude,
      cityObj.longitude,
      cityObj.name,
      cityObj.admin1,
      cityObj.country
    );
  } else {
    fetchWeatherByCity(cityObj.name);
  }
};


  // Troca unidade de temperatura
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

  // Seleção de dia na previsão
  const handleSelectDay = (_, index) => {
    Haptics.selectionAsync();
    setActiveDayIndex(index);
  };

  const isNight = isNightWithOffset(weather?.timezone_offset); // verifica se é noite no fuso da cidade

  // --------------------- RENDER ---------------------------
  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView >
  );
}

// ========================= STYLES =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    flex: 1, // ocupa espaço restante
  },
});
