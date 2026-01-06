/*import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ElasticSlot } from './elastic-slot.entity';
import { Appointment } from '../appointments/appointment.entity';

export enum SlotAllocationStatus {
  ACTIVE = 'ACTIVE',
  RELEASED = 'RELEASED',
}

@Entity('slot_allocations')
export class SlotAllocation {
  @PrimaryGeneratedColumn()
  id: number;

  // 🔗 Elastic slot being consumed
  @ManyToOne(
    () => ElasticSlot,
    (elasticSlot) => elasticSlot.allocations,
    { onDelete: 'CASCADE' },
  )
  elasticSlot: ElasticSlot;

  // 🔗 Appointment consuming capacity
  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  appointment: Appointment;

  // ⏱ Final reporting time given to patient
  @Column({ type: 'time' })
  reportingTime: string;

  // 📌 Allocation state
  @Column({
    type: 'enum',
    enum: SlotAllocationStatus,
    default: SlotAllocationStatus.ACTIVE,
  })
  status: SlotAllocationStatus;

  @CreateDateColumn()
  allocatedAt: Date;
}*/
