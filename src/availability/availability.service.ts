import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './availability.entity';
import { Slot } from './slot.entity';
import { Doctor } from '../doctors/doctor.entity';
import { VerificationStatus } from '../common/enums/verification-status.enum';

import { RecurringAvailability, WeekDay } from './recurring-availability.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepo: Repository<Availability>,

    @InjectRepository(Slot)
    private slotRepo: Repository<Slot>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(RecurringAvailability)
private recurringRepo: Repository<RecurringAvailability>,

  ) {}

 

  // 1️⃣ Create availability (date)
  async createAvailability(userId: number, date: string) {
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

    const availability = this.availabilityRepo.create({
      doctor,
      date,
    });

    await this.availabilityRepo.save(availability);

    return {
      message: 'Availability added successfully',
      availabilityId: availability.id,
    };
  }

  // 2️⃣ Add slot to availability
  async addSlot(
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
  }

  // 3️⃣ Get doctor availability (for patients)
  async getDoctorAvailability(doctorId: number) {
    return this.availabilityRepo.find({
      where: { doctor: { id: doctorId }, isActive: true },
      relations: ['doctor', 'slots'],
    });
  }

  async getAvailabilityByDate(doctorId: number, date: string) {
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

}
