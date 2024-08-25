import { User } from "./user";
import { CreateGuest as Guest } from "./guest";

export interface ExtendGuest extends Guest {
  monthlyRent: number;
  roomCode: string;
  bedCode: string;
  checkIn: Date | string;
  checkOut: Date | string;
}

export interface AgreementForm extends User {
  signature: string | null;
  guests: ExtendGuest[];
}
