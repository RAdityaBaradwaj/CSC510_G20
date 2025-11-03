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

const INITIAL_FORM = {
  email: "demo@routedash.com",
  password: "routedash123"
};

export const LoginScreen = () => {
  const { login } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: "email" | "password", value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const ok = await login(form);
    setIsSubmitting(false);

    if (!ok) {
      setError("We couldn't verify those credentials. Use the demo account above to preview the app.");
    }
  };

  const canSubmit = Boolean(form.email.trim()) && Boolean(form.password.trim()) && !isSubmitting;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 72 : 0}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to RouteDash</Text>
          <Text style={styles.subtitle}>
            Route-aware pickup planning so your meal is hot, fresh, and ready when you arrive.
          </Text>

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

          <View style={styles.demoCallout}>
            <Text style={styles.demoTitle}>Demo access</Text>
            <Text style={styles.demoBody}>
              Use demo@routedash.com with password routedash123 to preview the RouteDash trip planner.
            </Text>
          </View>
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
