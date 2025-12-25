import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Doctor } from '../doctors/doctor.entity';
import { PatientDetail } from './patient-detail.entity';
import { Payment } from '../payments/payment.entity';
import { Feedback } from '../feedback/feedback.entity';
import { Chat } from '../chats/chat.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  appointmentDate: Date;

  @Column()
  appointmentTime: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  tokenNumber: number;

  @ManyToOne(() => User, user => user.appointments)
  user: User;

  @ManyToOne(() => Doctor, doctor => doctor.appointments)
  doctor: Doctor;

  @OneToOne(() => PatientDetail, detail => detail.appointment)
  patientDetail: PatientDetail;

  @OneToOne(() => Payment, payment => payment.appointment)
  payment: Payment;

  @OneToOne(() => Feedback, feedback => feedback.appointment)
  feedback: Feedback;

  @OneToMany(() => Chat, chat => chat.appointment)
  chats: Chat[];
}
