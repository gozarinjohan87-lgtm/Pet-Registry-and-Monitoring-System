import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery, vetClinicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { surgeryRecords } from "@db/schema";

export const surgeryRouter = createRouter({
  listByPet: authedQuery
    .input(z.object({ petId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(surgeryRecords)
        .where(eq(surgeryRecords.petId, input.petId))
        .orderBy(desc(surgeryRecords.surgeryDate));
    }),

  create: vetClinicQuery
    .input(
      z.object({
        petId: z.number(),
        surgeryType: z.enum(["spay", "neuter"]),
        surgeryDate: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(surgeryRecords).values({
        petId: input.petId,
        performedBy: ctx.user.id,
        surgeryType: input.surgeryType,
        surgeryDate: new Date(input.surgeryDate),
        notes: input.notes,
      });
      return { id: Number(result[0].insertId) };
    }),
});
