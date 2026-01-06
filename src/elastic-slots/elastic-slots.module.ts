import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticSlot } from './elastic-slot.entity';
import { ElasticSlotsController } from './elastic-slots.controller';
import { ElasticSlotsService } from './elastic-slots.service';
import { AvailabilityModule } from 'src/availability/availability.module';
import { DoctorsModule } from 'src/doctors/doctors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ElasticSlot]),
    AvailabilityModule,
    DoctorsModule,

  ],
  controllers: [ElasticSlotsController],
  providers: [ElasticSlotsService],
  exports: [ElasticSlotsService, TypeOrmModule],
})
export class ElasticSlotsModule {}
