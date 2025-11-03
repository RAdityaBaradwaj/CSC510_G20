import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../navigation/types";
import { restaurants } from "../restaurants";

type Navigation = NativeStackNavigationProp<RootStackParamList, "Restaurants">;

export const RestaurantsScreen = () => {
  const navigation = useNavigation<Navigation>();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Restaurants Along Your Route</Text>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => {
              navigation.navigate("Menu", { restaurant: item });
              console.log("hello");
            }}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.cuisine} • {item.priceLevel} • {item.rating}
            </Text>
            <Text style={styles.eta}>ETA: {item.etaMinutes} min</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  listContent: { paddingBottom: 32 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  name: { fontSize: 18, fontWeight: "700" },
  meta: { color: "#475569", marginTop: 4 },
  eta: { color: "#2563EB", marginTop: 6, fontWeight: "600" }
});
