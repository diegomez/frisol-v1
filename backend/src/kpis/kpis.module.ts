import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kpi } from './entities/kpi.entity';
import { KpisService } from './kpis.service';
import { KpisController } from './kpis.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([Kpi]), ProjectsModule],
  providers: [KpisService],
  controllers: [KpisController],
  exports: [KpisService],
})
export class KpisModule {}
