import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  timestamp,
  text,
  integer,
  numeric,
  boolean,
  date,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { stat } from "fs";

export const PropertyOwnerTable = pgTable("property_owner", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  clerkId: text("clerk_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const PropertyTable = pgTable("property", {
  id: serial("id").primaryKey(),
  propertyOwnerId: integer("property_owner_id")
    .notNull()
    .references(() => PropertyOwnerTable.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  country: text("country").notNull(),
  mapUrl: text("map_url"),
  imageUrls: text("image_urls")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const RoomTable = pgTable("room", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id")
    .notNull()
    .references(() => PropertyTable.id),
  name: text("name").notNull(),
  floor: integer("floor").notNull().default(0),
  gender: text("gender"),
  imageUrls: text("image_urls")
    .notNull()
    .default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const BedTable = pgTable("bed", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id")
    .notNull()
    .references(() => RoomTable.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  monthlyRent: integer("monthly_rent").notNull(),
  dailyRent: integer("daily_rent").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const UserTable = pgTable("user", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  dob: date("dob"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const GuestTable = pgTable("guest", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => UserTable.id),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  dob: date("dob").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const CartTable = pgTable("cart", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => UserTable.id),
  guestId: integer("guest_id")
    .notNull()
    .references(() => GuestTable.id),
  bedId: integer("bed_id")
    .notNull()
    .references(() => BedTable.id),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const BedOccupancyTable = pgTable("bed_occupancy", {
  id: serial("id").primaryKey(),
  bedId: integer("bed_id")
    .notNull()
    .references(() => BedTable.id),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});
