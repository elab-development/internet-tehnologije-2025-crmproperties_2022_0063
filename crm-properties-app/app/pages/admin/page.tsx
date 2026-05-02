"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import AdminMetricsCharts from "@/components/AdminMetricsCharts";

type AdminUser = {
  name: string;
  role: string;
};

type MetricsData = {
  usersCount: number;
  clientsCount: number;
  propertiesCount: number;
  interestsCount: number;
  activitiesCount: number;
};

// Admin stranica sa metrikama i Google Charts dijagramima.
export default function AdminPage() {
  // Čuvamo podatke o prijavljenom korisniku.
  const [user, setUser] = useState<AdminUser | null>(null);

  // Čuvamo metrike sistema.
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  // Čuvamo loading stanje.
  const [loading, setLoading] = useState(true);

  // Čuvamo eventualnu grešku.
  const [error, setError] = useState("");

  // Router koristimo za preusmeravanje.
  const router = useRouter();

  useEffect(() => {
    // Funkcija koja učitava korisnika i metrike.
    const loadData = async () => {
      try {
        const meResponse = await fetch("/api/auth/me");
        const meData = await meResponse.json();

        // Ako korisnik nije prijavljen, vraćamo ga na login.
        if (!meData.success) {
          router.push("/pages/login");
          return;
        }

        // Ako korisnik nije admin, vraćamo ga na dashboard.
        if (meData.data.role !== "ADMIN") {
          router.push("/pages/dashboard");
          return;
        }

        setUser(meData.data);

        const metricsResponse = await fetch("/api/metrics");
        const metricsData = await metricsResponse.json();

        if (!metricsData.success) {
          setError(metricsData.message || "Failed to load metrics.");
          return;
        }

        setMetrics(metricsData.data);
      } catch {
        setError("Something went wrong while loading the page.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Loading prikaz.
  if (loading) {
    return <main className="loading-screen">Loading admin panel...</main>;
  }

  // Ako korisnik nije učitan, ne prikazujemo ništa.
  if (!user) {
    return null;
  }

  return (
    <main className="dashboard-layout">
      <Navigation user={user} />

      <section className="dashboard-content">
        <h1 className="section-title">Admin Panel</h1>

        <p className="section-subtitle" style={{ marginBottom: "28px" }}>
          This page displays real system metrics loaded from the backend API.
        </p>

        {error && <p className="error-text">{error}</p>}

        {metrics && (
          <>
            <div className="grid-3" style={{ marginBottom: "28px" }}>
              <div className="app-card-accent">
                <p className="text-soft" style={{ marginBottom: "10px" }}>
                  Users
                </p>
                <h3 style={{ fontSize: "34px", fontWeight: "800" }}>
                  {metrics.usersCount}
                </h3>
              </div>

              <div className="app-card">
                <p className="text-soft" style={{ marginBottom: "10px" }}>
                  Clients
                </p>
                <h3 style={{ fontSize: "34px", fontWeight: "800" }}>
                  {metrics.clientsCount}
                </h3>
              </div>

              <div className="app-card">
                <p className="text-soft" style={{ marginBottom: "10px" }}>
                  Properties
                </p>
                <h3 style={{ fontSize: "34px", fontWeight: "800" }}>
                  {metrics.propertiesCount}
                </h3>
              </div>

              <div className="app-card">
                <p className="text-soft" style={{ marginBottom: "10px" }}>
                  Interests
                </p>
                <h3 style={{ fontSize: "34px", fontWeight: "800" }}>
                  {metrics.interestsCount}
                </h3>
              </div>

              <div className="app-card">
                <p className="text-soft" style={{ marginBottom: "10px" }}>
                  Activities
                </p>
                <h3 style={{ fontSize: "34px", fontWeight: "800" }}>
                  {metrics.activitiesCount}
                </h3>
              </div>
            </div>

            <AdminMetricsCharts metrics={metrics} />
          </>
        )}
      </section>
    </main>
  );
}