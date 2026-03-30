import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { ProjectsModule } from '../projects/projects.module';
import { SymptomsModule } from '../symptoms/symptoms.module';
import { CausasModule } from '../causas/causas.module';
import { KpisModule } from '../kpis/kpis.module';

@Module({
  imports: [ProjectsModule, SymptomsModule, CausasModule, KpisModule],
  providers: [PdfService],
  controllers: [PdfController],
})
export class PdfModule {}