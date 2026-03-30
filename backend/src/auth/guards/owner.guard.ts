import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const projectId = request.params.id;

    // PO can access any project
    if (user.role === 'po') return true;

    // Dev can read any project (write is blocked by RolesGuard)
    if (user.role === 'dev') return true;

    // CSM can only access own projects
    const project = await this.projectsRepository.findOne({ where: { id: projectId } });
    if (!project) return false;

    if (project.csm_id !== user.id) {
      throw new ForbiddenException('No tenés acceso a este proyecto');
    }

    return true;
  }
}
