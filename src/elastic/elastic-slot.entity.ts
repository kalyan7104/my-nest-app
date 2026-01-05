import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { SlotAllocation } from './slot-allocation.entity';

@Entity('elastic_slots')
export class ElasticSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  doctor: Doctor;

  @Column({ type: 'date' })
  date: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  // Base capacity (from availability)
  @Column()
  baseCapacity: number;

  // Max capacity doctor can expand to
  @Column()
  maxCapacity: number;

  @Column({ default: 0 })
  currentLoad: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => SlotAllocation, (a) => a.elasticSlot)
  allocations: SlotAllocation[];

  @CreateDateColumn()
  createdAt: Date;
}
