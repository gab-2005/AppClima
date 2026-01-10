// React Native
import { View, Text, StyleSheet } from "react-native";

// Icons
import { Ionicons } from "@expo/vector-icons";

// Utils
import { formatTemperature } from "../utils/temperature";

/**
 * WeatherGrid
 *
 * Papel do componente:
 * - Exibir informações climáticas secundárias em formato de grid
 * - Cada card representa um dado específico do clima atual
 *
 * Uso em conjunto com o Home:
 * - O Home busca e centraliza os dados climáticos
 * - Este componente apenas recebe o objeto `weather` já tratado
 * - Não possui estado próprio nem efeitos colaterais
 *
 * Props recebidas do Home:
 * @param {object} weather - Objeto com dados atuais do clima
 * @param {string} unit - Unidade de temperatura ("celsius" | "fahrenheit")
 *
 * O que retorna para o Home:
 * - Um grid visual com métricas complementares do clima
 */
export function WeatherGrid({ weather, unit }) {
  // Segurança: não renderiza sem dados válidos
  if (!weather) return null;

  const apparentTemp = weather.apparent_temperature;
  const tempMax = weather.tempMax;
  const tempMin = weather.tempMin;

  /**
   * Formata valores numéricos de acordo com o tipo
   * Mantém fallback visual ("--") para dados ausentes
   */
  const formatValue = (value, type) => {
    if (value === undefined || value === null) return "--";

    switch (type) {
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
        <View style={[styles.cardInner, styles.cardInnerStart]}>
          <Ionicons name="water-outline" size={25} />
          <Text style={styles.cardLabel}>Umidade</Text>
          <Text style={styles.cardValue}>
            {formatValue(weather.humidity, "humidity")}
          </Text>
        </View>
      </View>

      {/* Sensação térmica */}
      <View style={styles.card}>
        <View style={[styles.cardInner, styles.cardInnerCenter]}>
          <Ionicons name="thermometer-outline" size={25} />
          <Text style={styles.cardLabel}>Sensação</Text>
          <Text style={styles.cardValue}>
            {formatTemperature(apparentTemp, unit)}
          </Text>
        </View>
      </View>

      {/* Temperatura máxima */}
      <View style={styles.card}>
        <View
          style={[
            styles.cardInner,
            styles.cardInnerEnd,
            { backgroundColor: "#000000de" },
          ]}
        >
          <Ionicons name="arrow-up-outline" size={25} color="#dd0000ff" />
          <Text style={styles.cardLabelWhite}>Máx</Text>
          <Text style={styles.cardValueWhite}>
            {formatTemperature(tempMax, unit)}
          </Text>
        </View>
      </View>

      {/* Precipitação */}
      <View style={styles.card}>
        <View style={[styles.cardInner, styles.cardInnerStart]}>
          <Ionicons name="rainy-outline" size={25} />
          <Text style={styles.cardLabel}>Chuva</Text>
          <Text style={styles.cardValue}>
            {formatValue(
              weather.precipitation_hourly ?? weather.precipitation,
              "precipitation"
            )}
          </Text>
        </View>
      </View>

      {/* Vento */}
      <View style={styles.card}>
        <View style={[styles.cardInner, styles.cardInnerCenter]}>
          <Ionicons name="leaf-outline" size={25} />
          <Text style={styles.cardLabel}>Vento</Text>
          <Text style={styles.cardValue}>
            {formatValue(weather.windspeed, "wind")}
          </Text>
        </View>
      </View>

      {/* Temperatura mínima */}
      <View style={styles.card}>
        <View
          style={[
            styles.cardInner,
            styles.cardInnerEnd,
            { backgroundColor: "#000000de" },
          ]}
        >
          <Ionicons name="arrow-down-outline" size={25} color="#08ceffff" />
          <Text style={styles.cardLabelWhite}>Mín</Text>
          <Text style={styles.cardValueWhite}>
            {formatTemperature(tempMin, unit)}
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
    width: 90,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#ffffffff",
  },

  cardInnerStart: {
    alignSelf: "flex-start",
    elevation: 1,
    borderRadius: 20,
  },

  cardInnerCenter: {
    alignSelf: "center",
    elevation: 1,
    borderRadius: 20,
  },

  cardInnerEnd: {
    alignSelf: "flex-end",
    borderRadius: 20,
  },

  cardLabel: {
    fontSize: 12,
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
