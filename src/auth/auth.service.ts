import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

import { UsersService } from '../users/users.service';
import { EmailVerification } from './email-verification.entity';
import { MailService } from './mail.service';

import { Doctor } from '../doctors/doctor.entity';
import { VerificationStatus } from '../common/enums/verification-status.enum';


@Injectable()
export class AuthService {
  private mailService = new MailService();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(EmailVerification)
    private emailRepo: Repository<EmailVerification>,
    @InjectRepository(Doctor)
  private doctorRepo: Repository<Doctor>,
  ) {}

  async signup(data: any) {
    data.password = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create(data);

    if (user.role === 'DOCTOR') {
  const doctor = this.doctorRepo.create({
    user: user,
    verificationStatus: VerificationStatus.PENDING,
    isActive: true,
  });

  await this.doctorRepo.save(doctor);
}

    const token = randomUUID();
    await this.emailRepo.save({ userId: user.id, token });

    await this.mailService.sendVerificationEmail(user.email, token);

    return { message: 'Verification email sent' };
  }

  async verifyEmail(token: string) {
    const record = await this.emailRepo.findOne({ where: { token } });
    if (!record) throw new BadRequestException('Invalid token');

    await this.usersService.verifyUser(record.userId);
    await this.emailRepo.delete(record.id);

    return { message: 'Email verified successfully' };
  }

  async signin(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.isVerified)
      throw new BadRequestException('User not verified');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new BadRequestException('Invalid credentials');

    const token = this.jwtService.sign({
      userId: user.id,
      role: user.role,
    });

    return { accessToken: token };
  }
}
