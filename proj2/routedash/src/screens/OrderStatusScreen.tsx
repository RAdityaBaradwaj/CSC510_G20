import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { RootStackParamList } from "../navigation/types";

type OrderStatusScreenProps = NativeStackScreenProps<RootStackParamList, "OrderStatus">;

const STATUS_STEPS = [
  "Order received. Notifying the kitchen…",
  "Cooking your meal…",
  "Packing and ready for pickup!"
];

export const OrderStatusScreen = ({ route }: OrderStatusScreenProps) => {
  const { order } = route.params;
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STATUS_STEPS.slice(1).map((_, index) =>
      setTimeout(() => setStep(index + 1), (index + 1) * 3000)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order #{order.id.slice(0, 6).toUpperCase()}</Text>
      <Text style={styles.sub}>Restaurant: {order.restaurant.name}</Text>
      <Text style={styles.sub}>Pickup ETA: {order.pickupEtaMin} min</Text>
      <View style={styles.statusBox}>
        <Text style={styles.status}>{STATUS_STEPS[step]}</Text>
      </View>
      <View style={styles.orderCard}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {item.quantity} × {item.name ?? "Menu item"}
            </Text>
            <Text style={styles.itemPrice}>${((item.priceCents * item.quantity) / 100).toFixed(2)}</Text>
          </View>
        ))}
        <Text style={styles.total}>Total ${(order.totalCents / 100).toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC"
  },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  sub: { fontSize: 16, color: "#475569", marginBottom: 4 },
  statusBox: {
    padding: 20,
    backgroundColor: "#E0F2FE",
    borderRadius: 12,
    width: "80%",
    alignItems: "center"
  },
  status: { fontSize: 18, color: "#2563EB", fontWeight: "600" },
  orderCard: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },
  itemName: { color: "#0F172A" },
  itemPrice: { fontWeight: "600", color: "#2563EB" },
  total: { marginTop: 8, fontWeight: "700", textAlign: "right" }
});
