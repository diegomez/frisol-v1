import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tribe } from '../../tribes/entities/tribe.entity';
import { Symptom } from '../../symptoms/entities/symptom.entity';
import { Causa } from '../../causas/entities/causa.entity';
import { Kpi } from '../../kpis/entities/kpi.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  internal_id: string;

  @Column()
  csm_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'csm_id' })
  csm: User;

  @Column({ nullable: true })
  tribe_id: string;

  @ManyToOne(() => Tribe)
  @JoinColumn({ name: 'tribe_id' })
  tribe: Tribe;

  @Column({ default: 'en_progreso' })
  estado: 'en_progreso' | 'terminado' | 'cerrado';

  @Column({ nullable: true })
  nombre_cliente: string;

  @Column({ nullable: true })
  nombre_proyecto: string;

  @Column({ nullable: true })
  crm_id: string;

  @Column({ type: 'date', nullable: true })
  fecha_inicio: string;

  @Column({ type: 'text', nullable: true })
  interlocutores: string;

  @Column({ type: 'text', nullable: true })
  evidencia: string;

  @Column({ type: 'text', nullable: true })
  voz_dolor: string;

  @Column({ type: 'text', nullable: true })
  impacto_negocio: string;

  @Column({ nullable: true })
  terminado_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'terminado_by' })
  terminado_user: User;

  @Column({ type: 'timestamp', nullable: true })
  terminado_at: Date;

  @Column({ nullable: true })
  cerrado_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cerrado_by' })
  cerrado_user: User;

  @Column({ type: 'timestamp', nullable: true })
  cerrado_at: Date;

  @OneToMany(() => Symptom, (symptom) => symptom.project)
  symptoms: Symptom[];

  @OneToMany(() => Causa, (causa) => causa.project)
  causas: Causa[];

  @OneToMany(() => Kpi, (kpi) => kpi.project)
  kpis: Kpi[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
