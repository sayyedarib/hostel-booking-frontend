import {
  pgTable,
  serial,
  timestamp,
  text,
  integer,
  numeric,
  boolean,
  date,
} from "drizzle-orm/pg-core";

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
  name: text("name").notNull(), // '2 seater', '3 seater', '4 seater', etc.
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
  genderRestriction: text("gender_restriction"), // 'male', 'female', or null for no restriction
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const bedTable = pgTable("bed", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id")
    .notNull()
    .references(() => roomTable.id),
  bedType: text("bed_type").notNull(), // 'lower_A', 'lower_B', 'upper_A', 'upper_B'
  dailyPrice: numeric("daily_price").notNull(),
  monthlyPrice: numeric("monthly_price").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const bedOccupancyTable = pgTable("bed_occupancy", {
  id: serial("id").primaryKey(),
  bedId: integer("bed_id")
    .notNull()
    .references(() => bedTable.id)
    .unique(),
  isOccupied: boolean("is_occupied").notNull().default(false),
  currentBookingId: integer("current_booking_id").references(
    () => bookingTable.id,
  ),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const guestTable = pgTable("guest", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userName: text("user_name").notNull().unique(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  dob: date("dob"),
  gender: text("gender").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const bookingTable = pgTable("booking", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id")
    .notNull()
    .references(() => guestTable.id),
  roomId: integer("room_id")
    .notNull()
    .references(() => roomTable.id),
  bedId: integer("bed_id").references(() => bedTable.id),
  bookingType: text("booking_type").notNull(), // 'bed', 'room'
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  bookingInterval: text("booking_interval").notNull(), // 'check_in - check_out'
  status: text("status").notNull().default("active"), // 'active', 'cancelled', 'completed'
  pricingType: text("pricing_type").notNull(), // 'daily', 'monthly'
  totalAmount: numeric("total_amount").notNull(),
  securityDeposit: numeric("security_deposit").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const paymentTable = pgTable("payment", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookingTable.id),
  amount: numeric("amount").notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentType: text("payment_type").notNull(), // 'security_deposit', 'rent', 'extra'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});
