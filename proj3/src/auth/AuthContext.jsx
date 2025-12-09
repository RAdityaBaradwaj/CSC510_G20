import { createContext, useContext, useEffect, useMemo, useState } from "react";
import backendAuth from "./adapters/backendAuthAdapter";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const unsubscribe = backendAuth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await backendAuth.login(email, password);
      if (result?.user) setUser(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const value = useMemo(() => ({
    user,
    isAuthed: !!user,
    login,
    signup: (n,e,p) => backendAuth.signup(n,e,p),
    loginWithGoogle: backendAuth.loginWithGoogle,
    logout: backendAuth.logout,
    getToken: backendAuth.getToken,
  }), [user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
