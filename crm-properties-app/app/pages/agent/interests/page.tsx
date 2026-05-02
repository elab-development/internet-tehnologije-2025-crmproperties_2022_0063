"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";

type AgentUser = {
  name: string;
  role: string;
};

type Client = {
  id: number;
  name: string;
};

type Property = {
  id: number;
  title: string;
};

type Interest = {
  id: number;
  status: "NEW" | "CONTACTED" | "VIEWING_SCHEDULED" | "CLOSED";
  note: string | null;
  client: {
    id: number;
    name: string;
  };
  property: {
    id: number;
    title: string;
    city: string;
    address: string;
  };
  createdAt: string;
};

type InterestForm = {
  clientId: string;
  propertyId: string;
  status: "NEW" | "CONTACTED" | "VIEWING_SCHEDULED" | "CLOSED";
  note: string;
};

// Početno stanje forme za interesovanje.
const initialForm: InterestForm = {
  clientId: "",
  propertyId: "",
  status: "NEW",
  note: "",
};

// Agent interests stranica.
export default function AgentInterestsPage() {
  // Čuvamo trenutno prijavljenog korisnika.
  const [user, setUser] = useState<AgentUser | null>(null);

  // Čuvamo sva interesovanja.
  const [interests, setInterests] = useState<Interest[]>([]);

  // Čuvamo listu klijenata za select polje.
  const [clients, setClients] = useState<Client[]>([]);

  // Čuvamo listu nekretnina za select polje.
  const [properties, setProperties] = useState<Property[]>([]);

  // Čuvamo stanje forme.
  const [form, setForm] = useState<InterestForm>(initialForm);

  // Čuvamo loading stanje.
  const [loading, setLoading] = useState(true);

  // Čuvamo grešku.
  const [error, setError] = useState("");

  // Čuvamo da li je forma otvorena.
  const [showForm, setShowForm] = useState(false);

  // Router koristimo za navigaciju.
  const router = useRouter();

  // Funkcija za učitavanje interesovanja.
  const loadInterests = async () => {
    try {
      const response = await fetch("/api/interests");
      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to load interests.");
        return;
      }

      setInterests(data.data);
    } catch {
      setError("Something went wrong while loading interests.");
    }
  };

  // Funkcija za učitavanje klijenata.
  const loadClients = async () => {
    const response = await fetch("/api/clients");
    const data = await response.json();

    if (data.success) {
      setClients(data.data);
    }
  };

  // Funkcija za učitavanje nekretnina.
  const loadProperties = async () => {
    const response = await fetch("/api/properties");
    const data = await response.json();

    if (data.success) {
      setProperties(data.data);
    }
  };

  useEffect(() => {
    // Učitavamo korisnika i podatke stranice.
    const loadPageData = async () => {
      try {
        const meResponse = await fetch("/api/auth/me");
        const meData = await meResponse.json();

        // Ako korisnik nije prijavljen, vraćamo ga na login.
        if (!meData.success) {
          router.push("/pages/login");
          return;
        }

        // Ako korisnik nije agent, vraćamo ga na dashboard.
        if (meData.data.role !== "AGENT") {
          router.push("/pages/dashboard");
          return;
        }

        // Čuvamo korisnika.
        setUser(meData.data);

        // Paralelno učitavamo sve potrebne podatke.
        await Promise.all([loadInterests(), loadClients(), loadProperties()]);
      } catch {
        setError("Something went wrong while loading the page.");
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [router]);

  // Funkcija za promenu input/select/textarea polja.
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  // Funkcija za reset forme.
  const resetForm = () => {
    setForm(initialForm);
    setShowForm(false);
  };

  // Funkcija za kreiranje interesovanja.
  const handleCreateInterest = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/interests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: Number(form.clientId),
          propertyId: Number(form.propertyId),
          status: form.status,
          note: form.note,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to create interest.");
        return;
      }

      // Resetujemo formu i ponovo učitavamo interesovanja.
      resetForm();
      await loadInterests();
    } catch {
      setError("Something went wrong while creating the interest.");
    }
  };

  // Funkcija za ažuriranje statusa interesovanja.
  const handleStatusChange = async (
    interestId: number,
    newStatus: "NEW" | "CONTACTED" | "VIEWING_SCHEDULED" | "CLOSED",
    currentNote: string | null
  ) => {
    setError("");

    try {
      const response = await fetch(`/api/interests/${interestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          note: currentNote,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to update interest.");
        return;
      }

      await loadInterests();
    } catch {
      setError("Something went wrong while updating the interest.");
    }
  };

  // Funkcija za ažuriranje beleške.
  const handleNoteUpdate = async (
    interestId: number,
    status: "NEW" | "CONTACTED" | "VIEWING_SCHEDULED" | "CLOSED",
    note: string
  ) => {
    setError("");

    try {
      const response = await fetch(`/api/interests/${interestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          note,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to update note.");
        return;
      }

      await loadInterests();
    } catch {
      setError("Something went wrong while updating the note.");
    }
  };

  // Prikaz loading poruke.
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
        Loading interests page...
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "18px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "40px",
                fontWeight: "800",
                marginBottom: "10px",
              }}
            >
              Client Interests
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "18px",
              }}
            >
              Manage client interests for available properties.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "14px 18px",
              borderRadius: "14px",
              border: "none",
              background: "#ffffff",
              color: "#111111",
              fontWeight: "700",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Add Interest
          </button>
        </div>

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

        {showForm && (
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(255,140,26,0.18), rgba(255,255,255,0.04))",
              borderRadius: "24px",
              padding: "24px",
              border: "1px solid rgba(255,255,255,0.1)",
              marginBottom: "26px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <h2
                style={{
                  fontSize: "26px",
                  fontWeight: "800",
                }}
              >
                Create Interest.
              </h2>

              <button
                onClick={resetForm}
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "transparent",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateInterest}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "18px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                    }}
                  >
                    Client
                  </label>
                  <select
                    name="clientId"
                    value={form.clientId}
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
                    <option value="" style={{ color: "black" }}>
                      Select client
                    </option>
                    {clients.map((client) => (
                      <option
                        key={client.id}
                        value={client.id}
                        style={{ color: "black" }}
                      >
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                    }}
                  >
                    Property
                  </label>
                  <select
                    name="propertyId"
                    value={form.propertyId}
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
                    <option value="" style={{ color: "black" }}>
                      Select property
                    </option>
                    {properties.map((property) => (
                      <option
                        key={property.id}
                        value={property.id}
                        style={{ color: "black" }}
                      >
                        {property.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: "1 / span 2" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                    }}
                  >
                    Note
                  </label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Enter note"
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.08)",
                      color: "white",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: "18px",
                  padding: "14px 18px",
                  borderRadius: "14px",
                  border: "none",
                  background: "#ffffff",
                  color: "#111111",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Create Interest
              </button>
            </form>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
          }}
        >
          {interests.length === 0 ? (
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.7)" }}>
                No interests available.
              </p>
            </div>
          ) : (
            interests.map((interest) => (
              <div
                key={interest.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "24px",
                  padding: "24px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    marginBottom: "10px",
                  }}
                >
                  {interest.client.name}
                </h2>

                <p
                  style={{
                    color: "#ffb15c",
                    fontWeight: "700",
                    marginBottom: "8px",
                  }}
                >
                  {interest.property.title}
                </p>

                <p
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    marginBottom: "6px",
                  }}
                >
                  <strong>City:</strong> {interest.property.city}
                </p>

                <p
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    marginBottom: "14px",
                  }}
                >
                  <strong>Address:</strong> {interest.property.address}
                </p>

                <div style={{ marginBottom: "14px" }}>
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
                    value={interest.status}
                    onChange={(event) =>
                      handleStatusChange(
                        interest.id,
                        event.target.value as
                          | "NEW"
                          | "CONTACTED"
                          | "VIEWING_SCHEDULED"
                          | "CLOSED",
                        interest.note
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.08)",
                      color: "white",
                      outline: "none",
                    }}
                  >
                    <option value="NEW" style={{ color: "black" }}>
                      New
                    </option>
                    <option value="CONTACTED" style={{ color: "black" }}>
                      Contacted
                    </option>
                    <option
                      value="VIEWING_SCHEDULED"
                      style={{ color: "black" }}
                    >
                      Viewing scheduled
                    </option>
                    <option value="CLOSED" style={{ color: "black" }}>
                      Closed
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                    }}
                  >
                    Note
                  </label>
                  <textarea
                    defaultValue={interest.note || ""}
                    rows={4}
                    onBlur={(event) =>
                      handleNoteUpdate(
                        interest.id,
                        interest.status,
                        event.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.08)",
                      color: "white",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}