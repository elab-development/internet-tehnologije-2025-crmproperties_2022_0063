import { redirect } from "next/navigation";

// Početna stranica samo preusmerava korisnika na login.
export default function HomePage() {
  redirect("/pages/login");
}