import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { VerificationStatus } from '../common/enums/verification-status.enum';

import { DoctorSpecialization } from '../common/enums/doctor-specialization.enum';



@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
  type: 'enum',
  enum: VerificationStatus,
  default: VerificationStatus.PENDING,
})
verificationStatus: VerificationStatus;


  @Column({
    type: 'enum',
    enum: DoctorSpecialization,
    nullable: true,
  })
  specialization: DoctorSpecialization;


  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //This is the Link for User entity

   @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
