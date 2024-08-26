export interface CreateUser {
  clerkId: string;
  name: string;
  phone?: string;
  email: string;
  dob?: Date;
  imageUrl: string;
}

export interface UserSubProfile {
  applicantPhoto: string;
  dob: string;
  userIdImage: string;
  guardianIdImage: string;
  guardianName: string;
  guardianPhone: string;
  guardianPhoto: string;
  address: string;
  pin: string;
  city: string;
  state: string;
}

export interface User {
  name: string;
  phone: string;
  email: string;
  applicantPhoto: string;
  dob: string | null;
  userIdImage: string | null;
  guardianIdImage: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianPhoto: string | null;
  address: string | null;
  pin: string | null;
  city: string | null;
  state: string | null;
}
