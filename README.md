# CRM Properties.

![CRM Properties Logo](./readme-promo-images/Logo%20Large.png)

CRM Properties je full-stack web aplikacija namenjena agencijama za nekretnine i timovima koji žele pregledno, jednostavno i efikasno upravljanje podacima o klijentima, nekretninama i prodajnim aktivnostima. Aplikacija je osmišljena kao moderan CRM sistem koji objedinjuje više važnih poslovnih procesa na jednom mestu i omogućava korisnicima da lakše organizuju svakodnevni rad.

U okviru sistema korisnici mogu da se registruju, prijave i odjave, da rade sa podacima u skladu sa svojom ulogom, da dodaju i pregledaju klijente, upravljaju nekretninama, prate interesovanja klijenata za određene nekretnine, evidentiraju aktivnosti poput poziva, poruka, sastanaka i razgledanja, kao i da kroz administratorski deo dobiju osnovne metrike sistema. Pored toga, aplikacija uključuje i AI market assistant funkcionalnost koja pruža osnovne uvide o tržištu nekretnina, trendovima i poznatim kompanijama iz industrije.

## Promo materijal.

### Promo video.

![CRM Properties Promo](./readme-promo-images/promo.gif)

### Promo poster 1.
![Promo 1](./readme-promo-images/promo1.png)

### Promo poster 2.
![Promo 2](./readme-promo-images/promo2.png)

## Osnovna ideja projekta.

Glavna ideja aplikacije CRM Properties jeste da se posao u oblasti nekretnina učini preglednijim i organizovanijim. U klasičnom radu podaci o klijentima, nekretninama i interesovanjima često se vode kroz više različitih alata, tabela ili beleški, što otežava praćenje kompletnog procesa. Ova aplikacija rešava taj problem tako što povezuje sve ključne informacije u jedan sistem.

Na taj način agenti mogu jednostavno da vode evidenciju o nekretninama koje nude, manager može da upravlja klijentima i prati važan deo procesa, dok administrator dobija širi pregled sistema i osnovnih metrika. Dodatna vrednost aplikacije ogleda se u AI podršci koja može da pomogne kroz tržišne informacije i opšte uvide relevantne za poslovanje sa nekretninama.

## Uloge korisnika.

Aplikacija podržava tri tipa korisnika.

### 1. Admin.
Administrator ima pristup administratorskom panelu i sistemskim metrikama. Njegova uloga je da prati opšti pregled podataka u aplikaciji, kao što su broj korisnika, klijenata, nekretnina, interesovanja i aktivnosti. U administratorskom delu prikazuju se i grafici koji olakšavaju vizuelni pregled stanja sistema.

### 2. Manager.
Manager upravlja klijentima. Može da dodaje nove klijente, pregleda postojeće klijente i briše klijente kada je to potrebno. Pored toga, manager ima pristup dashboard stranici i AI asistenciji koja pruža tržišne informacije i osnovne uvide.

### 3. Agent.
Agent upravlja nekretninama, interesovanjima i aktivnostima. On može da kreira, menja, briše i pregleda nekretnine, da prati interesovanja klijenata za nekretnine i da evidentira aktivnosti povezane sa tim interesovanjima. Upravo agent predstavlja ključnu operativnu ulogu u okviru sistema.

## Glavne funkcionalnosti aplikacije.

U okviru aplikacije implementirane su sledeće funkcionalnosti.

- Registracija korisnika.
- Prijava korisnika.
- Odjava korisnika.
- Upravljanje korisničkim ulogama kroz sam sistem.
- Dodavanje, pregled i brisanje klijenata.
- Kreiranje, izmena, brisanje i pregled nekretnina.
- Povezivanje klijenta i nekretnine kroz interesovanje.
- Ažuriranje statusa interesovanja klijenta.
- Evidencija aktivnosti kao što su poziv, poruka, sastanak i razgledanje.
- Prikaz administratorskih metrika kroz kartice i grafikone.
- AI market assistant za opšte tržišne uvide i trendove.
- Swagger / OpenAPI dokumentacija API ruta.
- Docker podrška za jednostavnije pokretanje projekta.

