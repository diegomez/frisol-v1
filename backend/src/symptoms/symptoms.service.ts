import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Symptom } from './entities/symptom.entity';
import { CreateSymptomDto, UpdateSymptomDto } from './dto/symptom.dto';

@Injectable()
export class SymptomsService {
  constructor(
    @InjectRepository(Symptom)
    private symptomsRepository: Repository<Symptom>,
  ) {}

  async findByProjectId(projectId: string): Promise<Symptom[]> {
    return this.symptomsRepository.find({
      where: { project_id: projectId },
      order: { created_at: 'ASC' },
    });
  }

  async create(projectId: string, dto: CreateSymptomDto): Promise<Symptom> {
    const symptom = this.symptomsRepository.create({
      project_id: projectId,
      ...dto,
    });
    return this.symptomsRepository.save(symptom);
  }

  async update(id: string, dto: UpdateSymptomDto): Promise<Symptom> {
    await this.symptomsRepository.update(id, dto);
    return this.symptomsRepository.findOne({ where: { id } }) as Promise<Symptom>;
  }

  async delete(id: string): Promise<void> {
    await this.symptomsRepository.delete(id);
  }
}
