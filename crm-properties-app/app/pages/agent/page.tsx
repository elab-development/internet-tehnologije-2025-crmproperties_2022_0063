"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";

type AgentUser = {
  name: string;
  role: string;
};

type Property = {
  id: number;
  title: string;
  description: string;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  price: number;
  address: string;
  city: string;
  type: string;
  imageUrl: string | null;
};

type PropertyForm = {
  title: string;
  description: string;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  price: string;
  address: string;
  city: string;
  type: string;
  imageUrl: string;
};

// Početno stanje forme za nekretninu.
const initialForm: PropertyForm = {
  title: "",
  description: "",
  status: "AVAILABLE",
  price: "",
  address: "",
  city: "",
  type: "",
  imageUrl: "",
};

// Agent stranica za rad sa nekretninama.
export default function AgentPage() {
  // Čuvamo trenutno prijavljenog korisnika.
  const [user, setUser] = useState<AgentUser | null>(null);

  // Čuvamo listu nekretnina.
  const [properties, setProperties] = useState<Property[]>([]);

  // Čuvamo stanje forme.
  const [form, setForm] = useState<PropertyForm>(initialForm);

  // Čuvamo loading stanje cele stranice.
  const [loading, setLoading] = useState(true);

  // Čuvamo grešku.
  const [error, setError] = useState("");

  // Čuvamo id nekretnine koja se trenutno menja.
  const [editingId, setEditingId] = useState<number | null>(null);

  // Čuvamo da li je forma otvorena.
  const [showForm, setShowForm] = useState(false);

  // Router koristimo za preusmeravanje.
  const router = useRouter();

  // Funkcija za učitavanje nekretnina.
  const loadProperties = async () => {
    try {
      const response = await fetch("/api/properties");
      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to load properties.");
        return;
      }

      setProperties(data.data);
    } catch {
      setError("Something went wrong while loading properties.");
    }
  };

  useEffect(() => {
    // Učitavamo korisnika i nekretnine kada se stranica otvori.
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

        // Učitavamo nekretnine.
        const propertiesResponse = await fetch("/api/properties");
        const propertiesData = await propertiesResponse.json();

        if (!propertiesData.success) {
          setError(propertiesData.message || "Failed to load properties.");
          return;
        }

        setProperties(propertiesData.data);
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
    setEditingId(null);
    setShowForm(false);
  };

  // Funkcija za otvaranje forme za izmenu.
  const handleEditClick = (property: Property) => {
    setEditingId(property.id);
    setShowForm(true);

    setForm({
      title: property.title,
      description: property.description,
      status: property.status,
      price: String(property.price),
      address: property.address,
      city: property.city,
      type: property.type,
      imageUrl: property.imageUrl || "",
    });
  };

  // Funkcija za slanje forme za kreiranje ili izmenu.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const payload = {
        ...form,
        price: Number(form.price),
      };

      // Ako postoji editingId radimo update, inače create.
      const response = await fetch(
        editingId ? `/api/properties/${editingId}` : "/api/properties",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to save property.");
        return;
      }

      // Resetujemo formu i ponovo učitavamo nekretnine.
      resetForm();
      await loadProperties();
    } catch {
      setError("Something went wrong while saving the property.");
    }
  };

  // Funkcija za brisanje nekretnine.
  const handleDeleteProperty = async (id: number) => {
    setError("");

    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to delete property.");
        return;
      }

      // Nakon brisanja ponovo učitavamo listu.
      await loadProperties();
    } catch {
      setError("Something went wrong while deleting the property.");
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
        Loading agent panel...
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
              Agent Panel
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "18px",
              }}
            >
              Manage your properties in one simple place.
            </p>
          </div>

          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm(initialForm);
            }}
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
            Add Property
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
                {editingId ? "Edit Property." : "Create Property."}
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

            <form onSubmit={handleSubmit}>
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
                    Title
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter property title"
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

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                    }}
                  >
                    City
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Enter city"
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

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                    }}
                  >
                    Price
                  </label>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Enter price"
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

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                    }}
                  >
                    Type
                  </label>
                  <input
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    placeholder="Enter property type"
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

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                    }}
                  >
                    Address
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter address"
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

                <div>
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
                    <option value="AVAILABLE" style={{ color: "black" }}>
                      Available
                    </option>
                    <option value="RESERVED" style={{ color: "black" }}>
                      Reserved
                    </option>
                    <option value="SOLD" style={{ color: "black" }}>
                      Sold
                    </option>
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
                    Image URL
                  </label>
                  <input
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="Enter image URL"
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

                <div style={{ gridColumn: "1 / span 2" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                    rows={5}
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
                {editingId ? "Update Property" : "Create Property"}
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
          {properties.length === 0 ? (
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.7)" }}>
                No properties available.
              </p>
            </div>
          ) : (
            properties.map((property) => (
              <div
                key={property.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "24px",
                  padding: "24px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                 {property.imageUrl && (
      <div
        style={{
          width: "100%",
          height: "220px",
          borderRadius: "18px",
          overflow: "hidden",
          marginBottom: "16px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <img
          src={property.imageUrl}
          alt={property.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
    )}
                <h2
                  style={{
                    fontSize: "26px",
                    fontWeight: "800",
                    marginBottom: "10px",
                  }}
                >
                  {property.title}
                </h2>

                <p
                  style={{
                    color: "#ffb15c",
                    fontWeight: "700",
                    marginBottom: "10px",
                  }}
                >
                  {property.status}
                </p>

                <p
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    marginBottom: "10px",
                  }}
                >
                  {property.description}
                </p>

                <p
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    marginBottom: "6px",
                  }}
                >
                  <strong>Price:</strong> €{property.price}
                </p>

                <p
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    marginBottom: "6px",
                  }}
                >
                  <strong>City:</strong> {property.city}
                </p>

                <p
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    marginBottom: "6px",
                  }}
                >
                  <strong>Address:</strong> {property.address}
                </p>

                <p
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    marginBottom: "16px",
                  }}
                >
                  <strong>Type:</strong> {property.type}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <button
                    onClick={() => handleEditClick(property)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#ffffff",
                      color: "#111111",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteProperty(property.id)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.18)",
                      background: "transparent",
                      color: "white",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}