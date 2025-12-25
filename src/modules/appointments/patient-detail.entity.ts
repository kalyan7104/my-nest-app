import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm'; 
import { Appointment } from '../appointments/appointment.entity';

@Entity('patient_details')
export class PatientDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  weight: number;

  @Column()
  complaint: string;

  @Column()
  visitType: string;

  @OneToOne(() => Appointment, appointment => appointment.patientDetail)
  @JoinColumn()
  appointment: Appointment;
}
