import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { UserRole } from '../common/enum';
import { AuthProvider } from '../common/enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true, unique: true })
  phone: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'enum', enum: UserRole, nullable: true })
  role: UserRole;

  @Column({ type: 'enum', enum: AuthProvider })
  authProvider: AuthProvider;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isOnboarded: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
