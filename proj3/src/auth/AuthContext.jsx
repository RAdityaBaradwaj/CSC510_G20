import { createContext, useContext, useEffect, useMemo, useState } from "react";
import localAuth from "./adapters/localAuthAdapter";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const unsubscribe = localAuth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await localAuth.login(email, password);
      // If it's a mock admin login, manually trigger state update
      if (result?.user?.isAdmin) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const value = useMemo(() => ({
    user,
    isAuthed: !!user,
    login,
    signup: (n,e,p) => localAuth.signup(n,e,p),
    loginWithGoogle: localAuth.loginWithGoogle,
    logout: localAuth.logout,
    getToken: localAuth.getToken,
  }), [user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
