import React, { createContext, useContext, useState, useCallback } from "react";
import AuthModal from "../components/auth/AuthModal";

const AuthUIContext = createContext({ openAuth: () => {}, closeAuth: () => {} });

export function AuthUIProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openAuth = useCallback(() => setOpen(true), []);
  const closeAuth = useCallback(() => setOpen(false), []);

  return (
    <AuthUIContext.Provider value={{ openAuth, closeAuth }}>
      {children}
      {/* Wrap modal here so it’s available app-wide */}
      <div id="auth-modal-root">
        <AuthModal open={open} onClose={closeAuth} />
      </div>
    </AuthUIContext.Provider>
  );
}

export function useAuthUI() {
  return useContext(AuthUIContext);
}
