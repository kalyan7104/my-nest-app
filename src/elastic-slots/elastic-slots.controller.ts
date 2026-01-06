import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ElasticSlotsService } from './elastic-slots.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';


@Controller('elastic-slots')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ElasticSlotsController {
  constructor(
    private readonly elasticSlotsService: ElasticSlotsService,
  ) {}

  // ✅ Elastic Expand
 /* @Post('expand')
  @Roles('DOCTOR')
  expandSession(@Req() req, @Body() dto: CreateElasticSlotDto) {
    return this.elasticSlotsService.createElasticSlot(
      req.user.userId,
      dto,
    );
  }*/

  @Post('expand-time')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
expandTime(@Req() req, @Body() body) {
  return this.elasticSlotsService.expandSessionTime(
    req.user.userId,
    body,
  );
}

}
