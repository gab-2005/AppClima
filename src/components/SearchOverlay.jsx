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
    <Animated.View style={[styles.overlayWrapper, { opacity: overlayOpacity }]}>
      <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <Animated.View
        style={[
          styles.overlayContent,
          { transform: [{ scale: suggestionsScale }] },
        ]}
      >
        <View style={styles.suggestionsContainer}>
          {/* RECENTES */}
          {showRecentCities && (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {recentCities.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => onSelectSuggestion(item)}
                >
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestionName}>{item.name}</Text>
                    <Text style={styles.suggestionRegion}>
                      {item.admin1}, {item.country}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* LOADING */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#666" />
              <Text style={styles.loadingText}>Buscando cidades...</Text>
            </View>
          )}

          {/* SUGESTÕES */}
          {!isLoading && citySuggestions.length > 0 && (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {citySuggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => onSelectSuggestion(item)}
                >
                  <Ionicons name="location-outline" size={20} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestionName}>{item.name}</Text>
                    {item.admin1 && (
                      <Text style={styles.suggestionRegion}>
                        {item.admin1}, {item.country}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* EMPTY */}
          {!isLoading && showEmptyState && (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={20} color="#ccc" />
              <Text style={styles.emptyText}>Nenhuma cidade encontrada</Text>
              <Text style={styles.emptySubtext}>
                Tente buscar com outro nome
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlayWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  overlayContent: {
    marginTop: 180,
    marginHorizontal: 20,
  },
  suggestionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    maxHeight: 450,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  suggestionRegion: {
    fontSize: 12,
    color: "#666",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    gap: 10,
  },
  
  loadingText: {
    color: "#666",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    gap: 6,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  emptySubtext: {
    fontSize: 12,
    color: "#999",
  },
});
