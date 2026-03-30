import { IsString, IsOptional } from 'class-validator';

export class CreateKpiDto {
  @IsString()
  nombre: string;

  @IsString()
  valor_actual: string;

  @IsString()
  valor_objetivo: string;
}

export class UpdateKpiDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  valor_actual?: string;

  @IsString()
  @IsOptional()
  valor_objetivo?: string;
}
