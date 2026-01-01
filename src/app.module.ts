import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OtpModule } from './otp/otp.module';
import { typeOrmConfig } from './config/typeorm.config';
import { Doctor } from './doctors/doctor.entity';
import { DoctorsModule } from './doctors/doctors.module';
import { AvailabilityModule } from './availability/availability.module';
import { App } from 'supertest/types';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
    OtpModule,
    DoctorsModule,
    AvailabilityModule,
    AppointmentsModule,
  ],
})
export class AppModule {}
