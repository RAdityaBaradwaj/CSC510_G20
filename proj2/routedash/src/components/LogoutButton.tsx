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
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  text: {
    color: "#2563EB",
    fontWeight: "600"
  }
});
