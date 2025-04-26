import { User } from '../entities/user.entity';
import { Client } from '../entities/client.entity';
import { Token } from '../entities/token.entity';
import { AuthorizationCode } from '../entities/authorization-code.entity';

export interface IOAuthService {
  // Authorization code functions
  generateAuthorizationCode(client: Client, user: User, scopes: string[], redirectUri: string): Promise<string>;
  validateAuthorizationCode(code: string, clientId: string, redirectUri: string): Promise<AuthorizationCode>;
  
  // Token functions
  generateAccessToken(client: Client, user: User | null, scopes: string[]): Promise<Token>;
  generateRefreshToken(client: Client, user: User | null, scopes: string[]): Promise<string>;
  validateToken(token: string): Promise<Token | null>;
  validateRefreshToken(refreshToken: string): Promise<Token | null>;
  revokeToken(token: string): Promise<boolean>;
  
  // Client verification
  validateClient(clientId: string, clientSecret: string, grantType: string): Promise<Client>;
  validateRedirectUri(client: Client, redirectUri: string): boolean;
  validateScopes(client: Client, scopes: string[]): string[];
}

export interface IUserService {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  validateUser(username: string, password: string): Promise<User | null>;
  createUser(userData: Partial<User>): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
}

export interface IClientService {
  findById(id: string): Promise<Client | null>;
  findByClientId(clientId: string): Promise<Client | null>;
  createClient(clientData: Partial<Client>): Promise<Client>;
  updateClient(id: string, clientData: Partial<Client>): Promise<Client>;
  deleteClient(id: string): Promise<boolean>;
  generateClientCredentials(): { clientId: string; clientSecret: string };
}