import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { apiDelete, apiFetch, apiPatch, apiPost } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { MenuSection, OrderStatusValue } from "../navigation/types";

type RestaurantOrderItem = {
  id: string;
  menuItemId: string;
  quantity: number;
  priceCents: number;
  menuItem: { name: string };
};

type RestaurantOrder = {
  id: string;
  status: OrderStatusValue;
  pickupEtaMin: number;
  routeOrigin: string;
  routeDestination: string;
  totalCents: number;
  createdAt: string;
  customer: { id: string; name: string };
  items: RestaurantOrderItem[];
};

const STATUS_LABELS: Record<OrderStatusValue, string> = {
  PENDING: "Pending",
  PREPARING: "Processing",
  READY: "Ready",
  COMPLETED: "Done",
  CANCELED: "Canceled"
};

const ORDER_ACTIONS: Partial<
  Record<
    OrderStatusValue,
    Array<{
      label: string;
      target: OrderStatusValue;
      tone?: "primary" | "danger";
    }>
  >
> = {
  PENDING: [
    { label: "Start Processing", target: "PREPARING", tone: "primary" },
    { label: "Cancel Order", target: "CANCELED", tone: "danger" }
  ],
  PREPARING: [
    { label: "Mark Ready", target: "READY", tone: "primary" },
    { label: "Cancel Order", target: "CANCELED", tone: "danger" }
  ],
  READY: [
    { label: "Mark Done", target: "COMPLETED", tone: "primary" },
    { label: "Cancel Order", target: "CANCELED", tone: "danger" }
  ]
};

