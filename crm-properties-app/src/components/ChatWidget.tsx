"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// Floating chat widget komponenta.
export default function ChatWidget() {
  // Čuvamo da li je chat otvoren.
  const [isOpen, setIsOpen] = useState(false);

  // Čuvamo tekst input polja.
  const [input, setInput] = useState("");

  // Čuvamo loading stanje dok čekamo odgovor.
  const [loading, setLoading] = useState(false);

  // Čuvamo poruke razgovora.
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "## Welcome.\nI can help with **real estate market insights**, *property companies*, stock information and industry trends.",
    },
  ]);

  // Funkcija za slanje poruke.
  const handleSend = async () => {
    // Ako nema unosa, ne radimo ništa.
    if (!input.trim()) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    };

    // Dodajemo korisničku poruku.
    setMessages((previous) => [...previous, userMessage]);

    const currentInput = input;

    // Resetujemo input.
    setInput("");

    // Uključujemo loading.
    setLoading(true);

    try {
      const response = await fetch("/api/market-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
        }),
      });

      const data = await response.json();

      // Ako backend vrati grešku, prikazujemo je kao poruku asistenta.
      if (!data.success) {
        setMessages((previous) => [
          ...previous,
          {
            role: "assistant",
            content:
              data.message ||
              "Something went wrong while processing the request.",
          },
        ]);
        return;
      }

      // Dodajemo odgovor asistenta.
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "The chat service is currently unavailable. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Okruglo dugme u donjem desnom uglu. */}
      <button
        onClick={() => setIsOpen((previous) => !previous)}
        style={{
          position: "fixed",
          right: "24px",
          bottom: "24px",
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, #ff8c1a, #ffb15c)",
          color: "#111111",
          fontSize: "26px",
          fontWeight: "800",
          cursor: "pointer",
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
          zIndex: 1000,
        }}
        aria-label="Open chat"
      >
        💬
      </button>

      {/* Chat popover prozor. */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            right: "24px",
            bottom: "100px",
            width: "390px",
            maxWidth: "calc(100vw - 32px)",
            height: "560px",
            background: "rgba(17,17,17,0.96)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1000,
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Header chata. */}
          <div
            style={{
              padding: "16px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(135deg, rgba(255,140,26,0.18), rgba(255,255,255,0.04))",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div>
              <h3
                style={{
                  color: "white",
                  fontSize: "18px",
                  fontWeight: "800",
                  marginBottom: "4px",
                }}
              >
                Market Assistant
              </h3>
              <p
                style={{
                  color: "rgba(255,255,255,0.72)",
                  fontSize: "13px",
                }}
              >
                Ask about companies, stocks and real estate trends.
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: "18px",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              ✕
            </button>
          </div>

          {/* Poruke u chatu. */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "#111111",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  alignSelf:
                    message.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "88%",
                  background:
                    message.role === "user"
                      ? "linear-gradient(135deg, #ff8c1a, #ffb15c)"
                      : "rgba(255,255,255,0.08)",
                  color: message.role === "user" ? "#111111" : "white",
                  padding: "12px 14px",
                  borderRadius: "16px",
                  lineHeight: "1.6",
                  fontSize: "14px",
                  overflowWrap: "break-word",
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p style={{ margin: "0 0 10px 0" }}>{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong style={{ fontWeight: 800 }}>{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em style={{ fontStyle: "italic" }}>{children}</em>
                    ),
                    ul: ({ children }) => (
                      <ul style={{ paddingLeft: "18px", margin: "8px 0" }}>
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol style={{ paddingLeft: "18px", margin: "8px 0" }}>
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li style={{ marginBottom: "4px" }}>{children}</li>
                    ),
                    h1: ({ children }) => (
                      <h1
                        style={{
                          fontSize: "20px",
                          fontWeight: 800,
                          margin: "0 0 10px 0",
                        }}
                      >
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2
                        style={{
                          fontSize: "18px",
                          fontWeight: 800,
                          margin: "0 0 10px 0",
                        }}
                      >
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: 800,
                          margin: "0 0 10px 0",
                        }}
                      >
                        {children}
                      </h3>
                    ),
                    code: ({ children }) => (
                      <code
                        style={{
                          background:
                            message.role === "user"
                              ? "rgba(17,17,17,0.12)"
                              : "rgba(255,255,255,0.12)",
                          padding: "2px 6px",
                          borderRadius: "8px",
                          fontSize: "13px",
                        }}
                      >
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre
                        style={{
                          background:
                            message.role === "user"
                              ? "rgba(17,17,17,0.16)"
                              : "rgba(0,0,0,0.25)",
                          padding: "12px",
                          borderRadius: "12px",
                          overflowX: "auto",
                          margin: "10px 0",
                        }}
                      >
                        {children}
                      </pre>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color:
                            message.role === "user" ? "#111111" : "#ffb15c",
                          textDecoration: "underline",
                          fontWeight: 700,
                        }}
                      >
                        {children}
                      </a>
                    ),
                    table: ({ children }) => (
                      <div style={{ overflowX: "auto", margin: "10px 0" }}>
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "13px",
                          }}
                        >
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th
                        style={{
                          border: "1px solid rgba(255,255,255,0.15)",
                          padding: "8px",
                          textAlign: "left",
                          background: "rgba(255,255,255,0.08)",
                        }}
                      >
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td
                        style={{
                          border: "1px solid rgba(255,255,255,0.12)",
                          padding: "8px",
                        }}
                      >
                        {children}
                      </td>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "85%",
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  padding: "12px 14px",
                  borderRadius: "16px",
                  fontSize: "14px",
                }}
              >
                Thinking...
              </div>
            )}
          </div>

          {/* Donji deo sa inputom. */}
          <div
            style={{
              padding: "14px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              background: "#0b0b0b",
              display: "flex",
              gap: "10px",
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSend();
                }
              }}
              placeholder="Ask something..."
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "white",
                outline: "none",
              }}
            />

            <button
              onClick={handleSend}
              disabled={loading}
              style={{
                padding: "12px 16px",
                borderRadius: "14px",
                border: "none",
                background: "#ffffff",
                color: "#111111",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}