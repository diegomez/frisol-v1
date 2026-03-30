import {
  Controller, Get, Post, Delete, Param, Body, UseGuards, UseInterceptors,
  UploadedFile, ForbiddenException, Res, StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { AttachmentsService } from './attachments.service';
import { ProjectsService } from '../projects/projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/v1/projects/:projectId/attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(
    private attachmentsService: AttachmentsService,
    private projectsService: ProjectsService,
  ) {}

  @Get()
  async findAll(@Param('projectId') projectId: string) {
    return this.attachmentsService.findByProjectId(projectId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } })) // 10MB max
  async create(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @CurrentUser() user: any,
  ) {
    const project = await this.projectsService.findById(projectId);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.estado !== 'en_progreso') throw new ForbiddenException('Proyecto no editable');
    if (project.csm_id !== user.id && user.role !== 'po') {
      throw new ForbiddenException('No tenés acceso a este proyecto');
    }
    if (!file) throw new ForbiddenException('No se recibió archivo');
    if (!title?.trim()) throw new ForbiddenException('El título es obligatorio');
    return this.attachmentsService.create(projectId, title.trim(), file);
  }

  @Delete(':attachmentId')
  async delete(
    @Param('projectId') projectId: string,
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: any,
  ) {
    const project = await this.projectsService.findById(projectId);
    if (!project) throw new ForbiddenException('Proyecto no encontrado');
    if (project.estado !== 'en_progreso') throw new ForbiddenException('Proyecto no editable');
    if (project.csm_id !== user.id && user.role !== 'po') {
      throw new ForbiddenException('No tenés acceso a este proyecto');
    }
    await this.attachmentsService.delete(attachmentId);
    return { message: 'Adjunto eliminado' };
  }

  @Get(':attachmentId/download')
  async download(
    @Param('projectId') projectId: string,
    @Param('attachmentId') attachmentId: string,
    @Res() res: Response,
  ) {
    const result = await this.attachmentsService.getFilePath(attachmentId);
    if (!result) throw new ForbiddenException('Archivo no encontrado');

    const file = createReadStream(result.path);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(result.name)}"`,
    });
    file.pipe(res);
  }
}
