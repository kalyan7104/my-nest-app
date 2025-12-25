import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';

import { UsersModule } from './modules/users/users.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ChatsModule } from './modules/chats/chats.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),

    UsersModule,
    DoctorsModule,
    AppointmentsModule,
    PaymentsModule,
    ChatsModule,
    FeedbackModule,
    NotificationsModule,
  ],
})
export class AppModule {}
