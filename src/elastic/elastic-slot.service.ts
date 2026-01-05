import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElasticSlot } from './elastic-slot.entity';
import { Doctor } from '../doctors/doctor.entity';

@Injectable()
export class ElasticSlotService {
  constructor(
    @InjectRepository(ElasticSlot)
    private elasticRepo: Repository<ElasticSlot>,
  ) {}

  async getOrCreateSlot(
    doctor: Doctor,
    date: string,
    startTime: string,
    endTime: string,
    baseCapacity: number,
    bookedCount: number,
  ) {
    let slot = await this.elasticRepo.findOne({
      where: { doctor: { id: doctor.id }, date, startTime, endTime },
    });

    if (!slot) {
      slot = this.elasticRepo.create({
  doctor,
  date,
  startTime,
  endTime,
  baseCapacity,
  maxCapacity: baseCapacity * 3,
  currentLoad: bookedCount,
});

      await this.elasticRepo.save(slot);
    }

    return slot;
  }

  async canAllocate(slot: ElasticSlot): Promise<boolean> {
    return slot.currentLoad < slot.maxCapacity;
  }

  async incrementLoad(slot: ElasticSlot) {
    slot.currentLoad += 1;
    await this.elasticRepo.save(slot);
  }

  async decrementLoad(slot: ElasticSlot) {
  slot.currentLoad = Math.max(0, slot.currentLoad - 1);
  await this.elasticRepo.save(slot);
}

}
