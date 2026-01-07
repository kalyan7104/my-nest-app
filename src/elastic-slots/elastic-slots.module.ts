import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticSlot } from './elastic-slot.entity';
import { ElasticSlotsController } from './elastic-slots.controller';
import { ElasticSlotsService } from './elastic-slots.service';
import { AvailabilityModule } from 'src/availability/availability.module';
import { DoctorsModule } from 'src/doctors/doctors.module';
import { App } from 'supertest/types';
import { Doctor } from 'src/doctors/doctor.entity';
import { Appointment } from 'src/appointments/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ElasticSlot,Appointment,Doctor]),
    AvailabilityModule,
    DoctorsModule,


  ],
  controllers: [ElasticSlotsController],
  providers: [ElasticSlotsService],
  exports: [ElasticSlotsService, TypeOrmModule],
})
export class ElasticSlotsModule {}
