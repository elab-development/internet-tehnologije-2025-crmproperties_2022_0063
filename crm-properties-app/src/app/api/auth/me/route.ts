import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  // Ako korisnik nije prijavljen vraćamo grešku.
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: user,
  });
}