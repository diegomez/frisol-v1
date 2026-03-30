import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Causa } from './entities/causa.entity';
import { CausasService } from './causas.service';
import { CausasController } from './causas.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([Causa]), ProjectsModule],
  providers: [CausasService],
  controllers: [CausasController],
  exports: [CausasService],
})
export class CausasModule {}
