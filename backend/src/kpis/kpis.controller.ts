import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { KpisService } from './kpis.service';
import { ProjectsService } from '../projects/projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateKpiDto, UpdateKpiDto } from './dto/kpi.dto';

@Controller('api/v1/projects/:projectId/kpis')
@UseGuards(JwtAuthGuard)
export class KpisController {
  constructor(
    private kpisService: KpisService,
    private projectsService: ProjectsService,
  ) {}

  @Get()
  async findAll(@Param('projectId') projectId: string) {
    return this.kpisService.findByProjectId(projectId);
  }

  @Post()
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateKpiDto,
  ) {
    const project = await this.projectsService.findById(projectId);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.estado !== 'en_progreso') throw new ForbiddenException('Proyecto no editable');
    return this.kpisService.create(projectId, dto);
  }

  @Patch(':kpiId')
  async update(
    @Param('projectId') projectId: string,
    @Param('kpiId') kpiId: string,
    @Body() dto: UpdateKpiDto,
  ) {
    const project = await this.projectsService.findById(projectId);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.estado !== 'en_progreso') throw new ForbiddenException('Proyecto no editable');
    return this.kpisService.update(kpiId, dto);
  }

  @Delete(':kpiId')
  async delete(
    @Param('projectId') projectId: string,
    @Param('kpiId') kpiId: string,
  ) {
    const project = await this.projectsService.findById(projectId);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.estado !== 'en_progreso') throw new ForbiddenException('Proyecto no editable');
    await this.kpisService.delete(kpiId);
    return { message: 'KPI eliminado' };
  }
}
