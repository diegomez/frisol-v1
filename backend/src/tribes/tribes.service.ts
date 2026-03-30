import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tribe } from './entities/tribe.entity';

@Injectable()
export class TribesService {
  constructor(
    @InjectRepository(Tribe)
    private tribesRepository: Repository<Tribe>,
  ) {}

  async findAll(): Promise<Tribe[]> {
    return this.tribesRepository.find({ order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<Tribe | null> {
    return this.tribesRepository.findOne({ where: { id } });
  }
}
