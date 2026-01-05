import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ElasticSlot } from './elastic-slot.entity';
import { Appointment } from '../appointments/appointment.entity';

@Entity('slot_allocations')
export class SlotAllocation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ElasticSlot, { onDelete: 'CASCADE' })
  elasticSlot: ElasticSlot;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  appointment: Appointment;

  @CreateDateColumn()
  allocatedAt: Date;
}
