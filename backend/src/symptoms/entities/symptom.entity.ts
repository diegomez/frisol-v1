import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity('symptoms')
export class Symptom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  project_id: string;

  @ManyToOne(() => Project, (project) => project.symptoms)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  what: string;

  @Column()
  who: string;

  @Column()
  when_field: string;

  @Column()
  where_field: string;

  @Column()
  how: string;

  @Column()
  declaration: string;

  @CreateDateColumn()
  created_at: Date;
}
