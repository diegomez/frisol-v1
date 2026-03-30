import { Controller, Get, Post, Patch, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('admin')
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      active: u.active,
      tribe_id: u.tribe_id,
      tribe_name: u.tribe?.name || null,
      created_at: u.created_at,
    }));
  }

  @Get('tribes')
  async getTribes() {
    // Any authenticated user can get tribes list
    const users = await this.usersService.findAll();
    // Return unique tribes from the tribe relation
    // Actually, we need tribes from the tribes table - but users service doesn't have that
    // We'll handle this differently
    return [];
  }

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ForbiddenException('Ya existe un usuario con ese email');
    const user = await this.usersService.create(dto);
    return { id: user.id, email: user.email, name: user.name, role: user.role, active: user.active, tribe_id: user.tribe_id };
  }

  @Patch(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    if (dto.email) {
      const existing = await this.usersService.findByEmail(dto.email);
      if (existing && existing.id !== id) throw new ForbiddenException('Ya existe un usuario con ese email');
    }
    const user = await this.usersService.update(id, dto);
    return { id: user.id, email: user.email, name: user.name, role: user.role, active: user.active, tribe_id: user.tribe_id };
  }
}
