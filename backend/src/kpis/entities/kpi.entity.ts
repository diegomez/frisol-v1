import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity('kpis')
export class Kpi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  project_id: string;

  @ManyToOne(() => Project, (project) => project.kpis)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  nombre: string;

  @Column()
  valor_actual: string;

  @Column()
  valor_objetivo: string;

  @CreateDateColumn()
  created_at: Date;
}
