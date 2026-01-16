import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export function WeatherError({
  variant = "error",
  title,
  message,
  onRetry,
  showRetry = true,
}) {
  const config = {
    error: {
      icon: "alert-circle-outline",
      defaultTitle: "Algo deu errado",
      defaultMessage: "Não foi possível carregar o clima.",
    },
     location: {
      icon: "earth-off",
      defaultTitle: "Localização indisponível",
      defaultMessage:
        "Ative a localização para ver o clima exato de onde você está ou pesquise uma cidade.",
    },
   
    empty: {
      icon: "weather-cloudy",
      defaultTitle: "Nenhuma informação",
      defaultMessage: "Busque uma cidade para começar.",
    },
  };

  const current = config[variant] || config.error;

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={current.icon}
        size={80}
        color="#999"
        style={styles.icon}
      />

      <Text style={styles.title}>
        {title || current.defaultTitle}
      </Text>

      <Text style={styles.text}>
        {message || current.defaultMessage}
      </Text>

      {showRetry && onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Tentar novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  icon: {
    marginBottom: 16,
    opacity: 0.8,
  },

  title: {
    fontSize: 25,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    color: "#222",
  },

  text: {
    fontSize: 15,
    textAlign: "center",
    color: "#666",
    lineHeight: 20,
    marginBottom: 20,
  },

  button: {
    marginTop: 8,
    backgroundColor: "#000000ff",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

