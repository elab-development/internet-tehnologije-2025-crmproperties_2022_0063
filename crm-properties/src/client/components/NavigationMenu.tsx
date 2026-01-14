// src/client/components/NavigationMenu.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import type { Role } from "@/src/client/types/roles";
import type { ApiOk } from "@/src/client/types/apiOk";
import type { ApiFail } from "@/src/client/types/apiFail";
import type { AuthUser } from "@/src/client/types/authUser";

export default function NavigationMenu() {
  const pathname = usePathname();
  const router = useRouter();

  // Bitno: hook-ovi moraju uvek da se pozovu (ne smemo da returnujemo pre njih).
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Ovu proveru radimo tek posle hook-ova (da se ne menja redosled hook-ova).
  const hideOnAuth = pathname.startsWith("/pages/auth");

  useEffect(() => {
    // Ako smo na auth stranici, nema potrebe da fetch-ujemo user-a.
    if (hideOnAuth) return;

    // Ucitavamo trenutnog korisnika sa servera (cookie je httpOnly).
    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // Vazno: salje cookie sesiju.
        });

        const json = (await res.json()) as ApiOk<{ user: AuthUser }> | ApiFail;
        if (!json.ok) return;

        setUser(json.data.user);
      } catch {
        // Ako pukne request, ostaje user=null.
      }
    }

    loadMe();
  }, [hideOnAuth]);

  const links = useMemo(() => {
    // Ako nemamo user (npr. niste ulogovani), ne prikazujemo role linkove.
    if (!user) return [];

    if (user.role === "manager") {
      return [
        { href: "/pages/manager/home", label: "Home" },
        { href: "/pages/manager/manager-sellers", label: "Manage Sellers" },
        { href: "/pages/manager/seller-metrics", label: "Seller Metrics" },
      ];
    }

    if (user.role === "seller") {
      return [
        { href: "/pages/seller/home", label: "Home" },
        { href: "/pages/seller/manage-deals", label: "Manage Deals" },
      ];
    }

    // Admin.
    return [
      { href: "/pages/admin/home", label: "Home" },
      { href: "/pages/admin/manage-users", label: "Manage Users" },
      { href: "/pages/admin/metrics", label: "Metrics" },
    ];
  }, [user]);

  async function handleLogout() {
    // Ako nije ulogovan, nema sta da radimo.
    if (!user) return;

    setLoggingOut(true);

    try {
      // Pozivamo logout rutu koju vec imate.
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Vazno: salje cookie da server moze da je obrise.
      });

      const json = (await res.json()) as ApiOk<{ message?: string }> | ApiFail;

      if (!json.ok) {
        console.error(json.message || "Logout failed.");
        return;
      }

      // Brisemo user iz state-a da UI odmah reaguje.
      setUser(null);

      // Vracamo na auth stranicu.
      router.replace("/pages/auth");
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingOut(false);
    }
  }

  // Tek ovde uslovno renderujemo.
  if (hideOnAuth) return null;

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0b10]/80 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo levo */}
          <Link
            href={user ? firstHrefForRole(user.role) : "/pages/auth"}
            className="relative h-10 w-28 shrink-0"
          >
            <Image src="/logo.png" alt="CRM Properties logo" fill className="object-contain" priority />
          </Link>

          {/* Sredina: navigacija */}
          <nav className="flex flex-1 items-center justify-center gap-2">
            {links.map((l) => {
              const active = pathname === l.href;

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-semibold transition",
                    "border border-white/10 bg-white/5",
                    active ? "bg-white text-black" : "text-white/75 hover:text-white hover:bg-white/10",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Skroz desno: user info + logout */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right text-xs text-white/70">
              {user ? (
                <>
                  <div className="font-semibold text-white/85">{user.name}</div>
                  <div className="text-white/55">{user.role}</div>
                </>
              ) : (
                <>
                  <div className="font-semibold text-white/85">Not logged in</div>
                  <div className="text-white/55">—</div>
                </>
              )}
            </div>

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className={[
                  "rounded-xl px-3 py-2 text-sm font-semibold transition",
                  "border border-white/10 bg-white/5",
                  "text-white/75 hover:text-white hover:bg-white/10",
                  loggingOut ? "cursor-not-allowed opacity-70" : "",
                ].join(" ")}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Pomocna funkcija za klik na logo (da korisnika vrati na njegov Home).
function firstHrefForRole(role: Role) {
  if (role === "admin") return "/pages/admin/home";
  if (role === "manager") return "/pages/manager/home";
  return "/pages/seller/home";
}