## Slučajevi korišćenja.

Sistem je organizovan kroz jednostavne i jasne slučajeve korišćenja.

### Za sve korisnike.
- Registracija.
- Login.
- Logout.

### Za admina.
- Prikaz metrika sistema.

### Za managera.
- Dodavanje klijenata.
- Brisanje klijenata.
- Pregled klijenata.

### Za agenta.
- Kreiranje nekretnine.
- Ažuriranje nekretnine.
- Brisanje nekretnine.
- Pregled nekretnina.
- Pregled klijenata.
- Kreiranje interesovanja klijenta za nekretninu.
- Pregled interesovanja klijenata.
- Ažuriranje statusa interesovanja.
- Dodavanje aktivnosti.
- Pregled aktivnosti.

## Model podataka.

Aplikacija koristi pet glavnih entiteta.

### User.
Entitet `User` predstavlja korisnika sistema. Svaki korisnik ima osnovne podatke kao što su ime, email, lozinka i uloga. Uloga određuje koje delove sistema korisnik može da koristi. Korisnici u sistemu mogu biti `ADMIN`, `MANAGER` ili `AGENT`.

### Client.
Entitet `Client` predstavlja klijenta sa kojim se radi u procesu prodaje ili interesovanja za nekretninu. Klijent nema nalog za prijavu, već se čuva kao kontakt u sistemu. Za klijenta se vode podaci kao što su ime, email, telefon i status.

### Property.
Entitet `Property` predstavlja nekretninu. Svaka nekretnina sadrži naziv, opis, status, cenu, adresu, grad, tip i opcioni URL slike. Nekretnina je povezana sa agentom koji ju je uneo u sistem.

### ClientPropertyInterest.
Entitet `ClientPropertyInterest` predstavlja interesovanje klijenta za određenu nekretninu. Ovaj entitet povezuje klijenta i nekretninu i sadrži status i napomenu. Na taj način sistem može da prati koji klijent je zainteresovan za koju nekretninu i u kojoj fazi se to interesovanje nalazi.

### Activity.
Entitet `Activity` predstavlja aktivnost vezanu za određeno interesovanje. Aktivnost može biti poziv, poruka, sastanak ili razgledanje. Ovim entitetom se vodi evidencija o komunikaciji i daljim koracima u radu sa klijentima.

## Veze između entiteta.

Veze u sistemu su organizovane tako da prate realan tok poslovanja.

- Jedan korisnik može imati više nekretnina.
- Jedan korisnik može imati više aktivnosti.
- Jedan klijent može imati više interesovanja.
- Jedna nekretnina može biti povezana sa više interesovanja.
- Jedno interesovanje može imati više aktivnosti.
- Svaka aktivnost pripada tačno jednom korisniku i jednom interesovanju.

Posebno je važno da između klijenta i nekretnine postoji jedinstvena kombinacija, kako ne bi postojalo više identičnih interesovanja za isti par `client + property`.

## Tehnologije.

Za razvoj projekta korišćene su sledeće tehnologije.

### Frontend.
- Next.js.
- React.
- TypeScript.
- CSS.
- React hooks.
- React Markdown za prikaz formatiranog AI odgovora.
- Google Charts za prikaz administratorskih metrika.

### Backend.
- Next.js API routes.
- Prisma ORM.
- PostgreSQL baza podataka.
- Cookie-based autentifikacija.
- Role-based pristup.

### Dodatne tehnologije.
- Swagger UI i OpenAPI za API dokumentaciju.
- Docker i Docker Compose za pokretanje aplikacije u kontejnerima.
- GitHub Models API za AI market assistant funkcionalnost.
- Pexels API za prikaz slika u slider komponenti.

## Arhitektura projekta.

Projekat je organizovan kao jedna Next.js aplikacija koja sadrži i frontend i backend deo. To znači da se korisnički interfejs, stranice i API rute nalaze u okviru istog projekta, što pojednostavljuje razvoj i održavanje.

Osnovna struktura projekta izgleda ovako:

