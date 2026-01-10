import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

/**
 * SearchOverlay
 * --------------------------------------------------
 * Overlay de sugestões de busca.
 *
 * Props:
 * - isVisible → controla visibilidade do overlay
 * - overlayOpacity → animação de opacidade
 * - suggestionsScale → animação de escala
 * - citySuggestions → array de sugestões da API
 * - recentCities → array de cidades recentes
 * - isLoading → indica loading de sugestões
 * - showEmptyState → mostra estado vazio
 * - showRecentCities → mostra histórico
 * - onSelectSuggestion → callback ao clicar em uma cidade
 * - onClose → fecha overlay
 */
export function SearchOverlay({
  isVisible,
  overlayOpacity,
  suggestionsScale,
  citySuggestions,
  recentCities,
  isLoading,
  showEmptyState,
  showRecentCities,
  onSelectSuggestion,
  onClose,
}) {
  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      {/* Blur de fundo */}
      <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
      {/* Pressable para fechar ao tocar fora */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <Animated.View
        style={[styles.content, { transform: [{ scale: suggestionsScale }] }]}
      >
        <View style={styles.box}>
          {/* Histórico */}
          {showRecentCities && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {recentCities.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.item}
                  onPress={() => onSelectSuggestion(item)}
                >
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.region}>
                      {item.admin1}, {item.country}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Loading */}
          {isLoading && (
            <View style={styles.center}>
              <ActivityIndicator size="small" color="#666" />
              <Text style={styles.helper}>Buscando cidades...</Text>
            </View>
          )}

          {/* Sugestões da API */}
          {!isLoading && citySuggestions.length > 0 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {citySuggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.item}
                  onPress={() => onSelectSuggestion(item)}
                >
                  <Ionicons name="location-outline" size={20} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    {item.admin1 && (
                      <Text style={styles.region}>
                        {item.admin1}, {item.country}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Estado vazio */}
          {!isLoading && showEmptyState && (
            <View style={styles.center}>
              <Ionicons name="search-outline" size={22} color="#ccc" />
              <Text style={styles.empty}>Nenhuma cidade encontrada</Text>
              <Text style={styles.helper}>Tente buscar com outro nome</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  content: {
    marginTop: 180,
    marginHorizontal: 20,
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 20,
    maxHeight: 450,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  region: {
    fontSize: 12,
    color: "#666",
  },
  center: {
    padding: 40,
    alignItems: "center",
    gap: 8,
  },
  empty: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  helper: {
    fontSize: 12,
    color: "#999",
  },
});
