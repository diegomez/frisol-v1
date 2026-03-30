import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private usersService: UsersService,
  ) {}

  async findAll(userId: string, role: string, filter: 'mine' | 'all' = 'all') {
    const query = this.projectsRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.csm', 'csm')
      .leftJoinAndSelect('project.tribe', 'tribe')
      .orderBy('project.updated_at', 'DESC');

    if (filter === 'mine' && role === 'csm') {
      query.where('project.csm_id = :userId', { userId });
    }

    return query.getMany();
  }

  async findById(id: string) {
    return this.projectsRepository.findOne({
      where: { id },
      relations: ['csm', 'tribe', 'symptoms', 'causas', 'kpis', 'terminado_user', 'cerrado_user'],
    });
  }

  async create(csmId: string) {
    // Get user's tribe as default
    const user = await this.usersService.findById(csmId);
    const project = this.projectsRepository.create({
      csm_id: csmId,
      estado: 'en_progreso',
      tribe_id: user?.tribe_id || undefined,
    });
    return this.projectsRepository.save(project);
  }

  async updateEstado(id: string, estado: 'en_progreso' | 'terminado' | 'cerrado', auditData?: any) {
    const updateData: any = { estado, ...auditData };
    await this.projectsRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string) {
    await this.projectsRepository.delete(id);
  }

  async updateCliente(id: string, data: Partial<Project>) {
    await this.projectsRepository.update(id, data);
    return this.findById(id);
  }

  async updateEvidencia(id: string, evidencia: string) {
    await this.projectsRepository.update(id, { evidencia });
    return this.findById(id);
  }

  async updateVozDolor(id: string, voz_dolor: string) {
    await this.projectsRepository.update(id, { voz_dolor });
    return this.findById(id);
  }

  async updateImpacto(id: string, impacto_negocio: string) {
    await this.projectsRepository.update(id, { impacto_negocio });
    return this.findById(id);
  }

  async getProgress(id: string) {
    const project = await this.findById(id);
    if (!project) return null;

    const compute = (condition: boolean) => condition ? 'green' : 'red';
    const computeYellow = (hasAny: boolean, allComplete: boolean) => {
      if (!hasAny) return 'red';
      return allComplete ? 'green' : 'yellow';
    };

    return {
      cliente: compute(
        !!(project.nombre_cliente?.trim() && project.nombre_proyecto?.trim() && project.fecha_inicio && project.crm_id?.trim())
      ),
      diagnostico: computeYellow(
        project.symptoms.length > 0,
        project.symptoms.length > 0 && project.symptoms.every(s =>
          s.what?.trim() && s.who?.trim() && s.when_field?.trim() && s.where_field?.trim() && s.how?.trim() && s.declaration?.trim()
        )
      ),
      evidencia: compute(!!project.evidencia?.trim()),
      vozDolor: compute(!!project.voz_dolor?.trim()),
      causas: computeYellow(
        project.causas.length > 0,
        project.causas.length > 0 && project.causas.every(c =>
          c.why_1?.trim() && c.why_2?.trim() && c.why_3?.trim() && (c.origin_metodo || c.origin_maquina || c.origin_gobernanza)
        )
      ),
      impacto: !project.impacto_negocio?.trim() ? 'red'
        : project.kpis.length === 0 || project.kpis.some(k => !k.nombre?.trim() || !k.valor_actual?.trim() || !k.valor_objetivo?.trim())
          ? 'yellow' : 'green',
    };
  }

  async canMarkTerminado(id: string): Promise<boolean> {
    const progress = await this.getProgress(id);
    if (!progress) return false;
    return Object.values(progress).every(status => status === 'green');
  }
}
