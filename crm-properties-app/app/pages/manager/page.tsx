"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";

type ManagerUser = {
  name: string;
  role: string;
};

type Client = {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

// Manager stranica za pregled, dodavanje i brisanje klijenata.
export default function ManagerPage() {
  // Čuvamo trenutno prijavljenog korisnika.
  const [user, setUser] = useState<ManagerUser | null>(null);

  // Čuvamo listu klijenata.
  const [clients, setClients] = useState<Client[]>([]);

  // Čuvamo loading stanje.
  const [loading, setLoading] = useState(true);

  // Čuvamo grešku.
  const [error, setError] = useState("");

  // Čuvamo stanje forme za novog klijenta.
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "ACTIVE",
  });

  // Router koristimo za preusmeravanje.
  const router = useRouter();

  // Funkcija za učitavanje svih klijenata.
  const loadClients = async () => {
    try {
      const response = await fetch("/api/clients");
      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to load clients.");
        return;
      }

      setClients(data.data);
    } catch {
      setError("Something went wrong while loading clients.");
    }
  };

  useEffect(() => {
    // Učitavamo korisnika i klijente kada se stranica otvori.
    const loadPageData = async () => {
      try {
        const meResponse = await fetch("/api/auth/me");
        const meData = await meResponse.json();

        // Ako korisnik nije prijavljen, vraćamo ga na login.
        if (!meData.success) {
          router.push("/pages/login");
          return;
        }

        // Ako korisnik nije manager, vraćamo ga na dashboard.
        if (meData.data.role !== "MANAGER") {
          router.push("/pages/dashboard");
          return;
        }

        // Čuvamo korisnika.
        setUser(meData.data);

        // Učitavamo klijente.
        const clientsResponse = await fetch("/api/clients");
        const clientsData = await clientsResponse.json();

        if (!clientsData.success) {
          setError(clientsData.message || "Failed to load clients.");
          return;
        }

        setClients(clientsData.data);
      } catch {
        setError("Something went wrong while loading the page.");
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [router]);

  // Funkcija za promenu input polja.
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  // Funkcija za dodavanje novog klijenta.
  const handleCreateClient = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to create client.");
        return;
      }

      // Resetujemo formu nakon uspešnog dodavanja.
      setForm({
        name: "",
        email: "",
        phone: "",
        status: "ACTIVE",
      });

      // Ponovo učitavamo klijente.
      await loadClients();
    } catch {
      setError("Something went wrong while creating a client.");
    }
  };

  // Funkcija za brisanje klijenta.
  const handleDeleteClient = async (id: number) => {
    setError("");

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to delete client.");
        return;
      }

      // Nakon brisanja ponovo učitavamo listu klijenata.
      await loadClients();
    } catch {
      setError("Something went wrong while deleting a client.");
    }
  };

  // Prikaz loading poruke dok traje učitavanje.
  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#111111",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "20px",
          fontWeight: "700",
        }}
      >
        Loading manager panel...
      </main>
    );
  }

  // Ako korisnik nije učitan, ne prikazujemo sadržaj.
  if (!user) {
    return null;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#111111",
      }}
    >
      <Navigation user={user} />

      <section
        style={{
          flex: 1,
          padding: "40px",
          color: "white",
        }}
      >
        <h1
          style={{
            fontSize: "40px",
            fontWeight: "800",
            marginBottom: "16px",
          }}
        >
          Manager Panel
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "18px",
            marginBottom: "28px",
          }}
        >
          Manage clients by creating, viewing and deleting them.
        </p>

        {error && (
          <p
            style={{
              color: "#ffb3b3",
              marginBottom: "20px",
              fontSize: "15px",
            }}
          >
            {error}
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1.4fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(255,140,26,0.18), rgba(255,255,255,0.04))",
              borderRadius: "24px",
              padding: "24px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "26px",
                fontWeight: "800",
                marginBottom: "18px",
              }}
            >
              Add Client.
            </h2>

            <form onSubmit={handleCreateClient}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter client name"
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

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
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
                  placeholder="Enter client email"
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

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter client phone"
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
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
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
                  <option value="ACTIVE" style={{ color: "black" }}>
                    Active
                  </option>
                  <option value="INACTIVE" style={{ color: "black" }}>
                    Inactive
                  </option>
                </select>
              </div>

              <button
                type="submit"
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
                Create Client
              </button>
            </form>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "24px",
              padding: "24px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "26px",
                fontWeight: "800",
                marginBottom: "18px",
              }}
            >
              Clients List.
            </h2>

            {clients.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.7)" }}>
                No clients available.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {clients.map((client) => (
                  <div
                    key={client.id}
                    style={{
                      padding: "18px",
                      borderRadius: "18px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          marginBottom: "6px",
                          fontSize: "20px",
                          fontWeight: "700",
                        }}
                      >
                        {client.name}
                      </h3>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.72)",
                          marginBottom: "4px",
                        }}
                      >
                        {client.email || "No email"}
                      </p>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.72)",
                          marginBottom: "4px",
                        }}
                      >
                        {client.phone}
                      </p>
                      <p
                        style={{
                          color:
                            client.status === "ACTIVE" ? "#ffb15c" : "#d1d1d1",
                          fontWeight: "700",
                        }}
                      >
                        {client.status}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: "none",
                        background: "#ffffff",
                        color: "#111111",
                        fontWeight: "700",
                        cursor: "pointer",
                        minWidth: "100px",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}