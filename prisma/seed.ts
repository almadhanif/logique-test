import "dotenv/config"; // load DATABASE_URL from .env when run standalone via tsx
import { Status } from "../lib/generated/prisma/client";
import { prisma } from "../lib/prisma";

type SeedCar = {
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  color?: string;
  description?: string;
  adCopy?: string;
  status: Status;
};

const cars: SeedCar[] = [
  {
    make: "Toyota",
    model: "Camry",
    year: 2019,
    mileage: 82000,
    price: 185000000,
    color: "Silver",
    status: Status.PUBLISHED,
    description: "2019 camry, 82k km, silver, runs great, minor scratch on rear bumper",
    adCopy:
      "Looking for a reliable daily driver? This 2019 Toyota Camry in Silver has just 82,000 km on the clock and runs beautifully. Renowned for bulletproof reliability and low running costs, it's the smart pick for anyone who values peace of mind. A minor scuff on the rear bumper is the only blemish on an otherwise immaculate car.",
  },
  {
    make: "Honda",
    model: "Civic",
    year: 2020,
    mileage: 55000,
    price: 245000000,
    color: "Blue",
    status: Status.PUBLISHED,
    description: "2020 civic, low km, one owner, full service history",
    adCopy:
      "A 2020 Honda Civic with only 55,000 km and a single careful owner backed by a full service history. Crisp Blue finish, frugal on fuel, and genuinely fun to drive. Hard to find this clean at this mileage.",
  },
  {
    make: "Suzuki",
    model: "Ertiga",
    year: 2021,
    mileage: 40000,
    price: 168000000,
    color: "White",
    status: Status.PUBLISHED,
    description: "family car, 7 seater, ac cold, tires new",
    adCopy:
      "Room for the whole family and then some. This 7-seater 2021 Suzuki Ertiga has just 40,000 km, ice-cold air conditioning, and a fresh set of tyres. The perfect budget-friendly people mover.",
  },
  {
    make: "Mitsubishi",
    model: "Pajero Sport",
    year: 2018,
    mileage: 110000,
    price: 315000000,
    color: "Black",
    status: Status.PUBLISHED,
    description: "diesel, 4x4, tough, been up the mountains no problem",
    adCopy:
      "Built to go anywhere. This 2018 Mitsubishi Pajero Sport diesel 4x4 has 110,000 km of adventure under its belt and is ready for plenty more. Tough, capable, and equally at home on the highway or the trail.",
  },
  {
    make: "Toyota",
    model: "Avanza",
    year: 2017,
    mileage: 135000,
    price: 98000000,
    color: "Silver",
    status: Status.PUBLISHED,
    description: "cheap runaround, well used but cheap",
  },
  {
    make: "Honda",
    model: "Brio",
    year: 2022,
    mileage: 28000,
    price: 178000000,
    color: "Red",
    status: Status.PUBLISHED,
    description: "nearly new, sat nav, reverse camera, very economical",
    adCopy:
      "Nearly new and barely run in. This 2022 Honda Brio in Red has just 28,000 km, with satellite navigation and a reverse camera. Incredibly economical and ideal for zipping around town.",
  },
  {
    make: "Hyundai",
    model: "Ioniq 5",
    year: 2023,
    mileage: 19000,
    price: 685000000,
    color: "Grey",
    status: Status.SOLD,
    description: "electric, long range, fast charging, sold pending collection",
    adCopy:
      "The future, today. A 2023 Hyundai Ioniq 5 EV with long range and ultra-fast charging, only 19,000 km. Striking Grey styling and a cabin that feels a generation ahead.",
  },
  {
    make: "Daihatsu",
    model: "Terios",
    year: 2019,
    mileage: 72000,
    price: 142000000,
    color: "White",
    status: Status.SOLD,
    description: "compact suv, good condition, sold",
  },
  // Drafts — not yet published (admin still writing the listing)
  {
    make: "Nissan",
    model: "Serena",
    year: 2020,
    mileage: 47000,
    price: 268000000,
    color: "Pearl White",
    status: Status.DRAFT,
    description: "mpv, sliding doors, family, just arrived need to clean it up",
  },
  {
    make: "Wuling",
    model: "Almaz",
    year: 2021,
    mileage: 38000,
    price: 235000000,
    color: "Black",
    status: Status.DRAFT,
    description: "suv, turbo, big screen, pending photos",
  },
];

async function main() {
  console.log(`🌱 Seeding ${cars.length} cars…`);

  // Wipe and reinsert so seeding is idempotent.
  await prisma.car.deleteMany();
  await prisma.make.deleteMany();

  // Seed the manufacturer catalog from the distinct makes used by the cars.
  const makeNames = Array.from(new Set(cars.map((c) => c.make))).sort();
  const countryByMake: Record<string, string> = {
    Toyota: "Japan",
    Honda: "Japan",
    Suzuki: "Japan",
    Mitsubishi: "Japan",
    Nissan: "Japan",
    Hyundai: "South Korea",
    Daihatsu: "Japan",
    Wuling: "China",
  };
  for (const name of makeNames) {
    await prisma.make.create({
      data: { name, country: countryByMake[name] ?? null },
    });
  }
  console.log(`🚗 Seeded ${makeNames.length} makes.`);

  for (const car of cars) {
    await prisma.car.create({ data: car });
  }

  const counts = {
    [Status.DRAFT]: 0,
    [Status.PUBLISHED]: 0,
    [Status.SOLD]: 0,
  };
  const all = await prisma.car.findMany();
  for (const c of all) counts[c.status]++;

  console.log(
    `✅ Done. Totals → draft: ${counts[Status.DRAFT]}, published: ${counts[Status.PUBLISHED]}, sold: ${counts[Status.SOLD]}`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
