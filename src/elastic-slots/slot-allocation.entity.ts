import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';
import { Availability } from '../availability/availability.entity';

/**
 * How this allocation was created
 */
export enum AllocationType {
  NORMAL = 'NORMAL',   // normal booking
  INFILL = 'INFILL',   // moved during infill
  SQUEEZE = 'SQUEEZE', // moved during squeeze
}

@Entity('slot_allocations')
export class SlotAllocation {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Appointment being allocated
   * One appointment → one allocation
   */
  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  appointment: Appointment;

  /**
   * Parent availability session
   * Needed for elastic expand/shrink
   */
  @ManyToOne(() => Availability, { onDelete: 'CASCADE' })
  availability: Availability;

  /**
   * Slot window this appointment belongs to
   * (used mainly for WAVE)
   */
  @Column({nullable: true})
  slotStartTime: string; // "10:00"

  @Column({nullable: true})
  slotEndTime: string; // "10:30"

  /**
   * Position inside the slot
   * 0, 1, 2, ...
   */
  @Column({ type: 'int' ,nullable: true})
  orderIndex: number;

  /**
   * Final reporting time calculated for the patient
   */
  @Column()
  reportingTime: string; // "10:15"

  /**
   * Why this allocation exists / was updated
   */
  @Column({
    type: 'enum',
    enum: AllocationType,
    default: AllocationType.NORMAL,
  })
  allocationType: AllocationType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
