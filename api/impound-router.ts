import { z } from "zod";
import { eq, and, desc, count } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { impoundRecords, pets, barangays } from "@db/schema";

export const impoundRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        status: z.string().optional(),
        isAdoptable: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.status) {
        conditions.push(eq(impoundRecords.status, input.status as any));
      }
      if (input?.isAdoptable !== undefined) {
        conditions.push(eq(impoundRecords.isAdoptable, input.isAdoptable));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const results = await db
        .select({
          id: impoundRecords.id,
          petId: impoundRecords.petId,
          impoundDate: impoundRecords.impoundDate,
          locationFound: impoundRecords.locationFound,
          conditionNotes: impoundRecords.conditionNotes,
          isAdoptable: impoundRecords.isAdoptable,
          status: impoundRecords.status,
          adoptionDate: impoundRecords.adoptionDate,
          createdAt: impoundRecords.createdAt,
          petName: pets.name,
          petSpecies: pets.species,
          petPhotoUrl: pets.photoUrl,
          barangayName: barangays.name,
        })
        .from(impoundRecords)
        .leftJoin(pets, eq(impoundRecords.petId, pets.id))
        .leftJoin(barangays, eq(impoundRecords.barangayId, barangays.id))
        .where(whereClause)
        .orderBy(desc(impoundRecords.createdAt))
        .limit(input?.limit ?? 20)
        .offset(input?.offset ?? 0);

      const totalResult = await db
        .select({ count: count() })
        .from(impoundRecords)
        .where(whereClause);

      return {
        records: results,
        total: totalResult[0]?.count ?? 0,
      };
    }),

  create: authedQuery
    .input(
      z.object({
        petId: z.number(),
        barangayId: z.number(),
        locationFound: z.string().min(1),
        conditionNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(impoundRecords).values({
        petId: input.petId,
        impoundedBy: ctx.user.id,
        barangayId: input.barangayId,
        impoundDate: new Date(),
        locationFound: input.locationFound,
        conditionNotes: input.conditionNotes,
        status: "active",
      });

      // Update pet classification
      await db
        .update(pets)
        .set({ classification: "impounded" })
        .where(eq(pets.id, input.petId));

      return { id: Number(result[0].insertId) };
    }),

  markAdoptable: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(impoundRecords)
        .set({ isAdoptable: true })
        .where(eq(impoundRecords.id, input.id));

      const record = await db
        .select()
        .from(impoundRecords)
        .where(eq(impoundRecords.id, input.id));

      if (record[0]) {
        await db
          .update(pets)
          .set({ classification: "adoptable" })
          .where(eq(pets.id, record[0].petId));
      }

      return { success: true };
    }),

  adopt: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(impoundRecords)
        .set({
          status: "adopted",
          adoptedBy: ctx.user.id,
          adoptionDate: new Date(),
        })
        .where(eq(impoundRecords.id, input.id));

      const record = await db
        .select()
        .from(impoundRecords)
        .where(eq(impoundRecords.id, input.id));

      if (record[0]) {
        await db
          .update(pets)
          .set({
            classification: "pet",
            ownerId: ctx.user.id,
          })
          .where(eq(pets.id, record[0].petId));
      }

      return { success: true };
    }),

  release: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(impoundRecords)
        .set({ status: "released" })
        .where(eq(impoundRecords.id, input.id));
      return { success: true };
    }),
});
