import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { Doctor } from '../doctors/doctor.entity';
import { User } from '../users/user.entity';
import { AvailabilityService } from '../availability/availability.service';
import { Availability } from '../availability/availability.entity';
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
  ) {}

  // 1️⃣ BOOK APPOINTMENT
  async bookAppointment(
    patientId: number,
    body: any,
  ) {
    const { doctorId, date, startTime, endTime, reason } = body;

    const doctor = await this.doctorRepo.findOne({
      where: { id: doctorId },
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

    // Check for existing availability on the same date
    const existing = await this.availabilityRepo.findOne({
      where: {
        doctor: { id: doctor.id },
        date,
        isActive: true,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Availability already exists for this date',
      );
    }

    // 🔍 Get availability for the date
    const availability =
      await this.availabilityService.getAvailabilityByDate(
        doctorId,
        date,
      );

    // ❌ Prevent duplicate booking for same doctor on same day
const existingAppointment = await this.appointmentRepo.findOne({
  where: {
    patient: { id: patientId },
    doctor: { id: doctorId },
    date,
    status: AppointmentStatus.BOOKED,
  },
});

if (existingAppointment) {
  throw new BadRequestException(
    'You already have an appointment with this doctor on this date',
  );
}
    if (!availability) {
      throw new BadRequestException(
        'No availability for the selected date',
      );
    }

    const slot = availability.slots.find(
      (s) =>
        s.startTime === startTime &&
        s.endTime === endTime,
    );

    if (!slot) {
      throw new BadRequestException('Slot not available');
    }

    // 🔢 Count existing appointments
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
      throw new BadRequestException(
        'Slot is fully booked',
      );
    }

    // ✅ Create appointment
    const appointment = this.appointmentRepo.create({
      doctor,
      patient,
      date,
      startTime,
      endTime,
      reason,
    });

    await this.appointmentRepo.save(appointment);

    return {
      message: 'Appointment booked successfully',
      appointmentId: appointment.id,
    };
  }

  // 2️⃣ GET PATIENT APPOINTMENTS
  async getMyAppointments(patientId: number) {
    return this.appointmentRepo.find({
      where: {
        patient: { id: patientId },
      },
      relations: ['doctor'],
      order: { createdAt: 'DESC' },
    });
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
}
