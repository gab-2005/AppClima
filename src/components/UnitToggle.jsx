// ========================= IMPORTS =========================
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";

// ========================= COMPONENT =========================
// Componente responsável por alternar a unidade de temperatura (°C / °F)
//
// USO NO HOME:
// - Recebe o estado `unit` vindo do Home
// - Recebe a função `onChange`, que atualiza esse estado no Home
// - Não possui estado próprio de unidade, apenas reflete o estado global
export function UnitToggle({ unit, onChange }) {

  // Valor animado responsável pelo deslocamento do botão
  // A posição inicial depende da unidade atual vinda do Home
  const translateX = useRef(
    new Animated.Value(unit === "celsius" ? 0 : 20)
  ).current;

  // ========================= EFFECT =========================
  // Sempre que a unidade mudar no Home,
  // essa animação é disparada para mover o botão
  useEffect(() => {
    Animated.timing(translateX, {
      toValue: unit === "celsius" ? 0 : 16,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [unit]);

  // ========================= RENDER =========================
  return (
    <Pressable
      style={styles.container}

      // Ao pressionar, apenas informa ao Home
      // qual unidade deve ser ativada
      onPress={() =>
        onChange(unit === "celsius" ? "fahrenheit" : "celsius")
      }
    >
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.thumb,
            { transform: [{ translateX }] },
          ]}
        >
          <Text style={styles.thumbText}>
            {unit === "celsius" ? "°C" : "°F"}
          </Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

// ========================= STYLES =========================
const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Fundo do toggle
  track: {
    width: 40,
    height: 20,
    borderRadius: 22,
    backgroundColor: "#b8b8b8ff",
    justifyContent: "center",
  },

  // Botão animado que desliza
  thumb: {
    width: 25,
    height: 25,
    borderRadius: 20,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },

  // Texto da unidade (°C / °F)
  thumbText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ff7b00ff",
    start: -2,
  },
});
