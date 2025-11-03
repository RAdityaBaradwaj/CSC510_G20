import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

const DEMO_USER = {
  email: "demo@routedash.com",
  password: "routedash123",
  name: "Taylor"
} as const;

type AuthContextValue = {
  user: { email: string; name: string } | null;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  isHydrating: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "@routedash/auth/user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const payload = await AsyncStorage.getItem(STORAGE_KEY);
        if (payload) {
          const parsed: AuthContextValue["user"] = JSON.parse(payload);
          setUser(parsed);
        }
      } catch (error) {
        console.warn("RouteDash AuthProvider: failed to read stored session", error);
      } finally {
        setIsHydrating(false);
      }
    };

    void loadSession();
  }, []);

  const login: AuthContextValue["login"] = useCallback(async ({ email, password }) => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (email.trim().toLowerCase() === DEMO_USER.email && password === DEMO_USER.password) {
      const nextUser = { email: DEMO_USER.email, name: DEMO_USER.name };
      setUser(nextUser);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      } catch (error) {
        console.warn("RouteDash AuthProvider: failed to persist session", error);
      }
      return true;
    }

    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    void AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      isHydrating
    }),
    [isHydrating, login, logout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
