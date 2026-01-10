// ==================================================
// HEADER LOCATION
// Responsável por:
// - Exibir a localização atual ou cidade pesquisada
// - Indicar estado da permissão de localização
// - Permitir limpar a busca
// - Alternar unidade de temperatura (°C / °F)
//
// Este componente NÃO busca dados.
// Ele apenas exibe informações recebidas do Home.
// ==================================================

import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { LOCATION_STATUS } from "../hooks/useLocation";
import { UnitToggle} from "../components/UnitToggle";

export function HeaderLocation({
  status,
  searchedCity,
  locationLabel,
  weather,
  onRefreshLocation,
  onClearSearch,
  onChangeUnit,
  unit,
}) {
  // ========================= ESTADOS DERIVADOS =========================
  // Verifica se a permissão de localização foi concedida
  const hasLocationPermission = status === LOCATION_STATUS.GRANTED;

  // Define se o app está usando localização ou cidade pesquisada
  const isUsingLocation = !searchedCity;

  // ========================= RENDER =========================
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 10,
        }}
      >
        {/* BLOCO DE LOCALIZAÇÃO */}
        <View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {/* ÍCONE DE LOCALIZAÇÃO */}
            <Ionicons
              name={
                !hasLocationPermission && !searchedCity
                  ? "globe-outline"
                  : "location-sharp"
              }
              size={20}
              color="#333"
            />

            {/* TEXTO PRINCIPAL (CLICÁVEL) */}
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

            {/* BOTÃO PARA LIMPAR BUSCA */}
            {searchedCity && (
              <TouchableOpacity onPress={onClearSearch}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {/* SUBTÍTULO */}
          {!isUsingLocation && weather?.region && weather?.country && (
            <Text
              style={{
                fontSize: 12,
                color: "#777",
                marginStart: 30,
              }}
            >
              {weather.region}, {weather.country}
            </Text>
          )}

          {isUsingLocation && (
            <Text
              style={{
                fontSize: 12,
                color: "#777",
                marginStart: 30,
              }}
            >
              Próximo a você
            </Text>
          )}
        </View>

        {/* TOGGLE DE UNIDADE */}
        <UnitToggle unit={unit} onChange={onChangeUnit} />
      </View>
    </View>
  );
}
