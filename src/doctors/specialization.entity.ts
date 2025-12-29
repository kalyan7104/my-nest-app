import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('specializations')
export class Specialization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // e.g., Cardiologist, Dentist

  @CreateDateColumn()
  createdAt: Date;

   // Many specializations can belong to one doctor
  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  doctor: Doctor;
}
