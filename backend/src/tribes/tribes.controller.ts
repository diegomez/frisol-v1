import { Controller, Get, UseGuards } from '@nestjs/common';
import { TribesService } from './tribes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/tribes')
@UseGuards(JwtAuthGuard)
export class TribesController {
  constructor(private tribesService: TribesService) {}

  @Get()
  async findAll() {
    return this.tribesService.findAll();
  }
}
