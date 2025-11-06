import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { useAuth } from "../context/AuthContext";

export const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <Pressable onPress={logout} style={styles.button} hitSlop={8}>
      <Text style={styles.text}>Logout</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#E0E7FF"
  },
  text: {
    color: "#1E3A8A",
    fontWeight: "600"
  }
});
