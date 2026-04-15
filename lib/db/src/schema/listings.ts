import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  price: text("price"),
  contactInfo: text("contact_info"),
  userId: text("user_id"),
  userName: text("user_name"),
  requestCount: integer("request_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({
  id: true,
  requestCount: true,
  createdAt: true,
});

export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
