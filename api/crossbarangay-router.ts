import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createRouter, barangayOperatorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { pets, notifications, barangays, users } from "@db/schema";

export const crossBarangayRouter = createRouter({
  // Flag a stray as suspected cross-barangay
  flagStray: barangayOperatorQuery
    .input(
      z.object({
        petId: z.number(),
        suspectedOriginBarangayId: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Update pet classification
      await db
        .update(pets)
        .set({
          classification: "suspected_cross_barangay",
          suspectedOriginBarangayId: input.suspectedOriginBarangayId,
        })
        .where(eq(pets.id, input.petId));

      // Get pet and barangay info for notification
      const petInfo = await db
        .select({
          petName: pets.name,
          petSpecies: pets.species,
          currentBarangayName: barangays.name,
        })
        .from(pets)
        .leftJoin(barangays, eq(pets.barangayId, barangays.id))
        .where(eq(pets.id, input.petId));

      const originBarangay = await db
        .select()
        .from(barangays)
        .where(eq(barangays.id, input.suspectedOriginBarangayId));

      // Create notification for operators in the suspected origin barangay
      const operators = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.role, "barangay_operator"),
            eq(users.barangayId, input.suspectedOriginBarangayId)
          )
        );

      for (const operator of operators) {
        await db.insert(notifications).values({
          userId: operator.id,
          type: "cross_barangay_alert",
          title: "Cross-Barangay Stray Alert",
          message: `A ${petInfo[0]?.petSpecies ?? "pet"} named "${petInfo[0]?.petName ?? "Unnamed"}" registered in ${petInfo[0]?.currentBarangayName ?? "another barangay"} is suspected to originate from your barangay (${originBarangay[0]?.name}). Please review and confirm.`,
          relatedPetId: input.petId,
          relatedBarangayId: input.suspectedOriginBarangayId,
        });
      }

      return { success: true };
    }),

  // List cross-barangay alerts for the current operator
  listAlerts: barangayOperatorQuery.query(async ({ ctx }) => {
    const db = getDb();

    const alerts = await db
      .select({
        id: pets.id,
        qrCode: pets.qrCode,
        name: pets.name,
        species: pets.species,
        breed: pets.breed,
        gender: pets.gender,
        colorMarkings: pets.colorMarkings,
        photoUrl: pets.photoUrl,
        dateRegistered: pets.dateRegistered,
        currentBarangayName: barangays.name,
      })
      .from(pets)
      .leftJoin(barangays, eq(pets.barangayId, barangays.id))
      .where(
        and(
          eq(pets.classification, "suspected_cross_barangay"),
          eq(pets.suspectedOriginBarangayId, ctx.user.barangayId ?? 0)
        )
      )
      .orderBy(desc(pets.dateRegistered));

    return alerts;
  }),

  // Confirm or reject cross-barangay alert
  resolveAlert: barangayOperatorQuery
    .input(
      z.object({
        petId: z.number(),
        confirm: z.boolean(), // true = confirm it's from this barangay, false = reject
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      if (input.confirm) {
        // Transfer pet to this barangay
        await db
          .update(pets)
          .set({
            barangayId: ctx.user.barangayId!,
            classification: "stray",
            suspectedOriginBarangayId: null,
          })
          .where(eq(pets.id, input.petId));
      } else {
        // Reject - keep in original barangay, remove suspicion
        await db
          .update(pets)
          .set({
            classification: "stray",
            suspectedOriginBarangayId: null,
          })
          .where(eq(pets.id, input.petId));
      }

      return { success: true };
    }),
});
