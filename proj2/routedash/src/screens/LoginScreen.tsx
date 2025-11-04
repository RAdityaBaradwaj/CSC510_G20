import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";

type Mode = "login" | "register";
type Role = "CUSTOMER" | "RESTAURANT";

const INITIAL_FORM = {
  name: "",
  email: "customer@example.com",
  password: "password123!",
  restaurantName: "",
  address: ""
};

export const LoginScreen = () => {
  const { login, registerCustomer, registerRestaurant } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof typeof INITIAL_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else if (role === "CUSTOMER") {
        await registerCustomer({ name: form.name || "Traveler", email: form.email, password: form.password });
      } else {
        await registerRestaurant({
          name: form.name || "Owner",
          email: form.email,
          password: form.password,
          restaurantName: form.restaurantName || "RouteDash Kitchen",
          address: form.address || "123 Main St"
        });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    Boolean(form.email.trim()) &&
    Boolean(form.password.trim()) &&
    (mode === "login" || (role === "CUSTOMER" ? Boolean((form.name || form.email).trim()) : Boolean(form.restaurantName.trim()))) &&
    !isSubmitting;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 72 : 0}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to RouteDash</Text>
          <Text style={styles.subtitle}>{mode === "login" ? "Sign in to plan your route or manage your restaurant." : "Create an account to start ordering or managing menus."}</Text>

          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleButton, mode === "login" && styles.toggleActive]}
              onPress={() => setMode("login")}
            >
              <Text style={mode === "login" ? styles.toggleTextActive : styles.toggleText}>Login</Text>
            </Pressable>
            <Pressable
              style={[styles.toggleButton, mode === "register" && styles.toggleActive]}
              onPress={() => setMode("register")}
            >
              <Text style={mode === "register" ? styles.toggleTextActive : styles.toggleText}>Register</Text>
            </Pressable>
          </View>

          {mode === "register" && (
            <View style={styles.toggleRow}>
              <Pressable
                style={[styles.toggleButton, role === "CUSTOMER" && styles.toggleActive]}
                onPress={() => setRole("CUSTOMER")}
              >
                <Text style={role === "CUSTOMER" ? styles.toggleTextActive : styles.toggleText}>Customer</Text>
              </Pressable>
              <Pressable
                style={[styles.toggleButton, role === "RESTAURANT" && styles.toggleActive]}
                onPress={() => setRole("RESTAURANT")}
              >
                <Text style={role === "RESTAURANT" ? styles.toggleTextActive : styles.toggleText}>Restaurant</Text>
              </Pressable>
            </View>
          )}

          {mode === "register" && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>{role === "RESTAURANT" ? "Owner name" : "Name"}</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                autoCapitalize="words"
                placeholder="Taylor Jordan"
                onChangeText={(value) => handleChange("name", value)}
              />
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              onChangeText={(value) => handleChange("email", value)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={form.password}
              secureTextEntry
              placeholder="••••••••"
              onChangeText={(value) => handleChange("password", value)}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryButton,
              !canSubmit && styles.disabledButton,
              pressed && canSubmit ? styles.primaryButtonPressed : null
            ]}
            disabled={!canSubmit}
            onPress={handleSubmit}
          >
            {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Continue</Text>}
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {mode === "register" && role === "RESTAURANT" && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Restaurant name</Text>
                <TextInput
                  style={styles.input}
                  value={form.restaurantName}
                  placeholder="RouteDash Kitchen"
                  onChangeText={(value) => handleChange("restaurantName", value)}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Restaurant address</Text>
                <TextInput
                  style={styles.input}
                  value={form.address}
                  placeholder="123 Main St, Raleigh NC"
                  onChangeText={(value) => handleChange("address", value)}
                />
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E0F2FE"
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center"
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    shadowColor: "#0f172a",
    shadowOpacity: 0.12,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 28,
    lineHeight: 22
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16
  },
  toggleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5F5",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center"
  },
  toggleActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB"
  },
  toggleText: { color: "#0F172A", fontWeight: "600" },
  toggleTextActive: { color: "#FFF", fontWeight: "700" },
  formGroup: {
    marginBottom: 18
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5f5",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: Platform.select({ ios: 16, android: 12 }),
    fontSize: 16,
    color: "#0f172a"
  },
  primaryButton: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButtonPressed: {
    opacity: 0.85
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  },
  disabledButton: {
    opacity: 0.6
  },
  error: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    fontSize: 14,
    lineHeight: 20
  },
  demoCallout: {
    marginTop: 24,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#EFF6FF"
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1d4ed8",
    marginBottom: 6
  },
  demoBody: {
    fontSize: 14,
    lineHeight: 20,
    color: "#1e293b"
  }
});
