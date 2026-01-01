import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { ScheduledType } from '../common/enums/scheduled-type.enum';

export enum WeekDay {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

@Entity('recurring_availabilities')
export class RecurringAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  doctor: Doctor;

  @Column({
    type: 'enum',
    enum: WeekDay,
  })
  dayOfWeek: WeekDay;

  @Column()
  startTime: string; // "10:00"

  @Column()
  endTime: string; // "13:00"

  // 🧠 Scheduling strategy
  @Column({
    type: 'enum',
    enum: ScheduledType,
    default: ScheduledType.SLOT,
  })
  scheduledType: ScheduledType;

  // 👥 Capacity per window
  @Column({ default: 1 })
  capacity: number;


  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
