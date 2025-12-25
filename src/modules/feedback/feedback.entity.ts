import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm'; 
import { Appointment } from '../appointments/appointment.entity';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  doctorRating: number;

  @Column()
  hospitalRating: number;

  @Column()
  waitingTimeRating: number;

  @OneToOne(() => Appointment, appointment => appointment.feedback)
  @JoinColumn()
  appointment: Appointment;
}
