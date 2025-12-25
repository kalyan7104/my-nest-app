import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm'; 
import { Appointment } from '../appointments/appointment.entity';


@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column()
  status: string;

  @Column()
  method: string;

  @OneToOne(() => Appointment, appointment => appointment.payment)
  @JoinColumn()
  appointment: Appointment;
}
