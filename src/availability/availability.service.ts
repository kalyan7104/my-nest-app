import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './availability.entity';
import { Doctor } from '../doctors/doctor.entity';
import { VerificationStatus } from '../common/enums/verification-status.enum';

import { RecurringAvailability, WeekDay } from './recurring-availability.entity';
import { ScheduledType } from '../common/enums/scheduled-type.enum';
import { Slot } from '../types/slot.type';
import { AvailabilityResponse } from '../types/availability-response.type';

import { In } from 'typeorm';
import { ElasticSlot, ElasticSlotStatus } from '../elastic-slots/elastic-slot.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepo: Repository<Availability>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(RecurringAvailability)
private recurringRepo: Repository<RecurringAvailability>,

    @InjectRepository(ElasticSlot)
    private elasticSlotRepo: Repository<ElasticSlot>,
  ) {}


  // 1️⃣ Create availability (date)
  async createAvailability(userId: number, body: any) {
    const {
      date,
      startTime,
      endTime,
      scheduledType = ScheduledType.SLOT,
      slotDuration,
      capacity,
    } = body;

    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!doctor) {
      throw new BadRequestException('Doctor not found');
    }

    if (doctor.verificationStatus !== VerificationStatus.APPROVED) {
      throw new BadRequestException('Doctor not approved');
    }

    // ⏱️ Time validation
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (end <= start) {
      throw new BadRequestException(
        'End time must be greater than start time',
      );
    }

    if (!slotDuration || slotDuration <= 0) {
  throw new BadRequestException('Invalid slot duration');
}

const totalMinutes = end - start;

if (totalMinutes % slotDuration !== 0) {
  throw new BadRequestException(
    'Time range must be divisible by slot duration',
  );
}

    // 👥 Capacity validation
    if (scheduledType === ScheduledType.SLOT && capacity !== 1) {
      throw new BadRequestException(
        'Slot scheduling must have capacity 1',
      );
    }

    if (
      scheduledType === ScheduledType.WAVE &&
      (!capacity || capacity < 1)
    ) {
      throw new BadRequestException(
        'Wave scheduling requires capacity > 0',
      );
    }

    // ✅ Allow multiple sessions but prevent overlap
const existingSessions = await this.availabilityRepo.find({
  where: {
    doctor: { id: doctor.id },
    date,
    isActive: true,
  },
});

for (const session of existingSessions) {
  const existingStart = this.timeToMinutes(session.startTime);
  const existingEnd = this.timeToMinutes(session.endTime);

  const overlaps =
    !(end <= existingStart || start >= existingEnd);

  if (overlaps) {
    throw new BadRequestException(
      `Session overlaps with existing session (${session.startTime} - ${session.endTime})`,
    );
  }
}


    const availability = this.availabilityRepo.create({
      doctor,
      date,
      startTime,
      endTime,
      scheduledType,
      slotDuration,
      capacity: scheduledType === ScheduledType.SLOT ? 1 : capacity,
    });

    await this.availabilityRepo.save(availability);

    return {
      message: 'Availability added successfully',
      availabilityId: availability.id,
    };
  }

  

  // 2️⃣ Add slot to availability
  /*async addSlot(
    userId: number,
    availabilityId: number,
    startTime: string,
    endTime: string,
  ) {
    const availability = await this.availabilityRepo.findOne({
      where: { id: availabilityId },
      relations: ['doctor', 'doctor.user'],
    });

    if (!availability) {
      throw new BadRequestException('Availability not found');
    }

    if (availability.doctor.user.id !== userId) {
      throw new BadRequestException('Not allowed');
    }

    const slot = this.slotRepo.create({
      availability,
      startTime,
      endTime,
    });

    await this.slotRepo.save(slot);

    return { message: 'Slot added successfully' };
  }*/

    
  // 3️⃣ Get doctor availability (for patients)
  async getDoctorAvailability(doctorId: number) {
    return this.availabilityRepo.find({
      where: { doctor: { id: doctorId }, isActive: true },
      relations: ['doctor', 'slots'],
    });
  }

 /* async getAvailabilityByDate(doctorId: number, date: string) {
  // 1️⃣ Check custom availability first
  const customAvailability = await this.availabilityRepo.findOne({
    where: {
      doctor: { id: doctorId },
      date,
      isActive: true,
    },
    relations: ['slots'],
  });

  if (customAvailability) {
    const availableSlots = customAvailability.slots.filter(
      (slot) => !slot.isBooked,
    );

    return {
      source: 'CUSTOM',
      date,
      slots: availableSlots,
    };
  }

  // 2️⃣ No custom availability → use recurring availability
  const dayOfWeek = new Date(date)
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toUpperCase() as WeekDay;

  const recurringRules = await this.recurringRepo.find({
    where: {
      doctor: { id: doctorId },
      dayOfWeek,
      isActive: true,
    },
  });

  if (recurringRules.length === 0) {
    return {
      source: 'NONE',
      date,
      slots: [],
    };
  }

  // 3️⃣ Generate slots dynamically (30 min)
  const slots: {
  startTime: string;
  endTime: string;
  isBooked: boolean;
}[] = [];


  for (const rule of recurringRules) {
    let start = this.timeToMinutes(rule.startTime);
    const end = this.timeToMinutes(rule.endTime);

    while (start + 30 <= end) {
      slots.push({
        startTime: this.minutesToTime(start),
        endTime: this.minutesToTime(start + 30),
        isBooked: false,
      });
      start += 30;
    }
  }

  return {
    source: 'RECURRING',
    date,
    slots,
  };
}*/

