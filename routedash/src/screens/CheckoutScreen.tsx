import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { MenuItemParam, RootStackParamList } from "../navigation/types";

type CheckoutScreenProps = NativeStackScreenProps<RootStackParamList, "Checkout">;

export const CheckoutScreen = ({ route, navigation }: CheckoutScreenProps) => {
  const { cart, restaurant } = route.params;
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price, 0), [cart]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Checkout — {restaurant.name}</Text>
      <FlatList<MenuItemParam>
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty.</Text>}
      />
      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
      <Pressable
        style={styles.orderBtn}
        onPress={() => navigation.navigate("OrderStatus", { restaurant })}
        disabled={!cart.length}
      >
        <Text style={styles.orderText}>Place Order</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0"
  },
  name: { fontSize: 16, color: "#0F172A" },
  price: { fontWeight: "700", color: "#2563EB" },
  emptyText: {
    textAlign: "center",
    paddingVertical: 24,
    color: "#64748B"
  },
  total: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
    color: "#0F172A"
  },
  orderBtn: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20
  },
  orderText: { color: "#FFF", fontWeight: "700" }
});
