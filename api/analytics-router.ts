import { z } from "zod";
import { eq, gte, sql, count, desc } from "drizzle-orm";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { pets, barangays, biteCases, vaccinationRecords } from "@db/schema";

export const analyticsRouter = createRouter({
  getDashboard: adminQuery.query(async () => {
    const db = getDb();

    const [
      totalPets,
      totalDogs,
      totalCats,
      pendingVerifications,
      activePets,
      strayPets,
      impoundedPets,
      adoptablePets,
      totalBiteCases,
      pendingBiteCases,
      quarantineCases,
      closedCases,
      totalVaccinations,
      expiredVaccinations,
      leashedPets,
      unleashedPets,
    ] = await Promise.all([
      db.select({ count: count() }).from(pets),
      db.select({ count: count() }).from(pets).where(eq(pets.species, "dog")),
      db.select({ count: count() }).from(pets).where(eq(pets.species, "cat")),
      db.select({ count: count() }).from(pets).where(eq(pets.registrationStatus, "pending_verification")),
      db.select({ count: count() }).from(pets).where(eq(pets.registrationStatus, "active")),
      db.select({ count: count() }).from(pets).where(eq(pets.classification, "stray")),
      db.select({ count: count() }).from(pets).where(eq(pets.classification, "impounded")),
      db.select({ count: count() }).from(pets).where(eq(pets.classification, "adoptable")),
      db.select({ count: count() }).from(biteCases),
      db.select({ count: count() }).from(biteCases).where(eq(biteCases.status, "pending_action")),
      db.select({ count: count() }).from(biteCases).where(eq(biteCases.status, "under_quarantine")),
      db.select({ count: count() }).from(biteCases).where(eq(biteCases.status, "case_closed")),
      db.select({ count: count() }).from(vaccinationRecords),
      db.select({ count: count() }).from(vaccinationRecords).where(eq(vaccinationRecords.status, "expired")),
      db.select({ count: count() }).from(pets).where(eq(pets.confinementStatus, "leashed")),
      db.select({ count: count() }).from(pets).where(eq(pets.confinementStatus, "unleashed_roaming")),
    ]);

    // Get per-barangay breakdown
    const barangayStats = await db
      .select({
        barangayName: barangays.name,
        petCount: count(pets.id),
      })
      .from(pets)
      .leftJoin(barangays, eq(pets.barangayId, barangays.id))
      .groupBy(pets.barangayId)
      .orderBy(desc(count(pets.id)));

    return {
      overview: {
        totalPets: totalPets[0]?.count ?? 0,
        totalDogs: totalDogs[0]?.count ?? 0,
        totalCats: totalCats[0]?.count ?? 0,
        pendingVerifications: pendingVerifications[0]?.count ?? 0,
        activeRegistrations: activePets[0]?.count ?? 0,
        strays: strayPets[0]?.count ?? 0,
        impounded: impoundedPets[0]?.count ?? 0,
        adoptable: adoptablePets[0]?.count ?? 0,
      },
      biteCases: {
        total: totalBiteCases[0]?.count ?? 0,
        pending: pendingBiteCases[0]?.count ?? 0,
        underQuarantine: quarantineCases[0]?.count ?? 0,
        closed: closedCases[0]?.count ?? 0,
      },
      vaccinations: {
        total: totalVaccinations[0]?.count ?? 0,
        expired: expiredVaccinations[0]?.count ?? 0,
      },
      compliance: {
        leashed: leashedPets[0]?.count ?? 0,
        unleashed: unleashedPets[0]?.count ?? 0,
      },
      barangayBreakdown: barangayStats,
    };
  }),

  getTrends: adminQuery
    .input(
      z.object({
        months: z.number().min(1).max(24).default(12),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const months = input?.months ?? 12;

      // Get monthly registration counts
      const registrations = await db
        .select({
          month: sql<string>`DATE_FORMAT(${pets.dateRegistered}, '%Y-%m')`,
          count: count(pets.id),
        })
        .from(pets)
        .where(
          gte(
            pets.dateRegistered,
            sql`DATE_SUB(NOW(), INTERVAL ${months} MONTH)`
          )
        )
        .groupBy(sql`DATE_FORMAT(${pets.dateRegistered}, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(${pets.dateRegistered}, '%Y-%m')`);

      // Get monthly vaccination counts
      const vaccinations = await db
        .select({
          month: sql<string>`DATE_FORMAT(${vaccinationRecords.vaccinationDate}, '%Y-%m')`,
          count: count(vaccinationRecords.id),
        })
        .from(vaccinationRecords)
        .where(
          gte(
            vaccinationRecords.vaccinationDate,
            sql`DATE_SUB(NOW(), INTERVAL ${months} MONTH)`
          )
        )
        .groupBy(sql`DATE_FORMAT(${vaccinationRecords.vaccinationDate}, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(${vaccinationRecords.vaccinationDate}, '%Y-%m')`);

      return { registrations, vaccinations };
    }),

  getHotspotMap: adminQuery.query(async () => {
    const db = getDb();

    const biteCaseHotspots = await db
      .select({
        barangayName: barangays.name,
        barangayId: biteCases.barangayId,
        count: count(biteCases.id),
      })
      .from(biteCases)
      .leftJoin(barangays, eq(biteCases.barangayId, barangays.id))
      .groupBy(biteCases.barangayId)
      .orderBy(desc(count(biteCases.id)));

    return biteCaseHotspots;
  }),
});
