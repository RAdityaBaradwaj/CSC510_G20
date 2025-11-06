import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";

import { apiFetch } from "../api/client";
import type { OrderSummary, OrderStatusValue, RootStackParamList } from "../navigation/types";

type OrdersScreenProps = NativeStackScreenProps<RootStackParamList, "Orders">;

type OrdersResponse = {
  orders: Array<
    OrderSummary & {
      status: OrderStatusValue;
      createdAt?: string;
      items: Array<OrderSummary["items"][number] & { menuItem?: { name?: string | null } }>;
    }
  >;
};

type OrderListItem = OrderSummary & { createdAt?: string };

const STATUS_LABELS: Record<OrderStatusValue, string> = {
  PENDING: "Pending",
  PREPARING: "Processing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELED: "Canceled"
};

const STATUS_COLORS: Record<OrderStatusValue, string> = {
  PENDING: "#DBEAFE",
  PREPARING: "#FDE68A",
  READY: "#BBF7D0",
  COMPLETED: "#DCFCE7",
  CANCELED: "#FEE2E2"
};

export const OrdersScreen = ({ navigation }: OrdersScreenProps) => {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setIsLoading(true);
    }
    try {
      setError(null);
      const response = await apiFetch<OrdersResponse>("/api/orders");
      const normalized = response.orders.map((order) => ({
        ...order,
        items: order.items.map((item) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          priceCents: item.priceCents,
          name: item.menuItem?.name ?? item.name ?? "Item"
        }))
      }));
      setOrders(normalized);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadOrders(true);
    }, [loadOrders])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    void loadOrders();
  }, [loadOrders]);

  const handleViewOrder = useCallback(
    (order: OrderListItem) => {
      navigation.navigate("OrderStatus", { order });
    },
    [navigation]
  );

  const renderOrder = ({ item }: { item: OrderListItem }) => {
    const createdLabel = item.createdAt
      ? new Date(item.createdAt).toLocaleString()
      : undefined;
    return (
      <Pressable style={styles.card} onPress={() => handleViewOrder(item)}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.restaurant}>{item.restaurant.name}</Text>
            <Text style={styles.subMeta}>{item.routeOrigin} → {item.routeDestination}</Text>
            {createdLabel ? <Text style={styles.subMeta}>{createdLabel}</Text> : null}
          </View>
          <View style={[styles.statusChip, { backgroundColor: STATUS_COLORS[item.status] }] }>
            <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items</Text>
          <Text style={styles.summaryValue}>{item.items.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryAmount}>${(item.totalCents / 100).toFixed(2)}</Text>
        </View>
        <Text style={styles.cta}>View status</Text>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#2563EB" size="large" />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={orders.length ? styles.listContent : styles.emptyContent}
      data={orders}
      keyExtractor={(order) => order.id}
      renderItem={renderOrder}
      refreshControl={<RefreshControl tintColor="#2563EB" refreshing={isRefreshing} onRefresh={handleRefresh} />}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          {error ? <Text style={styles.errorText}>{error}</Text> : <Text style={styles.emptyText}>No orders yet. Place your first order to see it here.</Text>}
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC"
  },
  listContent: {
    padding: 16,
    gap: 16,
    backgroundColor: "#F8FAFC"
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#F8FAFC"
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    gap: 12
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },
  cardInfo: {
    flex: 1,
    gap: 4
  },
  restaurant: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  subMeta: { color: "#475569", fontSize: 13 },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: "flex-start"
  },
  statusText: { fontWeight: "600", color: "#0F172A" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  summaryLabel: { color: "#475569" },
  summaryValue: { fontWeight: "600", color: "#1E293B" },
  summaryAmount: { fontWeight: "700", color: "#0F172A" },
  cta: { color: "#2563EB", fontWeight: "600" },
  emptyState: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  emptyText: { color: "#475569", textAlign: "center" },
  errorText: { color: "#B91C1C", textAlign: "center" }
});
