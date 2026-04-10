import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sponsors')
@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly service: SponsorsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
