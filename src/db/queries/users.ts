"use server";
/*
 * Split out of a single 2,200-line module. Every export here is a Next.js
 * server action — a publicly reachable HTTP endpoint — so each one authorizes
 * itself via requireUser/requireAdmin from @/lib/auth.
 */

import { eq, and, count, sql, inArray, gte, lte, or } from "drizzle-orm";

import type { OccupiedDateRange } from "@/interface";

import { logger } from "@/lib/utils";
import { db } from "@/db";
import {
  AddressBookTable,
  BedTable,
  BedBookingTable,
  BookingTable,
  CartTable,
  GuestTable,
  PropertyTable,
  ReviewTable,
  RoomTable,
  securityDepositTable,
  TransactionTable,
  UserTable,
} from "@/db/schema";
import {
  AgreementForm,
  CreateUser,
  CreateGuest,
  CreateAddress,
  UpdateUser,
} from "@/interface";

import { auth } from "@clerk/nextjs/server";
import { generateToken } from "@/lib/utils";
import { requireAdmin, requireUser, resolveTargetUserId } from "@/lib/auth";
import { updateUserDocument } from "./_internal";

const getClerkId = () => {
  return auth().userId;
};

/**
 * How far ahead a booking makes a bed unavailable.
 *
 * A bed booked to start within this window cannot be taken by someone else,
 * because the incoming resident needs it prepared. Room cards and the booking
 * drawer must agree on this number or the two views contradict each other.
 */
const BOOKING_LEAD_DAYS = 15;

export const getUserId = async () => {
  try {
    const clerkId = getClerkId();
    logger("info", "Fetching user ID", { clerkId });
    if (!clerkId) {
      logger("info", "Clerk ID not found");
      return { status: "error", data: null };
    }

    const user = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.clerkId, clerkId));
    logger("info", "User have been found");
    logger("info", "UserId found", { userId: user[0]?.id, clerkId });
    return { status: "success", data: user[0]?.id };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger("error", "Error fetching user", { error: errorMessage });
    return { status: "error", data: null };
  }
};

export const getUserData = async () => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Fetching user data", { userId: userId.data });
    const user = await db
      .select({
        name: UserTable.name,
        phone: UserTable.phone,
        email: UserTable.email,
        applicantPhoto: UserTable.imageUrl,
        dob: UserTable.dob,
        purpose: UserTable.purpose,
        userIdImage: UserTable.idUrl,
      })
      .from(UserTable)
      .where(eq(UserTable.id, userId.data));

    logger("info", "Fetched user data", { user: user[0] });
    return { status: "success", data: user[0] };
  } catch (error) {
    logger("error", "Error fetching user data", { error });
    return { status: "error", data: null };
  }
};

export const getUserOnboardingStatus = async () => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Fetching user onboarding status", { userId: userId.data });
    const user = await db
      .select({
        onboarded: UserTable.onboarded,
      })
      .from(UserTable)
      .where(eq(UserTable.id, userId.data));

    logger("info", "Fetched user onboarding status", { user: user[0] });
    return { status: "success", data: user[0] };
  } catch (error) {
    logger("error", "Error fetching user onboarding status", { error });
    return { status: "error", data: null };
  }
};

export const createAddress = async ({
  address,
  city,
  state,
  pin,
}: CreateAddress) => {
  try {
    await requireUser();
    logger("info", "Creating address", { address, city, state, pin });
    const addressId = await db
      .insert(AddressBookTable)
      .values({
        address,
        city,
        state,
        pin,
      })
      .returning({
        id: AddressBookTable.id,
      });
    logger("info", "Address created successfully");
    return { status: "success", data: addressId[0].id };
  } catch (error) {
    logger("error", "Error in creating address", { error });
    return { status: "error", data: null };
  }
};

