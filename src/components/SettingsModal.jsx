// SettingsModal.js
import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";

export function SettingsModal({ visible, onClose, unit, onChangeUnit }) {
  // Estado temporário para armazenar a escolha antes de confirmar
  const [tempUnit, setTempUnit] = useState(unit);

  useEffect(() => {
    // Sempre que abrir o modal, inicializa com a unidade atual
    setTempUnit(unit);
  }, [unit, visible]);

  const handleConfirm = () => {
    onChangeUnit(tempUnit); // Aplica a unidade escolhida
    onClose(); // Fecha o modal
  };

  const handleCancel = () => {
    setTempUnit(unit); // Reseta a unidade temporária
    onClose(); // Fecha o modal
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Unidade de Temperatura</Text>

          <View style={styles.options}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                tempUnit === "celsius" && styles.optionSelected,
              ]}
              onPress={() => setTempUnit("celsius")}
            >
              <Text
                style={[
                  styles.optionText,
                  tempUnit === "celsius" && styles.optionTextSelected,
                ]}
              >
                Celsius (°C)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                tempUnit === "fahrenheit" && styles.optionSelected,
              ]}
              onPress={() => setTempUnit("fahrenheit")}
            >
              <Text
                style={[
                  styles.optionText,
                  tempUnit === "fahrenheit" && styles.optionTextSelected,
                ]}
              >
                Fahrenheit (°F)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  options: {
    width: "100%",
    marginBottom: 30,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: "#1e90ff",
    borderColor: "#1e90ff",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelText: {
    color: "#333",
    fontWeight: "bold",
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#1e90ff",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
