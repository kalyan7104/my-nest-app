import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticSlot } from './elastic-slot.entity';
import { SlotAllocation } from './slot-allocation.entity';
import { ElasticSlotService } from './elastic-slot.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ElasticSlot, SlotAllocation]),
  ],
  providers: [ElasticSlotService],
  exports: [ElasticSlotService], // 
})
export class ElasticModule {}
