"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type NavigationProps = {
  user: {
    name: string;
    role: string;
  };
};

// Navigaciona komponenta za sve dashboard stranice.
export default function Navigation({ user }: NavigationProps) {
  // Uzimamo trenutnu putanju da bismo označili aktivan link.
  const pathname = usePathname();

  // Router koristimo za preusmeravanje nakon logout-a.
  const router = useRouter();

  // Čuvamo loading stanje za logout akciju.
  const [loading, setLoading] = useState(false);

  // Funkcija za odjavu korisnika.
  const handleLogout = async () => {
    setLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/pages/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  // Pomoćna funkcija za stil aktivnog i neaktivnog linka.
  const getLinkStyle = (path: string) => ({
    display: "block",
    padding: "12px 16px",
    borderRadius: "14px",
    background: pathname === path ? "rgba(255,140,26,0.2)" : "transparent",
    color: "white",
    textDecoration: "none",
    fontWeight: pathname === path ? "700" : "500",
    border:
      pathname === path
        ? "1px solid rgba(255,140,26,0.4)"
        : "1px solid transparent",
    transition: "0.2s ease",
  });

  return (
    <aside
      style={{
        width: "290px",
        minHeight: "100vh",
        background: "#615c5c",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <Image
              src="/images/Logo Large.png"
              alt="CRM Properties large logo"
              width={250}
              height={150}
              style={{ height: "auto", width: "auto", maxWidth: "250px" }}
              priority
            />
          </div>

          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px" }}>
            Real estate CRM dashboard.
          </p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link href="/pages/dashboard" style={getLinkStyle("/pages/dashboard")}>
            Dashboard
          </Link>

          {user.role === "ADMIN" && (
            <Link href="/pages/admin" style={getLinkStyle("/pages/admin")}>
              Admin Panel
            </Link>
          )}

          {user.role === "MANAGER" && (
            <Link href="/pages/manager" style={getLinkStyle("/pages/manager")}>
              Manager Panel
            </Link>
          )}

          {user.role === "AGENT" && (
            <>
              <Link href="/pages/agent" style={getLinkStyle("/pages/agent")}>
                Properties
              </Link>

              <Link
                href="/pages/agent/interests"
                style={getLinkStyle("/pages/agent/interests")}
              >
                Client Interests
              </Link>

              <Link
                href="/pages/agent/activities"
                style={getLinkStyle("/pages/agent/activities")}
              >
                Activities
              </Link>
            </>
          )}
        </nav>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "18px",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "6px" }}>
          Signed in as.
        </p>

        <h4
          style={{
            color: "white",
            fontSize: "18px",
            fontWeight: "700",
            marginBottom: "6px",
          }}
        >
          {user.name}
        </h4>

        <p
          style={{
            color: "#ffb15c",
            fontWeight: "700",
            marginBottom: "14px",
          }}
        >
          {user.role}
        </p>

        <button
          onClick={handleLogout}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "14px",
            border: "none",
            background: "#ffffff",
            color: "#111111",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          {loading ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}