import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { CausasService } from './causas.service';
import { ProjectsService } from '../projects/projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCausaDto, UpdateCausaDto } from './dto/causa.dto';

@Controller('api/v1/projects/:projectId/causas')
@UseGuards(JwtAuthGuard)
export class CausasController {
  constructor(
    private causasService: CausasService,
    private projectsService: ProjectsService,
  ) {}

  @Get()
  async findAll(@Param('projectId') projectId: string) {
    return this.causasService.findByProjectId(projectId);
  }

  @Post()
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateCausaDto,
  ) {
    const project = await this.projectsService.findById(projectId);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.estado !== 'en_progreso') throw new ForbiddenException('Proyecto no editable');
    return this.causasService.create(projectId, dto);
  }

  @Patch(':causaId')
  async update(
    @Param('projectId') projectId: string,
    @Param('causaId') causaId: string,
    @Body() dto: UpdateCausaDto,
  ) {
    const project = await this.projectsService.findById(projectId);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.estado !== 'en_progreso') throw new ForbiddenException('Proyecto no editable');
    return this.causasService.update(causaId, dto);
  }

  @Delete(':causaId')
  async delete(
    @Param('projectId') projectId: string,
    @Param('causaId') causaId: string,
  ) {
    const project = await this.projectsService.findById(projectId);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.estado !== 'en_progreso') throw new ForbiddenException('Proyecto no editable');
    await this.causasService.delete(causaId);
    return { message: 'Causa eliminada' };
  }
}
