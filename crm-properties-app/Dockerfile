# Koristimo zvaničnu Node.js Alpine sliku radi manjeg image-a.
FROM node:20-alpine

# Instaliramo postgres klijentske alate zbog pg_isready komande.
RUN apk add --no-cache postgresql-client

# Postavljamo radni direktorijum.
WORKDIR /app

# Prvo kopiramo package fajlove da bi Docker cache radio bolje.
COPY package*.json ./

# Instaliramo zavisnosti.
RUN npm install

# Kopiramo ostatak projekta.
COPY . .

# Dajemo dozvolu za izvršavanje entrypoint skripte.
RUN chmod +x docker/app-entrypoint.sh

# Otvaramo port za Next.js aplikaciju.
EXPOSE 3000

# Pokrećemo entrypoint skriptu.
CMD ["sh", "docker/app-entrypoint.sh"]