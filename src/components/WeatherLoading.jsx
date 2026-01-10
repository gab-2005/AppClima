/**
 * WeatherLoading
 *
 * Componente responsável por exibir o estado de carregamento do clima.
 * Ele aparece enquanto a API está sendo consultada.
 *
 * 🔗 Conexão com o Home:
 * - É renderizado quando `loading === true`
 * - Não possui estado próprio
 * - Não executa lógica nenhuma
 *
 * Responsabilidade ÚNICA:
 * 👉 Mostrar um indicador visual de carregamento
 */

import { View, ActivityIndicator, StyleSheet } from "react-native";

export function WeatherLoading() {
  return (
    <View style={styles.container}>
      {/* Spinner padrão do React Native */}
      <ActivityIndicator size="large" color="#222" />
    </View>
  );
}

const styles = StyleSheet.create({
  /**
   * Container ocupa toda a área disponível
   * e centraliza o loading na tela
   */
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
