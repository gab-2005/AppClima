// React
import { useEffect, useState } from "react";

// Expo
import * as Location from "expo-location";

// React Native
import { AppState } from "react-native";

/**
 * Estados possíveis da permissão de localização
 *
 * Usado pelo Home para decidir:
 * - Buscar clima automaticamente
 * - Mostrar ações alternativas (ex: abrir configurações)
 */
export const LOCATION_STATUS = {
  LOADING: "loading",
  DENIED: "denied",
  GRANTED: "granted",
  BLOCKED: "blocked",
};

/**
 * useLocation
 *
 * Papel do hook:
 * - Gerenciar permissão de localização
 * - Obter a localização atual do usuário
 * - Resolver um rótulo amigável (cidade/região)
 *
 * Uso em conjunto com o Home:
 * - O Home consome `status` para decidir o fluxo da aplicação
 * - Usa `locationLabel` apenas para exibição
 * - Pode chamar `requestPermission` manualmente se necessário
 */
export function useLocation() {
  const [status, setStatus] = useState(LOCATION_STATUS.LOADING);
  const [locationLabel, setLocationLabel] = useState(null);

  /**
   * Obtém a posição atual do usuário
   * e resolve um nome de local amigável
   */
  const getUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });

      const address = await Location.reverseGeocodeAsync(location.coords);

      const label =
        address[0]?.subregion ||
        address[0]?.city ||
        "Localização";

      setLocationLabel(label);
    } catch (error) {
      console.log("Erro ao obter localização:", error);
    }
  };

  /**
   * Solicita permissão de localização ao usuário
   * e atualiza o status corretamente:
   * - GRANTED
   * - DENIED
   * - BLOCKED (quando não pode mais perguntar)
   */
  const requestPermission = async () => {
    try {
      setStatus(LOCATION_STATUS.LOADING);

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        const current =
          await Location.getForegroundPermissionsAsync();

        if (current.status === "denied" && !current.canAskAgain) {
          setStatus(LOCATION_STATUS.BLOCKED);
        } else {
          setStatus(LOCATION_STATUS.DENIED);
        }

        return;
      }

      setStatus(LOCATION_STATUS.GRANTED);
      getUserLocation();
    } catch (error) {
      console.log("Erro de permissão:", error);
      setStatus(LOCATION_STATUS.DENIED);
    }
  };

  /**
   * Effect inicial:
   * - Solicita permissão ao montar
   * - Escuta retorno do app ao foreground
   *   para revalidar a permissão
   */
  useEffect(() => {
    requestPermission();

    const listener = AppState.addEventListener(
      "change",
      async (state) => {
        if (state !== "active") return;

        const current =
          await Location.getForegroundPermissionsAsync();

        if (current.status === "granted") {
          getUserLocation();
          setStatus(LOCATION_STATUS.GRANTED);
        } else if (
          current.status === "denied" &&
          !current.canAskAgain
        ) {
          setStatus(LOCATION_STATUS.BLOCKED);
        }
      }
    );

    return () => listener.remove();
  }, []);

  /**
   * Retorno do hook:
   * - status: estado da permissão
   * - locationLabel: nome amigável da localização
   * - requestPermission: ação manual (caso necessário)
   */
  return {
    status,
    locationLabel,
    requestPermission,
  };
}
