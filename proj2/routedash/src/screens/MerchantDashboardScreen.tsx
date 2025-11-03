import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { apiDelete, apiFetch, apiPatch, apiPost } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { MenuSection } from "../navigation/types";

export const MerchantDashboardScreen = () => {
  const { user, logout } = useAuth();
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("10.00");
  const [itemSectionId, setItemSectionId] = useState<string | undefined>(undefined);

  const restaurantId = user?.restaurantId;

  const loadMenu = async () => {
    if (!restaurantId) return;
    try {
      setIsLoading(true);
      const response = await apiFetch<{ sections: MenuSection[] }>(`/api/restaurants/${restaurantId}/menu`);
      setSections(response.sections);
      if (response.sections.length) {
        setItemSectionId(response.sections[0].id);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMenu();
  }, [restaurantId]);

  const handleAddSection = async () => {
    if (!restaurantId || !sectionTitle.trim()) return;
    try {
      await apiPost(`/api/restaurants/${restaurantId}/menu/sections`, { title: sectionTitle.trim() });
      setSectionTitle("");
      await loadMenu();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAddItem = async () => {
    if (!restaurantId || !itemName.trim()) return;
    try {
      await apiPost(`/api/restaurants/${restaurantId}/menu/items`, {
        sectionId: itemSectionId ?? null,
        name: itemName.trim(),
        priceCents: Math.round(parseFloat(itemPrice) * 100)
      });
      setItemName("");
      await loadMenu();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const toggleAvailability = async (itemId: string, isAvailable: boolean) => {
    if (!restaurantId) return;
    try {
      await apiPatch(`/api/restaurants/${restaurantId}/menu/items/${itemId}`, { isAvailable: !isAvailable });
      await loadMenu();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!restaurantId) return;
    try {
      await apiDelete(`/api/restaurants/${restaurantId}/menu/items/${itemId}`);
      await loadMenu();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!restaurantId) {
    return (
      <View style={styles.centered}>
        <Text>No restaurant linked to this account.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Merchant Dashboard</Text>
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoading ? <ActivityIndicator color="#2563EB" /> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add Menu Section</Text>
        <TextInput
          style={styles.input}
          placeholder="Section title (e.g., Breakfast)"
          value={sectionTitle}
          onChangeText={setSectionTitle}
        />
        <Pressable style={styles.primaryBtn} onPress={handleAddSection}>
          <Text style={styles.primaryBtnText}>Add Section</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add Menu Item</Text>
        <TextInput
          style={styles.input}
          placeholder="Item name"
          value={itemName}
          onChangeText={setItemName}
        />
        <TextInput
          style={styles.input}
          placeholder="Price (e.g., 9.99)"
          keyboardType="decimal-pad"
          value={itemPrice}
          onChangeText={setItemPrice}
        />
        <Text style={styles.label}>Section</Text>
        <FlatList
          data={sections}
          horizontal
          keyExtractor={(section) => section.id}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.pill, itemSectionId === item.id && styles.pillActive]}
              onPress={() => setItemSectionId(item.id)}
            >
              <Text style={itemSectionId === item.id ? styles.pillTextActive : styles.pillText}>{item.title}</Text>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.meta}>No sections yet</Text>}
        />
        <Pressable style={styles.primaryBtn} onPress={handleAddItem}>
          <Text style={styles.primaryBtnText}>Add Item</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Menu</Text>
        {sections.map((section) => (
          <View key={section.id} style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>{section.title}</Text>
            {section.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.meta}>${(item.priceCents / 100).toFixed(2)}</Text>
                </View>
                <View style={styles.itemActions}>
                  <Pressable style={styles.secondaryBtn} onPress={() => toggleAvailability(item.id, item.isAvailable)}>
                    <Text style={styles.secondaryText}>{item.isAvailable ? "Disable" : "Enable"}</Text>
                  </Pressable>
                  <Pressable style={styles.deleteBtn} onPress={() => removeItem(item.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    backgroundColor: "#F8FAFC",
    flexGrow: 1
  },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  header: { fontSize: 24, fontWeight: "700" },
  error: { color: "#B91C1C" },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5F5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12
  },
  label: { fontWeight: "600", marginBottom: 6 },
  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center"
  },
  primaryBtnText: { color: "#FFF", fontWeight: "700" },
  logoutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 12
  },
  logoutText: { fontWeight: "600", color: "#0F172A" },
  meta: { color: "#475569" },
  pill: {
    borderWidth: 1,
    borderColor: "#CBD5F5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8
  },
  pillActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  pillText: { color: "#0F172A" },
  pillTextActive: { color: "#FFF" },
  sectionBlock: { marginBottom: 12 },
  sectionHeading: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  itemName: { fontWeight: "600" },
  itemActions: { flexDirection: "row", gap: 8 },
  secondaryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#E0F2FE"
  },
  secondaryText: { color: "#0369A1", fontWeight: "600" },
  deleteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FEE2E2"
  },
  deleteText: { color: "#B91C1C", fontWeight: "600" }
});
