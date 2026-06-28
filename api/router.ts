import { authRouter } from "./auth-router";
import { barangayRouter } from "./barangay-router";
import { petRouter } from "./pet-router";
import { vaccinationRouter } from "./vaccination-router";
import { surgeryRouter } from "./surgery-router";
import { biteCaseRouter } from "./bitecase-router";
import { impoundRouter } from "./impound-router";
import { incidentRouter } from "./incident-router";
import { notificationRouter } from "./notification-router";
import { analyticsRouter } from "./analytics-router";
import { crossBarangayRouter } from "./crossbarangay-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  barangay: barangayRouter,
  pet: petRouter,
  vaccination: vaccinationRouter,
  surgery: surgeryRouter,
  biteCase: biteCaseRouter,
  impound: impoundRouter,
  incident: incidentRouter,
  notification: notificationRouter,
  analytics: analyticsRouter,
  crossBarangay: crossBarangayRouter,
});

export type AppRouter = typeof appRouter;
