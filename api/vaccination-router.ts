import { z } from "zod";
import { eq, desc, and, gte, count } from "drizzle-orm";
import { createRouter, authedQuery, vetClinicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { vaccinationRecords } from "@db/schema";

export const vaccinationRouter = createRouter({
  listByPet: authedQuery
    .input(z.object({ petId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(vaccinationRecords)
        .where(eq(vaccinationRecords.petId, input.petId))
        .orderBy(desc(vaccinationRecords.vaccinationDate));
    }),

  create: vetClinicQuery
    .input(
      z.object({
        petId: z.number(),
        vaccineType: z.string().min(1),
        batchNumber: z.string().optional(),
        vaccinationDate: z.string(),
        nextDueDate: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(vaccinationRecords).values({
        petId: input.petId,
        vaccinatedBy: ctx.user.id,
        vaccineType: input.vaccineType,
        batchNumber: input.batchNumber,
        vaccinationDate: new Date(input.vaccinationDate),
        nextDueDate: new Date(input.nextDueDate),
        notes: input.notes,
        status: "active",
      });
      return { id: Number(result[0].insertId) };
    }),

  getDueCount: authedQuery.query(async () => {
    const db = getDb();
    const result = await db
      .select({ count: count() })
      .from(vaccinationRecords)
      .where(
        gte(vaccinationRecords.nextDueDate, new Date())
      );
    return result[0]?.count ?? 0;
  }),

  getDueByPet: authedQuery
    .input(z.object({ petId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(vaccinationRecords)
        .where(
          and(
            eq(vaccinationRecords.petId, input.petId),
            gte(vaccinationRecords.nextDueDate, new Date())
          )
        )
        .orderBy(desc(vaccinationRecords.nextDueDate));
    }),
});