export const MerchantDashboardScreen = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"orders" | "menu">("orders");
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("10.00");
  const [itemSectionId, setItemSectionId] = useState<string | undefined>(undefined);

  const restaurantId = user?.restaurantId;

  const loadMenu = async () => {
    if (!restaurantId) return;
    try {
      setMenuError(null);
      setIsMenuLoading(true);
      const response = await apiFetch<{ sections: MenuSection[] }>(`/api/restaurants/${restaurantId}/menu`);
      setSections(response.sections);
      if (response.sections.length) {
        setItemSectionId(response.sections[0].id);
      }
    } catch (err) {
      setMenuError((err as Error).message);
    } finally {
      setIsMenuLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!restaurantId) return;
    try {
      setOrdersError(null);
      setIsOrdersLoading(true);
      const response = await apiFetch<{ orders: RestaurantOrder[] }>(`/api/restaurants/${restaurantId}/orders`);
      setOrders(response.orders);
    } catch (err) {
      setOrdersError((err as Error).message);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  useEffect(() => {
    void loadMenu();
    void loadOrders();
  }, [restaurantId]);

  const handleAddSection = async () => {
    if (!restaurantId || !sectionTitle.trim()) return;
    try {
      setMenuError(null);
      await apiPost(`/api/restaurants/${restaurantId}/menu/sections`, { title: sectionTitle.trim() });
      setSectionTitle("");
      await loadMenu();
    } catch (err) {
      setMenuError((err as Error).message);
    }
  };

  const handleAddItem = async () => {
    if (!restaurantId || !itemName.trim()) return;
    try {
      setMenuError(null);
      await apiPost(`/api/restaurants/${restaurantId}/menu/items`, {
        sectionId: itemSectionId ?? null,
        name: itemName.trim(),
        priceCents: Math.round(parseFloat(itemPrice) * 100)
      });
      setItemName("");
      await loadMenu();
    } catch (err) {
      setMenuError((err as Error).message);
    }
  };

  const toggleAvailability = async (itemId: string, isAvailable: boolean) => {
    if (!restaurantId) return;
    try {
      setMenuError(null);
      await apiPatch(`/api/restaurants/${restaurantId}/menu/items/${itemId}`, { isAvailable: !isAvailable });
      await loadMenu();
    } catch (err) {
      setMenuError((err as Error).message);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!restaurantId) return;
    try {
      setMenuError(null);
      await apiDelete(`/api/restaurants/${restaurantId}/menu/items/${itemId}`);
      await loadMenu();
    } catch (err) {
      setMenuError((err as Error).message);
    }
  };

  const handleOrderStatusChange = async (orderId: string, nextStatus: OrderStatusValue) => {
    if (!restaurantId) return;
    try {
      setOrdersError(null);
      await apiPatch(`/api/restaurants/${restaurantId}/orders/${orderId}`, { status: nextStatus });
      await loadOrders();
    } catch (err) {
      setOrdersError((err as Error).message);
    }
  };

  const switchTab = (tab: "orders" | "menu") => {
    setActiveTab(tab);
    if (tab === "orders") {
      void loadOrders();
    } else {
      void loadMenu();
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
      <View style={styles.tabRow}>
        <Pressable
          onPress={() => switchTab("orders")}
          style={[styles.tabButton, activeTab === "orders" && styles.tabButtonActive]}
        >
          <Text style={[styles.tabButtonText, activeTab === "orders" && styles.tabButtonTextActive]}>Orders</Text>
        </Pressable>
        <Pressable
          onPress={() => switchTab("menu")}
          style={[styles.tabButton, activeTab === "menu" && styles.tabButtonActive]}
        >
          <Text style={[styles.tabButtonText, activeTab === "menu" && styles.tabButtonTextActive]}>Menu</Text>
        </Pressable>
      </View>

      {activeTab === "orders" ? (
        <>
          {ordersError ? <Text style={styles.error}>{ordersError}</Text> : null}
          {isOrdersLoading ? <ActivityIndicator color="#2563EB" /> : null}
          {!isOrdersLoading && orders.length === 0 ? <Text style={styles.meta}>No orders yet</Text> : null}
          {orders.map((order) => {
            const actions = ORDER_ACTIONS[order.status] ?? [];
            return (
              <View key={order.id} style={styles.card}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderTitle}>Order #{order.id.slice(0, 6).toUpperCase()}</Text>
                  <View style={[styles.statusChip, styles[`statusChip${order.status}` as const]]}>
                    <Text style={styles.statusChipText}>{STATUS_LABELS[order.status]}</Text>
                  </View>
                </View>
                <Text style={styles.meta}>Customer: {order.customer.name}</Text>
                <Text style={styles.meta}>
                  Route: {order.routeOrigin} → {order.routeDestination}
                </Text>
                <Text style={styles.meta}>
                  ETA {order.pickupEtaMin} min • ${(order.totalCents / 100).toFixed(2)}
                </Text>
                <View style={styles.divider} />
                <View style={styles.orderItems}>
                  {order.items.map((item) => (
                    <Text key={item.id} style={styles.orderItemText}>
                      {item.quantity} × {item.menuItem?.name ?? "Item"}
                    </Text>
                  ))}
                </View>
                {actions.length ? (
                  <View style={styles.orderActions}>
                    {actions.map((action) => (
                      <Pressable
                        key={action.target}
                        style={[
                          styles.orderActionBtn,
                          action.tone === "danger" ? styles.orderActionBtnDanger : styles.orderActionBtnPrimary
                        ]}
                        onPress={() => handleOrderStatusChange(order.id, action.target)}
                      >
                        <Text
                          style={[
                            styles.orderActionText,
                            action.tone === "danger" ? styles.orderActionTextDanger : styles.orderActionTextPrimary
                          ]}
                        >
                          {action.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </>
      ) : (
        <>
          {menuError ? <Text style={styles.error}>{menuError}</Text> : null}
          {isMenuLoading ? <ActivityIndicator color="#2563EB" /> : null}

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
        <Pressable style={[styles.primaryBtn, styles.addItemBtn]} onPress={handleAddItem}>
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
                      <Pressable
                        style={styles.secondaryBtn}
                        onPress={() => toggleAvailability(item.id, item.isAvailable)}
                      >
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
        </>
      )}
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
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 14,
    padding: 4
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10
  },
  tabButtonActive: {
    backgroundColor: "#FFF",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  tabButtonText: { fontWeight: "600", color: "#475569" },
  tabButtonTextActive: { color: "#0F172A" },
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
  addItemBtn: {
    marginTop: 12
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  orderTitle: { fontSize: 18, fontWeight: "700" },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E2E8F0"
  },
  statusChipPENDING: { backgroundColor: "#E0F2FE" },
  statusChipPREPARING: { backgroundColor: "#FDE68A" },
  statusChipREADY: { backgroundColor: "#BBF7D0" },
  statusChipCOMPLETED: { backgroundColor: "#DCFCE7" },
  statusChipCANCELED: { backgroundColor: "#FEE2E2" },
  statusChipText: { fontWeight: "600", color: "#0F172A" },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12
  },
  orderItems: { gap: 4 },
  orderItemText: { color: "#1F2937" },
  orderActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12
  },
  orderActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  orderActionBtnPrimary: { backgroundColor: "#2563EB" },
  orderActionBtnDanger: { backgroundColor: "#FEE2E2" },
  orderActionText: { fontWeight: "600" },
  orderActionTextPrimary: { color: "#FFF" },
  orderActionTextDanger: { color: "#B91C1C" },
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
