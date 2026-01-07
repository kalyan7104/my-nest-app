import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElasticSlot } from './elastic-slot.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Availability } from '../availability/availability.entity';
import { ElasticSlotStatus } from './elastic-slot.entity';
import { ScheduledType } from '../common/enums/scheduled-type.enum';
import { AppointmentStatus } from '../appointments/appointment.entity';
import { Appointment } from '../appointments/appointment.entity';

@Injectable()
export class ElasticSlotsService {
  constructor(
    @InjectRepository(ElasticSlot)
    private elasticSlotRepo: Repository<ElasticSlot>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(Availability)
    private availabilityRepo: Repository<Availability>,

    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
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

  /*async expandSessionTime(userId: number, body: any) {
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
}*/

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /*async expandSessionStartTime(userId: number, body: any) {
  const { availabilityId, newStartTime, reason } = body;

  const availability = await this.availabilityRepo.findOne({
    where: { id: availabilityId, isActive: true },
    relations: ['doctor', 'doctor.user'],
  });

  if (!availability) {
    throw new BadRequestException('Session not found');
  }

  if (availability.doctor.user.id !== userId) {
    throw new BadRequestException('Unauthorized');
  }

  const originalStart = this.timeToMinutes(availability.startTime);
  const newStart = this.timeToMinutes(newStartTime);

  // ⏱️ Validation
  if (newStart >= originalStart) {
    throw new BadRequestException(
      'New start time must be before original start time',
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
      !(originalStart <= sStart || newStart >= sEnd);

    if (overlaps) {
      throw new BadRequestException(
        'Elastic start overlaps with another session',
      );
    }
  }

  // ✅ Create elastic slot
  const elasticSlot = this.elasticSlotRepo.create({
    availability,
    originalStartTime: availability.startTime,
    originalEndTime: availability.endTime,
    extendedStartTime: newStartTime,
    reason,
  });

  await this.elasticSlotRepo.save(elasticSlot);

  return {
    message: 'Session start time extended successfully',
    availabilityId,
    from: availability.startTime,
    to: newStartTime,
  };
}*/

async expandSession(userId: number, body: any) {
  const { availabilityId, newStartTime, newEndTime, reason } = body;

  if (!newStartTime && !newEndTime) {
    throw new BadRequestException(
      'Provide at least newStartTime or newEndTime',
    );
  }

  const availability = await this.availabilityRepo.findOne({
    where: { id: availabilityId, isActive: true },
    relations: ['doctor', 'doctor.user'],
  });

  if (!availability) {
    throw new BadRequestException('Session not found');
  }

  if (availability.doctor.user.id !== userId) {
    throw new BadRequestException('Unauthorized');
  }

  const originalStart = this.timeToMinutes(availability.startTime);
  const originalEnd = this.timeToMinutes(availability.endTime);

  let extendedStartTime: string | null = null;
  let extendedEndTime: string | null = null;

  // ⏱️ Validate start-time extension
  if (newStartTime) {
    const newStart = this.timeToMinutes(newStartTime);

    if (newStart >= originalStart) {
      throw new BadRequestException(
        'New start time must be before original start time',
      );
    }

    extendedStartTime = newStartTime;
  }

  // ⏱️ Validate end-time extension
  if (newEndTime) {
    const newEnd = this.timeToMinutes(newEndTime);

    if (newEnd <= originalEnd) {
      throw new BadRequestException(
        'New end time must be after original end time',
      );
    }

    extendedEndTime = newEndTime;
  }

  // 🚫 Overlap check with other sessions
  const otherSessions = await this.availabilityRepo.find({
    where: {
      doctor: { id: availability.doctor.id },
      date: availability.date,
      isActive: true,
    },
  });

  const effectiveStart = newStartTime
    ? this.timeToMinutes(newStartTime)
    : originalStart;

  const effectiveEnd = newEndTime
    ? this.timeToMinutes(newEndTime)
    : originalEnd;

  if (effectiveStart >= effectiveEnd) {
    throw new BadRequestException(
      'Invalid elastic time range',
    );
  }

  for (const session of otherSessions) {
    if (session.id === availability.id) continue;

    const sStart = this.timeToMinutes(session.startTime);
    const sEnd = this.timeToMinutes(session.endTime);

    const overlaps =
      !(effectiveEnd <= sStart || effectiveStart >= sEnd);

    if (overlaps) {
      throw new BadRequestException(
        'Elastic extension overlaps with another session',
      );
    }
  }
  const previousElastic = await this.elasticSlotRepo.findOne({
  where: {
    availability: { id: availabilityId },
    status: ElasticSlotStatus.ACTIVE,
  },
});
const previousStartTime =
  previousElastic?.extendedStartTime ?? availability.startTime;

const previousEndTime =
  previousElastic?.extendedEndTime ?? availability.endTime;




  // 1️⃣ Deactivate existing ACTIVE elastic slot (if any)
const existingElastic = await this.elasticSlotRepo.findOne({
  where: {
    availability: { id: availabilityId },
    status: ElasticSlotStatus.ACTIVE,
  },
});

if (existingElastic) {
  existingElastic.status = ElasticSlotStatus.INACTIVE;
  await this.elasticSlotRepo.save(existingElastic);
}


  // ✅ Save elastic slot (single record)
  const elasticSlot = this.elasticSlotRepo.create({
    availability,
    originalStartTime: availability.startTime,
    originalEndTime: availability.endTime,
    extendedStartTime,
    extendedEndTime,
    reason,
  });

  await this.elasticSlotRepo.save(elasticSlot);

 return {
  message: 'Elastic session expanded successfully',
  availabilityId,
  from: {
    startTime: previousStartTime,
    endTime: previousEndTime,
  },
  to: {
    startTime: extendedStartTime ?? previousStartTime,
    endTime: extendedEndTime ?? previousEndTime,
  },
};
}

private formatTimeHHMM(time: string | null): string | null {
if (!time) return time;
const parts = time.split(':');
const hh = parts[0].padStart(2, '0');
const mm = (parts[1] ?? '00').padStart(2, '0');
return `${hh}:${mm}`;
}

private minutesToTime(minutes: number): string {
  const hh = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const mm = (minutes % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

async shrinkSessionTime(userId: number, body: any) {
  const { availabilityId, newStartTime, newEndTime, reason } = body;

  if (!newStartTime && !newEndTime) {
    throw new BadRequestException(
      'Provide at least newStartTime or newEndTime',
    );
  }

  const availability = await this.availabilityRepo.findOne({
    where: { id: availabilityId, isActive: true },
    relations: ['doctor', 'doctor.user'],
  });

  if (!availability) {
    throw new BadRequestException('Session not found');
  }

  if (availability.doctor.user.id !== userId) {
    throw new BadRequestException('Unauthorized');
  }

  if (availability.scheduledType !== ScheduledType.WAVE) {
    throw new BadRequestException(
      'Shrinking is allowed only for WAVE scheduling',
    );
  }

  const activeElastic = await this.elasticSlotRepo.findOne({
    where: {
      availability: { id: availabilityId },
      status: ElasticSlotStatus.ACTIVE,
    },
  });

  const currentStart =
    activeElastic?.extendedStartTime ?? availability.startTime;
  const currentEnd =
    activeElastic?.extendedEndTime ?? availability.endTime;

  const currentStartMin = this.timeToMinutes(currentStart);
  const currentEndMin = this.timeToMinutes(currentEnd);

  const newStartMin = newStartTime
    ? this.timeToMinutes(newStartTime)
    : currentStartMin;

  const newEndMin = newEndTime
    ? this.timeToMinutes(newEndTime)
    : currentEndMin;

  if (newStartMin >= newEndMin) {
    throw new BadRequestException('Invalid shrink time range');
  }

  const appointments = await this.appointmentRepo.find({
    where: {
      doctor: { id: availability.doctor.id },
      date: availability.date,
      status: AppointmentStatus.BOOKED,
    },
    order: { startTime: 'ASC' },
  });

  const affectedAppointments = appointments.filter((appt) => {
    const apptStartMin = this.timeToMinutes(appt.startTime);
    return (
      apptStartMin < newStartMin ||
      apptStartMin >= newEndMin
    );
  });

  const remainingSlots = this.generateSlots(
    this.minutesToTime(newStartMin),
    this.minutesToTime(newEndMin),
    availability.slotDuration,
    availability.capacity,
  );

  for (const slot of remainingSlots) {
    const slotStartMin = this.timeToMinutes(slot.startTime);

    const bookedCount = appointments.filter(
      (appt) =>
        this.timeToMinutes(appt.startTime) === slotStartMin &&
        !affectedAppointments.includes(appt),
    ).length;

    slot.availableCapacity = slot.capacity - bookedCount;
  }

  for (const appt of affectedAppointments) {
    const freeSlot = remainingSlots.find(
      (slot) => slot.availableCapacity > 0,
    );

    if (!freeSlot) {
      throw new BadRequestException(
        'Unable to shrink session without affecting patients',
      );
    }

    appt.startTime = freeSlot.startTime;
    appt.endTime = freeSlot.endTime;
    appt.reportingTime = freeSlot.startTime;

    await this.appointmentRepo.save(appt);

    freeSlot.availableCapacity--;
  }

  if (activeElastic) {
    activeElastic.status = ElasticSlotStatus.INACTIVE;
    await this.elasticSlotRepo.save(activeElastic);
  }

  const elasticSlot = this.elasticSlotRepo.create({
    availability,
    originalStartTime: availability.startTime,
    originalEndTime: availability.endTime,
    extendedStartTime:
      newStartTime ?? activeElastic?.extendedStartTime ?? null,
    extendedEndTime:
      newEndTime ?? activeElastic?.extendedEndTime ?? null,
    status: ElasticSlotStatus.ACTIVE,
    reason,
  });

  await this.elasticSlotRepo.save(elasticSlot);

  return {
    message: 'Session shrunk successfully using In-Fill strategy',
    availabilityId,
    from: {
      startTime: this.formatTimeHHMM(currentStart),
      endTime: this.formatTimeHHMM(currentEnd),
    },
    to: {
      startTime: this.formatTimeHHMM(
        elasticSlot.extendedStartTime ?? currentStart,
      ),
      endTime: this.formatTimeHHMM(
        elasticSlot.extendedEndTime ?? currentEnd,
      ),
    },
    affectedAppointments: affectedAppointments.length,
  };
}

private generateSlots(
  startTime: string,
  endTime: string,
  slotDuration: number,
  capacity: number,
) {
  const slots: {
    startTime: string;
    endTime: string;
    capacity: number;
    availableCapacity: number;
  }[] = [];

  let start = this.timeToMinutes(startTime);
  const end = this.timeToMinutes(endTime);

  while (start + slotDuration <= end) {
    const slotStart = start;
    const slotEnd = start + slotDuration;

    slots.push({
      startTime: this.minutesToTime(slotStart),
      endTime: this.minutesToTime(slotEnd),
      capacity,
      availableCapacity: capacity,
    });

    start = slotEnd;
  }

  return slots;
}


}