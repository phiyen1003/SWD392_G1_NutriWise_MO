import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const FILTERS = ["All", "Breakfast", "Lunch", "Dinner", "Meat"];

export default function FilterBar({ selectedFilter, onFilterChange }) {
  return (
    <View style={styles.container}>
      {FILTERS.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.button,
            selectedFilter === filter && styles.selectedButton,
          ]}
          onPress={() => onFilterChange(filter)}
        >
          <Text
            style={[
              styles.text,
              selectedFilter === filter && styles.selectedText,
            ]}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
  button: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#e0e0e0" },
  selectedButton: { backgroundColor: "#4285F4" },
  text: { fontSize: 14, color: "#555" },
  selectedText: { color: "#fff", fontWeight: "bold" },
});
