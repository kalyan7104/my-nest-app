import {
  Controller,
  Post,
  UseGuards,
  Req,
  Body,
  Param,
  Get, Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DoctorsService } from './doctors.service';
import { VerificationStatus } from '../common/enums/verification-status.enum';
import { DoctorSpecialization } from '../common/enums/doctor-specialization.enum';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  // 1️⃣ Request verification
  @Post('verify-request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  requestVerification(@Req() req) {
    return this.doctorsService.requestVerification(req.user.userId);
  }

  // 2️⃣ Admin approves / rejects doctor (simulated)
  @Post('verify/:doctorId')
  approveDoctor(
    @Param('doctorId') doctorId: number,
    @Body('status') status: VerificationStatus,
  ) {
    return this.doctorsService.verifyDoctor(doctorId, status);
  }

  // 3️⃣ Create / Update profile
  @Post('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
   upsertProfile(@Req() req, @Body() body) {
    return this.doctorsService.upsertProfile(
      req.user.userId,
      body,
    );
  }

  // 4️⃣ Add specialization
  @Post('specializations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  addSpecialization(@Req() req, @Body('name') name: string) {
    return this.doctorsService.addSpecialization(req.user.userId, name);
  }

  // Get doctors (with optional specialization filter)

  @Get()
  getDoctors(
    @Query('specialization') specialization?: DoctorSpecialization,
  ) {
    return this.doctorsService.getDoctors(specialization);
  }

  // Get doctor profile by doctorId
  @Get(':doctorId/profile')
  getDoctorProfile(@Param('doctorId') doctorId: number) {
    return this.doctorsService.getDoctorProfile(doctorId);
  }
}
