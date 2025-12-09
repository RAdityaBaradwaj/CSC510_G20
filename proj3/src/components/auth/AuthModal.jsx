import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
};

const card = {
  width: 420, background: "#fff", borderRadius: 12, boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
  padding: "22px 22px 18px", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
};

const tabRow = { display: "flex", gap: 8, marginBottom: 16 };
const tabBtn = (active) => ({
  flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #e6e2ea",
  background: active ? "#681a75" : "#f7f4f9", color: active ? "#fff" : "#3c2f3f",
  fontWeight: 600, cursor: "pointer",
});

export default function AuthModal({ open, onClose, defaultTab = "login" }) {
  const [tab, setTab] = useState(defaultTab);
  const [loginError, setLoginError] = useState("");
  useEffect(() => { if (open) setTab(defaultTab); }, [open, defaultTab]);
  if (!open) return null;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={tabRow}>
          <button style={tabBtn(tab === "login")} onClick={() => setTab("login")}>Login</button>
          <button style={tabBtn(tab === "signup")} onClick={() => setTab("signup")}>Sign up</button>
        </div>
        {tab === "login" ? (
          <LoginForm onDone={onClose} initialError={loginError}/>
        ) : (
          <SignupForm
            onDone={onClose}
            switchToLogin={() => setTab("login")}
            onDuplicateEmail={(msg) => setLoginError(msg || "Email already exists. Please log in.")}
          />
        )}
        <button
          onClick={onClose}
          style={{ marginTop: 14, background: "transparent", border: "none", color: "#6b6b6b", cursor: "pointer" }}
        >Close</button>
      </div>
    </div>
  );
}
