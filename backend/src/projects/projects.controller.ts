import { Controller, Get, Post, Patch, Delete, Param, Query, UseGuards, Body, ForbiddenException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ClienteDto } from './dto/cliente.dto';
import { TextUpdateDto } from './dto/text-update.dto';

@Controller('api/v1/projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('filter') filter: 'mine' | 'all' = 'all',
  ) {
    const projects = await this.projectsService.findAll(user.id, user.role, filter);
    const result = [];
    for (const p of projects) {
      const progress = await this.projectsService.getProgress(p.id);
      result.push({
        id: p.id,
        internal_id: p.internal_id,
        nombre_cliente: p.nombre_cliente,
        nombre_proyecto: p.nombre_proyecto,
        crm_id: p.crm_id,
        fecha_inicio: p.fecha_inicio,
        estado: p.estado,
        csm_name: p.csm?.name,
        csm_id: p.csm_id,
        tribe_id: p.tribe_id,
        tribe_name: p.tribe?.name || null,
        progress,
        created_at: p.created_at,
        updated_at: p.updated_at,
      });
    }
    return result;
  }

  @Post()
  @Roles('csm')
  async create(@CurrentUser() user: any) {
    return this.projectsService.create(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const project = await this.projectsService.findById(id);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');

    return {
      ...project,
      symptoms: project.symptoms,
      causas: project.causas,
      kpis: project.kpis,
    };
  }

  @Patch(':id/cliente')
  async updateCliente(
    @Param('id') id: string,
    @Body() clienteDto: ClienteDto,
    @CurrentUser() user: any,
  ) {
    const project = await this.projectsService.findById(id);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.csm_id !== user.id && user.role !== 'po') {
      throw new ForbiddenException('No tenés acceso a este proyecto');
    }
    if (project.estado !== 'en_progreso') {
      throw new ForbiddenException('Este proyecto ya no es editable');
    }
    return this.projectsService.updateCliente(id, clienteDto);
  }

  @Patch(':id/estado')
  async updateEstado(
    @Param('id') id: string,
    @Body() body: { estado: 'en_progreso' | 'terminado' | 'cerrado' },
    @CurrentUser() user: any,
  ) {
    const project = await this.projectsService.findById(id);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');

    if (body.estado === 'terminado') {
      if (user.role !== 'csm') throw new ForbiddenException('Solo CSM puede marcar como terminado');
      if (project.csm_id !== user.id) throw new ForbiddenException('No es tu proyecto');
      const canMark = await this.projectsService.canMarkTerminado(id);
      if (!canMark) throw new ForbiddenException('Todas las secciones deben estar en verde');
      // Save audit trail
      return this.projectsService.updateEstado(id, 'terminado', {
        terminado_by: user.id,
        terminado_at: new Date(),
      });
    }

    if (body.estado === 'cerrado') {
      if (user.role !== 'po') throw new ForbiddenException('Solo PO puede marcar como cerrado');
      if (project.estado !== 'terminado') throw new ForbiddenException('El proyecto debe estar terminado primero');
      // Save audit trail
      return this.projectsService.updateEstado(id, 'cerrado', {
        cerrado_by: user.id,
        cerrado_at: new Date(),
      });
    }

    if (body.estado === 'en_progreso') {
      // PO can reject from terminado
      if (user.role === 'po' && project.estado === 'terminado') {
        return this.projectsService.updateEstado(id, 'en_progreso', {
          terminado_by: null,
          terminado_at: null,
        });
      }
      // Admin can reopen from cerrado
      if (user.role === 'admin' && project.estado === 'cerrado') {
        return this.projectsService.updateEstado(id, 'en_progreso', {
          terminado_by: null,
          terminado_at: null,
          cerrado_by: null,
          cerrado_at: null,
        });
      }
      throw new ForbiddenException('No tenés permisos para esta acción');
    }

    throw new ForbiddenException('Estado inválido');
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    const project = await this.projectsService.findById(id);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.estado !== 'en_progreso') throw new ForbiddenException('Solo se pueden eliminar proyectos en progreso');
    // CSM can delete own projects, PO can delete any
    if (user.role === 'csm' && project.csm_id !== user.id) {
      throw new ForbiddenException('No es tu proyecto');
    }
    if (user.role !== 'csm' && user.role !== 'po') {
      throw new ForbiddenException('Solo CSM o PO pueden eliminar proyectos');
    }
    await this.projectsService.delete(id);
    return { message: 'Proyecto eliminado' };
  }

  @Get(':id/progress')
  async getProgress(@Param('id') id: string) {
    return this.projectsService.getProgress(id);
  }

  @Patch(':id/evidencia')
  async updateEvidencia(
    @Param('id') id: string,
    @Body() body: TextUpdateDto,
    @CurrentUser() user: any,
  ) {
    const project = await this.projectsService.findById(id);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.csm_id !== user.id && user.role !== 'po') {
      throw new ForbiddenException('No tenés acceso a este proyecto');
    }
    if (project.estado !== 'en_progreso') {
      throw new ForbiddenException('Este proyecto ya no es editable');
    }
    return this.projectsService.updateEvidencia(id, body.value);
  }

  @Patch(':id/voz-dolor')
  async updateVozDolor(
    @Param('id') id: string,
    @Body() body: TextUpdateDto,
    @CurrentUser() user: any,
  ) {
    const project = await this.projectsService.findById(id);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.csm_id !== user.id && user.role !== 'po') {
      throw new ForbiddenException('No tenés acceso a este proyecto');
    }
    if (project.estado !== 'en_progreso') {
      throw new ForbiddenException('Este proyecto ya no es editable');
    }
    return this.projectsService.updateVozDolor(id, body.value);
  }

  @Patch(':id/impacto')
  async updateImpacto(
    @Param('id') id: string,
    @Body() body: TextUpdateDto,
    @CurrentUser() user: any,
  ) {
    const project = await this.projectsService.findById(id);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.csm_id !== user.id && user.role !== 'po') {
      throw new ForbiddenException('No tenés acceso a este proyecto');
    }
    if (project.estado !== 'en_progreso') {
      throw new ForbiddenException('Este proyecto ya no es editable');
    }
    return this.projectsService.updateImpacto(id, body.value);
  }
}
