import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Symptom } from './entities/symptom.entity';
import { SymptomsService } from './symptoms.service';
import { SymptomsController } from './symptoms.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([Symptom]), ProjectsModule],
  providers: [SymptomsService],
  controllers: [SymptomsController],
  exports: [SymptomsService],
})
export class SymptomsModule {}
