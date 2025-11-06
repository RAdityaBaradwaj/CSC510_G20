import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { apiFetch } from "../api/client";
import type {
  CartItem,
  MenuItem,
  MenuSection,
  RootStackParamList,
} from "../navigation/types";

type MenuResponse = {
  sections: Array<{
    id: string;
    title: string;
    items: Array<{
      id: string;
      name: string;
      description: string | null;
      priceCents: number;
      isAvailable: boolean;
      tags: string[];
    }>;
  }>;
};

type MenuScreenProps = NativeStackScreenProps<RootStackParamList, "Menu">;

export const MenuScreen = ({ route, navigation }: MenuScreenProps) => {
  const { restaurant, trip } = route.params;
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch<MenuResponse>(
          `/api/restaurants/${restaurant.id}/menu`,
          {
            requireAuth: false,
          },
        );
        const normalized: MenuSection[] = response.sections.map((section) => ({
          id: section.id,
          title: section.title,
          items: section.items
            .filter((item) => item.isAvailable)
            .map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              priceCents: item.priceCents,
              isAvailable: item.isAvailable,
              tags: item.tags,
            })),
        }));
        setSections(normalized);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenu().catch(() => {});
  }, [restaurant.id]);

  const itemCount = useMemo(
    () => cart.reduce((sum, entry) => sum + entry.quantity, 0),
    [cart],
  );

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.menuItemId === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.menuItemId === item.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          priceCents: item.priceCents,
          quantity: 1,
        },
      ];
    });
  };

  const goToCheckout = () => {
    navigation.navigate("Checkout", { cart, restaurant, trip });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Menu — {restaurant.name}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoading ? (
        <ActivityIndicator color="#2563EB" />
      ) : (
        <FlatList<MenuSection>
          data={sections}
          keyExtractor={(section) => section.id}
          renderItem={({ item: section }) => (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item) => (
                <View key={item.id} style={styles.card}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.desc}>{item.description}</Text>
                  ) : null}
                  <Text style={styles.price}>
                    ${(item.priceCents / 100).toFixed(2)}
                  </Text>
                  <Pressable
                    style={styles.addBtn}
                    onPress={() => addToCart(item)}
                  >
                    <Text style={styles.addText}>Add to Cart</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          ListEmptyComponent={<Text>No menu items yet.</Text>}
          contentContainerStyle={styles.listContent}
        />
      )}
      {itemCount > 0 && (
        <Pressable style={styles.checkoutBtn} onPress={goToCheckout}>
          <Text style={styles.checkoutText}>Checkout ({itemCount} items)</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  error: { color: "#B91C1C", marginBottom: 12 },
  listContent: { paddingBottom: 120 },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  name: { fontSize: 18, fontWeight: "700" },
  desc: { color: "#475569", marginTop: 4 },
  price: { color: "#2563EB", marginTop: 6, fontWeight: "600" },
  addBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
    alignItems: "center",
  },
  addText: { color: "#FFF", fontWeight: "600" },
  checkoutBtn: {
    backgroundColor: "#16A34A",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  checkoutText: { color: "#FFF", fontWeight: "700" },
});
