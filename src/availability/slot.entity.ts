import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Availability } from './availability.entity';

@Entity('slots')
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Availability, { onDelete: 'CASCADE' })
  availability: Availability;

  @Column()
  startTime: string; // "10:00"

  @Column()
  endTime: string; // "10:30"

  @Column({ default: false })
  isBooked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
