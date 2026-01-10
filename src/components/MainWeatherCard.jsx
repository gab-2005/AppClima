// React Native
import { View, Text } from "react-native";

// Expo
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Utils
import {
  getWeatherEmoji,
  getDayNightEmoji,
} from "../utils/getWeatherEmoji";
import { getWeatherDescription } from "../utils/getWeatherDescription";
import { formatTemperature } from "../utils/temperature";

/**
 * MainWeatherCard
 *
 * Papel do componente:
 * - Exibir as informações principais do clima do dia atual
 * - Emoji do clima
 * - Data atual
 * - Temperatura formatada conforme a unidade
 * - Descrição do clima (dia/noite)
 *
 * Uso em conjunto com o Home:
 * - O Home busca e gerencia os dados do clima
 * - Este componente apenas recebe os dados prontos via props
 * - Não possui estado próprio nem lógica de negócio
 *
 * Props recebidas do Home:
 * @param {object} weather - Objeto de clima retornado pela API
 * @param {string} unit - Unidade de temperatura ("celsius" ou "fahrenheit")
 *
 * O que retorna para o Home:
 * - Um cartão visual com o resumo do clima atual
 */
export function MainWeatherCard({ weather, unit }) {
  // Segurança: não renderiza nada sem dados válidos
  if (!weather) return null;

  return (
    <LinearGradient
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      colors={["#000000ff", "#000000b9"]}
      style={{
        flexDirection: "row",
        justifyContent: "center",
        marginHorizontal: 20,
        borderRadius: 20,
        minHeight: 180,
      }}
    >
      {/* Coluna esquerda: Emoji do clima */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 125 }}>
          {getWeatherEmoji(
            weather.daily[0].weathercode,
            weather?.timezone_offset
          )}
        </Text>
      </View>

      {/* Coluna direita: Data, temperatura e descrição */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Dia da semana */}
        <Text style={{ fontSize: 25, color: "#fff" }}>
          {new Date().toLocaleDateString("pt-BR", { weekday: "long" })}
        </Text>

        {/* Dia e mês */}
        <Text style={{ fontSize: 15, color: "#fff" }}>
          {new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
          })}
        </Text>

        {/* Temperatura atual */}
        <Text style={{ fontSize: 40, color: "#fff" }}>
          {formatTemperature(weather.temperature, unit)}
        </Text>

        {/* Ícone dia/noite + descrição do clima */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
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
