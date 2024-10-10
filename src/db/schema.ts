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
  pin: text("pin").notNull(),
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

export const AddressBookTable = pgTable("address_book", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pin: text("pin").notNull(),
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
  roomCode: text("code").notNull(),
  floor: integer("floor").notNull().default(0),
  gender: text("gender").notNull().default("male"),
  imageUrls: text("image_urls")
    .array()
    .notNull()
    .default(["/img/fall_back_room.png"]),
  available: boolean("available").default(true),
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
  bedCode: text("code").notNull(),
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
  addressId: integer("address_id").references(() => AddressBookTable.id),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  dob: date("dob"),
  purpose: text("purpose"),
  institute: text("institute"),
  enrollment: text("enrollment"),
  imageUrl: text("image_url").notNull(),
  idUrl: text("id_url"),
  guardianName: text("guardian_name"),
  guardianPhone: text("guardian_phone"),
  guardianPhoto: text("guardian_photo"),
  guardianIdUrl: text("guardian_id_url"),
  signature: text("signature"),
  onboarded: boolean("onboarded").notNull().default(false),
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
  purpose: text("purpose").notNull(),
  photoUrl: text("photo_url").notNull(),
  aadhaarUrl: text("aadhaar_url").notNull(),
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
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const BookingTable = pgTable("booking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => UserTable.id),
  transactionId: integer("transaction_id")
    .references(() => TransactionTable.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

const statusEnum = pgEnum("status", [
  "booked",
  "checked_in",
  "checked_out",
  "cancelled",
]);

export const BedBookingTable = pgTable("bed_booking", {
  id: serial("id").primaryKey(),
  bedId: integer("bed_id")
    .notNull()
    .references(() => BedTable.id),
  guestId: integer("guest_id")
    .notNull()
    .references(() => GuestTable.id),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => BookingTable.id),
  status: statusEnum("status").notNull().default("booked"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const UserRentTable = pgTable("user_rent", {
  id: serial("id").primaryKey(),
  totalAmount: integer("total_amount").notNull(),
  paidAmount: integer("paid_amount").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

const securityDepositEnum = pgEnum("status", ["pending", "paid", "lost"]);

export const securityDepositTable = pgTable("security_deposit", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: securityDepositEnum("status").notNull().default("pending"),
  warningLevel: integer("warning_level").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const TransactionTable = pgTable("transaction", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => UserTable.id),
  token: text("token").notNull(),
  discount: integer("discount").notNull(),
  rentAmount: integer("rent_amount").notNull(),
  securityDeposit: integer("security_deposit").notNull(),
  additionalCharges: integer("additional_charge").notNull(),
  totalAmount: integer("total_amount").notNull(),
  verified: boolean("verified").notNull().default(false),
  invoiceUrl: text("invoice_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const AgreementTable = pgTable("agreement", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => UserTable.id),
  agreementUrl: text("agreement_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const ReviewTable = pgTable("review", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => UserTable.id),
  roomId: integer("room_id").references(() => RoomTable.id),
  rating: integer("rating"),
  review: text("review"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
