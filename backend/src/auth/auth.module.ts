import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { EditableGuard } from './guards/editable.guard';
import { OwnerGuard } from './guards/owner.guard';
import { Project } from '../projects/entities/project.entity';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'frisol-dev-secret-change-in-production',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
    TypeOrmModule.forFeature([Project]),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy, EditableGuard, OwnerGuard],
  controllers: [AuthController],
  exports: [AuthService, EditableGuard, OwnerGuard],
})
export class AuthModule {}
