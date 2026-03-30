import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tribe } from '../../tribes/entities/tribe.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column()
  name: string;

  @Column()
  role: 'admin' | 'csm' | 'po' | 'dev';

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  tribe_id: string;

  @ManyToOne(() => Tribe)
  @JoinColumn({ name: 'tribe_id' })
  tribe: Tribe;

  @CreateDateColumn()
  created_at: Date;
}
