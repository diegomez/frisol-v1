import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class ClienteDto {
  @IsString()
  nombre_cliente: string;

  @IsString()
  nombre_proyecto: string;

  @IsDateString()
  fecha_inicio: string;

  @IsString()
  crm_id: string;

  @IsString()
  @IsOptional()
  interlocutores?: string;

  @IsUUID()
  @IsOptional()
  tribe_id?: string;
}
