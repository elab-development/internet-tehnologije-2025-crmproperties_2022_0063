// prisma/seed.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Ovo su “plain” lozinke koje ćemo heširati pre upisa u bazu.
  // U realnoj aplikaciji lozinke nikad ne čuvamo kao plain tekst.
  const sellerPasswordPlain = "Seller123!";
  const managerPasswordPlain = "Manager123!";
  const adminPasswordPlain = "Admin123!";

  // Heširanje lozinki pomoću bcryptjs.
  // Salt rounds = 10 je standardna i jednostavna vrednost za demo.
  const sellerPasswordHash = await bcrypt.hash(sellerPasswordPlain, 10);
  const managerPasswordHash = await bcrypt.hash(managerPasswordPlain, 10);
  const adminPasswordHash = await bcrypt.hash(adminPasswordPlain, 10);

  // Brisanje postojećih podataka (da seed bude ponovljiv).
  // Brišemo redom od “dece” ka “roditeljima” zbog foreign key ograničenja.
  await prisma.activity.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.property.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Kreiranje korisnika.
  // Uloge čuvamo kao string: "seller", "manager", "admin".
  const seller = await prisma.user.create({
    data: {
      name: "Ana Seller",
      email: "seller@crmproperties.com",
      password: sellerPasswordHash,
      phone: "+381601112223",
      role: "seller",
    },
  });

  await prisma.user.create({
    data: {
      name: "Marko Manager",
      email: "manager@crmproperties.com",
      password: managerPasswordHash,
      phone: "+381601112224",
      role: "manager",
    },
  });

  await prisma.user.create({
    data: {
      name: "Ivana Admin",
      email: "admin@crmproperties.com",
      password: adminPasswordHash,
      phone: "+381601112225",
      role: "admin",
    },
  });

  // Kreiranje klijenata (kupaca).
  const client1 = await prisma.client.create({
    data: {
      name: "Petar Petrovic",
      email: "petar.petrovic@example.com",
      phone: "+381641234567",
      city: "Belgrade",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "Jelena Jovanovic",
      email: "jelena.jovanovic@example.com",
      phone: "+381651234567",
      city: "Novi Sad",
    },
  });

  // Kreiranje nekretnina.
  const property1 = await prisma.property.create({
    data: {
      title: "Modern Apartment Near Center",
      address: "Kralja Milana 10",
      city: "Belgrade",
      type: "apartment",
      bedrooms: 2,
      price: 135000,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      title: "Family House With Yard",
      address: "Dunavska 55",
      city: "Novi Sad",
      type: "house",
      bedrooms: 4,
      price: 220000,
    },
  });

  // Kreiranje deal-ova.
  // Sve deal-ove vezujemo za prodavca, da bi scenario bio realan za početnike.
  const deal1 = await prisma.deal.create({
    data: {
      title: "Deal - Petar buys Apartment",
      expectedValue: 135000,
      stage: "new",
      closeDate: null,
      userId: seller.id,
      clientId: client1.id,
      propertyId: property1.id,
    },
  });

  const deal2 = await prisma.deal.create({
    data: {
      title: "Deal - Jelena buys House",
      expectedValue: 220000,
      stage: "negotiation",
      closeDate: null,
      userId: seller.id,
      clientId: client2.id,
      propertyId: property2.id,
    },
  });

  // Kreiranje aktivnosti (svaki deal mora imati bar jednu aktivnost po tvom opisu).
  await prisma.activity.createMany({
    data: [
      {
        subject: "Initial call with client",
        type: "call",
        description: "Discussed budget and preferred location.",
        dueDate: new Date(),
        dealId: deal1.id,
      },
      {
        subject: "Property viewing scheduled",
        type: "meeting",
        description: "Viewing scheduled for next week.",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        dealId: deal1.id,
      },
      {
        subject: "Sent property details via email",
        type: "email",
        description: "Sent photos and floor plan.",
        dueDate: new Date(),
        dealId: deal2.id,
      },
      {
        subject: "Negotiation follow-up call",
        type: "call",
        description: "Follow-up on price and conditions.",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        dealId: deal2.id,
      },
    ],
  });

  // Ispis kredencijala na kraju.
  console.log("Seed credentials.");
  console.log("Seller role -> email: seller@crmproperties.com, password: Seller123!.");
  console.log("Manager role -> email: manager@crmproperties.com, password: Manager123!.");
  console.log("Admin role -> email: admin@crmproperties.com, password: Admin123!.");
  console.log("Seed finished.");
}

main()
  .catch(async (e) => {
    console.error("Seed error.", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
