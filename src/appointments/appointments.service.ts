import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { Doctor } from '../doctors/doctor.entity';
import { User } from '../users/user.entity';
import { AvailabilityService } from '../availability/availability.service';
import { MoreThanOrEqual } from 'typeorm';
import { In } from 'typeorm';
import { ScheduledType } from '../common/enums/scheduled-type.enum';
import { Availability } from 'src/availability/availability.entity';
import { SlotAllocation, AllocationType } from 'src/elastic-slots/slot-allocation.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Availability)
    private availabilityRepo: Repository<Availability>,
    private availabilityService: AvailabilityService,

    @InjectRepository(SlotAllocation)
    private slotAllocationRepo: Repository<SlotAllocation>,
  ) {}

  // 1️⃣ BOOK APPOINTMENT
 async bookAppointment(patientId: number, body: any) {
  const { doctorId, date, startTime, endTime, reason } = body;

  const doctor = await this.doctorRepo.findOne({
    where: { id: doctorId },
    relations: ['user'],
  });

  if (!doctor) {
    throw new BadRequestException('Doctor not found');
  }

  const patient = await this.userRepo.findOne({
    where: { id: patientId },
  });

  if (!patient) {
    throw new BadRequestException('Patient not found');
  }

  // Get availability for the date
  const availability =
    await this.availabilityService.getAvailabilityByDate(
      doctorId,
      date,
    );

  if (!availability || availability.source === 'NONE') {
    throw new BadRequestException(
      'No availability for the selected date',
    );
  }

  //  Prevent duplicate booking (doctor + date)
  const existingAppointment = await this.appointmentRepo.findOne({
    where: {
      patient: { id: patientId },
      doctor: { id: doctorId },
      date,
      status: AppointmentStatus.BOOKED,
    },
  });

  /*if (existingAppointment) {
    throw new BadRequestException(
      'You already have an appointment with this doctor on this date',
    );
  }*/

  /* =========================================================
     STREAM SCHEDULING
     ========================================================= */
  if (availability.scheduledType === ScheduledType.STREAM) {

  const availabilityEntity = await this.availabilityRepo.findOne({
    where: {
      doctor: { id: doctorId },
      date,
      isActive: true,
      scheduledType: ScheduledType.STREAM,
    },
  });

  if (!availabilityEntity) {
    throw new BadRequestException(
      'No stream availability found for this date',
    );
  }

  const { startTime, endTime, capacity, slotDuration } =
    availabilityEntity;

  const totalBookings = await this.appointmentRepo.count({
    where: {
      doctor: { id: doctorId },
      date,
      status: AppointmentStatus.BOOKED,
    },
  });

  if (totalBookings >= capacity) {
    throw new BadRequestException('Session is fully booked');
  }

  const reportingMinutes =
    this.timeToMinutes(startTime) +
    totalBookings * slotDuration;

  const reportingTime = this.minutesToTime(reportingMinutes);

  const appointment = this.appointmentRepo.create({
    doctor,
    patient,
    date,
    startTime,
    endTime,
    reportingTime,
    reason,
    status: AppointmentStatus.BOOKED,
  });

  await this.appointmentRepo.save(appointment);

  return {
    message: 'Appointment booked successfully',
    appointment: {
      id: appointment.id,
      doctorName: doctor.user.name,
      date,
      reportingTime,
    },
  };
}


  /* =========================================================
   WAVE / SLOT SCHEDULING
   ========================================================= */

if (!startTime || !endTime) {
  throw new BadRequestException(
    'startTime and endTime are required for slot or wave booking',
  );
}

let slot: any = undefined;
let matchedSession: any = undefined;

if (Array.isArray(availability.sessions)) {
  for (const session of availability.sessions) {
    if (Array.isArray(session.slots)) {
      const found = session.slots.find((s) => {
        return (
          this.timeToMinutes(s.startTime) ===
            this.timeToMinutes(startTime) &&
          this.timeToMinutes(s.endTime) ===
            this.timeToMinutes(endTime)
        );
      });

      if (found) {
        slot = found;
        matchedSession = session; // 👈 capture session
        break;
      }
    }
  }
}

if (!slot || !matchedSession) {
  throw new BadRequestException('Slot not available');
}

const bookedCount = await this.appointmentRepo.count({
  where: {
    doctor: { id: doctorId },
    date,
    startTime,
    endTime,
    status: AppointmentStatus.BOOKED,
  },
});

if (bookedCount >= slot.capacity) {
  throw new BadRequestException('Slot is fully booked');
}

const slotDurationMinutes =
  this.timeToMinutes(endTime) -
  this.timeToMinutes(startTime);

const consultationInterval =
  Math.floor(slotDurationMinutes / slot.capacity);

const reportingMinutes =
  this.timeToMinutes(startTime) +
  bookedCount * consultationInterval;

const reportingTime = this.minutesToTime(reportingMinutes);

const appointment = this.appointmentRepo.create({
  doctor,
  patient,
  date,
  startTime,
  endTime,
  reportingTime,
  reason,
  status: AppointmentStatus.BOOKED,
});

await this.appointmentRepo.save(appointment);

/* =========================================================
   CREATE SlotAllocation → ONLY FOR WAVE
   ========================================================= */

if (matchedSession.scheduledType === ScheduledType.WAVE) {

  const availabilityEntity = await this.availabilityRepo.findOne({
    where: {
      id: matchedSession.availabilityId, // 👈 safest anchor
      isActive: true,
    },
  });

  if (!availabilityEntity) {
    throw new BadRequestException('Availability session not found');
  }

  const allocation = this.slotAllocationRepo.create({
    appointment,
    availability: availabilityEntity,
    slotStartTime: startTime,
    slotEndTime: endTime,
    orderIndex: bookedCount,
    reportingTime,
    allocationType: AllocationType.NORMAL,
  });

  await this.slotAllocationRepo.save(allocation);
}

return {
  message: 'Appointment booked successfully',
  appointment: {
    id: appointment.id,
    doctorName: doctor.user.name,
    date: appointment.date,
    reportingTime: appointment.reportingTime,
  },
};

}

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  // 2️⃣ GET PATIENT APPOINTMENTS
  async getMyAppointments(patientId: number) {
    const appointments = await this.appointmentRepo.find({
      where: {
        patient: { id: patientId },
      },
      relations: ['doctor', 'doctor.user'],
      order: { createdAt: 'DESC' },
    });

    return appointments.map((a) => ({
      AppointmentId: a.id,
      date: a.date,
      startTime: a.startTime,
      endTime: a.endTime,
      reportingTime: a.reportingTime,
      status: a.status,
      doctor: {
        id: a.doctor.id,
        name: a.doctor.user.name,
      },
    }));
  }

  // 3️⃣ CANCEL APPOINTMENT
  async cancelAppointment(
    patientId: number,
    appointmentId: number,
  ) {
    const appointment = await this.appointmentRepo.findOne({
      where: {
        id: appointmentId,
        patient: { id: patientId },
      },
    });

    if (!appointment) {
      throw new BadRequestException(
        'Appointment not found',
      );
    }

    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentRepo.save(appointment);

    return { message: 'Appointment cancelled' };
  }

  async getUpcomingAppointments(patientId: number) {
  const today = new Date().toISOString().split('T')[0];

  return this.appointmentRepo.find({
    where: {
      patient: { id: patientId },
      status: AppointmentStatus.BOOKED,
      date: MoreThanOrEqual(today),
    },
    relations: ['doctor', 'doctor.user'],
    order: {
      date: 'ASC',
      reportingTime: 'ASC',
    },
  });
}

  async getMyAppointmentHistory(patientId: number) {
  const appointments = await this.appointmentRepo.find({
    where: {
      patient: { id: patientId },
      status: In([
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
      ]),
    },
    relations: ['doctor', 'doctor.user'],
    order: {
      date: 'DESC',
      reportingTime: 'DESC',
    },
  });

  // Return a clean, patient-friendly response
  return appointments.map((a) => ({
    id: a.id,
    date: a.date,
    startTime: a.startTime,
    endTime: a.endTime,
    reportingTime: a.reportingTime,
    status: a.status,
    doctor: {
      id: a.doctor.id,
      name: a.doctor.user.name,
    },
  }));
}


  // DOCTOR SIDE METHODS

  async getDoctorUpcomingAppointments(userId: number) {
  const doctor = await this.doctorRepo.findOne({
    where: { user: { id: userId } },
  });

  if (!doctor) {
    throw new BadRequestException('Doctor not found');
  }

  const today = new Date().toISOString().split('T')[0];

  return this.appointmentRepo.find({
    where: {
      doctor: { id: doctor.id },
      status: AppointmentStatus.BOOKED,
      date: MoreThanOrEqual(today),
    },
    relations: ['patient'],
    order: {
      date: 'ASC',
      reportingTime: 'ASC',
    },
  });
}

