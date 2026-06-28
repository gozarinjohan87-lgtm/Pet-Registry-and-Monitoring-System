import { relations } from "drizzle-orm";
import {
  users,
  barangays,
  pets,
  vaccinationRecords,
  surgeryRecords,
  biteCases,
  impoundRecords,
  incidentReports,
  notifications,
  activityLogs,
} from "./schema";

// ─── Users Relations ──────────────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  barangay: one(barangays, {
    fields: [users.barangayId],
    references: [barangays.id],
  }),
  pets: many(pets),
  vaccinations: many(vaccinationRecords),
  surgeries: many(surgeryRecords),
  biteCases: many(biteCases),
  impounds: many(impoundRecords),
  notifications: many(notifications),
  activityLogs: many(activityLogs),
}));

// ─── Barangays Relations ─────────────────────────────────────────
export const barangaysRelations = relations(barangays, ({ many }) => ({
  users: many(users),
  pets: many(pets),
  biteCases: many(biteCases),
  impoundRecords: many(impoundRecords),
  incidentReports: many(incidentReports),
  notifications: many(notifications),
}));

// ─── Pets Relations ──────────────────────────────────────────────
export const petsRelations = relations(pets, ({ one, many }) => ({
  owner: one(users, {
    fields: [pets.ownerId],
    references: [users.id],
  }),
  barangay: one(barangays, {
    fields: [pets.barangayId],
    references: [barangays.id],
  }),
  vaccinations: many(vaccinationRecords),
  surgeries: many(surgeryRecords),
  biteCases: many(biteCases),
  impoundRecords: many(impoundRecords),
}));

// ─── Vaccination Records Relations ───────────────────────────────
export const vaccinationRecordsRelations = relations(vaccinationRecords, ({ one }) => ({
  pet: one(pets, {
    fields: [vaccinationRecords.petId],
    references: [pets.id],
  }),
  vaccinator: one(users, {
    fields: [vaccinationRecords.vaccinatedBy],
    references: [users.id],
  }),
}));

// ─── Surgery Records Relations ───────────────────────────────────
export const surgeryRecordsRelations = relations(surgeryRecords, ({ one }) => ({
  pet: one(pets, {
    fields: [surgeryRecords.petId],
    references: [pets.id],
  }),
  performer: one(users, {
    fields: [surgeryRecords.performedBy],
    references: [users.id],
  }),
}));

// ─── Bite Cases Relations ────────────────────────────────────────
export const biteCasesRelations = relations(biteCases, ({ one }) => ({
  pet: one(pets, {
    fields: [biteCases.petId],
    references: [pets.id],
  }),
  reporter: one(users, {
    fields: [biteCases.reportedBy],
    references: [users.id],
  }),
  barangay: one(barangays, {
    fields: [biteCases.barangayId],
    references: [barangays.id],
  }),
}));

// ─── Impound Records Relations ───────────────────────────────────
export const impoundRecordsRelations = relations(impoundRecords, ({ one }) => ({
  pet: one(pets, {
    fields: [impoundRecords.petId],
    references: [pets.id],
  }),
  impounder: one(users, {
    fields: [impoundRecords.impoundedBy],
    references: [users.id],
  }),
  barangay: one(barangays, {
    fields: [impoundRecords.barangayId],
    references: [barangays.id],
  }),
}));

// ─── Incident Reports Relations ──────────────────────────────────
export const incidentReportsRelations = relations(incidentReports, ({ one }) => ({
  reporter: one(users, {
    fields: [incidentReports.reportedBy],
    references: [users.id],
  }),
  barangay: one(barangays, {
    fields: [incidentReports.barangayId],
    references: [barangays.id],
  }),
}));

// ─── Notifications Relations ─────────────────────────────────────
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// ─── Activity Logs Relations ─────────────────────────────────────
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));
