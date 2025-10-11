import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoginScreen } from "./src/screens/LoginScreen";
import { PlannerScreen } from "./src/screens/PlannerScreen";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

export type RootStackParamList = {
  Login: undefined;
  Planner: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#F8FAFC"
  }
};

const AuthenticatedNavigator = () => (
  <Stack.Navigator initialRouteName="Planner">
    <Stack.Screen
      name="Planner"
      component={PlannerScreen}
      options={{ headerShown: false, animation: "fade_from_bottom" }}
    />
  </Stack.Navigator>
);

const PublicNavigator = () => (
  <Stack.Navigator initialRouteName="Login">
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false, animation: "fade_from_bottom" }}
    />
  </Stack.Navigator>
);

const Router = () => {
  const { isAuthenticated, isHydrating } = useAuth();

  useEffect(() => {
    // We can potentially perform analytics or warmups when auth state changes.
  }, [isAuthenticated]);

  if (isHydrating) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8FAFC"
        }}
      >
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={AppTheme}>
      {isAuthenticated ? <AuthenticatedNavigator /> : <PublicNavigator />}
    </NavigationContainer>
  );
};

const App = () => (
  <AuthProvider>
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Router />
    </SafeAreaProvider>
  </AuthProvider>
);

export default App;
