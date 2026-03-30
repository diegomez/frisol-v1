import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tribe } from './entities/tribe.entity';
import { TribesService } from './tribes.service';
import { TribesController } from './tribes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tribe])],
  providers: [TribesService],
  controllers: [TribesController],
  exports: [TribesService],
})
export class TribesModule {}
