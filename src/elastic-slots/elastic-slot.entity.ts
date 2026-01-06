import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Availability } from '../availability/availability.entity';

export enum ElasticSlotStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('elastic_slots')
export class ElasticSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Availability, { onDelete: 'CASCADE' })
  availability: Availability; // 🔥 session-level link

  @Column({ type: 'time' ,nullable: true})
  originalEndTime: string;

  @Column({ type: 'time' ,nullable: true})
  extendedEndTime: string;

  @Column({
    type: 'enum',
    enum: ElasticSlotStatus,
    default: ElasticSlotStatus.ACTIVE,
  })
  status: ElasticSlotStatus;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
