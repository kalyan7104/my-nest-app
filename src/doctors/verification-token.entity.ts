import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';

import { VerificationStatus } from '../common/enums/verification-status.enum';




@Entity('verification_tokens')
export class VerificationToken {
  @PrimaryGeneratedColumn()
  id: number;

  // Used to uniquely identify a verification request
  @Column({ unique: true })
  token: string;

  @Column({
  type: 'enum',
  enum: VerificationStatus,
  default: VerificationStatus.PENDING,
})
status: VerificationStatus;

  @CreateDateColumn()
  requestedAt: Date;

  @UpdateDateColumn()
  reviewedAt: Date;

  // Many verification requests can belong to one doctor
  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  doctor: Doctor;
}
