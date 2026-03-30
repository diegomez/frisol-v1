import { IsEmail, IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsString()
  role: 'admin' | 'csm' | 'po' | 'dev';

  @IsBoolean()
  active: boolean;

  @IsString()
  @IsOptional()
  tribe_id?: string;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  role?: 'admin' | 'csm' | 'po' | 'dev';

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  tribe_id?: string;
}
