import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender: string;

  @Column()
  message: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Appointment, appointment => appointment.chats)
  appointment: Appointment;
}
