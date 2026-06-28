import { getDb } from "../api/queries/connection";
import { barangays } from "./schema";

const IROSIN_BARANGAYS = [
  { name: "Bacolod", code: "BAC" },
  { name: "Bagsangan", code: "BAG" },
  { name: "Bolos", code: "BOL" },
  { name: "Buenavista", code: "BUE" },
  { name: "Bulawan", code: "BUL" },
  { name: "Carriedo", code: "CAR" },
  { name: "Casini", code: "CAS" },
  { name: "Cawayan", code: "CAW" },
  { name: "Cogon", code: "COG" },
  { name: "Gabao", code: "GAB" },
  { name: "Gulang-Gulang", code: "GUL" },
  { name: "Gu Sorosopon", code: "SOR" },
  { name: "Lungib", code: "LUN" },
  { name: "Macawayan", code: "MAC" },
  { name: "Monbon", code: "MON" },
  { name: "Patag", code: "PAT" },
  { name: "Salvacion", code: "SAL" },
  { name: "San Agustin", code: "AGU" },
  { name: "San Isidro", code: "ISI" },
  { name: "San Juan", code: "JUA" },
];

async function seed() {
  const db = getDb();
  console.log("Seeding barangays...");

  for (const b of IROSIN_BARANGAYS) {
    await db
      .insert(barangays)
      .values(b)
      .onDuplicateKeyUpdate({ set: { name: b.name } });
  }

  console.log(`Seeded ${IROSIN_BARANGAYS.length} barangays.`);
}

seed().catch(console.error);
