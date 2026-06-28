import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery, barangayOperatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { incidentReports, barangays } from "@db/schema";

export const incidentRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        status: z.string().optional(),
        barangayId: z.number().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const conditions = [];

      if (ctx.user.role === "barangay_operator" && ctx.user.barangayId) {
        conditions.push(eq(incidentReports.barangayId, ctx.user.barangayId));
      }
      if (input?.status) {
        conditions.push(eq(incidentReports.status, input.status as any));
      }
      if (input?.barangayId) {
        conditions.push(eq(incidentReports.barangayId, input.barangayId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const results = await db
        .select({
          id: incidentReports.id,
          petDescription: incidentReports.petDescription,
          incidentType: incidentReports.incidentType,
          location: incidentReports.location,
          incidentDate: incidentReports.incidentDate,
          description: incidentReports.description,
          isAnonymous: incidentReports.isAnonymous,
          status: incidentReports.status,
          createdAt: incidentReports.createdAt,
          barangayName: barangays.name,
        })
        .from(incidentReports)
        .leftJoin(barangays, eq(incidentReports.barangayId, barangays.id))
        .where(whereClause)
        .orderBy(desc(incidentReports.createdAt))
        .limit(input?.limit ?? 20)
        .offset(input?.offset ?? 0);

      return results;
    }),

  create: publicQuery
    .input(
      z.object({
        barangayId: z.number(),
        petDescription: z.string().min(1),
        incidentType: z.enum([
          "stray_sighting",
          "aggressive_behavior",
          "noise_complaint",
          "welfare_concern",
          "other",
        ]),
        location: z.string().min(1),
        incidentDate: z.string(),
        description: z.string().min(1),
        contactInfo: z.string().optional(),
        isAnonymous: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(incidentReports).values({
        barangayId: input.barangayId,
        petDescription: input.petDescription,
        incidentType: input.incidentType,
        location: input.location,
        incidentDate: new Date(input.incidentDate),
        description: input.description,
        contactInfo: input.contactInfo,
        isAnonymous: input.isAnonymous,
        status: "pending",
      });
      return { id: Number(result[0].insertId) };
    }),

  updateStatus: barangayOperatorQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "investigating", "resolved"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(incidentReports)
        .set({ status: input.status })
        .where(eq(incidentReports.id, input.id));
      return { success: true };
    }),
});
