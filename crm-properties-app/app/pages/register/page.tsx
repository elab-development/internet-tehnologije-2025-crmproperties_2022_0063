"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Register stranica.
export default function RegisterPage() {
  // Čuvamo podatke forme.
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "AGENT",
  });

  // Čuvamo grešku.
  const [error, setError] = useState("");

  // Čuvamo loading stanje.
  const [loading, setLoading] = useState(false);

  // Router koristimo za navigaciju.
  const router = useRouter();

  // Funkcija za promenu input polja.
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  // Funkcija za slanje register forme.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Registration failed.");
        return;
      }

      // Nakon uspešne registracije idemo na dashboard.
      router.push("/pages/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #292727 0%, #1a1a1a 45%, #ff8c1a 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "28px",
          padding: "32px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            marginBottom: "1px",
            alignItems: "flex-start",
          }}
        >
            <Image
              src="/images/Logo Large.png"
              alt="CRM Properties large logo"
              width={550}
              height={275}
              style={{ height: "auto", width: "auto", maxWidth: "550px" }}
              priority
            />
        </div>

        <h1
          style={{
            color: "white",
            fontSize: "34px",
            fontWeight: "800",
            marginBottom: "24px",
          }}
        >
          Create account
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                color: "white",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Full name
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                color: "white",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                color: "white",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                color: "white",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                outline: "none",
              }}
            >
              <option value="AGENT" style={{ color: "black" }}>
                Agent
              </option>
              <option value="MANAGER" style={{ color: "black" }}>
                Manager
              </option>
              <option value="ADMIN" style={{ color: "black" }}>
                Admin
              </option>
            </select>
          </div>

          {error && (
            <p
              style={{
                color: "#ffb3b3",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              border: "none",
              background: "#ffffff",
              color: "#111111",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {loading ? "Loading..." : "Register"}
          </button>
        </form>

        <p
          style={{
            marginTop: "18px",
            color: "rgba(255,255,255,0.8)",
            fontSize: "14px",
          }}
        >
          Already have an account?{" "}
          <a
            href="/pages/login"
            style={{
              color: "#ffffff",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Login
          </a>
        </p>
      </div>
    </main>
  );
}