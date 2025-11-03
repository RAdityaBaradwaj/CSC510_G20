import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { menus } from "../menus";
import type { MenuItemParam, RootStackParamList } from "../navigation/types";

type MenuScreenProps = NativeStackScreenProps<RootStackParamList, "Menu">;

export const MenuScreen = ({ route, navigation }: MenuScreenProps) => {
  const { restaurant } = route.params;
  const [cart, setCart] = useState<MenuItemParam[]>([]);

  const menuItems = useMemo(() => menus[restaurant.id] ?? [], [restaurant.id]);

  const addToCart = (item: MenuItemParam) => {
    setCart((prev) => [...prev, item]);
  };

  const goToCheckout = () => {
    navigation.navigate("Checkout", { cart, restaurant });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Menu — {restaurant.name}</Text>
      <FlatList<MenuItemParam>
        data={menuItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            {item.desc ? <Text style={styles.desc}>{item.desc}</Text> : null}
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            <Pressable style={styles.addBtn} onPress={() => addToCart(item)}>
              <Text style={styles.addText}>Add to Cart</Text>
            </Pressable>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
      {cart.length > 0 && (
        <Pressable style={styles.checkoutBtn} onPress={goToCheckout}>
          <Text style={styles.checkoutText}>Checkout ({cart.length} items)</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  listContent: { paddingBottom: 120 },
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
  desc: { color: "#475569", marginTop: 4 },
  price: { color: "#2563EB", marginTop: 6, fontWeight: "600" },
  addBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
    alignItems: "center"
  },
  addText: { color: "#FFF", fontWeight: "600" },
  checkoutBtn: {
    backgroundColor: "#16A34A",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12
  },
  checkoutText: { color: "#FFF", fontWeight: "700" }
});
