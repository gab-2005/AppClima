import { View, Text, StyleSheet, ScrollView, Pressable} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  getWeatherEmoji,
} from "../utils/getWeatherEmoji";

export function DailyForecast({
  weather,
  activeDayIndex,
  onSelectDay,
}) {
  if (!weather?.daily?.length) return null;

  return (
      <View style={styles.daily}>
        <View style={styles.dailyTitle}>
          <Ionicons name="calendar" size={20} color={"#333"} />
          <Text style={styles.dailyText}>Próximos dias</Text>
        </View>
            <View style={styles.dailySection}>
        <View style={{ position: "relative" }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {weather.daily
              .filter(
                (d) =>
                  new Date(d.date).setHours(0, 0, 0, 0) >=
                  new Date().setHours(0, 0, 0, 0)
              )
              .map((item, i) => {
                const date = new Date(item.date);
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                const d1 = new Date(item.date).setHours(0, 0, 0, 0);
                const d2 = today.setHours(0, 0, 0, 0);
                const isToday = d1 === d2;
                const label = isToday
                  ? "Hoje"
                  : d1 === tomorrow.getTime()
                  ? "Amanhã"
                  : date.toLocaleDateString("pt-BR", {
                      weekday: "short",
                    });
                const emoji = isToday
                  ? getWeatherEmoji(
                      weather.daily[0].weathercode,
                      weather?.timezone_offset
                    )
                  : getWeatherEmoji(item.weathercode, weather?.timezone_offset, {
                      forceDay: true,
                    });
                return (
                  <Pressable
                    key={i}
                    onPress={() => onSelectDay(item, i)}
                    style={[
                      styles.dailyCard,
                      i === activeDayIndex && styles.dailyCardActive,
                    ]}
                  >
                    <Text style={styles.dailyDay}>{label}</Text>
                    <Text style={{ fontSize: 30 }}>{emoji}</Text>
                    <Text style={styles.dailyTempMax}>
                      {Math.round(
                        isToday ? weather.tempMax : item.tempMax
                      )}
                      °
                    </Text>
                    <Text style={styles.dailyTempMin}>
                      {Math.round(
                        isToday ? weather.tempMin : item.tempMin
                      )}
                      °
                    </Text>
                  </Pressable>
                );
              })}
          </ScrollView>
          {/* GRADIENTES */}
          <LinearGradient
            colors={["#fff", "#fff", "transparent"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={styles.gradientRight}
            pointerEvents="none"
          />
          <LinearGradient
            colors={["#fff", "#fff", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientLeft}
            pointerEvents="none"
          />
        </View>
            </View>
      </View>
  );
}
const styles = StyleSheet.create({
  daily: {
  marginHorizontal: 20,
  borderRadius: 20,
 },
 dailyTitle: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 10,
  paddingVertical: 15,
  borderRadius: 20,
  backgroundColor: "#fff",
  gap: 10,
  elevation: 1,       // sombra no título ✔
  overflow: "hidden", // respeita o radius da sombra no Android ✔

  // ❗ removendo qualquer borda:
  borderWidth: 0,
  borderBottomWidth: 0,
  borderColor: "transparent",
  zIndex: 10,
},
dailyText:{
  fontSize: 15,
  fontWeight: "600",
},

dailySection: {
  marginBottom: 10,
  borderRadius: 20,
  backgroundColor: "#fff",
  paddingVertical: 20,
  elevation: 1,        // sombra na section
  overflow: "hidden",  // respeita o radius no Android
},

  dailyCard: {
    justifyContent: "center",
    alignItems: "center",
    paddingInline: 10,
  },

  dailyDay: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },

  dailyTempMax: {
    fontSize: 15,
    fontWeight: "800",
    color: "#333",
  },

  dailyTempMin: {
    fontSize: 12,
    fontWeight: "800",
    color: "#999",
  },

  gradientRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 15,
  },

  gradientLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 15,
  },
});

