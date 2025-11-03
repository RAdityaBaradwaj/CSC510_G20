import React, { useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { apiFetch } from "../api/client";
import { RestaurantSummary, RootStackParamList } from "../navigation/types";

type RestaurantsScreenProps = NativeStackScreenProps<RootStackParamList, "Restaurants">;

export const RestaurantsScreen = ({ navigation, route }: RestaurantsScreenProps) => {
  const { trip } = route.params;
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch<{ restaurants: RestaurantSummary[] }>("/api/restaurants", {
          requireAuth: false
        });
        setRestaurants(response.restaurants);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const handleOpen = (restaurant: RestaurantSummary) => {
    navigation.navigate("Menu", { restaurant, trip });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Registered Restaurants</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoading ? (
        <ActivityIndicator color="#2563EB" />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => handleOpen(item)}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.address}</Text>
              <Text style={styles.eta}>ETA goal: {trip.pickupEtaMin} min</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text>No restaurants registered yet.</Text>}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  eta: { color: "#2563EB", marginTop: 6, fontWeight: "600" },
  error: { color: "#B91C1C", marginBottom: 12 }
});