export const updateUserSubProfile = async ({
  imageUrl,
  dob,
  idUrl,
  guardianName,
  guardianPhone,
  guardianPhoto,
  guardianIdUrl,
  addressId,
  onboarded,
}: {
  imageUrl: string;
  dob: string;
  idUrl: string;
  guardianName: string;
  guardianPhone: string;
  guardianPhoto: string;
  guardianIdUrl: string;
  addressId: number;
  onboarded: boolean;
}) => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Updating user", { userId: userId.data });
    await db
      .update(UserTable)
      .set({
        imageUrl,
        dob,
        idUrl,
        guardianName,
        guardianPhone,
        guardianPhoto,
        guardianIdUrl,
        addressId,
        onboarded,
      })
      .where(eq(UserTable.id, userId.data))
      .execute();
    logger("info", "User updated successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error in updating user", { error });
    return { status: "error", data: null };
  }
};

export const updateUserSignature = async ({
  signature,
}: {
  signature: string;
}) => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Updating user signature", { userId: userId.data });
    await db
      .update(UserTable)
      .set({
        signature,
      })
      .where(eq(UserTable.id, userId.data))
      .execute();
    logger("info", "User signature updated successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error in updating user signature", { error });
    return { status: "error", data: null };
  }
};

export const updateUserDetails = async ({
  name,
  phone,
  dob,
  purpose,
  photoUrl,
  aadhaarUrl,
  enrollment,
  institute,
}: UpdateUser) => {
  try {
    logger("info", "Updating user details", { name, phone, dob, purpose });
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null, message: "User not found" };
    }

    const updatedUser = await db
      .update(UserTable)
      .set({
        name,
        phone,
        dob,
        purpose,
        imageUrl: photoUrl,
        idUrl: aadhaarUrl,
        enrollment,
        institute,
      })
      .where(eq(UserTable.id, userId.data))
      .returning();

    if (updatedUser.length === 0) {
      logger("error", "Failed to update user details");
      return {
        status: "error",
        data: null,
        message: "Failed to update user details",
      };
    }

    logger("info", "User details updated successfully");
    return {
      status: "success",
      data: updatedUser[0],
      message: "User details updated successfully",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger("error", "Error updating user details", { error: errorMessage });
    return {
      status: "error",
      data: null,
      message: "Error updating user details",
    };
  }
};

export const updateAddressAndGuardian = async ({
  address,
  city,
  state,
  pin,
  guardianName,
  guardianPhone,
}: {
  address: string;
  city: string;
  state: string;
  pin: string;
  guardianName: string;
  guardianPhone: string;
}) => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Updating user address and guardian details", {
      userId: userId.data,
    });

    // Create a new address
    const newAddressId = await db
      .insert(AddressBookTable)
      .values({
        address,
        city,
        state,
        pin,
      })
      .returning({ id: AddressBookTable.id });

    // Update user with new address and guardian details
    await db
      .update(UserTable)
      .set({
        addressId: newAddressId[0].id,
        guardianName,
        guardianPhone,
        onboarded: true, // Set onboarded status to true
      })
      .where(eq(UserTable.id, userId.data))
      .execute();

    logger("info", "User address and guardian details updated successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error in updating user address and guardian details", {
      error,
    });
    return { status: "error", data: null };
  }
};

export const getUsersData = async () => {
  try {
    await requireAdmin();
    const users = await db
      .select({
        id: UserTable.id,
        name: UserTable.name,
        email: UserTable.email,
        phone: UserTable.phone,
        role: UserTable.role,
        onboarded: UserTable.onboarded,
        createdAt: UserTable.createdAt,
      })
      .from(UserTable)
      .orderBy(sql`${UserTable.createdAt} DESC`);

    return { status: "success", data: users };
  } catch (error) {
    logger("error", "Error fetching user data", { error });
    return { status: "error", data: null };
  }
};

export const getUserDataById = async (requestedUserId?: number | null) => {
  try {
    // This row carries ID-document URLs and a signature; only the owner or an
    // admin may read it.
    const userId = await resolveTargetUserId(requestedUserId);

    const user = await db
      .select({
        id: UserTable.id,
        name: UserTable.name,
        email: UserTable.email,
        phone: UserTable.phone,
        applicantPhoto: UserTable.imageUrl,
        dob: UserTable.dob,
        userIdImage: UserTable.idUrl,
        guardianIdImage: UserTable.guardianIdUrl,
        guardianName: UserTable.guardianName,
        guardianPhone: UserTable.guardianPhone,
        guardianPhoto: UserTable.guardianPhoto,
        signature: UserTable.signature,
        address: AddressBookTable.address,
        pin: AddressBookTable.pin,
        city: AddressBookTable.city,
        state: AddressBookTable.state,
      })
      .from(UserTable)
      .leftJoin(AddressBookTable, eq(UserTable.addressId, AddressBookTable.id))
      .where(eq(UserTable.id, userId));

    logger("info", "Fetched user data", { user });
    return { status: "success", data: user };
  } catch (error) {
    logger("error", "Error fetching user data", { error });
    return { status: "error", data: null };
  }
};

