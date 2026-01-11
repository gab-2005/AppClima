import AsyncStorage from "@react-native-async-storage/async-storage";

// ========================= STORAGE KEYS =========================
const STORAGE_KEYS = {
  LAST_CITY: "@weather:last_city",       // última cidade pesquisada
  RECENT_CITIES: "@weather:recent_cities", // cidades recentes
  SETTINGS: "@weather:settings",         // configurações do app (ex: unidade)
};

// ========================= LAST CITY =========================
/**
 * saveLastCity
 * - Salva a última cidade pesquisada
 * @param {Object} city - objeto da cidade (nome, latitude, longitude, etc.)
 */
export async function saveLastCity(city) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_CITY, JSON.stringify(city));
  } catch (error) {
    console.warn("Erro ao salvar última cidade");
  }
}

/**
 * getLastCity
 * - Recupera a última cidade salva
 * @returns {Object|null} cidade ou null se não houver
 */
export async function getLastCity() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CITY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// ========================= RECENT CITIES =========================
/**
 * saveRecentCities
 * - Salva a lista de cidades recentes
 * @param {Array} cities - array de objetos de cidade
 */
export async function saveRecentCities(cities) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_CITIES, JSON.stringify(cities));
  } catch {}
}

/**
 * getRecentCities
 * - Recupera a lista de cidades recentes
 * @returns {Array} array de cidades (pode ser vazio)
 */
export async function getRecentCities() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_CITIES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// ========================= SETTINGS =========================
/**
 * saveSettings
 * - Salva configurações do app (ex: unidade de temperatura)
 * @param {Object} settings - { unit: "celsius" | "fahrenheit" }
 */
export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}

/**
 * getSettings
 * - Recupera configurações do app
 * @returns {Object} settings (default: { unit: "celsius" })
 */
export async function getSettings() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : { unit: "celsius" };
  } catch {
    return { unit: "celsius" };
  }
}
