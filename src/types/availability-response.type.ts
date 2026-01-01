import { Slot } from "./slot.type";


export interface AvailabilityResponse {
  source: 'CUSTOM' | 'RECURRING' | 'NONE';
  date: string;
  scheduledType?: string;
  slots: Slot[];
}