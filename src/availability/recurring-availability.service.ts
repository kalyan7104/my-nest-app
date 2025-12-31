import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RecurringAvailability,
  WeekDay,
} from './recurring-availability.entity';
import { Doctor } from '../doctors/doctor.entity';
import { VerificationStatus } from '../common/enums/verification-status.enum';

@Injectable()
export class RecurringAvailabilityService {
  constructor(
    @InjectRepository(RecurringAvailability)
    private recurringRepo: Repository<RecurringAvailability>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
  ) {}

  async createRecurringAvailability(
    userId: number,
    dayOfWeek: WeekDay,
    startTime: string,
    endTime: string,
  ) {
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

    //This will check for startTIme and EndTime 

    const newStart = this.timeToMinutes(startTime);
  const newEnd = this.timeToMinutes(endTime);

  if (newEnd <= newStart) {
    throw new BadRequestException(
      'End time must be greater than start time',
    );
  }

  //This IS added for duplicate checking and overlapping time ranges
  const existingRules = await this.recurringRepo.find({
    where: {
      doctor: { id: doctor.id },
      dayOfWeek,
      isActive: true,
    },
  });

  for (const rule of existingRules) {
    const existingStart = this.timeToMinutes(rule.startTime);
    const existingEnd = this.timeToMinutes(rule.endTime);

    const isOverlap =
      newStart < existingEnd && newEnd > existingStart;

    if (isOverlap) {
      throw new BadRequestException(
        'Recurring availability overlaps with existing time range',
      );
    }
  }


   
    const rule = this.recurringRepo.create({
      doctor,
      dayOfWeek,
      startTime,
      endTime,
    });

    await this.recurringRepo.save(rule);

    return { message: 'Recurring availability added' };
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
