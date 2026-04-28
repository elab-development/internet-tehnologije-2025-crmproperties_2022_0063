import {
  PrismaClient,
  Role,
  ClientStatus,
  PropertyStatus,
  InterestStatus,
  ActivityType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

// Kreiranje Prisma klijenta za rad sa bazom.
const prisma = new PrismaClient();

async function main() {
  // Prvo brišemo podatke iz zavisnih tabela zbog stranih ključeva.
  await prisma.activity.deleteMany();
  await prisma.clientPropertyInterest.deleteMany();
  await prisma.property.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Hešujemo lozinku koja će biti ista za test naloge.
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Kreiranje admin korisnika.
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@crm.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // Kreiranje manager korisnika.
  const manager = await prisma.user.create({
    data: {
      name: "Manager User",
      email: "manager@crm.com",
      password: hashedPassword,
      role: Role.MANAGER,
    },
  });

  // Kreiranje agent korisnika.
  const agent = await prisma.user.create({
    data: {
      name: "Agent User",
      email: "agent@crm.com",
      password: hashedPassword,
      role: Role.AGENT,
    },
  });

  // Kreiranje nekoliko klijenata.
  const clientOne = await prisma.client.create({
    data: {
      name: "Djordje Pajic",
      email: "djordje@gmail.com",
      phone: "+38160000111",
      status: ClientStatus.ACTIVE,
    },
  });

  const clientTwo = await prisma.client.create({
    data: {
      name: "Vanja Cvetic",
      email: "vanja@gmail.com",
      phone: "+38160000222",
      status: ClientStatus.ACTIVE,
    },
  });

  const clientThree = await prisma.client.create({
    data: {
      name: "Sanja Cvetic",
      email: "sanja@gmail.com",
      phone: "+38160000333",
      status: ClientStatus.INACTIVE,
    },
  });

  // Kreiranje nekretnina koje pripadaju agentu.
  const propertyOne = await prisma.property.create({
    data: {
      title: "Modern Apartment",
      description: "Bright apartment with two bedrooms and a large balcony.",
      status: PropertyStatus.AVAILABLE,
      price: 145000,
      address: "Bulevar Oslobodjenja 15",
      city: "Novi Sad",
      type: "Apartment",
      imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
      userId: agent.id,
    },
  });

  const propertyTwo = await prisma.property.create({
    data: {
      title: "Family House",
      description: "Comfortable family house with a yard and garage.",
      status: PropertyStatus.RESERVED,
      price: 265000,
      address: "Cara Dusana 21",
      city: "Belgrade",
      type: "House",
      imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
      userId: agent.id,
    },
  });

  const propertyThree = await prisma.property.create({
    data: {
      title: "City Studio",
      description: "Small studio apartment in the city center.",
      status: PropertyStatus.AVAILABLE,
      price: 89000,
      address: "Zmaj Jovina 7",
      city: "Novi Sad",
      type: "Studio",
      imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156",
      userId: agent.id,
    },
  });

  // Kreiranje interesovanja klijenata za nekretnine.
  const interestOne = await prisma.clientPropertyInterest.create({
    data: {
      clientId: clientOne.id,
      propertyId: propertyOne.id,
      status: InterestStatus.CONTACTED,
      note: "Client prefers properties near the city center.",
    },
  });

  const interestTwo = await prisma.clientPropertyInterest.create({
    data: {
      clientId: clientTwo.id,
      propertyId: propertyTwo.id,
      status: InterestStatus.VIEWING_SCHEDULED,
      note: "Viewing is planned for next week.",
    },
  });

  const interestThree = await prisma.clientPropertyInterest.create({
    data: {
      clientId: clientThree.id,
      propertyId: propertyThree.id,
      status: InterestStatus.NEW,
      note: "First contact has not been made yet.",
    },
  });

  // Kreiranje aktivnosti za prvo interesovanje.
  await prisma.activity.create({
    data: {
      type: ActivityType.CALL,
      description: "Initial phone call with the client.",
      activityDate: new Date(),
      userId: agent.id,
      interestId: interestOne.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: ActivityType.MESSAGE,
      description: "Sent property details by email.",
      activityDate: new Date(),
      userId: agent.id,
      interestId: interestOne.id,
    },
  });

  // Kreiranje aktivnosti za drugo interesovanje.
  await prisma.activity.create({
    data: {
      type: ActivityType.MEETING,
      description: "Meeting arranged with the client to discuss the property.",
      activityDate: new Date(),
      userId: agent.id,
      interestId: interestTwo.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: ActivityType.VIEWING,
      description: "Property viewing scheduled for Friday at 18:00.",
      activityDate: new Date(),
      userId: agent.id,
      interestId: interestTwo.id,
    },
  });

  // Ispisujemo osnovne informacije u terminal radi provere.
  console.log("Seed completed successfully.");
  console.log({
    admin: admin.email,
    manager: manager.email,
    agent: agent.email,
    clients: [clientOne.name, clientTwo.name, clientThree.name],
    properties: [propertyOne.title, propertyTwo.title, propertyThree.title],
    interests: [interestOne.id, interestTwo.id, interestThree.id],
  });
}

// Pokretanje seed skripte.
main()
  .catch((error) => {
    // Ispisujemo grešku ako do nje dođe.
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    // Zatvaramo konekciju prema bazi.
    await prisma.$disconnect();
  });