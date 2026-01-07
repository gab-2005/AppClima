// ========================= IMPORTS =========================
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  ActivityIndicator,
  StatusBar,
  Linking
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


//========================== COMPONENTS ========================

import { HeaderLocation } from "../components/HeaderLocation";
import { SearchBox } from "../components/SearchBox";
import { SearchOverlay } from "../components/SearchOverlay";
import { MainWeatherCard } from "../components/MainWeatherCard";
import { WeatherGrid } from "../components/WeatherGrid";
import { DailyForecast } from "../components/DailyForecast";
import { WeatherLoading } from "../components/WeatherLoading";
import { WeatherError } from "../components/WeatherError";





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
    closeSearchUI();
    fetchWeatherByCity(city);
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
      return [city, ...filtered].slice(0, 5);
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
              />

              {/* GRID 2x3 */}
              <WeatherGrid weather={weather} />
            </>
          )}
        </View>

        {/* PREVISÃO DIÁRIA */}
        {!loading && !error && weather?.daily?.length > 0 && (
          <DailyForecast
            weather={weather}
            activeDayIndex={activeDayIndex}
            onSelectDay={handleSelectDay}
          />
        )}
      </>
    </View>
  );
}

// ========================= STYLES =========================
const styles = StyleSheet.create({

  /* |||||||||||||||||||||||||||||||||||||||||||| */
  /* ||||||||||||||||| CONTAINER |||||||||||||||| */

  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight + 0,
  },

  /* |||||||||||||||||||||||||||||||||||||||||||| */
  /* |||||||||||||||||| HEADER |||||||||||||||||| */

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    padding: 10,
  },

  locationRow: {
    flexDirection: "row",
    gap: 10,    
  },

  locationText: {
    fontWeight: "bold",
    fontSize: 16,
  },

  locationSubtext: {
    fontSize: 12,
    color: "#777",
    marginStart: 30,
  },

   /* |||||||||||||||||||||||||||||||||||||||||||| */
   /* |||||||||||||||||| SEARCH |||||||||||||||||| */

  searchBox: {
    flexDirection: "row",
    justifyContent:"center",
    alignItems:"center",
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    zIndex: 1005,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },

  input: {
    flex: 1,
  },

   /* |||||||||||||||||||||||||||||||||||||||||||| */
   /* ||||||||||||||||||| OVERLAY |||||||||||||||| */


  overlayWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  loadingOverlay:{
     ...StyleSheet.absoluteFillObject, // ocupa a tela toda
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    zIndex: 2000,
  },
   loadingOverlayText:{
    color: "#666",
   },

  overlayContent: {
    zIndex: 1001,
    marginTop: statusBarHeight + 140,
  },

  suggestionsContainer: {
    overflow: "hidden",
    marginHorizontal: 20,
    borderRadius: 20,
    maxHeight: 450, // Limite de altura
    backgroundColor: "#fff",
  },

  suggestionsList: {
    maxHeight: 450, // Limite de altura do scroll
  },

  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 15,
    gap: 10,
    borderBottomColor: "#f0f0f0",
  },
    suggestionTextContainer: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  suggestionRegion: {
    fontSize: 12,
    color: "#666",
  },

  /* |||||||||||||||||||||||||||||||||||||||||||| */
  /* |||||||||||||| OVERLAY-LOADING ||||||||||||| */


  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  loadingText: {
    fontSize: 15,
    color: "#666",
  },

  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

  },

  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
    marginTop: 8,

  },
  
  emptySubtext: {
    fontSize: 12.5,
    color: "#999",
  },

  /* |||||||||||||||||||||||||||||||||||||||||||| */
  /* ||||||||||||||||| CARD-ERRO |||||||||||||||| */

  errorWrapper: {
  flex: 1,
  justifyContent: "center",
  marginHorizontal: 20,
},

errorCard: {
  borderRadius: 20,
  padding: 30,
  backgroundColor: "#fff",
  elevation: 2,
  alignItems: "center",
  gap: 12,
},

errorTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: "#222",
  textAlign: "center",
},

errorText: {
  fontSize: 14,
  fontWeight: "500",
  color: "#555",
  textAlign: "center",
  lineHeight: 20,
},

retryButton: {
  marginTop: 6,
  backgroundColor: "#222",
  paddingHorizontal: 18,
  paddingVertical: 10,
  borderRadius: 10,
  elevation: 2,
},

retryText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#fff",
  textAlign: "center",
},

  /* |||||||||||||||||||||||||||||||||||||||||||| */
  /* ||||||||||||||||||| MAIN ||||||||||||||||||| */

  main: {
    flex: 1,
  },

  /* |||||||||||||||||||||||||||||||||||||||||||| */
  /* ||||||||||||||||| MAIN-CARD |||||||||||||||| */


  mainCard: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 20,
    borderRadius: 20,
    minHeight: 180,
  },

  mainCardEmoji: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  mainCardInfo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },

  weekday: {
    fontSize: 25,
    color: "#fff",
  },

  dayMonth: {
    fontSize: 15,
    color: "#fff",
  },

  tempText: {
    fontSize: 40,
    color: "#fff",
  },

  weatherDescription: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },

  DescriptionEmoiji: {
    fontSize: 18,
    color: "#fff",
  },

  DescriptionText: {
    textAlign: "center",
    fontSize: 10,
    color: "#fff",
  },

  /* |||||||||||||||||||||||||||||||||||||||||||| */
  /* |||||||||||||||| CARDS-GRID |||||||||||||||| */

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 20,
    paddingVertical: 20,
    rowGap: 20, // ← GAP APENAS ENTRE AS LINHAS
  },

  card: {
    width: "33.333%", // força 3 colunas
  },

  cardInner: {
    width: 80,
    backgroundColor: "#fff",
    alignItems: "center",
    margintop: 10,
    paddingVertical: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 30,
    elevation: 2,


  },
  // simula alinhamento por coluna VISUAL
  cardInneStart: {
    alignSelf: "flex-start", // 1ª coluna fica na esquerda
  },

  cardInneCenter: {
    alignSelf: "center", // 2ª coluna fica no meio
  },

  cardInneEnd: {
    alignSelf: "flex-end", // 3ª coluna fica na direita
  },

  cardLabel: {
      fontSize: 12,
      color: "#777",
  },

  cardValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },

  cardLabelWhite: {
    fontSize: 12,
    color: "#fff",
  },

  cardValueWhite: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },

  /* |||||||||||||||||||||||||||||||||||||||||||| */
  /* ||||||||||||||| NEXT FEW DAYS |||||||||||||| */

  dailySection: {
    margin: 20,
    borderRadius: 20,
    backgroundColor:"#fff",
    elevation: 2,
  },

  dailyTitle: {
    flexDirection: "row",
    color: "#333",
    paddingHorizontal: 10,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    
  

  },
  dailyText:{
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",

    
  },

  dailyCard: {
    justifyContent:"center",
    alignItems:"center",
    paddingBottom: 20,
    paddingInline: 18,
    

  },

  dailyDay: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },

  dailyTempMax: {
    fontSize: 12,
    fontWeight: "800",
    color: "#333",
  },

  dailyTempMin: {
    fontSize: 12,
    fontWeight: "800",
    color: "#999",

  },

    

    
  
});

 /* |||||||||||||||||||||||||||||||||||||||||||| */

