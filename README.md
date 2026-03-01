# CRM Properties — opis aplikacije i tehnologije.

CRM Properties je full-stack web aplikacija za upravljanje prodajom nekretnina (CRM). Sistem je organizovan po ulogama (**seller**, **manager**, **admin**) i omogućava rad nad klijentima, nekretninama, deal-ovima (pipeline) i aktivnostima, uz stranice za metrike i dodatne “competitors/concurrents” informacije.

![CRM Properties Logo](./crm-properties/app/favicon.ico)

> Struktura repozitorijuma (jedan Next.js projekat).
> - `app/` — Next.js App Router (stranice + API rute).
> - `src/` — klijentski i serverski kod (servisi, validatori, tipovi, UI komponente).
> - `prisma/` — Prisma šema, migracije i seed.
> - `public/` — statički fajlovi (Swagger UI, slike, favicon).

---

## Ciljna grupa i uloge korisnika.

Aplikacija podržava sledeće uloge:

- **Seller (seller)**: radi sa svojim klijentima, nekretninama, deal-ovima i aktivnostima.
- **Manager (manager)**: uvid u sellers i timske preglede (npr. seller list/metrics po selleru).
- **Administrator (admin)**: administracija sistema, uvid u metrike na nivou celog sistema + dodatne admin stranice.

---

## Ključne funkcionalnosti.

### CRM podaci.
- **Clients**: kupci/klijenti (ime, email, telefon, grad).
- **Properties**: nekretnine (naslov, adresa, grad, tip, broj soba, cena, itd.).
- **Deals**: centralni entitet pipeline-a; povezuje **User + Client + Property**.
  - polja: `title`, `expectedValue`, `stage`, `closeDate`.
  - stage primer: `new → negotiation → offer_sent → won/lost`.
- **Activities**: aktivnosti na deal-u (poziv, sastanak, zadatak, email…).
  - polja: `subject`, `type`, `description`, `dueDate`.
  - svaka aktivnost pripada tačno jednom deal-u.

> Model relacije (Prisma).
> - `User 1:N Deal`
> - `Client 1:N Deal`
> - `Property 1:N Deal`
> - `Deal 1:N Activity`

---

## Metrike (Charts).

Aplikacija ima metrike koje UI prikazuje kroz dijagrame (Recharts):

- **Manager seller metrics**: metrike po izabranom selleru (deal counts, pipeline composition, values).
- **Admin metrics**: metrike agregirane za sve sellere (globalni pregled).

> Napomena (dogovor u projektu): metrike se prikazuju “generalno”, bez filtera u odnosu na `closeDate`, osim ako je eksplicitno uveden filter na UI.

---

## Competitors / Concurrents.

Admin stranica “Concurrents” prikazuje osnovni watchlist kompanija (npr. CBRE, JLL, Redfin…) sa:
- slikama (Lorem Picsum).
- cenama (Alpha Vantage).
- konverzijom valute USD → EUR/USD preko ExchangeRates API (apilayer ključ).

> Strategija učitavanja (da se izbegne rate limit):
> 1) Prvo se učita FX (jedan zahtev).
> 2) Zatim “base list” (placeholder kartice).
> 3) Onda se quote-ovi učitavaju polako, jedan ticker po request-u (sa delay-om).

---

## Tehnologije koje se koriste.

### Frontend + Backend.
- **Next.js (App Router)** — UI + API rute u istom projektu.
- **React** — client components za interaktivne stranice.
- **TypeScript** — tipovi za UI i API.

### Baza podataka.
- **PostgreSQL**
- **Prisma ORM** — schema/migrations/seed + Prisma Client.

### Autentifikacija i autorizacija.
- Cookie-based auth (HttpOnly session cookie) + RBAC (role-based).
- Helperi:
  - `requireAuth()` — proverava sesiju i osvežava cookie (sliding TTL).
  - `requireRole()` — enforcuje dozvole po ulogama.

---

## Podešavanje okruženja (.env).

U root-u projekta se nalazi `.env` (ne commit-uje se). Tipične promenljive:

- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm_properties?schema=public`
- `SESSION_TTL_MINUTES=25`
- `ALPHA_VANTAGE_API_KEY=...`
- `EXCHANGERATES_API_KEY=...` (API Layer / ExchangeRates API key)

> Ako koristiš Prisma config (`prisma.config.ts`), moguće je da Prisma preskoči automatsko učitavanje env varijabli i oslanja se na taj config.

---

## Pokretanje projekta (lokalno, bez Docker-a).

> Pretpostavke: Node.js 18+.

### 1) Instalacija.
- `npm install`.

### 2) Migracije + seed.
- `npx prisma migrate reset`.

### 3) Prisma Studio.
- `npx prisma studio`.
- Studio tipično: `http://localhost:5555`.

### 4) Next.js dev server.
- `npm run dev`.
- App: `http://localhost:3000`.

> Seed kredencijali (iz seeda):
> - seller: `seller@crmproperties.com` / `Seller123!.`
> - manager: `manager@crmproperties.com` / `Manager123!.`
> - admin: `admin@crmproperties.com` / `Admin123!.`

---

## Swagger UI + OpenAPI (API dokumentacija).

Ako postoji:
- `public/swagger/index.html`
- `public/swagger/openapi.yaml`

Otvori:
- Swagger UI: `http://localhost:3000/swagger/index.html`
- OpenAPI: `http://localhost:3000/swagger/openapi.yaml`

> Bitno: auth je HttpOnly cookie based. Swagger UI treba da šalje cookies (`credentials=include`).

---

## Pokretanje projekta uz Docker.

> Pretpostavke: Docker Desktop instaliran.

### Preimenovanje Docker fajlova.

U root-u repozitorijuma preimenuj fajlove tako da su “crm-properties”:

- `Dockerfile.frontend` → `Dockerfile.crm-properties.frontend`
- `Dockerfile.backend` → `Dockerfile.crm-properties.backend`

(ili alternativno: `Dockerfile.frontend.crm-properties`, `Dockerfile.backend.crm-properties` — bitno je da `docker-compose.yaml` pokazuje na tačan naziv).

### docker-compose.yaml (primer: CRM Properties).

- `db` servis: PostgreSQL.
- `app` servis: Next.js dev container.
- `studio` servis: Prisma Studio.

### Pokretanje.

U folderu gde je `docker-compose.yaml`:

- `docker compose down -v`.
- `docker compose up --build`.

Aplikacija:
- `http://localhost:3000`.

Prisma Studio:
- `http://localhost:5555`.

---

## API (pregled glavnih ruta).

### Auth.
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Sellers / Manager.
- `GET /api/manager/sellers`
- `GET /api/manager/sellers/{id}/metrics`

### Admin.
- `GET /api/admin/metrics` (globalne metrike).
- `GET /api/admin/competitors?currency=EUR|USD` (concurrents / competitors).

### Core entities (tipično).
- `GET/POST/PATCH/DELETE` rute za `clients`, `properties`, `deals`, `activities` (u skladu sa implementacijom u `app/api/*`).

---

## Bezbednosne napomene.

- Ne commituje se `.env`.
- API ključevi (Alpha Vantage, ExchangeRates API) se drže isključivo u `.env`.
- RBAC mora biti enforced na serveru (ne oslanjati se samo na UI).

---

## Autori.

- Autor: (upiši svoje podatke ovde).
- Projekat: CRM Properties (CRM Nekretnine).