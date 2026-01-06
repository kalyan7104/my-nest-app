/*import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ElasticScheduledType } from '../elastic-slot.entity';

export class CreateElasticSlotDto {
  @IsString()
  @IsNotEmpty()
  date: string; // YYYY-MM-DD

  @IsString()
  startTime: string; // HH:mm

  @IsString()
  endTime: string; // HH:mm

  @IsEnum(ElasticScheduledType)
  scheduledType: ElasticScheduledType;

  @IsNumber()
  capacity: number;

  @IsString()
  reason?: string;
}*/
