import { Slot } from "./slot.type";
import { ScheduledType } from "../common/enums/scheduled-type.enum";

export interface AvailabilitySession {
  availabilityId?: number;
  scheduledType: ScheduledType;
  startTime: string;
  endTime: string;
  slots: Slot[];
}

export interface AvailabilityResponse {
  source: 'CUSTOM' | 'RECURRING' | 'NONE';
  date: string;
  scheduledType?: string;
  // legacy single-list slots (optional) — newer API returns `sessions`
  slots?: Slot[];
  sessions?: AvailabilitySession[];
}