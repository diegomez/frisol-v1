import { IsString, IsOptional } from 'class-validator';

export class CreateSymptomDto {
  @IsString()
  what: string;

  @IsString()
  who: string;

  @IsString()
  when_field: string;

  @IsString()
  where_field: string;

  @IsString()
  how: string;

  @IsString()
  declaration: string;
}

export class UpdateSymptomDto {
  @IsString()
  @IsOptional()
  what?: string;

  @IsString()
  @IsOptional()
  who?: string;

  @IsString()
  @IsOptional()
  when_field?: string;

  @IsString()
  @IsOptional()
  where_field?: string;

  @IsString()
  @IsOptional()
  how?: string;

  @IsString()
  @IsOptional()
  declaration?: string;
}