/*async getAvailabilityByDate(doctorId: number, date: string): Promise<AvailabilityResponse> {
  // 1️⃣ Check CUSTOM availability first
  const custom = await this.availabilityRepo.findOne({
    where: {
      doctor: { id: doctorId },
      date,
      isActive: true,
    },
  });

  if (custom) {
    return {
      source: 'CUSTOM',
      date,
      scheduledType: custom.scheduledType,
      slots: this.generateSlots(
        custom.startTime,
        custom.endTime,
        custom.slotDuration,
        custom.capacity,
      ),
    };
  }

  // 2️⃣ Fallback to RECURRING availability
  const dayOfWeek = new Date(date)
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toUpperCase() as WeekDay;

  const recurring = await this.recurringRepo.find({
    where: {
      doctor: { id: doctorId },
      dayOfWeek,
      isActive: true,
    },
  });

  if (!recurring.length) {
    return {
      source: 'NONE',
      date,
      slots: [],
    };
  }

  // Assume one rule per day (as per your validation)
  const rule = recurring[0];

  return {
    source: 'RECURRING',
    date,
    scheduledType: rule.scheduledType,
    slots: this.generateSlots(
      rule.startTime,
      rule.endTime,
      rule.slotDuration,
      rule.capacity,
    ),
  };
}*/
async getAvailabilityByDate(
  doctorId: number,
  date: string,
): Promise<AvailabilityResponse> {
  // 1️⃣ Fetch ALL custom sessions for that date
  const sessions = await this.availabilityRepo.find({
    where: {
      doctor: { id: doctorId },
      date,
      isActive: true,
    },
    order: { startTime: 'ASC' },
  });

  const elasticSlots = await this.elasticSlotRepo.find({
  where: {
    availability: { id: In(sessions.map((s) => s.id)) },
    status: ElasticSlotStatus.ACTIVE,
  },
  relations: ['availability'],
});

  if (sessions.length > 0) {
  return {
    source: 'CUSTOM',
    date,
    sessions: sessions.map((session) => {
      const elastic = elasticSlots.find(
        (e) => e.availability.id === session.id,
      );

      const effectiveStartTime = this.formatTime(
  elastic?.extendedStartTime ?? session.startTime,
);

const effectiveEndTime = this.formatTime(
  elastic?.extendedEndTime ?? session.endTime,
);

return {
  availabilityId: session.id,
  scheduledType: session.scheduledType,
  startTime: effectiveStartTime,
  endTime: effectiveEndTime,
  slots: this.generateSlots(
    effectiveStartTime,
    effectiveEndTime,
    session.slotDuration,
    session.capacity,
  ),
};
    }),
  };
}
  // 2️⃣ No custom sessions → fallback to recurring
  const dayOfWeek = new Date(date)
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toUpperCase() as WeekDay;

  const recurringRules = await this.recurringRepo.find({
    where: {
      doctor: { id: doctorId },
      dayOfWeek,
      isActive: true,
    },
    order: { startTime: 'ASC' },
  });

  if (recurringRules.length === 0) {
    return {
      source: 'NONE',
      date,
      sessions: [],
    };
  }

  return {
    source: 'RECURRING',
    date,
    sessions: recurringRules.map((rule) => ({
      scheduledType: rule.scheduledType,
      startTime: rule.startTime,
      endTime: rule.endTime,
      slots: this.generateSlots(
        rule.startTime,
        rule.endTime,
        rule.slotDuration,
        rule.capacity,
      ),
    })),
  };
}

private generateSlots(
  startTime: string,
  endTime: string,
  slotDuration: number,
  capacity: number,
): Slot[] {
  const slots: Slot[] = [];

  let start = this.timeToMinutes(startTime);
  const end = this.timeToMinutes(endTime);

  const SLOT_DURATION = slotDuration; // minutes

  while (start + SLOT_DURATION <= end) {
    slots.push({
      startTime: this.minutesToTime(start),
      endTime: this.minutesToTime(start + SLOT_DURATION),
      capacity,
      availableCapacity: capacity, // later reduced by appointments
    });

    start += SLOT_DURATION;
  }

  return slots;
}


private timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

private minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

private formatTime(time: string): string {
  // Converts "11:00:00" → "11:00"
  return time.length === 8 ? time.slice(0, 5) : time;
}

}
