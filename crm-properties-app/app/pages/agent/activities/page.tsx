"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";

type AgentUser = {
  name: string;
  role: string;
};

type InterestOption = {
  id: number;
  client: {
    name: string;
  };
  property: {
    title: string;
  };
};

type Activity = {
  id: number;
  type: "CALL" | "MESSAGE" | "MEETING" | "VIEWING";
  description: string;
  activityDate: string;
  interest: {
    id: number;
    client: {
      name: string;
    };
    property: {
      title: string;
      city: string;
    };
  };
  user: {
    name: string;
  };
};

type ActivityForm = {
  type: "CALL" | "MESSAGE" | "MEETING" | "VIEWING";
  description: string;
  activityDate: string;
  interestId: string;
};

// Početno stanje forme za aktivnost.
const initialForm: ActivityForm = {
  type: "CALL",
  description: "",
  activityDate: "",
  interestId: "",
};

// Agent activities stranica.
export default function AgentActivitiesPage() {
  // Čuvamo trenutno prijavljenog korisnika.
  const [user, setUser] = useState<AgentUser | null>(null);

  // Čuvamo sve aktivnosti.
  const [activities, setActivities] = useState<Activity[]>([]);

  // Čuvamo interesovanja za select polje.
  const [interests, setInterests] = useState<InterestOption[]>([]);

  // Čuvamo stanje forme.
  const [form, setForm] = useState<ActivityForm>(initialForm);

  // Čuvamo loading stanje.
  const [loading, setLoading] = useState(true);

  // Čuvamo grešku.
  const [error, setError] = useState("");

  // Čuvamo da li je forma otvorena.
  const [showForm, setShowForm] = useState(false);

  // Router koristimo za navigaciju.
  const router = useRouter();

  // Funkcija za učitavanje aktivnosti.
  const loadActivities = async () => {
    try {
      const response = await fetch("/api/activities");
      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to load activities.");
        return;
      }

      setActivities(data.data);
    } catch {
      setError("Something went wrong while loading activities.");
    }
  };

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

        // Paralelno učitavamo aktivnosti i interesovanja.
        await Promise.all([loadActivities(), loadInterests()]);
      } catch {
        setError("Something went wrong while loading the page.");
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [router]);

  // Funkcija za promenu polja forme.
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

  // Funkcija za dodavanje aktivnosti.
  const handleCreateActivity = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: form.type,
          description: form.description,
          activityDate: form.activityDate,
          interestId: Number(form.interestId),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to create activity.");
        return;
      }

      // Resetujemo formu i ponovo učitavamo aktivnosti.
      resetForm();
      await loadActivities();
    } catch {
      setError("Something went wrong while creating the activity.");
    }
  };

  // Funkcija za formatiranje datuma.
  const formatDate = (value: string) => {
    return new Date(value).toLocaleString("en-GB");
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
        Loading activities page...
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
              Activities
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "18px",
              }}
            >
              Track calls, messages, meetings and viewings for client interests.
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
            Add Activity
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
                Create Activity.
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

            <form onSubmit={handleCreateActivity}>
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
                    Type
                  </label>
                  <select
                    name="type"
                    value={form.type}
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
                    <option value="CALL" style={{ color: "black" }}>
                      Call
                    </option>
                    <option value="MESSAGE" style={{ color: "black" }}>
                      Message
                    </option>
                    <option value="MEETING" style={{ color: "black" }}>
                      Meeting
                    </option>
                    <option value="VIEWING" style={{ color: "black" }}>
                      Viewing
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
                    Date and time
                  </label>
                  <input
                    name="activityDate"
                    type="datetime-local"
                    value={form.activityDate}
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
                    Interest
                  </label>
                  <select
                    name="interestId"
                    value={form.interestId}
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
                      Select interest
                    </option>
                    {interests.map((interest) => (
                      <option
                        key={interest.id}
                        value={interest.id}
                        style={{ color: "black" }}
                      >
                        {interest.client.name} - {interest.property.title}
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
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter activity description"
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
                Create Activity
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
          {activities.length === 0 ? (
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.7)" }}>
                No activities available.
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "24px",
                  padding: "24px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p
                  style={{
                    color: "#ffb15c",
                    fontWeight: "700",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {activity.type}
                </p>

                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: "800",
                    marginBottom: "10px",
                  }}
                >
                  {activity.interest.client.name}
                </h2>

                <p
                  style={{
                    color: "rgba(255,255,255,0.78)",
                    marginBottom: "8px",
                  }}
                >
                  <strong>Property:</strong> {activity.interest.property.title}
                </p>

                <p
                  style={{
                    color: "rgba(255,255,255,0.78)",
                    marginBottom: "8px",
                  }}
                >
                  <strong>City:</strong> {activity.interest.property.city}
                </p>

                <p
                  style={{
                    color: "rgba(255,255,255,0.78)",
                    marginBottom: "12px",
                  }}
                >
                  <strong>Agent:</strong> {activity.user.name}
                </p>

                <p
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    marginBottom: "12px",
                    lineHeight: "1.6",
                  }}
                >
                  {activity.description}
                </p>

                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "14px",
                  }}
                >
                  {formatDate(activity.activityDate)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}