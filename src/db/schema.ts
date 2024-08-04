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
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { stat } from "fs";

export const buildingTable = pgTable("building", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const roomTypeTable = pgTable("room_type", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const roomTable = pgTable("room", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id")
    .notNull()
    .references(() => buildingTable.id),
  roomTypeId: integer("room_type_id")
    .notNull()
    .references(() => roomTypeTable.id),
  roomNumber: text("room_number").notNull(),
  dailyPrice: numeric("daily_price").notNull(),
  monthlyPrice: numeric("monthly_price").notNull(),
  genderRestriction: text("gender_restriction"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
  imageUrls: text("image_urls")
    .notNull()
    .default(sql`'{}'::text[]`),
});

export const bedTable = pgTable("bed", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id")
    .notNull()
    .references(() => roomTable.id),
  bedType: text("bed_type").notNull(),
  bedCode: text("bed_code").notNull(),
  occupied: boolean("occupied").notNull().default(false),
  dailyPrice: numeric("daily_price").notNull(),
  monthlyPrice: numeric("monthly_price").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const guestTable = pgTable(
  "guest",
  {
    id: serial("id").primaryKey(),
    clerkId: text("clerk_id").notNull(),
    name: text("name").notNull(),
    userName: text("user_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull().default(""),
    dob: date("dob"),
    address: text("address").notNull().default(""),
    aadhaar: numeric("aadhaar"),
    gender: text("gender").default(""),
    googlePic: text("google_pic"),
    guardianName: text("guardian_name"),
    guardianPhone: text("guardian_phone"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      userNameUnique: uniqueIndex("user_name_unique").on(table.userName),
    };
  },
);

export const bookingTable = pgTable("booking", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id")
    .notNull()
    .references(() => guestTable.id),
  roomId: integer("room_id")
    .notNull()
    .references(() => roomTable.id),
  bedId: integer("bed_id").references(() => bedTable.id),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const bedOccupancyTable = pgTable(
  "bed_occupancy",
  {
    id: serial("id").primaryKey(),
    bedId: integer("bed_id")
      .notNull()
      .references(() => bedTable.id),
    isOccupied: boolean("is_occupied").notNull().default(false),
    currentBookingId: integer("current_booking_id").references(
      () => bookingTable.id,
    ),
    lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  },
  (table) => {
    return {
      bedIdUnique: uniqueIndex("bed_id_unique").on(table.bedId),
    };
  },
);

export const paymentTable = pgTable("payment", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookingTable.id),
  amount: integer("amount").notNull(),
  token: text("token").notNull(),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const agreementTable = pgTable("agreement", {
  id: serial("id").primaryKey(),
  guestName: text("guest_name").notNull(),
  guestAddress: text("guest_address").notNull(),
  agreementDate: date("agreement_date").notNull(),
  duration: integer("duration").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});
