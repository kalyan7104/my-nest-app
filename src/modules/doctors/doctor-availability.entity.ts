import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';


@Entity('doctor_availability')
export class DoctorAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  day: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @ManyToOne(() => Doctor, doctor => doctor.availability)
  doctor: Doctor;
}
