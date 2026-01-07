import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function SearchBox({
  city,
  inputRef,
  onChangeCity,
  onSearch,
  onFocus,
  onBlur,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 20,
        marginVertical: 20,
        borderRadius: 20,
        backgroundColor: "#fff",
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 5,
        zIndex: 1005,
      }}
    >
      <Ionicons name="search" size={20} color="#666" />

      <TextInput
        ref={inputRef}
        placeholder="Buscar cidade..."
        style={{ flex: 1 }}
        value={city}
        onChangeText={onChangeCity}
        onFocus={onFocus}
        onBlur={onBlur}
        blurOnSubmit={false}
      />

      {city.length > 0 && (
        <TouchableOpacity onPress={() => onChangeCity("")}>
          <Ionicons name="close-circle" size={20} color="#666" />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onSearch}>
        <Ionicons name="arrow-forward" size={20} color="#333" />
      </TouchableOpacity>
    </View>
  );
}
