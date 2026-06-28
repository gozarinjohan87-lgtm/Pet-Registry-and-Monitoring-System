import { z } from "zod";
import { eq, and, desc, count } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notifications } from "@db/schema";

export const notificationRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        status: z.enum(["unread", "read", "dismissed"]).optional(),
        limit: z.number().min(1).max(50).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [eq(notifications.userId, ctx.user.id)];

      if (input?.status) {
        conditions.push(eq(notifications.status, input.status));
      } else {
        conditions.push(eq(notifications.status, "unread"));
      }

      return db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(input?.limit ?? 20);
    }),

  getUnreadCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.status, "unread")
        )
      );
    return result[0]?.count ?? 0;
  }),

  markRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(notifications)
        .set({ status: "read" })
        .where(eq(notifications.id, input.id));
      return { success: true };
    }),

  dismiss: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(notifications)
        .set({ status: "dismissed" })
        .where(eq(notifications.id, input.id));
      return { success: true };
    }),

  create: authedQuery
    .input(
      z.object({
        userId: z.number(),
        type: z.enum([
          "cross_barangay_alert",
          "verification_required",
          "vaccination_due",
          "bite_incident",
          "adoption_available",
        ]),
        title: z.string().min(1),
        message: z.string().min(1),
        relatedPetId: z.number().optional(),
        relatedBarangayId: z.number().optional(),
        relatedBiteCaseId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(notifications).values({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        relatedPetId: input.relatedPetId,
        relatedBarangayId: input.relatedBarangayId,
        relatedBiteCaseId: input.relatedBiteCaseId,
        status: "unread",
      });
      return { id: Number(result[0].insertId) };
    }),
});
