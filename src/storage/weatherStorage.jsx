import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  LAST_CITY: "@weather:last_city",
  RECENT_CITIES: "@weather:recent_cities",
  SETTINGS: "@weather:settings",
};

// ================= LAST CITY =================
export async function saveLastCity(city) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_CITY,
      JSON.stringify(city)
    );
  } catch (error) {
    console.warn("Erro ao salvar última cidade");
  }
}

export async function getLastCity() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CITY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// ================= RECENT CITIES =================
export async function saveRecentCities(cities) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.RECENT_CITIES,
      JSON.stringify(cities)
    );
  } catch {}
}

export async function getRecentCities() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_CITIES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// ================= SETTINGS =================
export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(settings)
    );
  } catch {}
}

export async function getSettings() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data
      ? JSON.parse(data)
      : { unit: "celsius" };
  } catch {
    return { unit: "celsius" };
  }
}
