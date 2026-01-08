import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { convertTemperature } from "../utils/temperature";

export function WeatherGrid({ weather, unit }) {
  if (!weather) return null;

  const currentTemp = weather?.temperature ?? 0;
  const apparentTemp = convertTemperature(weather?.apparent_temperature ?? currentTemp, unit);
  const tempMax = convertTemperature(weather?.tempMax ?? currentTemp, unit);
  const tempMin = convertTemperature(weather?.tempMin ?? currentTemp, unit);

  // Função de formatação genérica para valores
  const formatValue = (value, type) => {
    if (value === undefined || value === null) return "--";
    switch (type) {
      case "temp":
        return `${Math.round(value)}°${unit === "celsius" ? "C" : "F"}`;
      case "humidity":
        return `${Math.round(value)}%`;
      case "wind":
        return `${Math.round(value)} km/h`;
      case "precipitation":
        return `${Math.round(value)} mm`;
      default:
        return value;
    }
  };

  return (
    <View style={styles.grid}>
      {/* Umidade */}
      <View style={styles.card}>
        <View style={[styles.cardInner, styles.cardInneStart]}>
          <Ionicons name="water-outline" size={25} />
          <Text style={styles.cardLabel}>Umidade</Text>
          <Text style={styles.cardValue}>{formatValue(weather.humidity, "humidity")}</Text>
        </View>
      </View>

      {/* Sensação */}
      <View style={styles.card}>
        <View style={[styles.cardInner, styles.cardInneCenter]}>
          <Ionicons name="thermometer-outline" size={25} />
          <Text style={styles.cardLabel}>Sensação</Text>
          <Text style={styles.cardValue}>{formatValue(apparentTemp, "temp")}</Text>
        </View>
      </View>

      {/* Máx */}
      <View style={styles.card}>
        <View style={[styles.cardInner, styles.cardInneEnd, { backgroundColor: "#000000de" }]}>
          <Ionicons name="arrow-up-outline" size={25} color="#dd0000ff" />
          <Text style={styles.cardLabelWhite}>Máx</Text>
          <Text style={styles.cardValueWhite}>{formatValue(tempMax, "temp")}</Text>
        </View>
      </View>

      {/* Chuva */}
      <View style={styles.card}>
        <View style={[styles.cardInner, styles.cardInneStart]}>
          <Ionicons name="rainy-outline" size={25} />
          <Text style={styles.cardLabel}>Chuva</Text>
          <Text style={styles.cardValue}>
            {formatValue(weather.precipitation_hourly ?? weather.precipitation, "precipitation")}
          </Text>
        </View>
      </View>

      {/* Vento */}
      <View style={styles.card}>
        <View style={[styles.cardInner, styles.cardInneCenter]}>
          <Ionicons name="leaf-outline" size={25} />
          <Text style={styles.cardLabel}>Vento</Text>
          <Text style={styles.cardValue}>{formatValue(weather.windspeed, "wind")}</Text>
        </View>
      </View>

      {/* Mín */}
      <View style={styles.card}>
        <View style={[styles.cardInner, styles.cardInneEnd, { backgroundColor: "#000000de" }]}>
          <Ionicons name="arrow-down-outline" size={25} color="#08ceffff" />
          <Text style={styles.cardLabelWhite}>Mín</Text>
          <Text style={styles.cardValueWhite}>{formatValue(tempMin, "temp")}</Text>
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
    width: 90,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#ffffffff",
  },
  cardInneStart: {
    alignSelf: "flex-start",
    elevation: 1,
    borderRadius: 20,
  },
  cardInneCenter: {
    alignSelf: "center",
    elevation: 1,
    borderRadius: 20,
  },
  cardInneEnd: {
    alignSelf: "flex-end",
    borderRadius: 20,
  },
  cardLabel: {
    fontSize: 12,
    rowGap: 20,
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