async getDoctorAppointmentsByDate(
  userId: number,
  date: string,
) {
  const doctor = await this.doctorRepo.findOne({
    where: { user: { id: userId } },
  });

  if (!doctor) {
    throw new BadRequestException('Doctor not found');
  }

  const appointments = await this.appointmentRepo.find({
  where: {
    doctor: { id: doctor.id },
    date,
    status: AppointmentStatus.BOOKED,
  },
  relations: ['patient'],
  order: {
    reportingTime: 'ASC',
  },
});
  
return appointments.map((a) => ({
  AppointmentId: a.id,
  date: a.date,
  startTime: a.startTime,
  endTime: a.endTime,
  reportingTime: a.reportingTime,
  status: a.status,
  patient: {
    id: a.patient.id,
    name: a.patient.name,
  },
}));
}


async completeAppointment(userId: number, appointmentId: number) {
  const doctor = await this.doctorRepo.findOne({
    where: { user: { id: userId } },
  });

  if (!doctor) {
    throw new BadRequestException('Doctor not found');
  }

  const appointment = await this.appointmentRepo.findOne({
    where: {
      id: appointmentId,
      doctor: { id: doctor.id },
      status: AppointmentStatus.BOOKED,
    },
  });

  if (!appointment) {
    throw new BadRequestException('Appointment not found');
  }

  appointment.status = AppointmentStatus.COMPLETED;
  await this.appointmentRepo.save(appointment);

  return { message: 'Appointment marked as completed' };
}


