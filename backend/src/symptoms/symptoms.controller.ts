import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { SymptomsService } from './symptoms.service';
import { ProjectsService } from '../projects/projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSymptomDto, UpdateSymptomDto } from './dto/symptom.dto';

@Controller('api/v1/projects/:projectId/symptoms')
@UseGuards(JwtAuthGuard)
export class SymptomsController {
  constructor(
    private symptomsService: SymptomsService,
    private projectsService: ProjectsService,
  ) {}

  @Get()
  async findAll(@Param('projectId') projectId: string) {
    return this.symptomsService.findByProjectId(projectId);
  }

  @Post()
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateSymptomDto,
  ) {
    const project = await this.projectsService.findById(projectId);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.estado !== 'en_progreso') throw new ForbiddenException('Proyecto no editable');
    return this.symptomsService.create(projectId, dto);
  }

  @Patch(':symptomId')
  async update(
    @Param('projectId') projectId: string,
    @Param('symptomId') symptomId: string,
    @Body() dto: UpdateSymptomDto,
  ) {
    const project = await this.projectsService.findById(projectId);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.estado !== 'en_progreso') throw new ForbiddenException('Proyecto no editable');
    return this.symptomsService.update(symptomId, dto);
  }

  @Delete(':symptomId')
  async delete(
    @Param('projectId') projectId: string,
    @Param('symptomId') symptomId: string,
  ) {
    const project = await this.projectsService.findById(projectId);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.estado !== 'en_progreso') throw new ForbiddenException('Proyecto no editable');
    await this.symptomsService.delete(symptomId);
    return { message: 'Síntoma eliminado' };
  }
}
