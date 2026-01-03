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
import { Query } from '@nestjs/common';

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

  @Get('my/upcoming')
@Roles('PATIENT')
getUpcomingAppointments(@Req() req) {
  return this.appointmentsService.getUpcomingAppointments(
    req.user.userId,
  );
}

@Get('my/history')
@Roles('PATIENT')
getMyAppointmentHistory(@Req() req) {
  return this.appointmentsService.getMyAppointmentHistory(
    req.user.userId,
  );
}
// ================= DOCTOR SIDE =================
// 1️⃣ GET UPCOMING APPOINTMENTS
@Get('doctor/upcoming')
@Roles('DOCTOR')
getDoctorUpcomingAppointments(@Req() req) {
  return this.appointmentsService.getDoctorUpcomingAppointments(
    req.user.userId,
  );
}

// 1️⃣ GET APPOINTMENTS BY DATE
@Get('doctor/date/:date')
@Roles('DOCTOR')
getDoctorAppointmentsByDate(
  @Req() req,
  @Param('date') date: string,
) {
  return this.appointmentsService.getDoctorAppointmentsByDate(
    req.user.userId,
    date,
  );
}

// 2️⃣ COMPLETE APPOINTMENT

@Post(':id/complete')
@Roles('DOCTOR')
completeAppointment(@Req() req, @Param('id') id: number) {
  return this.appointmentsService.completeAppointment(
    req.user.userId,
    id,
  );
}

// 3️⃣ CANCEL APPOINTMENT BY DOCTOR
@Post(':id/cancel')
@Roles('DOCTOR')
cancelAppointmentByDoctor(
  @Req() req,
  @Param('id') id: number,
) {
  return this.appointmentsService.cancelAppointmentByDoctor(
    req.user.userId,
    id,
  );
}

//Get All Appointments
@Get('doctor')
@Roles('DOCTOR')
getAllDoctorAppointments(
  @Req() req,
  @Query('status') status?: string,
  @Query('date') date?: string,
) {
  return this.appointmentsService.getAllDoctorAppointments(
    req.user.userId,
    status,
    date,
  );
}
}
