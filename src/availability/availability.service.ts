import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './availability.entity';
import { Slot } from './slot.entity';
import { Doctor } from '../doctors/doctor.entity';
import { VerificationStatus } from '../common/enums/verification-status.enum';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepo: Repository<Availability>,

    @InjectRepository(Slot)
    private slotRepo: Repository<Slot>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
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
}
