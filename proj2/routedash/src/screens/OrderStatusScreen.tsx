import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { apiFetch } from "../api/client";
import type {
  OrderSummary,
  OrderStatusValue,
  RootStackParamList,
} from "../navigation/types";

type OrderStatusScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "OrderStatus"
>;

type ApiOrderResponse = {
  order: Omit<OrderSummary, "items"> & {
    items: Array<{
      id: string;
      menuItemId: string;
      quantity: number;
      priceCents: number;
      name?: string;
      menuItem?: { name?: string | null };
    }>;
  };
};

const STATUS_MESSAGES: Record<OrderStatusValue, string> = {
  PENDING: "Order received. Notifying the kitchen…",
  PREPARING: "Cooking your meal…",
  READY: "Packing and ready for pickup!",
  COMPLETED: "Order completed. Enjoy your meal!",
  CANCELED: "The restaurant canceled this order.",
};

const STATUS_LABELS: Record<OrderStatusValue, string> = {
  PENDING: "Pending",
  PREPARING: "Processing",
  READY: "Ready",
  COMPLETED: "Done",
  CANCELED: "Canceled",
};

const STATUS_PROGRESS: Record<OrderStatusValue, number> = {
  PENDING: 0,
  PREPARING: 1,
  READY: 2,
  COMPLETED: 2,
  CANCELED: 0,
};

const FINAL_STATUSES: OrderStatusValue[] = ["COMPLETED", "CANCELED"];

const STATUS_CHIP_KEYS = {
  PENDING: "statusChipPENDING",
  PREPARING: "statusChipPREPARING",
  READY: "statusChipREADY",
  COMPLETED: "statusChipCOMPLETED",
  CANCELED: "statusChipCANCELED",
} as const;

const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export const OrderStatusScreen = ({ route }: OrderStatusScreenProps) => {
  const { order: initialOrder } = route.params;
  const [order, setOrder] = useState<OrderSummary>(initialOrder);
  const [error, setError] = useState<string | null>(null);
  const initialOrderRef = useRef(initialOrder);

  useEffect(() => {
    initialOrderRef.current = initialOrder;
    setOrder(initialOrder);
  }, [initialOrder]);

  useEffect(() => {
    let isMounted = true;
    let pollId: ReturnType<typeof setInterval> | undefined;

    const fetchOrder = async () => {
      try {
        const response = await apiFetch<ApiOrderResponse>(
          `/api/orders/${initialOrderRef.current.id}`,
        );

        if (!isMounted) {
          return;
        }

        setOrder((previous) => {
          const fallback = previous ?? initialOrderRef.current;
          const next = response.order;

          return {
            ...fallback,
            ...next,
            restaurant: {
              ...fallback.restaurant,
              ...next.restaurant,
            },
            items: next.items.map((item) => ({
              ...item,
              name:
                item.name ??
                item.menuItem?.name ??
                fallback.items.find(
                  (existing) => existing.menuItemId === item.menuItemId,
                )?.name ??
                "Item",
            })),
          };
        });
        setError(null);

        if (FINAL_STATUSES.includes(response.order.status) && pollId) {
          clearInterval(pollId);
          pollId = undefined;
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message);
        }
      }
    };

    fetchOrder().catch(() => {});
    pollId = setInterval(fetchOrder, 5000);

    return () => {
      isMounted = false;
      if (pollId) {
        clearInterval(pollId);
      }
    };
  }, []);

  const subtotalCents =
    order.subtotalCents ??
    order.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const inferredTax =
    order.taxCents ?? Math.max(order.totalCents - subtotalCents, 0);
  const totalCents = order.totalCents ?? subtotalCents + inferredTax;

  const statusMessage = STATUS_MESSAGES[order.status];
  const statusLabel = STATUS_LABELS[order.status];
  const step = STATUS_PROGRESS[order.status];
  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Order #{order.id.slice(0, 6).toUpperCase()}
      </Text>
      <Text style={styles.sub}>Restaurant: {order.restaurant.name}</Text>
      <Text style={styles.sub}>Pickup ETA: {order.pickupEtaMin} min</Text>
      <Text style={styles.sub}>
        Route: {order.routeOrigin} → {order.routeDestination}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.statusBox}>
        <View style={styles.statusHeader}>
          <Text style={styles.status}>{statusMessage}</Text>
          <View
            style={[styles.statusChip, styles[STATUS_CHIP_KEYS[order.status]]]}
          >
            <Text style={styles.statusChipText}>{statusLabel}</Text>
          </View>
        </View>
        {order.status !== "CANCELED" ? (
          <Text style={styles.statusStep}>
            Step {Math.min(step + 1, 3)} of 3
          </Text>
        ) : null}
      </View>
      <View style={styles.orderCard}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {item.quantity} × {item.name ?? "Menu item"}
            </Text>
            <Text style={styles.itemPrice}>
              {formatCurrency(item.priceCents * item.quantity)}
            </Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(subtotalCents)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>{formatCurrency(inferredTax)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotalRow]}>
          <Text style={styles.summaryTotal}>Total</Text>
          <Text style={styles.summaryTotal}>{formatCurrency(totalCents)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  sub: { fontSize: 16, color: "#475569", marginBottom: 4 },
  error: { color: "#B91C1C", marginBottom: 12 },
  statusBox: {
    padding: 20,
    backgroundColor: "#E0F2FE",
    borderRadius: 12,
    width: "85%",
    alignSelf: "center",
    gap: 8,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  status: { flex: 1, fontSize: 18, color: "#0F172A", fontWeight: "700" },
  statusStep: { color: "#475569", fontWeight: "600" },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  statusChipPENDING: { backgroundColor: "#DBEAFE" },
  statusChipPREPARING: { backgroundColor: "#FDE68A" },
  statusChipREADY: { backgroundColor: "#BBF7D0" },
  statusChipCOMPLETED: { backgroundColor: "#DCFCE7" },
  statusChipCANCELED: { backgroundColor: "#FEE2E2" },
  statusChipText: { fontWeight: "600", color: "#0F172A" },
  orderCard: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemName: { color: "#0F172A" },
  itemPrice: { fontWeight: "600", color: "#2563EB" },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: { color: "#475569" },
  summaryValue: { color: "#0F172A", fontWeight: "600" },
  summaryTotalRow: { marginTop: 6 },
  summaryTotal: { fontWeight: "700", color: "#0F172A" },
});
