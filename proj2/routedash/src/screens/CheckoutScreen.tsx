import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { apiPost } from "../api/client";
import type { CartItem, RootStackParamList } from "../navigation/types";

type CheckoutScreenProps = NativeStackScreenProps<RootStackParamList, "Checkout">;

type OrderResponse = {
  order: {
    id: string;
    status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELED";
    totalCents: number;
    pickupEtaMin: number;
    routeOrigin: string;
    routeDestination: string;
    items: Array<{ id: string; menuItemId: string; quantity: number; priceCents: number; menuItem?: { name: string } }>;
  };
};

export const CheckoutScreen = ({ route, navigation }: CheckoutScreenProps) => {
  const { cart, restaurant, trip } = route.params;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCents = useMemo(
    () => cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    [cart]
  );

  const placeOrder = async () => {
    if (!cart.length || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const payload = {
        restaurantId: restaurant.id,
        pickupEtaMin: trip.pickupEtaMin,
        routeOrigin: trip.origin,
        routeDestination: trip.destination,
        items: cart.map((item) => ({ menuItemId: item.menuItemId, quantity: item.quantity }))
      };
      const response = await apiPost<OrderResponse>("/api/orders", payload);
      navigation.replace("OrderStatus", {
        order: {
          ...response.order,
          restaurant,
          items: response.order.items.map((item) => ({
            ...item,
            name: item.menuItem?.name ?? cart.find((c) => c.menuItemId === item.menuItemId)?.name ?? "Item"
          }))
        }
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Checkout — {restaurant.name}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList<CartItem>
        data={cart}
        keyExtractor={(item) => item.menuItemId}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>
              {item.quantity} × {item.name}
            </Text>
            <Text style={styles.price}>${((item.priceCents * item.quantity) / 100).toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty.</Text>}
      />
      <Text style={styles.total}>Total: ${(totalCents / 100).toFixed(2)}</Text>
      <Pressable style={[styles.orderBtn, !cart.length && styles.disabled]} onPress={placeOrder} disabled={!cart.length || isSubmitting}>
        {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.orderText}>Place Order</Text>}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  error: { color: "#B91C1C", marginBottom: 12 },
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
  orderText: { color: "#FFF", fontWeight: "700" },
  disabled: { opacity: 0.6 }
});
