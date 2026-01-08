// ========================= IMPORTS =========================
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  StatusBar,
  Linking,
} from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocation, LOCATION_STATUS } from "../hooks/useLocation";
import { useWeather } from "../hooks/useWeather";
import { getWeatherDescription } from "../utils/getWeatherDescription";
import { fetchCitySuggestions } from "../utils/cityApi";
import {
  getWeatherEmoji,
  isNightWithOffset,
  getDayNightEmoji,
} from "../utils/getWeatherEmoji";
import {
  saveLastCity,
  getLastCity,
  saveRecentCities,
  getRecentCities,
  getSettings,
  saveSettings,
} from "../storage/weatherStorage";




//========================== COMPONENTS ========================

import { HeaderLocation } from "../components/HeaderLocation";
import { SearchBox } from "../components/SearchBox";
import { SearchOverlay } from "../components/SearchOverlay";
import { MainWeatherCard } from "../components/MainWeatherCard";
import { WeatherGrid } from "../components/WeatherGrid";
import { DailyForecast } from "../components/DailyForecast";
import { WeatherLoading } from "../components/WeatherLoading";
import { WeatherError } from "../components/WeatherError";
import { SettingsModal } from "../components/SettingsModal";






// ========================= CONSTANTS =========================
const statusBarHeight = Constants.statusBarHeight;

