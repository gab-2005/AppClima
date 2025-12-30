// ========================= IMPORTS =========================
import { 
  View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Pressable, Animated, ActivityIndicator, StatusBar
} from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from 'expo-linear-gradient';

import { useLocation, LOCATION_STATUS } from "../hooks/useLocation";
import { useWeather } from "../hooks/useWeather";
import { getWeatherDescription } from "../utils/getWeatherDescription";
import { fetchCitySuggestions } from "../utils/cityApi";
import { getWeatherEmoji, isNightWithOffset } from "../utils/getWeatherEmoji";

// ========================= CONSTANTS =========================
const statusBarHeight = Constants.statusBarHeight;

// ========================= COMPONENT =========================
export default function Home() {
  // ========================= HOOKS DE ESTADO =========================
  const { status, locationLabel } = useLocation();
  const [city, setCity] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [recentCities, setRecentCities] = useState([]);
  const [searchBoxLayout, setSearchBoxLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

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
  const weatherEmoji = getWeatherEmoji(weather?.weathercode, weather?.timezone_offset);
  const weatherDescription = weather
    ? getWeatherDescription(weather.weathercode, weather?.timezone_offset)
    : "";
  const todayDaily = weather?.daily?.find(
    d => new Date(d.date).setHours(0,0,0,0) === new Date().setHours(0,0,0,0)
  );

  const hasSuggestions = citySuggestions.length > 0 || isLoadingSuggestions || showEmptyState;
  const isSearchActive = isInputFocused || hasSuggestions;
  const displayCity = searchedCity || locationLabel;
  const isUsingLocation = !searchedCity;

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
        Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(suggestionsScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(suggestionsScale, { toValue: 0.9, duration: 200, useNativeDriver: true }),
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
      fetchWeatherByCoordsWithCity(latitude, longitude, cityName, admin1, country);
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
    setRecentCities(prev => {
      const filtered = prev.filter(item => item.name !== city.name);
      return [city, ...filtered].slice(0, 5);
    });
  }

  const showRecentCities = isInputFocused && city.length === 0 && recentCities.length > 0;

  const handleSelectDay = (day, index) => {
    Haptics.selectionAsync();
    setActiveDayIndex(index);
  };

  // ========================= RENDER =========================
  return (
    <View style={styles.container}>
      <>
        {/* STATUS BAR */}
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

        {/* HEADER */}
        <View>
          <View style={styles.header}>
            <View style={styles.locationBlock}>
              <View style={styles.locationRow}>
                <Ionicons
                  name={isUsingLocation ? "location" : "search"}
                  size={25}
                  color="#333"
                />
                  <Text style={styles.locationText}>{displayCity}</Text>
                {searchedCity && (
                  <TouchableOpacity onPress={handleClearSearch}>
                    <Ionicons 
                    name="close-circle" 
                    size={25} 
                    color="#666666ff" />
                  </TouchableOpacity>
              
                )}
              </View>

              {!isUsingLocation && weather?.region && weather?.country && (
                <Text style={styles.locationSubtext}>
                  {weather.region}, {weather.country}
                </Text>
              )}
              {isUsingLocation && (
                <Text style={styles.locationSubtext}>Próximo a você</Text>
              )}
            </View>
            <Ionicons name="settings-outline" size={25} color="#333" />
          </View>

          {/* INPUT DE PESQUISA */}
          <View 
            style={styles.searchBox}
            onLayout={(event) => {
              const { x, y, width, height } = event.nativeEvent.layout;
              setSearchBoxLayout({ x, y, width, height });
            }}
          >
            <Ionicons name="search" size={25} color="#666" />
            <TextInput
              ref={inputRef}
              placeholder="Buscar cidade..."
              style={styles.input}
              value={city}
              onChangeText={handleCityChange}
              onFocus={() => {
                if (blurTimeout.current) {
                  clearTimeout(blurTimeout.current);
                  blurTimeout.current = null;
                }
                setTimeout(() => setIsInputFocused(true), 50);
              }}
              onBlur={() => {
                blurTimeout.current = setTimeout(() => {
                  if (citySuggestions.length === 0 && !isLoadingSuggestions && !showEmptyState) {
                    setIsInputFocused(false);
                  }
                  blurTimeout.current = null;
                }, 200);
              }}
              blurOnSubmit={false}
            />
            {city.length > 0 && (
              <TouchableOpacity 
                onPress={() => { 
                  setCity(""); 
                  setCitySuggestions([]); 
                  setIsLoadingSuggestions(false);
                  setShowEmptyState(false);
                }}
              >
                <Ionicons name="close-circle" size={25} color="#666" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Ionicons name="arrow-forward" size={25} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* OVERLAY DE BUSCA */}
        {isSearchActive && (
          <Animated.View style={[styles.overlayWrapper, { opacity: overlayOpacity }]}>
            <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
            <Pressable style={StyleSheet.absoluteFill} onPress={handleCloseOverlay} />
            {(citySuggestions.length > 0 || isLoadingSuggestions || showEmptyState || showRecentCities) && (
              <Animated.View style={[styles.overlayContent, { transform: [{ scale: suggestionsScale }] }]}>
                <View style={styles.suggestionsContainer}>
                  {/* RECENT CITIES */}
                  {showRecentCities && (
                    <ScrollView style={styles.suggestionsList} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                      {recentCities.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.suggestionItem} onPress={() => handleSelectSuggestion(item)}>
                          <Ionicons name="time-outline" size={25} color="#666" />
                          <View style={styles.suggestionTextContainer}>
                            <Text style={styles.suggestionName}>{item.name}</Text>
                            <Text style={styles.suggestionRegion}>{item.admin1}, {item.country}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                  {/* SUGESTÕES DE BUSCA */}
                  {isLoadingSuggestions ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#666" />
                      <Text style={styles.loadingText}>Buscando cidades...</Text>
                    </View>
                  ) : citySuggestions.length > 0 ? (
                    <ScrollView style={styles.suggestionsList} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                      {citySuggestions.map((suggestion, index) => (
                        <TouchableOpacity key={index} style={styles.suggestionItem} onPress={() => handleSelectSuggestion(suggestion)}>
                          <Ionicons name="location-outline" size={25} color="#666" />
                          <View style={styles.suggestionTextContainer}>
                            <Text style={styles.suggestionName}>{suggestion.name}</Text>
                            {suggestion.admin1 && <Text style={styles.suggestionRegion}>{suggestion.admin1}, {suggestion.country}</Text>}
                          </View>
                          <Ionicons name="chevron-forward" size={25} color="#ccc" />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : showEmptyState ? (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="search-outline" size={25} color="#ccc" />
                      <Text style={styles.emptyText}>Nenhuma cidade encontrada</Text>
                      <Text style={styles.emptySubtext}>Tente buscar com outro nome</Text>
                    </View>
                  ) : null}
                </View>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {/* CLIMA PRINCIPAL */}
        <View style={styles.main}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#333" style={{ transform: [{ scale: 2 }] }} />
            </View>
          )}

          {!loading && error && (
            <View style={styles.errorWrapper}>
              <View style={styles.errorCard}>
                <Ionicons name="warning-outline" size={28} color="#c0392b" />
                <Text style={styles.errorTitle}>Erro ao carregar clima</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => searchedCity ? fetchWeatherByCity(searchedCity) : fetchWeatherByCoords()}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!loading && !error && weather && (
            <>
              {/* MAIN CARD */}
              <View style={styles.mainCard}>
                <Text style={styles.mainCardEmoji}>
                  {getWeatherEmoji(weather.daily[0].weathercode, weather?.timezone_offset)}
                </Text>
                <View style={styles.mainCardInfo}>
                  <Text style={styles.weekday}>
                    {new Date().toLocaleDateString("pt-BR", { weekday: "long" })}
                  </Text>
                  <Text style={styles.dayMonth}>
                    {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
                  </Text>
                  <Text style={styles.tempText}>{Math.round(weather.temperature)}°C</Text>
                  <View style={styles.row}>
                    <Text style={styles.weatherDescription}>{weatherDescription}</Text>
                  </View>
                </View>
              </View>

              {/* GRID 2x3 */}
              <View style={styles.grid}>
                {/* CARD UMIDADE */}
                <View style={styles.card}>
                  <View style={styles.cardInner}>
                    <Ionicons name="water-outline" size={25} color="#1e90ff" />
                    <Text style={styles.cardLabel}>Umidade</Text>
                    <Text style={styles.cardValue}>{weather.humidity ?? 0}%</Text>
                  </View>
                </View>
                {/* CARD SENSAÇÃO */}
                <View style={styles.card}>
                  <View style={styles.cardInner}>
                    <Ionicons name="thermometer-outline" size={25} color="#333" />
                    <Text style={styles.cardLabel}>Sensação</Text>
                    <Text style={styles.cardValue}>{Math.round(weather.apparent_temperature)}°C</Text>
                  </View>
                </View>
                {/* CARD MÁX */}
                <View style={styles.card}>
                  <View style={[styles.cardInner, { backgroundColor:"#a80000ff" }]}>
                    <Ionicons name="arrow-up-outline" size={25} color="#fff" />
                    <Text style={styles.cardLabelWhite}>Máx</Text>
                    <Text style={styles.cardValueWhite}>{Math.round(weather.tempMax)}°C</Text>
                  </View>
                </View>
                {/* CARD CHUVA */}
                <View style={styles.card}>
                  <View style={styles.cardInner}>
                    <Ionicons name="rainy-outline" size={25} color="#4682b4" />
                    <Text style={styles.cardLabel}>Chuva</Text>
                    <Text style={styles.cardValue}>
                      {weather.precipitation_hourly !== undefined ? `${weather.precipitation_hourly} mm/h` : `${weather.precipitation ?? 0} mm`}
                    </Text>
                  </View>
                </View>
                {/* CARD VENTO */}
                <View style={styles.card}>
                  <View style={styles.cardInner}>
                    <Ionicons name="leaf-outline" size={25} color="#2e8b57" />
                    <Text style={styles.cardLabel}>Vento</Text>
                    <Text style={styles.cardValue}>{weather.windspeed} km/h</Text>
                  </View>
                </View>
                {/* CARD MÍN */}
                <View style={styles.card}>
                  <View style={[styles.cardInner, { backgroundColor:"#001b7fff" }]}>
                    <Ionicons name="arrow-down-outline" size={25} color="#fff" />
                    <Text style={styles.cardLabelWhite}>Mín</Text>
                    <Text style={styles.cardValueWhite}>{Math.round(weather.tempMin)}°C</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        {/* PREVISÃO DOS PRÓXIMOS DIAS */}
        {weather?.daily?.length > 0 && (
          <View style={styles.dailySection}>
            <Text style={styles.dailyTitle}>Próximos dias</Text>
            <View style={styles.dividerLine} />

            <View style={{ position: 'relative' }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dailyList}
              >
                {weather.daily
                  ?.filter(d => new Date(d.date).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0))
                  .map((item, i) => {
                    const date = new Date(item.date);
                    const today = new Date();
                    const d1 = date.setHours(0,0,0,0);
                    const d2 = today.setHours(0,0,0,0);

                    const tomorrow = new Date();
                      tomorrow.setDate(today.getDate() + 1);
                      tomorrow.setHours(0,0,0,0);

                      const label = d1 === d2
                        ? "Hoje"
                        : d1 === tomorrow.getTime()
                          ? "Amanhã"
                          : new Date(item.date).toLocaleDateString("pt-BR", { weekday: "short" });


                    

                    const emoji = (d1 === d2)
                      ? getWeatherEmoji(weather.daily[0].weathercode, weather?.timezone_offset)
                      : getWeatherEmoji(item.weathercode, weather?.timezone_offset, { forceDay: true });

                    return (
                      <Pressable
                        key={i}
                        onPress={() => handleSelectDay(item, i)}
                        style={[styles.dailyCard, i === activeDayIndex && styles.dailyCardActive]}
                      >
                        <Text style={styles.dailyDay}>{label}</Text>
                        <View style={styles.dividerLine} />
                        <Text style={{ fontSize: 25 }}>{emoji}</Text>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dailyTemp}>
                          {Math.round(item.tempMax)}° / {Math.round(item.tempMin)}°
                        </Text>
                      </Pressable>
                    );
                  })}
              </ScrollView>

              {/* GRADIENTES */}
              <LinearGradient
                colors={['#fff', '#fff', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={{ position: 'absolute', right: 0, top: 0, bottom: 20, width: 20 }}
                pointerEvents="none"
              />
              <LinearGradient
                colors={['#fff', '#fff', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', left: 0, top: 0, bottom: 20, width: 20 }}
                pointerEvents="none"
              />
            </View>
          </View>
        )}
      </>
    </View>
  );
}

// ========================= STYLES =========================
const styles = StyleSheet.create({
  /* ================================== CONTAINER ================================== */
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight + 12,
    fontFamily: "Arial",
    justifyContent:'space-between',
  },

  /* ================================== HEADER ================================== */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 30,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  locationText: {                                                                                   
    fontWeight: "bold",
    fontSize: 18,
  },

  locationBlock: {
    gap: 4,
  },

  locationSubtext: {
    fontSize: 15,
    color: "#777",
    marginStart: 40,
  },

  /* ================================== SEARCH BOX ================================== */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 25,
    marginHorizontal: 20,
    marginTop: 15,
    gap: 8,
    zIndex: 1005,
  },

  input: {
    flex: 1,
    height: 40,
  },

  searchButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ================================== OVERLAY ================================== */
  overlayWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },

  overlayContent: {
    paddingHorizontal: 20,
    zIndex: 1001,
    marginTop: statusBarHeight + 120,
  },

  suggestionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 25,
    shadowColor: "#000",
    overflow: "hidden",
    maxHeight: 450,
    marginTop: 15,
  },

  suggestionsList: {
    maxHeight: 450,
  },

  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 8,
  },
  loadingContainer: {
    padding: 30,
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

  suggestionTextContainer: {
    flex: 1,
  },

  suggestionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  suggestionRegion: {
    fontSize: 12.5,
    color: "#666",
    marginTop: 2,
  },

  /* ================================== MAIN CARD ================================== */
  main: {
    alignItems: "center",
    justifyContent:"center",
    gap: 10,
  },

  weekday: {
    fontSize: 20,
    textTransform: "capitalize",
    color: "#fff",
  },

  dayMonth: {
    fontSize: 15,
    color: "#fff",
  },

  tempText: {
    fontSize:60,
    fontWeight: "bold",
    color: "#fff",
  },

  mainCard: {
    flexDirection: "row",
    backgroundColor: "#001b7fff",
    borderRadius:20,
    paddingVertical: 10,
    marginHorizontal: 20,
    margintop: 10,
  },

  mainCardEmoji: {
    flex: 1,
    fontSize: 125,
    paddingHorizontal:15,  
  },

  mainCardInfo: {
    justifyContent:"center",
    alignItems: "flex-end",
    paddingEnd: 30,
  },

  weatherDescription:{
    color:"#fff",
  },

  /* ================================== GRID ================================== */
  grid: {
    justifyContent:"space-between",
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal:20,
  },

  card: {
    width: "33.333%", 
    alignItems:"center",
    marginBlock:10, 
  },

  cardInner: {
    width: 80,
    backgroundColor: "#fff",
    borderRadius: 15,
    alignItems: "center",
    paddingVertical: 8,
  },

  cardLabel: {
    fontSize: 12,
    color: "#777",
  },

  cardValue: {
    fontSize: 12 ,
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

  /* ================================== DAILY FORECAST ================================== */
  dailySection:{
    backgroundColor:"white",
    margin: 20,
    borderRadius: 20,
  },

  dailyTitle: {
    fontSize: 15,
    color:"#333",
    textAlign: "center",
    fontWeight: "600",
    padding: 10,
  },

  dailyCard: {
    width: 60,
    padding: 0,
    borderRadius: 10,
    justifyContent: "space-between",
    alignItems: "center",
    marginStart: 10,
    paddingTop: 10,
    paddingBottom: 30 ,
   
  },
  dailyDay: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
    textTransform: "capitalize",
  },

  dailyTemp: {
    fontSize: 12,
    fontWeight: "800",
    color: "#333",
  },

  dividerLine: {
    marginHorizontal: 0,
    height: 1,
    backgroundColor: "#99999970",
    marginVertical: 2,
  },

  dailyCardActive: {},
});
