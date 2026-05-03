import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Dozvoljeni origin-i za tvoj projekat.
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

// Proxy funkcija koja dodaje CORS headere na sve API rute.
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const origin = request.headers.get("origin");

  // Ako je origin dozvoljen, vraćamo baš taj origin.
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else {
    // Podrazumevani lokalni origin za razvoj.
    response.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
  }

  // Dozvoljene metode.
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE"
  );

  // Dozvoljeni headeri.
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Dozvoljavamo cookie-je.
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}

// Proxy se primenjuje samo na API rute.
export const config = {
  matcher: ["/api/:path*"],
};