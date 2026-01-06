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
import { ElasticSlotsModule } from 'src/elastic-slots/elastic-slots.module';
import { Doctor } from 'src/doctors/doctor.entity';
import { ElasticSlot } from 'src/elastic-slots/elastic-slot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Availability,
       Slot,RecurringAvailability,
       Doctor,
       ElasticSlot

    ]),
    DoctorsModule,
  ],
  providers: [AvailabilityService, RecurringAvailabilityService],
  controllers: [AvailabilityController, RecurringAvailabilityController],
  exports: [TypeOrmModule,AvailabilityService, RecurringAvailabilityService],
})
export class AvailabilityModule {}
