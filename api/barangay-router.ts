import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { barangays } from "@db/schema";

export const barangayRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(barangays).orderBy(barangays.name);
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(barangays)
        .where(eq(barangays.id, input.id));
      return results[0] ?? null;
    }),
});
