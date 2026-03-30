import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tribes')
export class Tribe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;
}
