// ========================= IMPORTS =========================
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ========================= COMPONENT =========================
// Componente responsável por exibir erros de carregamento do clima
//
// USO NO HOME:
// - Recebe `message` → mensagem de erro do Home
// - Recebe `onRetry` → função que dispara novamente o fetch do clima
// - Renderiza ícone, título, mensagem e botão de retry
export function WeatherError({ message, onRetry }) {
  return (
    <View style={styles.errorWrapper}>
      <View style={styles.errorCard}>
        {/* Ícone de aviso */}
        <Ionicons name="warning-outline" size={28} color="#c0392b" />

        {/* Título do erro */}
        <Text style={styles.errorTitle}>Erro ao carregar clima</Text>

        {/* Mensagem detalhada do erro */}
        <Text style={styles.errorText}>{message}</Text>

        {/* Botão para tentar novamente */}
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ========================= STYLES =========================
const styles = StyleSheet.create({
  // Container principal, centraliza o card de erro
  errorWrapper: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 20,
  },

  // Card do erro
  errorCard: {
    borderRadius: 20,
    padding: 30,
    backgroundColor: "#fff",
    elevation: 2,
    alignItems: "center",
    gap: 12, // espaço entre elementos
  },

  // Título do erro
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
  },

  // Mensagem de erro detalhada
  errorText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
  },

  // Botão para retry
  retryButton: {
    marginTop: 6,
    backgroundColor: "#222",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 2,
  },

  // Texto do botão
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
});
