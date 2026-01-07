import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function WeatherGrid({ weather }) {
  if (!weather) return null;

  return (
    <View style={styles.grid}>

      {/* COLUNA 1 */}
      <View style={styles.card}>
        <View style={[styles.cardInner, styles.cardInneStart]}>
          <Ionicons name="water-outline" size={25} />
          <Text style={styles.cardLabel}>Umidade</Text>
          <Text style={styles.cardValue}>{weather.humidity ?? 0}%</Text>
        </View>
      </View>

      {/* COLUNA 2 */}
      <View style={styles.card}>
        <View style={[styles.cardInner, styles.cardInneCenter]}>
          <Ionicons name="thermometer-outline" size={25} />
          <Text style={styles.cardLabel}>Sensação</Text>
          <Text style={styles.cardValue}>
            {Math.round(weather.apparent_temperature)}°C
          </Text>
        </View>
      </View>

      {/* COLUNA 3 — MÁX */}
      <View style={styles.card}>
        <View
          style={[
            styles.cardInner,
            styles.cardInneEnd,
            { backgroundColor: "#a80000ff" },
          ]}
        >
          <Ionicons name="arrow-up-outline" size={25} color="#fff" />
          <Text style={styles.cardLabelWhite}>Máx</Text>
          <Text style={styles.cardValueWhite}>
            {Math.round(weather.tempMax)}°C
          </Text>
        </View>
      </View>

      {/* 2ª LINHA */}

      {/* COLUNA 1 */}
      <View style={styles.card}>
        <View style={[styles.cardInner, styles.cardInneStart]}>
          <Ionicons name="rainy-outline" size={25} />
          <Text style={styles.cardLabel}>Chuva</Text>
          <Text style={styles.cardValue}>
            {weather.precipitation_hourly !== undefined
              ? `${weather.precipitation_hourly} mm/h`
              : `${weather.precipitation ?? 0} mm`}
          </Text>
        </View>
      </View>

      {/* COLUNA 2 */}
      <View style={styles.card}>
        <View style={[styles.cardInner, styles.cardInneCenter]}>
          <Ionicons name="leaf-outline" size={25} />
          <Text style={styles.cardLabel}>Vento</Text>
          <Text style={styles.cardValue}>{weather.windspeed} km/h</Text>
        </View>
      </View>

      {/* COLUNA 3 — MÍN */}
      <View style={styles.card}>
        <View
          style={[
            styles.cardInner,
            styles.cardInneEnd,
            { backgroundColor: "#001b7fff" },
          ]}
        >
          <Ionicons name="arrow-down-outline" size={25} color="#fff" />
          <Text style={styles.cardLabelWhite}>Mín</Text>
          <Text style={styles.cardValueWhite}>
            {Math.round(weather.tempMin)}°C
          </Text>
        </View>
      </View>

    </View>
  );
}
const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 20,
    paddingVertical: 20,
    rowGap: 20,
  },

  card: {
    width: "33.333%",
  },

  cardInner: {
    width: 80,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 10,
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 2,
  },

  cardInneStart: {
    alignSelf: "flex-start",
  },

  cardInneCenter: {
    alignSelf: "center",
  },

  cardInneEnd: {
    alignSelf: "flex-end",
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
});
