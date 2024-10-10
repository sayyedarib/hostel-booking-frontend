export interface CreateGuest {
  userId?: number;
  name: string;
  phone: string;
  email: string;
  dob: string;
  photoUrl: string;
  purpose: string;
  aadhaarUrl: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pin?: string | null;
  enrollment?: string | null;
  institute?: string | null;
  someoneElse?: boolean;
}
