import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  project_id: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  title: string;

  @Column()
  original_name: string;

  @Column()
  stored_name: string;

  @Column({ nullable: true })
  file_size: number;

  @CreateDateColumn()
  uploaded_at: Date;
}
