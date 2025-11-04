import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import Constants from "expo-constants";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { useAuth } from "../context/AuthContext";
import type { CartItem, RootStackParamList } from "../navigation/types";

const API_URL =
  (Constants?.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  (Constants?.manifest?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  "http://localhost:4000";

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

const TAX_RATE = 0.0825;

type PaymentMethod = "card" | "apple_pay" | "arrival";
type CardDetails = { name: string; number: string; expiry: string; cvv: string };
type ApplePayCard = { id: string; label: string; last4: string };

type CheckoutPageProps = NativeStackScreenProps<RootStackParamList, "Checkout">;

type CartResponse = {
  items: CartItem[];
};

type OrderResponse = {
  order: {
    id: string;
    totalCents: number;
    pickupEtaMin: number;
    items: Array<{
      id: string;
      menuItemId: string;
      quantity: number;
      priceCents: number;
      menuItem?: { name?: string };
    }>;
  };
};

const PAYMENT_OPTIONS: Array<{ id: PaymentMethod; title: string; caption: string }> = [
  { id: "card", title: "Credit or Debit Card", caption: "Pay securely with saved cards." },
  { id: "apple_pay", title: "Apple Pay", caption: "Quick checkout with Apple Pay." },
  { id: "arrival", title: "Pay on Arrival", caption: "Pay when you pick up the order." }
];

const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const sanitizeCardNumber = (value: string) => value.replace(/\D/g, "").slice(0, 16);
const formatCardNumberDisplay = (digits: string) =>
  digits.replace(/\s+/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").trim();
const sanitizeExpiry = (value: string) => value.replace(/\D/g, "").slice(0, 4);
const formatExpiryDisplay = (digits: string) => {
  if (!digits) {
    return "";
  }
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};
const sanitizeCvv = (value: string) => value.replace(/\D/g, "").slice(0, 4);

export const CheckoutPage = ({ route, navigation }: CheckoutPageProps) => {
  const { restaurant, trip } = route.params;
  const initialCartCount = route.params.cart?.length ?? 0;
  const [cartItems, setCartItems] = useState<CartItem[]>(route.params.cart ?? []);
  const [isLoading, setIsLoading] = useState(initialCartCount === 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    name: "",
    number: "",
    expiry: "",
    cvv: ""
  });
  const [showApplePaySheet, setShowApplePaySheet] = useState(false);
  const [selectedApplePayCard, setSelectedApplePayCard] = useState<string | null>(null);
  const [applePayAuthenticated, setApplePayAuthenticated] = useState(false);

  const { user } = useAuth();

  const loadCartFromApi = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await client.get<CartResponse>("/api/cart");
      if (response.data?.items?.length) {
        setCartItems(response.data.items);
      }
    } catch (error) {
      if (!cartItems.length) {
        setFetchError((error as Error).message || "Unable to load cart items.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [cartItems.length]);

  useEffect(() => {
    if (!initialCartCount) {
      void loadCartFromApi();
    } else {
      setIsLoading(false);
    }
  }, [initialCartCount, loadCartFromApi]);

  const subtotalCents = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    [cartItems]
  );
  const taxCents = useMemo(() => Math.round(subtotalCents * TAX_RATE), [subtotalCents]);
  const totalWithTaxCents = subtotalCents + taxCents;

  const applePayCards = useMemo<ApplePayCard[]>(
    () => [
      { id: "apple-card-1", label: "Personal Visa •••• 4242", last4: "4242" },
      { id: "apple-card-2", label: "Travel Mastercard •••• 7788", last4: "7788" },
      { id: "apple-card-3", label: "Corporate Amex •••• 3005", last4: "3005" }
    ],
    []
  );
  const selectedAppleCard = useMemo(
    () => applePayCards.find((card) => card.id === selectedApplePayCard) ?? null,
    [applePayCards, selectedApplePayCard]
  );

  const isCardDetailsValid = useMemo(() => {
    const sanitizedNumber = sanitizeCardNumber(cardDetails.number);
    const sanitizedExpiryValue = sanitizeExpiry(cardDetails.expiry);
    return (
      cardDetails.name.trim().length > 1 &&
      sanitizedNumber.length >= 12 &&
      sanitizedExpiryValue.length === 4 &&
      sanitizeCvv(cardDetails.cvv).length >= 3
    );
  }, [cardDetails]);

  const isPaymentReady = useMemo(() => {
    if (!cartItems.length) {
      return false;
    }
    if (paymentMethod === "card") {
      return isCardDetailsValid;
    }
    if (paymentMethod === "apple_pay") {
      return Boolean(selectedApplePayCard) && applePayAuthenticated;
    }
    return true;
  }, [applePayAuthenticated, cartItems.length, isCardDetailsValid, paymentMethod, selectedApplePayCard]);

  const openApplePaySheet = useCallback(() => {
    setShowApplePaySheet(true);
  }, []);

  useEffect(() => {
    if (paymentMethod === "apple_pay" && !selectedApplePayCard) {
      setShowApplePaySheet(true);
    }
    if (paymentMethod !== "apple_pay") {
      setShowApplePaySheet(false);
      setSelectedApplePayCard(null);
      setApplePayAuthenticated(false);
    }
  }, [paymentMethod, selectedApplePayCard]);

  useEffect(() => {
    setSubmitError(null);
  }, [paymentMethod, cardDetails, selectedApplePayCard, applePayAuthenticated]);

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCartItems((prev) => {
      const next = prev
        .map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: Math.max(item.quantity + delta, 0) }
            : item
        )
        .filter((item) => item.quantity > 0);
      return next;
    });
  };

  const removeItem = (menuItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  };

  const handlePlaceOrder = async () => {
    if (!isPaymentReady || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const paymentDetails =
        paymentMethod === "card"
          ? {
              method: "card",
              cardholderName: cardDetails.name.trim(),
              last4: sanitizeCardNumber(cardDetails.number).slice(-4),
              expiry: formatExpiryDisplay(sanitizeExpiry(cardDetails.expiry))
            }
          : paymentMethod === "apple_pay"
            ? {
                method: "apple_pay",
                wallet: "Apple Pay",
                last4: selectedAppleCard?.last4 ?? "",
                token: `apple-pay-${selectedAppleCard?.id ?? "token"}`
              }
            : { method: "arrival" };

      const payload = {
        userId: user?.id,
        restaurantId: restaurant.id,
        items: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          priceCents: item.priceCents
        })),
        total: totalWithTaxCents / 100,
        paymentMethod,
        pickupEtaMin: trip.pickupEtaMin,
        routeOrigin: trip.origin,
        routeDestination: trip.destination,
        paymentDetails
      };

      const response = await client.post<OrderResponse>("/api/orders", payload);

      const successMessage =
        paymentMethod === "arrival"
          ? "Order placed! Pay when you pick up."
          : "Payment processed and order placed!";
      Alert.alert("Order placed", successMessage);
      navigation.replace("OrderStatus", {
        order: {
          ...response.data.order,
          subtotalCents,
          taxCents,
          totalCents: totalWithTaxCents,
          restaurant,
          items: response.data.order.items.map((item) => ({
            ...item,
            name:
              item.menuItem?.name ??
              cartItems.find((entry) => entry.menuItemId === item.menuItemId)?.name ??
              "Item"
          }))
        }
      });
    } catch (error) {
      setSubmitError((error as Error).message || "Unable to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCartContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingState}>
          <ActivityIndicator color="#2563EB" size="large" />
          <Text style={styles.loadingText}>Fetching your cart…</Text>
        </View>
      );
    }

    if (!cartItems.length) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCaption}>Add something delicious from the menu to continue.</Text>
          {fetchError ? (
            <Pressable style={styles.retryBtn} onPress={loadCartFromApi}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          ) : null}
        </View>
      );
    }

    return cartItems.map((item) => (
      <View key={item.menuItemId} style={styles.cartCard}>
        <View style={styles.cartRow}>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.priceCents)}</Text>
          </View>
          <View style={styles.quantityGroup}>
            <Pressable
              accessibilityLabel={`Decrease quantity of ${item.name}`}
              style={styles.qtyBtn}
              onPress={() => updateQuantity(item.menuItemId, -1)}
            >
              <Text style={styles.qtySymbol}>-</Text>
            </Pressable>
            <Text style={styles.qtyValue}>{item.quantity}</Text>
            <Pressable
              accessibilityLabel={`Increase quantity of ${item.name}`}
              style={styles.qtyBtn}
              onPress={() => updateQuantity(item.menuItemId, 1)}
            >
              <Text style={styles.qtySymbol}>+</Text>
            </Pressable>
          </View>
        </View>
        <Pressable style={styles.removeBtn} onPress={() => removeItem(item.menuItemId)}>
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>Checkout — {restaurant.name}</Text>
          <Text style={styles.sectionLabel}>Your Order</Text>
          {fetchError && cartItems.length ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{fetchError}</Text>
              <Pressable onPress={loadCartFromApi}>
                <Text style={styles.retryLink}>Retry</Text>
              </Pressable>
            </View>
          ) : null}
          {renderCartContent()}

          <View style={styles.summaryCard}>
            <Text style={styles.sectionLabel}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotalCents)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>{formatCurrency(taxCents)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <Text style={styles.summaryTotal}>Total</Text>
            <Text style={styles.summaryTotal}>{formatCurrency(totalWithTaxCents)}</Text>
            </View>
          </View>

          <View style={styles.paymentCard}>
            <Text style={styles.sectionLabel}>Payment Method</Text>
            {PAYMENT_OPTIONS.map((option) => {
              const isSelected = option.id === paymentMethod;
              return (
                <Pressable
                  key={option.id}
                  style={[styles.paymentOption, isSelected && styles.paymentOptionSelected]}
                  onPress={() => setPaymentMethod(option.id)}
                >
                  <View style={styles.paymentIndicatorOuter}>
                    <View
                      style={[
                        styles.paymentIndicatorInner,
                        isSelected && styles.paymentIndicatorInnerSelected
                      ]}
                    />
                  </View>
                  <View style={styles.paymentCopy}>
                    <Text style={styles.paymentTitle}>{option.title}</Text>
                    <Text style={styles.paymentCaption}>{option.caption}</Text>
                  </View>
                </Pressable>
              );
            })}

            {paymentMethod === "card" ? (
              <View style={styles.cardForm}>
                <Text style={styles.inputLabel}>Name on Card</Text>
                <TextInput
                  style={styles.input}
                  value={cardDetails.name}
                  onChangeText={(value) =>
                    setCardDetails((prev) => ({
                      ...prev,
                      name: value
                    }))
                  }
                  placeholder="Jane Doe"
                  autoCapitalize="words"
                  returnKeyType="next"
                />

                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  value={formatCardNumberDisplay(cardDetails.number)}
                  onChangeText={(value) =>
                    setCardDetails((prev) => ({
                      ...prev,
                      number: sanitizeCardNumber(value)
                    }))
                  }
                  placeholder="1234 5678 9012 3456"
                  keyboardType="number-pad"
                  maxLength={19}
                />

                <View style={styles.expiryCvvRow}>
                  <View style={styles.expiryField}>
                    <Text style={styles.inputLabel}>Expiry (MM/YY)</Text>
                    <TextInput
                      style={styles.input}
                      value={formatExpiryDisplay(cardDetails.expiry)}
                      onChangeText={(value) =>
                        setCardDetails((prev) => ({
                          ...prev,
                          expiry: sanitizeExpiry(value)
                        }))
                      }
                      placeholder="09/28"
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.cvvField}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      value={cardDetails.cvv}
                      onChangeText={(value) =>
                        setCardDetails((prev) => ({
                          ...prev,
                          cvv: sanitizeCvv(value)
                        }))
                      }
                      placeholder="123"
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={4}
                    />
                  </View>
                </View>
                {!isCardDetailsValid ? (
                  <Text style={styles.cardHelpText}>Enter full card details to continue.</Text>
                ) : null}
              </View>
            ) : null}

            {paymentMethod === "apple_pay" ? (
              <View style={styles.applePayPanel}>
                {selectedAppleCard ? (
                  <>
                    <View style={styles.applePaySummary}>
                      <Text style={styles.applePaySummaryText}>{selectedAppleCard.label}</Text>
                      <Pressable onPress={openApplePaySheet}>
                        <Text style={styles.applePayChangeBtn}>Change</Text>
                      </Pressable>
                    </View>
                    <Text
                      style={
                        applePayAuthenticated
                          ? styles.applePayAuthStatus
                          : styles.applePayAuthPending
                      }
                    >
                      {applePayAuthenticated
                        ? `Authenticated • Card ending ${selectedAppleCard.last4}`
                        : "Authenticate with Face ID / Touch ID to continue."}
                    </Text>
                    {!applePayAuthenticated ? (
                      <Pressable style={styles.applePayTriggerBtn} onPress={openApplePaySheet}>
                        <Text style={styles.applePayTriggerText}>Authenticate with Apple Pay</Text>
                      </Pressable>
                    ) : null}
                  </>
                ) : (
                  <Pressable style={styles.applePayTriggerBtn} onPress={openApplePaySheet}>
                    <Text style={styles.applePayTriggerText}>Choose Apple Pay Card</Text>
                  </Pressable>
                )}
              </View>
            ) : null}
          </View>

          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.placeOrderBtn,
            (!isPaymentReady || isSubmitting) && styles.placeOrderBtnDisabled
          ]}
          onPress={handlePlaceOrder}
          disabled={!isPaymentReady || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.placeOrderText}>
              Place Order • {formatCurrency(totalWithTaxCents)}
            </Text>
          )}
        </Pressable>
      </View>

      <Modal
        visible={showApplePaySheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowApplePaySheet(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Apple Pay</Text>
            <Text style={styles.modalCaption}>Select a card to authenticate your payment.</Text>

            {applePayCards.map((card) => {
              const isSelected = card.id === selectedApplePayCard;
              return (
                <Pressable
                  key={card.id}
                  style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                  onPress={() => {
                    setSelectedApplePayCard(card.id);
                    setApplePayAuthenticated(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{card.label}</Text>
                  {isSelected ? <Text style={styles.modalOptionBadge}>Selected</Text> : null}
                </Pressable>
              );
            })}

            <Pressable
              style={[
                styles.modalPrimaryBtn,
                !selectedApplePayCard && styles.modalPrimaryBtnDisabled
              ]}
              disabled={!selectedApplePayCard}
              onPress={() => {
                if (!selectedAppleCard) {
                  return;
                }
                setApplePayAuthenticated(true);
                setShowApplePaySheet(false);
                Alert.alert("Apple Pay", `Authenticated with card ending ${selectedAppleCard.last4}.`);
              }}
            >
              <Text style={styles.modalPrimaryText}>Authenticate & Continue</Text>
            </Pressable>
            <Pressable style={styles.modalSecondaryBtn} onPress={() => setShowApplePaySheet(false)}>
              <Text style={styles.modalSecondaryText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { padding: 16, paddingBottom: 200 },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 12, color: "#0F172A" },
  sectionLabel: { fontSize: 18, fontWeight: "600", marginBottom: 12, color: "#1E293B" },
  loadingState: {
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    paddingVertical: 40,
    alignItems: "center",
    marginBottom: 16
  },
  loadingText: { marginTop: 12, color: "#2563EB", fontWeight: "600" },
  emptyState: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A", marginBottom: 6 },
  emptyCaption: { color: "#475569", textAlign: "center", marginBottom: 16 },
  retryBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999
  },
  retryText: { color: "#FFF", fontWeight: "600" },
  cartCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12
  },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "600", color: "#0F172A" },
  itemPrice: { marginTop: 4, color: "#2563EB", fontWeight: "600" },
  quantityGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1D4ED8"
  },
  qtySymbol: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  qtyValue: { marginHorizontal: 10, fontWeight: "600", color: "#0F172A" },
  removeBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FEE2E2"
  },
  removeText: { color: "#B91C1C", fontWeight: "600" },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  summaryLabel: { color: "#475569" },
  summaryValue: { color: "#0F172A", fontWeight: "600" },
  summaryTotalRow: { marginTop: 8, borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 12 },
  summaryTotal: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  paymentCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginBottom: 10
  },
  paymentOptionSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF"
  },
  paymentIndicatorOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  paymentIndicatorInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "transparent"
  },
  paymentIndicatorInnerSelected: {
    backgroundColor: "#1D4ED8"
  },
  paymentCopy: { flex: 1 },
  paymentTitle: { fontSize: 16, fontWeight: "600", color: "#0F172A" },
  paymentCaption: { fontSize: 13, color: "#64748B", marginTop: 2 },
  cardForm: { marginTop: 12 },
  inputLabel: { fontSize: 13, color: "#475569", marginBottom: 4 },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    color: "#0F172A"
  },
  expiryCvvRow: { flexDirection: "row" },
  expiryField: { flex: 1, marginRight: 12 },
  cvvField: { width: 100 },
  cardHelpText: { fontSize: 12, color: "#B91C1C", marginTop: -4 },
  applePayPanel: {
    marginTop: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 16
  },
  applePaySummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  applePaySummaryText: { fontWeight: "600", color: "#0F172A" },
  applePayChangeBtn: { color: "#1D4ED8", fontWeight: "600" },
  applePayTriggerBtn: {
    backgroundColor: "#1D4ED8",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12
  },
  applePayTriggerText: { color: "#FFF", fontWeight: "600" },
  applePayAuthStatus: { color: "#15803D", fontWeight: "600", marginTop: 12 },
  applePayAuthPending: { color: "#B91C1C", fontWeight: "600", marginTop: 12 },
  errorBanner: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  errorText: { color: "#B91C1C", flex: 1, marginRight: 12 },
  retryLink: { color: "#1D4ED8", fontWeight: "600" },
  submitError: { color: "#B91C1C", marginTop: 16, textAlign: "center", fontWeight: "600" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderColor: "#E2E8F0"
  },
  placeOrderBtn: {
    backgroundColor: "#16A34A",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12
  },
  placeOrderBtnDisabled: { opacity: 0.6 },
  placeOrderText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  modalCaption: { color: "#475569", marginTop: 8 },
  modalOption: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12
  },
  modalOptionSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF"
  },
  modalOptionText: { color: "#0F172A", fontWeight: "600" },
  modalOptionBadge: { color: "#2563EB", fontWeight: "700" },
  modalPrimaryBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20
  },
  modalPrimaryBtnDisabled: { opacity: 0.5 },
  modalPrimaryText: { color: "#FFF", fontWeight: "700" },
  modalSecondaryBtn: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12
  },
  modalSecondaryText: { color: "#1D4ED8", fontWeight: "600" }
});
