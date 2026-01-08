import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

export function WeatherLoading() {
  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator
        size="large"
        color="#666"
        style={{ transform: [{ scale: 1.2 }] }}
      />
      <Text style={styles.loadingText}>Carregando Clima...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    gap: 20
  },

  loadingText: {
    color: "#666",
  },
});