export const updateUserPersonalDetails = async (
  data: FormData,
  userId?: number | null,
) => {
  if (!userId) {
    const { data } = await getUserId();
    userId = data;
  }

  if (!userId) {
    logger("error", "User not found");
    return { status: "error" };
  }

  try {
    logger("info", "User data", {
      user: data.get("name") as string,
      email: data.get("email") as string,
      phone: data.get("phone") as string,
      dob: data.get("dob") as string,
    });

    await db.transaction(async (trx) => {
      try {
        logger("info", "Updating user personal data", { userId });
        await trx
          .update(UserTable)
          .set({
            name: data.get("name") as string,
            email: data.get("email") as string,
            phone: data.get("phone") as string,
            dob:
              data.has("dob") && data.get("dob") !== ""
                ? new Date(data.get("dob") as string).toISOString()
                : null,
          })
          .where(eq(UserTable.id, userId!));
      } catch (error) {
        logger("error", "Error updating user personal data", { error });
        throw error;
      }

      logger("info", "Fetching user address id");
      const user = await trx
        .select({
          addressId: UserTable.addressId,
        })
        .from(UserTable)
        .where(eq(UserTable.id, userId!))
        .limit(1);

      logger("info", "User address id found", {
        addressId: user[0]?.addressId,
      });

      if (user[0]?.addressId) {
        try {
          logger("info", "Updating user address data", {
            addressId: user[0]?.addressId,
          });
          await trx
            .update(AddressBookTable)
            .set({
              address: data.get("address") as string,
              city: data.get("city") as string,
              state: data.get("state") as string,
              pin: data.get("pin") as string,
            })
            .where(eq(AddressBookTable.id, user[0].addressId))
            .execute();
          logger("info", "User address data updated");
        } catch (error) {
          logger("error", "Error updating user address data", { error });
          throw error;
        }
      } else {
        try {
          logger("info", "Creating user new address");
          const newAddressId = await trx
            .insert(AddressBookTable)
            .values({
              address: data.get("address") as string,
              city: data.get("city") as string,
              state: data.get("state") as string,
              pin: data.get("pin") as string,
            })
            .returning({ id: AddressBookTable.id });

          logger("info", "User new address created", {
            newAddressId: newAddressId[0].id,
          });

          await trx
            .update(UserTable)
            .set({ addressId: newAddressId[0].id })
            .where(eq(UserTable.id, userId));
          logger("info", "User new address updated");
        } catch (error) {
          logger("error", "Error creating user new address", { error });
          throw error;
        }
      }
    });

    return { status: "success" };
  } catch (error) {
    logger("error", "Error updating user data", { error });
    return { status: "error" };
  }
};

export const updateUserSignatureByUserId = async (
  userId: number,
  signatureUrl: string,
) => updateUserDocument("signature", signatureUrl, userId);

export const updateGuardianIdImage = async (
  userId: number,
  guardianIdImageUrl: string,
) => updateUserDocument("guardianIdUrl", guardianIdImageUrl, userId);

export const updateUserIdImage = async (
  userId: number,
  userIdImageUrl: string,
) => updateUserDocument("idUrl", userIdImageUrl, userId);

export const updateGuardianPhoto = async (
  userId: number,
  guardianPhotoUrl: string,
) => updateUserDocument("guardianPhoto", guardianPhotoUrl, userId);

export const updateUserImageUrl = async ({
  userId,
  imageUrl,
}: {
  userId?: number | null;
  imageUrl: string;
}) => updateUserDocument("imageUrl", imageUrl, userId);