async cancelAppointmentByDoctor(
  userId: number,
  appointmentId: number,
) {
  // 1️⃣ Find doctor by logged-in user
  const doctor = await this.doctorRepo.findOne({
    where: { user: { id: userId } },
  });

  if (!doctor) {
    throw new BadRequestException('Doctor not found');
  }

  // 2️⃣ Find appointment
  const appointment = await this.appointmentRepo.findOne({
    where: {
      id: appointmentId,
      doctor: { id: doctor.id },
      status: AppointmentStatus.BOOKED,
    },
  });

  if (!appointment) {
    throw new BadRequestException(
      'Appointment not found or already processed',
    );
  }

  // 3️⃣ Cancel appointment
  appointment.status = AppointmentStatus.CANCELLED;
  await this.appointmentRepo.save(appointment);

  return {
    message: 'Appointment cancelled successfully',
  };
}

async getAllDoctorAppointments(
  userId: number,
  status?: string,
  date?: string,
) {
  // 1️⃣ Find doctor
  const doctor = await this.doctorRepo.findOne({
    where: { user: { id: userId } },
  });

  if (!doctor) {
    throw new BadRequestException('Doctor not found');
  }

  // 2️⃣ Build dynamic filter
  const where: any = {
    doctor: { id: doctor.id },
  };

  if (status) {
    where.status = status;
  }

  if (date) {
    where.date = date;
  }

  // 3️⃣ Fetch appointments
  const appointments = await this.appointmentRepo.find({
    where,
    relations: ['patient'],
    order: {
      date: 'DESC',
      reportingTime: 'ASC',
    },
  });

  // 4️⃣ Map minimal response
  return appointments.map((a) => ({
    id: a.id,
    date: a.date,
    startTime: a.startTime,
    endTime: a.endTime,
    reportingTime: a.reportingTime,
    status: a.status,
    patient: {
      id: a.patient.id,
      name: a.patient.name,
    },
  }));
}
}
