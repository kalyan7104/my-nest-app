import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Appointment} from './appointment.entity';
import {PatientDetail} from './patient-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, PatientDetail])],
  exports: [TypeOrmModule],
})
export class AppointmentsModule {}