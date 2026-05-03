import Image from "next/image";

// Reusable footer komponenta koja se prikazuje na svim stranicama.
export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        background: "#252424",
        color: "white",
        padding: "18px 24px",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Image
            src="/images/Logo Small.png"
            alt="CRM Properties small logo"
            width={38}
            height={38}
            style={{ borderRadius: "10px" }}
          />

          <div>
            <p
              style={{
                fontWeight: "700",
                fontSize: "15px",
                marginBottom: "4px",
              }}
            >
              CRM Properties
            </p>

            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: "13px",
              }}
            >
              Real estate CRM application.
            </p>
          </div>
        </div>

        <div
          style={{
            textAlign: "right",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: "14px",
              marginBottom: "4px",
            }}
          >
            © 2026 CRM Properties. All rights reserved.
          </p>

          <p
            style={{
              color: "#ffb15c",
              fontSize: "13px",
              fontWeight: "700",
            }}
          >
            Lets get those clients!
          </p>
        </div>
      </div>
    </footer>
  );
}