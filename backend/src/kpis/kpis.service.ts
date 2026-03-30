import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kpi } from './entities/kpi.entity';
import { CreateKpiDto, UpdateKpiDto } from './dto/kpi.dto';

@Injectable()
export class KpisService {
  constructor(
    @InjectRepository(Kpi)
    private kpisRepository: Repository<Kpi>,
  ) {}

  async findByProjectId(projectId: string): Promise<Kpi[]> {
    return this.kpisRepository.find({
      where: { project_id: projectId },
      order: { created_at: 'ASC' },
    });
  }

  async create(projectId: string, dto: CreateKpiDto): Promise<Kpi> {
    const kpi = this.kpisRepository.create({
      project_id: projectId,
      ...dto,
    });
    return this.kpisRepository.save(kpi);
  }

  async update(id: string, dto: UpdateKpiDto): Promise<Kpi> {
    await this.kpisRepository.update(id, dto);
    return this.kpisRepository.findOne({ where: { id } }) as Promise<Kpi>;
  }

  async delete(id: string): Promise<void> {
    await this.kpisRepository.delete(id);
  }
}
