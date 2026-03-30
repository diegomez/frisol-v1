import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Causa } from './entities/causa.entity';
import { CreateCausaDto, UpdateCausaDto } from './dto/causa.dto';

@Injectable()
export class CausasService {
  constructor(
    @InjectRepository(Causa)
    private causasRepository: Repository<Causa>,
  ) {}

  async findByProjectId(projectId: string): Promise<Causa[]> {
    return this.causasRepository.find({
      where: { project_id: projectId },
      order: { created_at: 'ASC' },
    });
  }

  private computeRootCause(dto: Partial<CreateCausaDto>): string {
    // Root cause = last filled why (min 3)
    if (dto.why_5?.trim()) return dto.why_5;
    if (dto.why_4?.trim()) return dto.why_4;
    return dto.why_3 || '';
  }

  async create(projectId: string, dto: CreateCausaDto): Promise<Causa> {
    const root_cause = this.computeRootCause(dto);
    const causa = this.causasRepository.create({
      project_id: projectId,
      ...dto,
      root_cause,
    });
    return this.causasRepository.save(causa);
  }

  async update(id: string, dto: UpdateCausaDto): Promise<Causa> {
    const root_cause = this.computeRootCause(dto);
    await this.causasRepository.update(id, { ...dto, root_cause });
    return this.causasRepository.findOne({ where: { id } }) as Promise<Causa>;
  }

  async delete(id: string): Promise<void> {
    await this.causasRepository.delete(id);
  }
}
