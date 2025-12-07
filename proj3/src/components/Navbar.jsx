import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useAuthUI } from "../auth/AuthUIContext";
import { useCart } from "../contexts/CartContext";
import { isAdmin } from "../utils/adminAuth";

const brand = "#681a75";
const brandHover = "#7B1FA2";

const btn = {
  background: brand,
  color: "#fff",
  padding: "8px 14px",
  borderRadius: 10,
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
};

export default function Navbar() {
  const location = useLocation();
  const { isAuthed, user, logout } = useAuth();
  const { openAuth } = useAuthUI();
  const { getCartItemCount } = useCart();
  const cartCount = getCartItemCount();

  return (
    <nav className="navbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px" }}>
      <h1>🏘️ NeighborhoodPool</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
        <Link to="/businesses" className={location.pathname === "/businesses" ? "active" : ""}>
          Businesses {cartCount > 0 && `(${cartCount})`}
        </Link>
        {isAuthed && (
          <>
            <Link to="/orders" className={location.pathname === "/orders" ? "active" : ""}>My Orders</Link>
            <Link to="/checkout" className={location.pathname === "/checkout" ? "active" : ""}>
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            {isAdmin(user) && (
              <Link to="/admin" className={location.pathname === "/admin" ? "active" : ""}>Admin</Link>
            )}
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {isAuthed ? (
          <>
            <span style={{ color: "#fff", opacity: 0.9 }}>
              Hi, {user?.displayName || user?.email?.split("@")[0]}
            </span>
            <button
              onClick={logout}
              style={btn}
              onMouseEnter={(e) => (e.currentTarget.style.background = brandHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = brand)}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            className="auth-btn"
            onClick={openAuth}
            style={btn}
            onMouseEnter={(e) => (e.currentTarget.style.background = brandHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = brand)}
          >
            Login / Sign up
          </button>
        )}
      </div>
    </nav>
  );
}
