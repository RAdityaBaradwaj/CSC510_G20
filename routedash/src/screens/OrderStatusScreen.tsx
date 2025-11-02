import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "../navigation/types";

type OrderStatusScreenProps = NativeStackScreenProps<RootStackParamList, "OrderStatus">;

export const OrderStatusScreen = ({ route }: OrderStatusScreenProps) => {
  const { restaurant } = route.params;
  const [status, setStatus] = useState("Preparing your order...");

  useEffect(() => {
    const timer1 = setTimeout(() => setStatus("Cooking your meal..."), 3000);
    const timer2 = setTimeout(() => setStatus("Packing and ready for pickup!"), 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order Status</Text>
      <Text style={styles.sub}>Restaurant: {restaurant.name}</Text>
      <View style={styles.statusBox}>
        <Text style={styles.status}>{status}</Text>
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
  sub: { fontSize: 16, color: "#475569", marginBottom: 24 },
  statusBox: {
    padding: 20,
    backgroundColor: "#E0F2FE",
    borderRadius: 12,
    width: "80%",
    alignItems: "center"
  },
  status: { fontSize: 18, color: "#2563EB", fontWeight: "600" }
});
