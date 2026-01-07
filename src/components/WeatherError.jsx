import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function WeatherError({ message, onRetry }) {
  return (
    <View style={styles.errorWrapper}>
      <View style={styles.errorCard}>
        <Ionicons name="warning-outline" size={28} color="#c0392b" />
        <Text style={styles.errorTitle}>Erro ao carregar clima</Text>
        <Text style={styles.errorText}>{message}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  errorWrapper: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 20,
  },

  errorCard: {
    borderRadius: 20,
    padding: 30,
    backgroundColor: "#fff",
    elevation: 2,
    alignItems: "center",
    gap: 12,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
  },

  errorText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
  },

  retryButton: {
    marginTop: 6,
    backgroundColor: "#222",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 2,
  },

  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
});
