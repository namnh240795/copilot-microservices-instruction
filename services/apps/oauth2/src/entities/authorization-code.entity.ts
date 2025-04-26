import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from './client.entity';
import { User } from './user.entity';

@Entity()
export class AuthorizationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  redirectUri: string;

  @Column({ type: 'simple-array', nullable: true })
  scopes: string[];

  @ManyToOne(() => Client, client => client.authorizationCodes)
  @JoinColumn()
  client: Client;

  @ManyToOne(() => User, user => user.authorizationCodes)
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}