- `app/` sadrži stranice aplikacije i API rute.
- `src/components/` sadrži reusable komponente kao što su navigation, footer, slider i chat widget.
- `src/lib/` sadrži pomoćne funkcije i logiku, na primer za autentifikaciju, Prisma client i druge pomoćne alate.
- `prisma/` sadrži Prisma šemu, migracije i seed fajl.
- `public/` sadrži statičke fajlove, slike i Swagger dokumentaciju.
- `readme-promo-images/` sadrži logo i promo materijal korišćen u ovom README fajlu.

## Dashboard i korisnički interfejs.

Aplikacija ima moderan tamni interfejs sa narandžastim akcentima koji prate vizuelni identitet brenda CRM Properties. Dashboard stranica prikazuje osnovni uvod u aplikaciju i koristi vizuelni slider sa inspirativnim real estate fotografijama. Navigacija je jasna i prilagođena roli korisnika, tako da svaki korisnik vidi samo one delove sistema koji su mu potrebni.

U okviru interfejsa posebno su istaknute:
- bočna navigacija,
- pregledne kartice,
- forma za unos i izmenu podataka,
- grafički prikaz metrika,
- floating chat dugme za AI asistenta.

## Administratorske metrike.

Administrator ima poseban panel sa metrikama sistema. U tom delu se prikazuju podaci kao što su:

- ukupan broj korisnika,
- broj klijenata,
- broj nekretnina,
- broj interesovanja,
- broj aktivnosti.

Pored brojčanih kartica, prikazuju se i grafikoni koji pomažu da administrator brzo dobije pregled sistema. Ovaj deo aplikacije je namenjen lakšem praćenju rada sistema i bržem donošenju osnovnih zaključaka.

## AI market assistant.

Aplikacija uključuje i AI asistenta u vidu chat prozora koji je dostupan kroz floating dugme u donjem desnom uglu ekrana. Ovaj deo omogućava korisniku da postavlja pitanja u vezi sa tržištem nekretnina, poznatim kompanijama iz oblasti, industrijskim trendovima i opštim tržišnim uvidima.

Odgovori asistenta prikazuju se formatirano, uz podršku za:
- bold tekst,
- italic tekst,
- naslove,
- liste,
- linkove,
- kraće tabele.

Na taj način AI deo ne služi kao zamena za glavni CRM sistem, već kao dodatna podrška pri informisanju i donošenju boljih poslovnih odluka.

## API dokumentacija.

Za API deo projekta postoji Swagger / OpenAPI dokumentacija. Dokumentacija opisuje glavne rute aplikacije i omogućava lakše testiranje i razumevanje API-ja.

Glavne grupe ruta su:

- Auth.
- Clients.
- Properties.
- Interests.
- Activities.
- Metrics.
- Market Chat.

# Pokretanje projekta lokalno

## 1. Kloniranje repozitorijuma

```bash
git clone <repository-url>
cd internet-tehnologije-2025-crmproperties_2022_0063/crm-properties-app
```

## 2. Instalacija zavisnosti

```bash
npm install
```

## 3. Podešavanje `.env` fajla

Potrebno je kreirati `.env` fajl i uneti odgovarajuće promenljive, na primer:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm_properties
JWT_SECRET=your_secret_key
NEXT_PUBLIC_PEXELS_API_KEY=your_pexels_key
GITHUB_TOKEN=your_github_token
```

## 4. Pokretanje migracija

```bash
npx prisma migrate dev
```

## 5. Pokretanje seed-a

```bash
npx prisma db seed
```

## 6. Pokretanje aplikacije

```bash
npm run dev
```

Nakon toga aplikacija će biti dostupna na adresi:

```
http://localhost:3000
```

---

## Pokretanje uz Docker

Projekat podržava i Docker način rada. To znači da se aplikacija, PostgreSQL baza i Prisma Studio mogu pokrenuti kroz kontejnere.

### Pokretanje

```bash
docker compose down -v
docker compose up --build
```

### Aplikacija

```
http://localhost:3000
```

### Prisma Studio

```
http://localhost:5555
```