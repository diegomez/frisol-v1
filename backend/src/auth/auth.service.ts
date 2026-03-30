import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    // Check if user is active
    if (!user.active) return null;

    // For seed users with placeholder hash, allow direct comparison
    if (user.password_hash === '$2b$10$placeholder') {
      const hash = await bcrypt.hash(password, 10);
      user.password_hash = hash;
      await this.usersService['usersRepository'].save(user);
      const { password_hash, ...result } = user;
      return result;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;

    const { password_hash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, active: user.active },
      token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    if (!user.active) throw new UnauthorizedException('Usuario desactivado');
    return { id: user.id, email: user.email, name: user.name, role: user.role, active: user.active };
  }
}
