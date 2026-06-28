import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  boolean,
  date,
  json,
  int,
  decimal,
} from "drizzle-orm/mysql-core";

// ─── Users ─────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", [
    "municipal_admin",
    "barangay_operator",
    "bite_center",
    "vet_clinic",
    "pet_owner",
  ])
    .default("pet_owner")
    .notNull(),
  barangayId: bigint("barangay_id", { mode: "number", unsigned: true }),
  clinicName: varchar("clinic_name", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Barangays ─────────────────────────────────────────────────────
export const barangays = mysqlTable("barangays", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  code: varchar("code", { length: 10 }).unique(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  populationEstimate: int("population_estimate"),
});

export type Barangay = typeof barangays.$inferSelect;

// ─── Pets ──────────────────────────────────────────────────────────
export const pets = mysqlTable("pets", {
  id: serial("id").primaryKey(),
  qrCode: varchar("qr_code", { length: 255 }).notNull().unique(),
  ownerId: bigint("owner_id", { mode: "number", unsigned: true }),
  barangayId: bigint("barangay_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }),
  species: mysqlEnum("species", ["dog", "cat"]).notNull(),
  breed: varchar("breed", { length: 255 }),
  gender: mysqlEnum("gender", ["male", "female", "unknown"]).notNull(),
  colorMarkings: text("color_markings"),
  distinguishingFeatures: text("distinguishing_features"),
  classification: mysqlEnum("classification", [
    "pet",
    "stray",
    "impounded",
    "adoptable",
    "suspected_cross_barangay",
  ])
    .default("pet")
    .notNull(),
  confinementStatus: mysqlEnum("confinement_status", ["leashed", "unleashed_roaming"])
    .default("leashed")
    .notNull(),
  registrationStatus: mysqlEnum("registration_status", [
    "pending_verification",
    "active",
    "rejected",
    "expired",
  ])
    .default("pending_verification")
    .notNull(),
  suspectedOriginBarangayId: bigint("suspected_origin_barangay_id", {
    mode: "number",
    unsigned: true,
  }),
  photoUrl: varchar("photo_url", { length: 500 }),
  dateOfBirth: date("date_of_birth"),
  dateRegistered: timestamp("date_registered").defaultNow().notNull(),
  verifiedBy: bigint("verified_by", { mode: "number", unsigned: true }),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Pet = typeof pets.$inferSelect;
export type InsertPet = typeof pets.$inferInsert;

// ─── Vaccination Records ──────────────────────────────────────────
export const vaccinationRecords = mysqlTable("vaccination_records", {
  id: serial("id").primaryKey(),
  petId: bigint("pet_id", { mode: "number", unsigned: true }).notNull(),
  vaccinatedBy: bigint("vaccinated_by", { mode: "number", unsigned: true }).notNull(),
  vaccineType: varchar("vaccine_type", { length: 255 }).notNull(),
  batchNumber: varchar("batch_number", { length: 100 }),
  vaccinationDate: date("vaccination_date").notNull(),
  nextDueDate: date("next_due_date").notNull(),
  status: mysqlEnum("status", ["active", "expired", "scheduled"])
    .default("active")
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type VaccinationRecord = typeof vaccinationRecords.$inferSelect;

// ─── Surgery Records ──────────────────────────────────────────────
export const surgeryRecords = mysqlTable("surgery_records", {
  id: serial("id").primaryKey(),
  petId: bigint("pet_id", { mode: "number", unsigned: true }).notNull(),
  performedBy: bigint("performed_by", { mode: "number", unsigned: true }).notNull(),
  surgeryType: mysqlEnum("surgery_type", ["spay", "neuter"]).notNull(),
  surgeryDate: date("surgery_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SurgeryRecord = typeof surgeryRecords.$inferSelect;

// ─── Bite Cases ───────────────────────────────────────────────────
export const biteCases = mysqlTable("bite_cases", {
  id: serial("id").primaryKey(),
  petId: bigint("pet_id", { mode: "number", unsigned: true }),
  reportedBy: bigint("reported_by", { mode: "number", unsigned: true }).notNull(),
  victimName: varchar("victim_name", { length: 255 }).notNull(),
  victimAge: int("victim_age"),
  victimGender: mysqlEnum("victim_gender", ["male", "female", "unknown"]),
  victimAddress: text("victim_address").notNull(),
  victimContact: varchar("victim_contact", { length: 50 }),
  barangayId: bigint("barangay_id", { mode: "number", unsigned: true }).notNull(),
  biteDate: date("bite_date").notNull(),
  biteLocation: varchar("bite_location", { length: 255 }).notNull(),
  circumstances: text("circumstances"),
  woundSeverity: mysqlEnum("wound_severity", ["minor", "moderate", "severe"]).notNull(),
  treatmentGiven: text("treatment_given"),
  status: mysqlEnum("status", ["pending_action", "under_quarantine", "case_closed"])
    .default("pending_action")
    .notNull(),
  quarantineStartDate: date("quarantine_start_date"),
  quarantineEndDate: date("quarantine_end_date"),
  caseClosedDate: date("case_closed_date"),
  closureNotes: text("closure_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type BiteCase = typeof biteCases.$inferSelect;

// ─── Impound Records ──────────────────────────────────────────────
export const impoundRecords = mysqlTable("impound_records", {
  id: serial("id").primaryKey(),
  petId: bigint("pet_id", { mode: "number", unsigned: true }).notNull(),
  impoundedBy: bigint("impounded_by", { mode: "number", unsigned: true }).notNull(),
  barangayId: bigint("barangay_id", { mode: "number", unsigned: true }).notNull(),
  impoundDate: date("impound_date").notNull(),
  locationFound: text("location_found").notNull(),
  conditionNotes: text("condition_notes"),
  isAdoptable: boolean("is_adoptable").default(false).notNull(),
  adoptedBy: bigint("adopted_by", { mode: "number", unsigned: true }),
  adoptionDate: date("adoption_date"),
  status: mysqlEnum("status", ["active", "released", "adopted", "euthanized"])
    .default("active")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type ImpoundRecord = typeof impoundRecords.$inferSelect;

// ─── Incident Reports ─────────────────────────────────────────────
export const incidentReports = mysqlTable("incident_reports", {
  id: serial("id").primaryKey(),
  reportedBy: bigint("reported_by", { mode: "number", unsigned: true }),
  barangayId: bigint("barangay_id", { mode: "number", unsigned: true }).notNull(),
  petDescription: text("pet_description").notNull(),
  incidentType: mysqlEnum("incident_type", [
    "stray_sighting",
    "aggressive_behavior",
    "noise_complaint",
    "welfare_concern",
    "other",
  ]).notNull(),
  location: text("location").notNull(),
  incidentDate: date("incident_date").notNull(),
  description: text("description").notNull(),
  contactInfo: varchar("contact_info", { length: 255 }),
  isAnonymous: boolean("is_anonymous").default(true).notNull(),
  status: mysqlEnum("status", ["pending", "investigating", "resolved"])
    .default("pending")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type IncidentReport = typeof incidentReports.$inferSelect;

// ─── Notifications ────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", [
    "cross_barangay_alert",
    "verification_required",
    "vaccination_due",
    "bite_incident",
    "adoption_available",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedPetId: bigint("related_pet_id", { mode: "number", unsigned: true }),
  relatedBarangayId: bigint("related_barangay_id", {
    mode: "number",
    unsigned: true,
  }),
  relatedBiteCaseId: bigint("related_bite_case_id", {
    mode: "number",
    unsigned: true,
  }),
  status: mysqlEnum("status", ["unread", "read", "dismissed"])
    .default("unread")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

// ─── Activity Logs ────────────────────────────────────────────────
export const activityLogs = mysqlTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }).notNull(),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
