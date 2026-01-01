import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RecurringAvailability,
  WeekDay,
} from './recurring-availability.entity';
import { Doctor } from '../doctors/doctor.entity';
import { VerificationStatus } from '../common/enums/verification-status.enum';
import { ScheduledType } from '../common/enums/scheduled-type.enum';

@Injectable()
export class RecurringAvailabilityService {
  constructor(
    @InjectRepository(RecurringAvailability)
    private recurringRepo: Repository<RecurringAvailability>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
  ) {}

  async createRecurringAvailability(userId: number, body: any) {
  const {
    dayOfWeek,
    startTime,
    endTime,
    scheduledType = ScheduledType.SLOT,
    capacity,
  } = body;

  const doctor = await this.doctorRepo.findOne({
    where: { user: { id: userId } },
  });

  if (!doctor) {
    throw new BadRequestException('Doctor not found');
  }

  if (doctor.verificationStatus !== VerificationStatus.APPROVED) {
    throw new BadRequestException('Doctor not approved');
  }

  // ✅ NEW RULE: only one per day
  const existingRule = await this.recurringRepo.findOne({
    where: {
      doctor: { id: doctor.id },
      dayOfWeek,
      isActive: true,
    },
  });

  if (existingRule) {
    throw new BadRequestException(
      `Recurring availability already exists for ${dayOfWeek}`,
    );
  }

  // ⏱️ time validation
  const start = this.timeToMinutes(startTime);
  const end = this.timeToMinutes(endTime);

  if (end <= start) {
    throw new BadRequestException(
      'End time must be greater than start time',
    );
  }

  // 👥 capacity validation
  if (scheduledType === ScheduledType.SLOT && capacity !== 1) {
    throw new BadRequestException(
      'Slot scheduling must have capacity 1',
    );
  }

  if (scheduledType === ScheduledType.WAVE && (!capacity || capacity < 1)) {
    throw new BadRequestException(
      'Wave scheduling requires capacity > 0',
    );
  }

  const recurring = this.recurringRepo.create({
    doctor,
    dayOfWeek,
    startTime,
    endTime,
    scheduledType,
    capacity: scheduledType === ScheduledType.SLOT ? 1 : capacity,
  });

  await this.recurringRepo.save(recurring);

  return { message: 'Recurring availability added successfully' };
}


private timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

  async getDoctorRecurringAvailability(doctorId: number) {
    return this.recurringRepo.find({
      where: { doctor: { id: doctorId }, isActive: true },
    });
  }
}
