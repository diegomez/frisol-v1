import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateCausaDto {
  @IsString()
  why_1: string;

  @IsString()
  why_2: string;

  @IsString()
  why_3: string;

  @IsString()
  @IsOptional()
  why_4?: string;

  @IsString()
  @IsOptional()
  why_5?: string;

  @IsBoolean()
  origin_metodo: boolean;

  @IsBoolean()
  origin_maquina: boolean;

  @IsBoolean()
  origin_gobernanza: boolean;
}

export class UpdateCausaDto {
  @IsString()
  @IsOptional()
  why_1?: string;

  @IsString()
  @IsOptional()
  why_2?: string;

  @IsString()
  @IsOptional()
  why_3?: string;

  @IsString()
  @IsOptional()
  why_4?: string;

  @IsString()
  @IsOptional()
  why_5?: string;

  @IsBoolean()
  @IsOptional()
  origin_metodo?: boolean;

  @IsBoolean()
  @IsOptional()
  origin_maquina?: boolean;

  @IsBoolean()
  @IsOptional()
  origin_gobernanza?: boolean;
}
