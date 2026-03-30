import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity('causas')
export class Causa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  project_id: string;

  @ManyToOne(() => Project, (project) => project.causas)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  why_1: string;

  @Column()
  why_2: string;

  @Column()
  why_3: string;

  @Column({ nullable: true })
  why_4: string;

  @Column({ nullable: true })
  why_5: string;

  @Column()
  root_cause: string;

  @Column({ default: false })
  origin_metodo: boolean;

  @Column({ default: false })
  origin_maquina: boolean;

  @Column({ default: false })
  origin_gobernanza: boolean;

  @CreateDateColumn()
  created_at: Date;
}
