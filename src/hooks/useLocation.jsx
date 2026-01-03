import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { AppState, Linking } from "react-native";


export const LOCATION_STATUS = {
  LOADING: "loading",
  DENIED: "denied",
  GRANTED: "granted",
  BLOCKED: "blocked", // 👈 adicionado

};

export function useLocation() {
  const [status, setStatus] = useState(LOCATION_STATUS.LOADING);
  const [locationLabel, setLocationLabel] = useState(null);

  const getUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      const address = await Location.reverseGeocodeAsync(location.coords);
      const label = address[0]?.subregion || address[0]?.city || "Localização";
      setLocationLabel(label);
    } catch (error) {
      console.log("Erro ao obter localização:", error);
    }
  };

 const requestPermission = async () => {
  try {
    setStatus(LOCATION_STATUS.LOADING);
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      // 👇 checa se o sistema bloqueou e não permite perguntar de novo
      const current = await Location.getForegroundPermissionsAsync();

      if (current.status === "denied" && !current.canAskAgain) {
        setStatus(LOCATION_STATUS.BLOCKED); // 👈 agora sabemos que foi bloqueado
      } else {
        setStatus(LOCATION_STATUS.DENIED); // negação normal
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

  useEffect(() => {
    requestPermission();

     const listener = AppState.addEventListener("change", async (state) => {
    if (state === "active") {
      const current = await Location.getForegroundPermissionsAsync();

      if (current.status === "granted") {
        getUserLocation(); // busca a localização automaticamente
        setStatus(LOCATION_STATUS.GRANTED);
      } else if (current.status === "denied" && !current.canAskAgain) {
        setStatus(LOCATION_STATUS.BLOCKED);
      }
    }
  });

  return () => listener.remove();
  }, []);

  return { status, locationLabel, requestPermission };
}
