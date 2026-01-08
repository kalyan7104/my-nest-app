import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './appointment.entity';
import { Doctor } from '../doctors/doctor.entity';
import { User } from '../users/user.entity';
import { AvailabilityModule } from '../availability/availability.module';
import { Availability } from 'src/availability/availability.entity';
import { SlotAllocation } from 'src/elastic-slots/slot-allocation.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Doctor,
      User,
      Availability,
      SlotAllocation,
    ]),
    AvailabilityModule, // ✅ Needed for availability checks
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
