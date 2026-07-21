import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const propertyPhotos = mysqlTable(
  "propertyPhotos",
  {
    id: int("id").autoincrement().primaryKey(),
    propertyId: varchar("propertyId", { length: 80 }).notNull(),
    label: varchar("label", { length: 180 }).notNull(),
    originalFileName: varchar("originalFileName", { length: 220 }).notNull(),
    mimeType: varchar("mimeType", { length: 100 }).notNull(),
    storageKey: varchar("storageKey", { length: 512 }).notNull().unique(),
    url: varchar("url", { length: 1024 }).notNull(),
    source: mysqlEnum("source", ["individual", "zip"]).notNull(),
    uploadedByOpenId: varchar("uploadedByOpenId", { length: 64 }).notNull(),
    uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  },
  table => [
    index("property_photos_property_uploaded_idx").on(table.propertyId, table.uploadedAt),
    index("property_photos_uploaded_by_idx").on(table.uploadedByOpenId),
  ],
);

export type PropertyPhoto = typeof propertyPhotos.$inferSelect;
export type InsertPropertyPhoto = typeof propertyPhotos.$inferInsert;
