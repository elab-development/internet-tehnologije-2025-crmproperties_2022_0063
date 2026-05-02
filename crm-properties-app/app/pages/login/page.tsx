"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Login stranica.
export default function LoginPage() {
  // Čuvamo email vrednost.
  const [email, setEmail] = useState("");

  // Čuvamo password vrednost.
  const [password, setPassword] = useState("");

  // Čuvamo poruku o grešci.
  const [error, setError] = useState("");

  // Čuvamo loading stanje.
  const [loading, setLoading] = useState(false);

  // Router koristimo za preusmeravanje.
  const router = useRouter();

  // Funkcija za slanje login forme.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Login failed.");
        return;
      }

      // Nakon uspešnog logina idemo na dashboard.
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
          maxWidth: "1100px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px",
          alignItems: "center",
        }}
      >
        <div style={{ color: "white" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              marginBottom: "1px",
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
              fontSize: "54px",
              fontWeight: "800",
              marginBottom: "16px",
              lineHeight: "1.1",
            }}
          >
            Smart real estate CRM
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "rgba(255,255,255,0.82)",
              maxWidth: "520px",
              lineHeight: "1.7",
            }}
          >
            A simple application for admins, managers and agents with support
            for authentication, client management, properties, interests and
            activities.
          </p>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "28px",
            padding: "32px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
          }}
        >
          <h2
            style={{
              color: "white",
              fontSize: "32px",
              fontWeight: "700",
              marginBottom: "24px",
            }}
          >
            Login
          </h2>

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
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
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
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
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
              {loading ? "Loading..." : "Login"}
            </button>
          </form>

          <p
            style={{
              marginTop: "18px",
              color: "rgba(255,255,255,0.8)",
              fontSize: "14px",
            }}
          >
            Don&apos;t have an account?{" "}
            <a
              href="/pages/register"
              style={{
                color: "#ffffff",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Register
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}