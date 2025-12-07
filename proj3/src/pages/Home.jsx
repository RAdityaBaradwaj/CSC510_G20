// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getAdminPlaceholderInfo } from "../utils/adminAuth";

const brand = "#681a75";
const brandHover = "#7B1FA2";

const btn = {
  background: brand,
  color: "#fff",
  padding: "1rem 2rem",
  borderRadius: 12,
  textDecoration: "none",
  fontSize: "1.1rem",
  display: "inline-block",
  transition: "background-color .2s ease",
  border: "none",
  outline: "none",
  boxShadow: "none",
};

export default function Home() {
  const { isAuthed } = useAuth();
  const adminInfo = getAdminPlaceholderInfo();

  return (
    <div style={{ minHeight: "100vh" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 1100,
          margin: "0 auto 24px",
          padding: "24px 24px 0",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.6rem", letterSpacing: 0.3 }}>
          NeighborhoodPool
        </h1>
      </header>

      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <h2 style={{ marginTop: 8, marginBottom: 8, fontSize: "1.4rem" }}>
          Welcome to NeighborhoodPool
        </h2>
        <p style={{ marginTop: 0, opacity: 0.9, marginBottom: "2rem" }}>
          Order from local businesses. We'll optimize delivery routes and assign drivers automatically.
        </p>

        <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
          <Link
            to="/businesses"
            style={btn}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = brandHover)
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = brand)}
          >
            Browse Businesses →
          </Link>
          
          {isAuthed && (
            <Link
              to="/orders"
              style={{ ...btn, background: "transparent", color: brand, border: `2px solid ${brand}` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = brand;
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = brand;
              }}
            >
              View My Orders →
            </Link>
          )}
        </div>

        <div style={{ 
          marginTop: "3rem", 
          padding: "20px", 
          background: "#f5f5f5", 
          borderRadius: "8px", 
          textAlign: "left",
          maxWidth: "500px",
          margin: "3rem auto 0"
        }}>
          <h3 style={{ marginTop: 0, fontSize: "1.1rem", color: "#333" }}>Admin Access</h3>
          <p style={{ fontSize: "0.9rem", color: "#666", margin: "10px 0" }}>
            {adminInfo.note}
          </p>
          <div style={{ fontSize: "0.85rem", color: "#555" }}>
            <p style={{ margin: "5px 0" }}><strong>Email:</strong> {adminInfo.email}</p>
            <p style={{ margin: "5px 0" }}><strong>Password:</strong> {adminInfo.password}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
