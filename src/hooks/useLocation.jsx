import { useEffect, useState } from "react";
import * as Location from "expo-location";

export const LOCATION_STATUS = {
  LOADING: "loading",
  DENIED: "denied",
  GRANTED: "granted",
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
        setStatus(LOCATION_STATUS.DENIED);
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
  }, []);

  return { status, locationLabel };
}
