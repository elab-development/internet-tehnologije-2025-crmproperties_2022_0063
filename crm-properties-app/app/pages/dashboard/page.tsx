import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import Slider from "@/components/Slider";

// Dashboard stranica.
export default async function DashboardPage() {
  // Uzimamo trenutno prijavljenog korisnika.
  const user = await getCurrentUser();

  // Ako korisnik nije prijavljen, vraćamo ga na login.
  if (!user) {
    redirect("/pages/login");
  }

  return (
    <main className="dashboard-layout">
      <Navigation user={user} />

      <section className="dashboard-content">
        <div className="hero-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginBottom: "18px",
                }}
              >
                <Image
                  src="/images/Logo Large.png"
                  alt="CRM Properties large logo"
                  width={500}
                  height={265}
                  style={{ height: "auto", width: "auto", maxWidth: "500px" }}
                  priority
                />
              </div>

              <p
                style={{
                  color: "#ffb15c",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  fontSize: "13px",
                  fontWeight: "700",
                  marginBottom: "10px",
                }}
              >
                Welcome back
              </p>

              <h1
                style={{
                  fontSize: "42px",
                  fontWeight: "800",
                  marginBottom: "12px",
                }}
              >
                Hello, {user.name}.
              </h1>

              <p
                style={{
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "18px",
                  maxWidth: "700px",
                  lineHeight: "1.7",
                }}
              >
                You are currently logged in as <strong>{user.role}</strong>.
                Explore property inspiration and modern real estate visuals
                through the slider below.
              </p>
            </div>

            <div
              style={{
                minWidth: "220px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "24px",
                padding: "22px",
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  marginBottom: "10px",
                  fontSize: "14px",
                }}
              >
                Active role.
              </p>

              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  color: "#ffb15c",
                  marginBottom: "10px",
                }}
              >
                {user.role}
              </h2>

              <p
                style={{
                  color: "rgba(255,255,255,0.72)",
                  lineHeight: "1.6",
                }}
              >
                Access to content and actions depends on your current role in the
                system.
              </p>
            </div>
          </div>
        </div>

        <Slider
          query="modern luxury apartment interior"
          title="Property Inspiration"
        />
      </section>
    </main>
  );
}