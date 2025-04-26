import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AuthorizationCode } from './authorization-code.entity';
import { Token } from './token.entity';

@Entity()
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  clientId: string;

  @Column()
  clientSecret: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ type: 'simple-array', nullable: true })
  redirectUris: string[];

  @Column({ type: 'simple-array', default: 'authorization_code,refresh_token' })
  allowedGrantTypes: string;

  @Column({ type: 'simple-array', nullable: true })
  scopes: string[];

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => AuthorizationCode, code => code.client)
  authorizationCodes: AuthorizationCode[];

  @OneToMany(() => Token, token => token.client)
  tokens: Token[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}