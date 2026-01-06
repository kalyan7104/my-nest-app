import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElasticSlot } from './elastic-slot.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Availability } from '../availability/availability.entity';

@Injectable()
export class ElasticSlotsService {
  constructor(
    @InjectRepository(ElasticSlot)
    private elasticSlotRepo: Repository<ElasticSlot>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(Availability)
    private availabilityRepo: Repository<Availability>,
  ) {}

  /*async createElasticSlot(
    userId: number,
    dto: CreateElasticSlotDto,
  ) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!doctor) {
      throw new BadRequestException('Doctor not found');
    }

    // 🔒 Validation: time range
    if (dto.endTime <= dto.startTime) {
      throw new BadRequestException(
        'End time must be greater than start time',
      );
    }

    // 🔒 Validation: capacity
    if (dto.capacity <= 0) {
      throw new BadRequestException(
        'Capacity must be greater than zero',
      );
    }

    // 🔒 Validation: overlapping elastic slots
    const overlap = await this.elasticSlotRepo.findOne({
      where: {
        doctor: { id: doctor.id },
        date: dto.date,
        status: ElasticSlotStatus.ACTIVE,
      },
    });

    if (
      overlap &&
      !(dto.endTime <= overlap.startTime ||
        dto.startTime >= overlap.endTime)
    ) {
      throw new BadRequestException(
        'Elastic slot overlaps with existing elastic slot',
      );
    }

    const elasticSlot = this.elasticSlotRepo.create({
      doctor,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      scheduledType: dto.scheduledType,
      capacity: dto.capacity,
      reason: dto.reason,
    });

    await this.elasticSlotRepo.save(elasticSlot);

    return {
      message: 'Elastic slot created successfully',
      elasticSlot: {
        id: elasticSlot.id,
        date: elasticSlot.date,
        startTime: elasticSlot.startTime,
        endTime: elasticSlot.endTime,
        capacity: elasticSlot.capacity,
        scheduledType: elasticSlot.scheduledType,
        status: elasticSlot.status,
      },
    };
  }*/

  async expandSessionTime(userId: number, body: any) {
  const { availabilityId, newEndTime, reason } = body;

  const availability = await this.availabilityRepo.findOne({
    where: { id: availabilityId, isActive: true },
    relations: ['doctor','doctor.user'],
  });

  if (!availability) {
    throw new BadRequestException('Session not found');
  }

  if (availability.doctor.user.id !== userId) {
    throw new BadRequestException('Unauthorized');
  }

  // ⏱️ Validate extension
  const currentEnd = this.timeToMinutes(availability.endTime);
  const newEnd = this.timeToMinutes(newEndTime);

  if (newEnd <= currentEnd) {
    throw new BadRequestException(
      'New end time must be after current end time',
    );
  }

  // 🚫 Check overlap with other sessions
  const otherSessions = await this.availabilityRepo.find({
    where: {
      doctor: { id: availability.doctor.id },
      date: availability.date,
      isActive: true,
    },
  });

  for (const session of otherSessions) {
    if (session.id === availability.id) continue;

    const sStart = this.timeToMinutes(session.startTime);
    const sEnd = this.timeToMinutes(session.endTime);

    const overlaps =
      !(newEnd <= sStart || currentEnd >= sEnd);

    if (overlaps) {
      throw new BadRequestException(
        'Elastic extension overlaps with another session',
      );
    }
  }

  // ✅ Create elastic slot
  const elasticSlot = this.elasticSlotRepo.create({
    availability,
    originalEndTime: availability.endTime,
    extendedEndTime: newEndTime,
    reason,
  });

  await this.elasticSlotRepo.save(elasticSlot);

  return {
    message: 'Session time extended successfully',
    availabilityId,
    from: availability.endTime,
    to: newEndTime,
  };
}

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

}
