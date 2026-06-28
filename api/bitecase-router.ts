import { z } from "zod";
import { eq, and, desc, count } from "drizzle-orm";
import { createRouter, authedQuery, biteCenterQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { biteCases, pets, barangays, users } from "@db/schema";

export const biteCaseRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        status: z.string().optional(),
        barangayId: z.number().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.status) {
        conditions.push(eq(biteCases.status, input.status as any));
      }
      if (input?.barangayId) {
        conditions.push(eq(biteCases.barangayId, input.barangayId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const results = await db
        .select({
          id: biteCases.id,
          victimName: biteCases.victimName,
          victimAge: biteCases.victimAge,
          biteDate: biteCases.biteDate,
          biteLocation: biteCases.biteLocation,
          woundSeverity: biteCases.woundSeverity,
          status: biteCases.status,
          quarantineStartDate: biteCases.quarantineStartDate,
          quarantineEndDate: biteCases.quarantineEndDate,
          createdAt: biteCases.createdAt,
          petName: pets.name,
          petSpecies: pets.species,
          barangayName: barangays.name,
        })
        .from(biteCases)
        .leftJoin(pets, eq(biteCases.petId, pets.id))
        .leftJoin(barangays, eq(biteCases.barangayId, barangays.id))
        .where(whereClause)
        .orderBy(desc(biteCases.createdAt))
        .limit(input?.limit ?? 20)
        .offset(input?.offset ?? 0);

      const totalResult = await db
        .select({ count: count() })
        .from(biteCases)
        .where(whereClause);

      return {
        cases: results,
        total: totalResult[0]?.count ?? 0,
      };
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select({
          id: biteCases.id,
          petId: biteCases.petId,
          victimName: biteCases.victimName,
          victimAge: biteCases.victimAge,
          victimGender: biteCases.victimGender,
          victimAddress: biteCases.victimAddress,
          victimContact: biteCases.victimContact,
          biteDate: biteCases.biteDate,
          biteLocation: biteCases.biteLocation,
          circumstances: biteCases.circumstances,
          woundSeverity: biteCases.woundSeverity,
          treatmentGiven: biteCases.treatmentGiven,
          status: biteCases.status,
          quarantineStartDate: biteCases.quarantineStartDate,
          quarantineEndDate: biteCases.quarantineEndDate,
          caseClosedDate: biteCases.caseClosedDate,
          closureNotes: biteCases.closureNotes,
          createdAt: biteCases.createdAt,
          updatedAt: biteCases.updatedAt,
          petName: pets.name,
          petSpecies: pets.species,
          petQrCode: pets.qrCode,
          barangayName: barangays.name,
          reporterName: users.name,
        })
        .from(biteCases)
        .leftJoin(pets, eq(biteCases.petId, pets.id))
        .leftJoin(barangays, eq(biteCases.barangayId, barangays.id))
        .leftJoin(users, eq(biteCases.reportedBy, users.id))
        .where(eq(biteCases.id, input.id));

      return results[0] ?? null;
    }),

  create: biteCenterQuery
    .input(
      z.object({
        petId: z.number().optional(),
        victimName: z.string().min(1),
        victimAge: z.number().optional(),
        victimGender: z.enum(["male", "female", "unknown"]).optional(),
        victimAddress: z.string().min(1),
        victimContact: z.string().optional(),
        barangayId: z.number(),
        biteDate: z.string(),
        biteLocation: z.string().min(1),
        circumstances: z.string().optional(),
        woundSeverity: z.enum(["minor", "moderate", "severe"]),
        treatmentGiven: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(biteCases).values({
        petId: input.petId,
        reportedBy: ctx.user.id,
        victimName: input.victimName,
        victimAge: input.victimAge,
        victimGender: input.victimGender,
        victimAddress: input.victimAddress,
        victimContact: input.victimContact,
        barangayId: input.barangayId,
        biteDate: new Date(input.biteDate),
        biteLocation: input.biteLocation,
        circumstances: input.circumstances,
        woundSeverity: input.woundSeverity,
        treatmentGiven: input.treatmentGiven,
        status: "pending_action",
      });
      return { id: Number(result[0].insertId) };
    }),

  updateStatus: biteCenterQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending_action", "under_quarantine", "case_closed"]),
        quarantineStartDate: z.string().optional(),
        quarantineEndDate: z.string().optional(),
        closureNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updates: any = { status: input.status };
      if (input.quarantineStartDate)
        updates.quarantineStartDate = new Date(input.quarantineStartDate);
      if (input.quarantineEndDate)
        updates.quarantineEndDate = new Date(input.quarantineEndDate);
      if (input.status === "case_closed") {
        updates.caseClosedDate = new Date();
        updates.closureNotes = input.closureNotes;
      }

      await db.update(biteCases).set(updates).where(eq(biteCases.id, input.id));
      return { success: true };
    }),

  getStats: adminQuery.query(async () => {
    const db = getDb();
    const [total, pending, quarantine, closed] = await Promise.all([
      db.select({ count: count() }).from(biteCases),
      db.select({ count: count() }).from(biteCases).where(eq(biteCases.status, "pending_action")),
      db.select({ count: count() }).from(biteCases).where(eq(biteCases.status, "under_quarantine")),
      db.select({ count: count() }).from(biteCases).where(eq(biteCases.status, "case_closed")),
    ]);

    return {
      total: total[0]?.count ?? 0,
      pending: pending[0]?.count ?? 0,
      underQuarantine: quarantine[0]?.count ?? 0,
      closed: closed[0]?.count ?? 0,
    };
  }),
});
