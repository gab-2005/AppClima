import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * SearchBox
 * --------------------------------------------------
 * Input de busca de cidades.
 * NÃO possui lógica própria.
 *
 * Props:
 * - city → texto digitado
 * - onChangeCity → atualiza o estado
 * - onSearch → executa a busca
 * - onFocus / onBlur → controla overlay
 */
export function SearchBox({
  city,
  inputRef,
  onChangeCity,
  onSearch,
  onFocus,
  onBlur,
}) {
  return (
    <View style={styles.container}>
      {/* Ícone de busca */}
      <Ionicons name="search" size={20} color="#666" />

      {/* Campo de input */}
      <TextInput
        ref={inputRef}
        placeholder="Buscar cidade..."
        style={styles.input}
        value={city}
        onChangeText={onChangeCity}
        onFocus={onFocus}
        // Pequeno delay no onBlur para permitir clique nas sugestões
        onBlur={() => setTimeout(onBlur, 100)}
        blurOnSubmit={false}
      />

      {/* Botão limpar campo */}
      {city.length > 0 && (
        <TouchableOpacity onPress={() => onChangeCity("")}>
          <Ionicons name="close-circle" size={20} color="#666" />
        </TouchableOpacity>
      )}

      {/* Botão executar busca */}
      <TouchableOpacity onPress={onSearch}>
        <Ionicons name="arrow-forward" size={20} color="#333" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 20,
    zIndex: 1005,
  },
  input: {
    flex: 1,
  },
});
