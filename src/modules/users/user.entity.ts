import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';
import { Notification } from '../notifications/notification.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  mobileNumber: string;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  gender: string;

  @OneToMany(() => Appointment, appointment => appointment.user)
  appointments: Appointment[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];
}
