import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { ScheduledType } from '../common/enums/scheduled-type.enum';

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  doctor: Doctor;

  // 📅 Custom date availability
  @Column({ type: 'date' })
  date: string;

  // ⏰ Time window
  @Column()
  startTime: string; // "12:00"

  @Column()
  endTime: string; // "14:00"

  // 🧠 Scheduling strategy
  @Column({
    type: 'enum',
    enum: ScheduledType,
    default: ScheduledType.SLOT,
  })
  scheduledType: ScheduledType;

  @Column({ type: 'int', default: 30 })
  slotDuration: number; // minutes

  // 👥 Capacity per time window
  @Column({ default: 1 })
  capacity: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
