import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LOCATION_STATUS } from "../hooks/useLocation";

export function HeaderLocation({
  status,
  searchedCity,
  locationLabel,
  weather,
  onRefreshLocation,
  onClearSearch,
}) {
  const hasLocationPermission = status === LOCATION_STATUS.GRANTED;
  const isUsingLocation = !searchedCity;

  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 10 }}>
        <View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Ionicons
              name={!hasLocationPermission && !searchedCity ? "globe-outline" : "location-sharp"}
              size={20}
              color="#333"
            />

            <TouchableOpacity onPress={onRefreshLocation}>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {status === LOCATION_STATUS.LOADING
                  ? "Buscando local…"
                  : searchedCity
                  ? searchedCity
                  : hasLocationPermission
                  ? locationLabel
                  : "Ativar localização"}
              </Text>
            </TouchableOpacity>

            {searchedCity && (
              <TouchableOpacity onPress={onClearSearch}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {!isUsingLocation && weather?.region && weather?.country && (
            <Text style={{ fontSize: 12, color: "#777", marginStart: 30 }}>
              {weather.region}, {weather.country}
            </Text>
          )}

          {isUsingLocation && (
            <Text style={{ fontSize: 12, color: "#777", marginStart: 30 }}>
              Próximo a você
            </Text>
          )}
        </View>

        <Ionicons name="settings-outline" size={20} color="#333" />
      </View>
    </View>
  );
}
