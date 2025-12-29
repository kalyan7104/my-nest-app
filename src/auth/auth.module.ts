import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailVerification } from './email-verification.entity';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';


@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([EmailVerification]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: (() => {
          const raw = process.env.JWT_EXPIRES_IN;
          if (!raw) return undefined;
          const n = Number(raw);
          return Number.isNaN(n) ? raw : n;
        })() as any,
      },
    }),
  ],
  providers: [AuthService, JwtStrategy,RolesGuard],
  controllers: [AuthController],
})
export class AuthModule {}
