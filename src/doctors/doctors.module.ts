import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './doctor.entity';
import { VerificationToken } from './verification-token.entity';
import { Profile } from './profile.entity';
import { Specialization } from './specialization.entity';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    Doctor,
    VerificationToken,
    Profile,
    Specialization,
])],
    controllers: [DoctorsController],
    providers: [DoctorsService],
  exports: [TypeOrmModule],
})
export class DoctorsModule {}
