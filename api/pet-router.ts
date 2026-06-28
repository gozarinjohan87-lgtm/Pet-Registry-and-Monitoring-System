import { z } from "zod";
import { eq, and, desc, count, gte } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery, barangayOperatorQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { pets, barangays, users, vaccinationRecords } from "@db/schema";

// Helper to generate unique QR code
function generateQrCode(): string {
  const prefix = "IROSIN";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export const petRouter = createRouter({
  // ─── List pets (role-filtered) ─────────────────────────────────
  list: authedQuery
    .input(
      z.object({
        barangayId: z.number().optional(),
        ownerId: z.number().optional(),
        classification: z.string().optional(),
        registrationStatus: z.string().optional(),
        species: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user;
      const conditions = [];

      if (user.role === "barangay_operator" && user.barangayId) {
        conditions.push(eq(pets.barangayId, user.barangayId));
      }
      if (user.role === "pet_owner" || input?.ownerId) {
        conditions.push(eq(pets.ownerId, input?.ownerId ?? user.id));
      }
      if (input?.barangayId) {
        conditions.push(eq(pets.barangayId, input.barangayId));
      }
      if (input?.classification) {
        conditions.push(eq(pets.classification, input.classification as any));
      }
      if (input?.registrationStatus) {
        conditions.push(eq(pets.registrationStatus, input.registrationStatus as any));
      }
      if (input?.species) {
        conditions.push(eq(pets.species, input.species as any));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const results = await db
        .select({
          id: pets.id,
          qrCode: pets.qrCode,
          name: pets.name,
          species: pets.species,
          breed: pets.breed,
          gender: pets.gender,
          classification: pets.classification,
          confinementStatus: pets.confinementStatus,
          registrationStatus: pets.registrationStatus,
          photoUrl: pets.photoUrl,
          dateRegistered: pets.dateRegistered,
          createdAt: pets.createdAt,
          barangayName: barangays.name,
          ownerName: users.name,
        })
        .from(pets)
        .leftJoin(barangays, eq(pets.barangayId, barangays.id))
        .leftJoin(users, eq(pets.ownerId, users.id))
        .where(whereClause)
        .orderBy(desc(pets.createdAt))
        .limit(input?.limit ?? 20)
        .offset(input?.offset ?? 0);

      const totalResult = await db
        .select({ count: count() })
        .from(pets)
        .where(whereClause);

      return {
        pets: results,
        total: totalResult[0]?.count ?? 0,
      };
    }),

  // ─── Get pet by ID ─────────────────────────────────────────────
  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select({
          id: pets.id,
          qrCode: pets.qrCode,
          ownerId: pets.ownerId,
          barangayId: pets.barangayId,
          name: pets.name,
          species: pets.species,
          breed: pets.breed,
          gender: pets.gender,
          colorMarkings: pets.colorMarkings,
          distinguishingFeatures: pets.distinguishingFeatures,
          classification: pets.classification,
          confinementStatus: pets.confinementStatus,
          registrationStatus: pets.registrationStatus,
          suspectedOriginBarangayId: pets.suspectedOriginBarangayId,
          photoUrl: pets.photoUrl,
          dateOfBirth: pets.dateOfBirth,
          dateRegistered: pets.dateRegistered,
          verifiedBy: pets.verifiedBy,
          verifiedAt: pets.verifiedAt,
          createdAt: pets.createdAt,
          updatedAt: pets.updatedAt,
          barangayName: barangays.name,
          ownerName: users.name,
          ownerEmail: users.email,
        })
        .from(pets)
        .leftJoin(barangays, eq(pets.barangayId, barangays.id))
        .leftJoin(users, eq(pets.ownerId, users.id))
        .where(eq(pets.id, input.id));

      return results[0] ?? null;
    }),

  // ─── Get pet by QR code ────────────────────────────────────────
  getByQrCode: authedQuery
    .input(z.object({ qrCode: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select({
          id: pets.id,
          qrCode: pets.qrCode,
          name: pets.name,
          species: pets.species,
          breed: pets.breed,
          gender: pets.gender,
          colorMarkings: pets.colorMarkings,
          distinguishingFeatures: pets.distinguishingFeatures,
          classification: pets.classification,
          confinementStatus: pets.confinementStatus,
          registrationStatus: pets.registrationStatus,
          photoUrl: pets.photoUrl,
          dateOfBirth: pets.dateOfBirth,
          dateRegistered: pets.dateRegistered,
          barangayName: barangays.name,
          ownerName: users.name,
        })
        .from(pets)
        .leftJoin(barangays, eq(pets.barangayId, barangays.id))
        .leftJoin(users, eq(pets.ownerId, users.id))
        .where(eq(pets.qrCode, input.qrCode));

      return results[0] ?? null;
    }),

  // ─── Create pet ────────────────────────────────────────────────
  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1),
        species: z.enum(["dog", "cat"]),
        breed: z.string().optional(),
        gender: z.enum(["male", "female", "unknown"]),
        colorMarkings: z.string().optional(),
        distinguishingFeatures: z.string().optional(),
        confinementStatus: z.enum(["leashed", "unleashed_roaming"]).default("leashed"),
        barangayId: z.number(),
        dateOfBirth: z.string().optional(),
        photoUrl: z.string().optional(),
        classification: z.enum(["pet", "stray", "impounded", "adoptable", "suspected_cross_barangay"]).default("pet"),
        suspectedOriginBarangayId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user;

      const qrCode = generateQrCode();

      const result = await db.insert(pets).values({
        qrCode,
        ownerId: user.role === "pet_owner" ? user.id : undefined,
        barangayId: input.barangayId,
        name: input.name,
        species: input.species,
        breed: input.breed,
        gender: input.gender,
        colorMarkings: input.colorMarkings,
        distinguishingFeatures: input.distinguishingFeatures,
        confinementStatus: input.confinementStatus,
        classification: input.classification,
        suspectedOriginBarangayId: input.suspectedOriginBarangayId,
        photoUrl: input.photoUrl,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        registrationStatus:
          user.role === "barangay_operator" || user.role === "municipal_admin"
            ? "active"
            : "pending_verification",
        verifiedBy:
          user.role === "barangay_operator" || user.role === "municipal_admin"
            ? user.id
            : undefined,
        verifiedAt:
          user.role === "barangay_operator" || user.role === "municipal_admin"
            ? new Date()
            : undefined,
      });

      return { id: Number(result[0].insertId), qrCode };
    }),

  // ─── Update pet ────────────────────────────────────────────────
  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        breed: z.string().optional(),
        colorMarkings: z.string().optional(),
        distinguishingFeatures: z.string().optional(),
        confinementStatus: z.enum(["leashed", "unleashed_roaming"]).optional(),
        photoUrl: z.string().optional(),
        classification: z.enum(["pet", "stray", "impounded", "adoptable", "suspected_cross_barangay"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(pets).set(data).where(eq(pets.id, id));
      return { success: true };
    }),

  // ─── Verify pet (barangay operator) ────────────────────────────
  verify: barangayOperatorQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(pets)
        .set({
          registrationStatus: "active",
          verifiedBy: ctx.user.id,
          verifiedAt: new Date(),
        })
        .where(eq(pets.id, input.id));
      return { success: true };
    }),

  // ─── Reject pet ────────────────────────────────────────────────
  reject: barangayOperatorQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(pets)
        .set({ registrationStatus: "rejected" })
        .where(eq(pets.id, input.id));
      return { success: true };
    }),

  // ─── Delete pet ────────────────────────────────────────────────
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(pets).where(eq(pets.id, input.id));
      return { success: true };
    }),

  // ─── Get adoptable pets (public) ──────────────────────────────
  getAdoptable: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: pets.id,
        qrCode: pets.qrCode,
        name: pets.name,
        species: pets.species,
        breed: pets.breed,
        gender: pets.gender,
        colorMarkings: pets.colorMarkings,
        distinguishingFeatures: pets.distinguishingFeatures,
        photoUrl: pets.photoUrl,
        dateRegistered: pets.dateRegistered,
        barangayName: barangays.name,
      })
      .from(pets)
      .leftJoin(barangays, eq(pets.barangayId, barangays.id))
      .where(eq(pets.classification, "adoptable"))
      .orderBy(desc(pets.createdAt));
  }),

  // ─── Dashboard stats ───────────────────────────────────────────
  getStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = ctx.user;

    const conditions = [];
    if (user.role === "barangay_operator" && user.barangayId) {
      conditions.push(eq(pets.barangayId, user.barangayId));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [
      totalPets,
      pendingPets,
      activePets,
      dogCount,
      catCount,
      strayCount,
      vaccinatedCount,
    ] = await Promise.all([
      db.select({ count: count() }).from(pets).where(whereClause),
      db
        .select({ count: count() })
        .from(pets)
        .where(
          conditions.length > 0
            ? and(...conditions, eq(pets.registrationStatus, "pending_verification"))
            : eq(pets.registrationStatus, "pending_verification")
        ),
      db
        .select({ count: count() })
        .from(pets)
        .where(
          conditions.length > 0
            ? and(...conditions, eq(pets.registrationStatus, "active"))
            : eq(pets.registrationStatus, "active")
        ),
      db
        .select({ count: count() })
        .from(pets)
        .where(
          conditions.length > 0
            ? and(...conditions, eq(pets.species, "dog"))
            : eq(pets.species, "dog")
        ),
      db
        .select({ count: count() })
        .from(pets)
        .where(
          conditions.length > 0
            ? and(...conditions, eq(pets.species, "cat"))
            : eq(pets.species, "cat")
        ),
      db
        .select({ count: count() })
        .from(pets)
        .where(
          conditions.length > 0
            ? and(...conditions, eq(pets.classification, "stray"))
            : eq(pets.classification, "stray")
        ),
      db
        .select({ count: count() })
        .from(vaccinationRecords)
        .where(
          gte(vaccinationRecords.nextDueDate, new Date())
        ),
    ]);

    return {
      total: totalPets[0]?.count ?? 0,
      pending: pendingPets[0]?.count ?? 0,
      active: activePets[0]?.count ?? 0,
      dogs: dogCount[0]?.count ?? 0,
      cats: catCount[0]?.count ?? 0,
      strays: strayCount[0]?.count ?? 0,
      vaccinated: vaccinatedCount[0]?.count ?? 0,
    };
  }),
});
