import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  getWeatherEmoji,
  getDayNightEmoji,
} from "../utils/getWeatherEmoji";
import { getWeatherDescription } from "../utils/getWeatherDescription";

export function MainWeatherCard({ weather, isNight }) {
  if (!weather) return null;

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      colors={
        isNight
          ? ["#0f0c29", "#2b3663ff"]
          : ["#3a7bd5", "#00d2ff"]
      }
      style={{
        flexDirection: "row",
        justifyContent: "center",
        marginHorizontal: 20,
        borderRadius: 20,
        minHeight: 180,
      }}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 125 }}>
          {getWeatherEmoji(
            weather.daily[0].weathercode,
            weather?.timezone_offset
          )}
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 2 }}>
        <Text style={{ fontSize: 25, color: "#fff" }}>
          {new Date().toLocaleDateString("pt-BR", { weekday: "long" })}
        </Text>

        <Text style={{ fontSize: 15, color: "#fff" }}>
          {new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
          })}
        </Text>

        <Text style={{ fontSize: 40, color: "#fff" }}>
          {Math.round(weather.temperature)}°C
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Ionicons
            style={{ fontSize: 18, color: "#fff" }}
            name={getDayNightEmoji(weather?.timezone_offset)}
          />
          <Text style={{ fontSize: 10, color: "#fff" }}>
            {getWeatherDescription(
              weather.daily[0].weathercode,
              weather?.timezone_offset
            )}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
