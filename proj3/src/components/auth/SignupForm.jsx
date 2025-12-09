import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { prettyAuthError } from "../../auth/errorMessages";

const field = { width: "100%", padding: "12px 12px", borderRadius: 10, border: "1px solid #e6e2ea", outline: "none", background: "#fbf8ff" };
const label = { fontSize: 13, marginBottom: 6, color: "#3c2f3f", fontWeight: 600 };
const row = { display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 };
const primary = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "none", background: "#681a75", color: "#fff", fontWeight: 700, cursor: "pointer" };

export default function SignupForm({ onDone, switchToLogin, onDuplicateEmail }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await signup(form.name.trim(), form.email.trim(), form.password);
      onDone?.();
    } catch (e) {
      const message = e?.message || prettyAuthError(e?.code);
      setErr(message);
      if (message.toLowerCase().includes('already exists') && typeof switchToLogin === 'function') {
        onDuplicateEmail?.(message);
        switchToLogin();
      }
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={row}>
        <span style={label}>Full name</span>
        <input style={field} placeholder="Jane Doe" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})}/>
      </div>
      <div style={row}>
        <span style={label}>Email</span>
        <input style={field} placeholder="you@email.com" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})}/>
      </div>
      <div style={row}>
        <span style={label}>Password</span>
        <input style={field} type="password" placeholder="Minimum 6 characters" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})}/>
      </div>

      {err && <div style={{ color: "#b00020", fontSize: 13, marginBottom: 4 }}>{err}</div>}
      <button type="submit" style={primary}>Create account</button>
    </form>
  );
}
