import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RecurringAvailabilityService } from './recurring-availability.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { WeekDay } from './recurring-availability.entity';

@Controller('availability/recurring')
export class RecurringAvailabilityController {
  constructor(
    private recurringService: RecurringAvailabilityService,
  ) {}

  // Doctor sets recurring availability
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  create(@Req() req, @Body() body) {
    return this.recurringService.createRecurringAvailability(
      req.user.userId,
      body.dayOfWeek,
      body.startTime,
      body.endTime,
    );
  }

  // Get doctor's recurring availability (patient / doctor view)
  @Get('doctor/:doctorId')
  getDoctorRules(@Param('doctorId') doctorId: number) {
    return this.recurringService.getDoctorRecurringAvailability(doctorId);
  }
}
