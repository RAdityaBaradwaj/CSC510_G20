import { createContext, useContext, useEffect, useMemo, useState } from "react";
import firebaseAuth from "./adapters/firebaseAdapter";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await firebaseAuth.login(email, password);
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
    signup: (n,e,p) => firebaseAuth.signup(n,e,p),
    loginWithGoogle: firebaseAuth.loginWithGoogle,
    logout: firebaseAuth.logout,
    getToken: firebaseAuth.getToken,
  }), [user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
