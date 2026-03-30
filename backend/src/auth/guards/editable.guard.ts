import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Injectable()
export class EditableGuard implements CanActivate {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const projectId = request.params.id;

    if (!projectId) return true; // Creating new project

    const project = await this.projectsRepository.findOne({ where: { id: projectId } });
    if (!project) return false;

    if (project.estado !== 'en_progreso') {
      throw new ForbiddenException('Este proyecto ya no es editable');
    }

    return true;
  }
}
