import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { created_at: 'DESC' }, relations: ['tribe'] });
  }

  async create(data: { email: string; password: string; name: string; role: string; active: boolean; tribe_id?: string }): Promise<User> {
    const password_hash = await bcrypt.hash(data.password, 10);
    const user = this.usersRepository.create({
      email: data.email,
      password_hash,
      name: data.name,
      role: data.role as User['role'],
      active: data.active,
      tribe_id: data.tribe_id || undefined,
    });
    return this.usersRepository.save(user);
  }

  async update(id: string, data: { email?: string; name?: string; role?: string; active?: boolean; password?: string; tribe_id?: string }): Promise<User> {
    const updateData: any = {};
    if (data.email) updateData.email = data.email;
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.tribe_id !== undefined) updateData.tribe_id = data.tribe_id || null;
    if (data.password) updateData.password_hash = await bcrypt.hash(data.password, 10);

    if (Object.keys(updateData).length === 0) {
      const found = await this.usersRepository.findOne({ where: { id } });
      return found!;
    }

    await this.usersRepository.update(id, updateData);
    const updated = await this.usersRepository.findOne({ where: { id } });
    return updated!;
  }
}
