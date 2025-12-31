import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './availability.entity';
import { Slot } from './slot.entity';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { DoctorsModule } from '../doctors/doctors.module';
import { RecurringAvailability } from './recurring-availability.entity';
import { RecurringAvailabilityService } from './recurring-availability.service';
import { RecurringAvailabilityController } from './recurring-availability.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Availability, Slot,RecurringAvailability]),
    DoctorsModule,
  ],
  providers: [AvailabilityService, RecurringAvailabilityService],
  controllers: [AvailabilityController, RecurringAvailabilityController],
})
export class AvailabilityModule {}