// ========================= COMPONENT =========================
export default function Home() {
  // ========================= HOOKS DE ESTADO =========================
  const { status, locationLabel, requestPermission} = useLocation();
  const [city, setCity] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [recentCities, setRecentCities] = useState([]);
  const [searchBoxLayout, setSearchBoxLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [unit, setUnit] = useState("celsius");


  // ========================= REFERÊNCIAS =========================
  const debounceTimer = useRef(null);
  const blurTimeout = useRef(null);
  const inputRef = useRef(null);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const suggestionsScale = useRef(new Animated.Value(0.9)).current;

  // ========================= HOOK DE CLIMA =========================
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

  // ========================= VARIÁVEIS DERIVADAS =========================
  const weatherEmoji = getWeatherEmoji(
    weather?.weathercode,
    weather?.timezone_offset
  );
  const weatherDescription = weather
    ? getWeatherDescription(weather.weathercode, weather?.timezone_offset)
    : "";
  const todayDaily = weather?.daily?.find(
    (d) =>
      new Date(d.date).setHours(0, 0, 0, 0) ===
      new Date().setHours(0, 0, 0, 0)
  );

  const hasSuggestions =
    citySuggestions.length > 0 ||
    isLoadingSuggestions ||
    showEmptyState;
  const isSearchActive = isInputFocused || hasSuggestions;
  const displayCity = searchedCity || locationLabel;
  const isUsingLocation = !searchedCity;

  const hasLocationPermission = status === LOCATION_STATUS.GRANTED;


  const locationContextText = isUsingLocation
    ? "📍 Próximo a você"
    : `🔎 ${weather?.region}, ${weather?.country}`;

  // ========================= USEEFFECTS =========================
  useEffect(() => {
    if (status === LOCATION_STATUS.GRANTED) {
      fetchWeatherByCoords();
    }
  }, [status]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (blurTimeout.current) clearTimeout(blurTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (isSearchActive) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(suggestionsScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(suggestionsScale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSearchActive]);

  useEffect(() => {
  async function loadAppData() {
    // 1️⃣ Carrega a unidade salva
    const settings = await getSettings();
    if (settings?.unit) setUnit(settings.unit);

    // 2️⃣ Carrega cidades recentes e última cidade
    const storedRecentCities = await getRecentCities();
    if (storedRecentCities.length > 0) setRecentCities(storedRecentCities);

    const lastCity = await getLastCity();
    if (lastCity) {
      // 3️⃣ Busca clima da última cidade usando a unidade já carregada
      fetchWeatherByCity(lastCity.name, settings?.unit || "celsius"); // ✅ passar unit
    } else if (status === LOCATION_STATUS.GRANTED) {
      // 4️⃣ Ou clima da localização atual
      fetchWeatherByCoords(settings?.unit || "celsius"); // ✅ passar unit
    }
  }

  loadAppData();
}, [status]);



 





  // ========================= FUNÇÕES =========================
  const closeSearchUI = () => {
    setCitySuggestions([]);
    setIsLoadingSuggestions(false);
    setShowEmptyState(false);
    setIsInputFocused(false);
    if (inputRef.current) inputRef.current.blur();
  };

  const handleSearch = () => {
  if (!city.trim()) return;

  const cityObject = { name: city };

  addRecentCity(cityObject);
  saveLastCity(cityObject);

  closeSearchUI();
  fetchWeatherByCity(city);
};


const handleChangeUnit = (value) => {
  setUnit(value);
  saveSettings({ unit: value });
};




  const handleClearSearch = () => {
    setCity("");
    setCitySuggestions([]);
    setIsLoadingSuggestions(false);
    setShowEmptyState(false);
    clearSearch();
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
        if (suggestions && suggestions.length > 0) {
          setCitySuggestions(suggestions);
          setShowEmptyState(false);
        } else {
          setCitySuggestions([]);
          setShowEmptyState(true);
        }
      } catch (error) {
        setCitySuggestions([]);
        setShowEmptyState(true);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);
  };
  const handleSelectSuggestion = (suggestion) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  addRecentCity(suggestion);
  saveLastCity(suggestion); // ✅ FALTAVA ISSO

  setCity(suggestion.name);

  const cityName = suggestion.name;
  const { latitude, longitude, admin1, country } = suggestion;
  closeSearchUI();

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




  const handleCloseOverlay = () => {
    setCitySuggestions([]);
    setIsLoadingSuggestions(false);
    setShowEmptyState(false);
    setIsInputFocused(false);
    if (inputRef.current) inputRef.current.blur();
  };

  function addRecentCity(city) {
  setRecentCities((prev) => {
    const filtered = prev.filter((item) => item.name !== city.name);
    const updated = [city, ...filtered].slice(0, 5);

    saveRecentCities(updated); // ✅ SALVA AQUI

    return updated;
  });
}


  

  const showRecentCities =
    isInputFocused &&
    city.length === 0 &&
    recentCities.length > 0;

  const handleSelectDay = (day, index) => {
    Haptics.selectionAsync();
    setActiveDayIndex(index);
  };

 


  const isNight = isNightWithOffset(weather?.timezone_offset);

  // ========================= RENDER =========================
  return (
    <View style={styles.container}>
      <>
        {/* STATUS BAR */}
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
       
        <View>
        
        {/* HEADER */}
          <HeaderLocation
            status={status}
            searchedCity={searchedCity}
            locationLabel={locationLabel}
            weather={weather}
            onRefreshLocation={
              status === LOCATION_STATUS.GRANTED
                ? fetchWeatherByCoords
                : () => Linking.openSettings()
            }
            onClearSearch={handleClearSearch}
            onOpenSettings={() => setSettingsVisible(true)} // ✅ importante
          />

 

          {/* INPUT DE PESQUISA */}
          <SearchBox
            city={city}
            inputRef={inputRef}
            onChangeCity={handleCityChange}
            onSearch={handleSearch}
            onFocus={() => {
              if (blurTimeout.current) {
                clearTimeout(blurTimeout.current);
                blurTimeout.current = null;
              }
              setTimeout(() => setIsInputFocused(true), 50);
            }}
            onBlur={() => {
              blurTimeout.current = setTimeout(() => {
                if (
                  citySuggestions.length === 0 &&
                  !isLoadingSuggestions &&
                  !showEmptyState
                ) {
                  setIsInputFocused(false);
                }
                blurTimeout.current = null;
              }, 200);
            }}
          />
        </View>

        {/* OVERLAY DE BUSCA */}
        
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
                  searchedCity
                    ? fetchWeatherByCity(searchedCity)
                    : fetchWeatherByCoords()
                }
              />
            )}
          {!loading && !error && weather && (
            <>
              {/* MAIN CARD */}

              <MainWeatherCard
                weather={weather}
                isNight={isNight}
                unit={unit}
              />

              {/* GRID 2x3 */}
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
        <SettingsModal
            visible={settingsVisible}
            onClose={() => setSettingsVisible(false)}
            unit={unit}
            onChangeUnit={(newUnit) => {
              setUnit(newUnit); // Atualiza o estado do app
              saveSettings({ unit: newUnit }); // Salva a unidade
              if (searchedCity) {
                fetchWeatherByCity(searchedCity, newUnit); // ✅ recarrega clima da cidade
              } else if (status === LOCATION_STATUS.GRANTED) {
                fetchWeatherByCoords(newUnit); // ✅ recarrega clima da localização
              }
            }}
          />


         
      </>
    </View>


  );
}


// ========================= STYLES =========================
const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight + 0,
  },

  main: {
    flex: 1,
  },
});


