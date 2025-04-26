import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from './client.entity';
import { User } from './user.entity';

@Entity()
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  accessToken: string;

  @Column({ nullable: true, unique: true })
  refreshToken: string;

  @Column()
  accessTokenExpiresAt: Date;

  @Column({ nullable: true })
  refreshTokenExpiresAt: Date;

  @Column({ type: 'simple-array', nullable: true })
  scopes: string[];

  @ManyToOne(() => Client, client => client.tokens)
  @JoinColumn()
  client: Client;

  @ManyToOne(() => User, user => user.tokens)
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}