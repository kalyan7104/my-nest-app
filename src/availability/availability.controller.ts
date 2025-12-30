import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('availability')
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  // 1️⃣ Doctor adds availability (date)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  createAvailability(@Req() req, @Body('date') date: string) {
    return this.availabilityService.createAvailability(
      req.user.userId,
      date,
    );
  }

  // 2️⃣ Doctor adds slot to availability
  @Post(':availabilityId/slots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  addSlot(
    @Req() req,
    @Param('availabilityId') availabilityId: number,
    @Body() body: { startTime: string; endTime: string },
  ) {
    return this.availabilityService.addSlot(
      req.user.userId,
      availabilityId,
      body.startTime,
      body.endTime,
    );
  }

  // 3️⃣ Get doctor availability (for patients)
  @Get('doctor/:doctorId')
  getDoctorAvailability(@Param('doctorId') doctorId: number) {
    return this.availabilityService.getDoctorAvailability(doctorId);
  }
}
