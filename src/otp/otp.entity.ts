import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('otp')
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  identifier: string; // email or phone

  @Column()
  otp: string;

  @CreateDateColumn()
  createdAt: Date;
}
