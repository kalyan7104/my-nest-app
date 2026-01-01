import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
  ) {}

  // 1️⃣ Book appointment (PATIENT)
  @Post()
  @Roles('PATIENT')
  book(@Req() req, @Body() body) {
    return this.appointmentsService.bookAppointment(
      req.user.userId,
      body,
    );
  }

  // 2️⃣ Get my appointments
  @Get('my')
  @Roles('PATIENT')
  getMy(@Req() req) {
    return this.appointmentsService.getMyAppointments(
      req.user.userId,
    );
  }

  // 3️⃣ Cancel appointment
  @Post(':id/cancel')
  @Roles('PATIENT')
  cancel(
    @Req() req,
    @Param('id') id: number,
  ) {
    return this.appointmentsService.cancelAppointment(
      req.user.userId,
      id,
    );
  }
}
