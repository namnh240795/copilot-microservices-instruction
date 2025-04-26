import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, createHash } from 'crypto';
import * as bcrypt from 'bcrypt';

import { Client } from './entities/client.entity';
import { User } from './entities/user.entity';
import { Token } from './entities/token.entity';
import { AuthorizationCode } from './entities/authorization-code.entity';
import { IOAuthService } from './interfaces/oauth.interfaces';

@Injectable()
export class Oauth2Service implements IOAuthService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Token)
    private tokensRepository: Repository<Token>,
    @InjectRepository(AuthorizationCode)
    private authCodesRepository: Repository<AuthorizationCode>,
  ) {}

  // Client methods
  async createClient(clientData: Partial<Client>): Promise<Client> {
    const credentials = this.generateClientCredentials();
    const client = this.clientsRepository.create({
      ...clientData,
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
    });
    return this.clientsRepository.save(client);
  }

  async findClientById(id: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id, active: true }
    });
    
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    
    return client;
  }

  async findClientByClientId(clientId: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { clientId, active: true }
    });
    
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    
    return client;
  }

  async updateClient(id: string, clientData: Partial<Client>): Promise<Client> {
    const client = await this.findClientById(id);
    this.clientsRepository.merge(client, clientData);
    return this.clientsRepository.save(client);
  }

  async deleteClient(id: string): Promise<boolean> {
    const client = await this.findClientById(id);
    client.active = false;
    await this.clientsRepository.save(client);
    return true;
  }

  generateClientCredentials(): { clientId: string; clientSecret: string } {
    const clientId = this.generateRandomToken(32);
    const clientSecret = this.generateRandomToken(64);
    return { clientId, clientSecret };
  }

  // User methods
  async createUser(userData: Partial<User>): Promise<User> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username: userData.username },
        { email: userData.email }
      ]
    });
    
    if (existingUser) {
      throw new BadRequestException('Username or email already exists');
    }
    
    // Check if password exists
    if (!userData.password) {
      throw new BadRequestException('Password is required');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });
    
    return this.usersRepository.save(user) as Promise<User>;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id, active: true }
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username, active: true }
    });
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.findUserByUsername(username);
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.findUserById(id);
    
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    this.usersRepository.merge(user, userData);
    return this.usersRepository.save(user);
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.findUserById(id);
    user.active = false;
    await this.usersRepository.save(user);
    return true;
  }

  // OAuth2 methods
  async generateAuthorizationCode(
    client: Client,
    user: User,
    scopes: string[],
    redirectUri: string,
  ): Promise<string> {
    const code = this.generateRandomToken(48);
    
    // Create expiration date - 10 minutes in the future
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    const authCode = this.authCodesRepository.create({
      code,
      expiresAt,
      redirectUri,
      scopes,
      client,
      user,
    });
    
    await this.authCodesRepository.save(authCode);
    
    return code;
  }

  async validateAuthorizationCode(
    code: string,
    clientId: string,
    redirectUri: string,
  ): Promise<AuthorizationCode> {
    const authCode = await this.authCodesRepository.findOne({
      where: { code },
      relations: ['client', 'user'],
    });
    
    if (!authCode) {
      throw new BadRequestException('Invalid authorization code');
    }
    
    if (authCode.client.clientId !== clientId) {
      throw new BadRequestException('Authorization code was not issued to this client');
    }
    
    if (authCode.redirectUri !== redirectUri) {
      throw new BadRequestException('Redirect URI does not match the one used during authorization');
    }
    
    if (new Date() > authCode.expiresAt) {
      throw new BadRequestException('Authorization code has expired');
    }
    
    // Delete the code so it can't be reused
    await this.authCodesRepository.remove(authCode);
    
    return authCode;
  }

  async generateAccessToken(
    client: Client,
    user: User | null,
    scopes: string[],
  ): Promise<Token> {
    const accessToken = this.generateRandomToken(64);
    
    // Create expiration date - 1 hour in the future
    const accessTokenExpiresAt = new Date();
    accessTokenExpiresAt.setHours(accessTokenExpiresAt.getHours() + 1);
    
    const refreshToken = this.generateRandomToken(64);
    
    // Create expiration date - 30 days in the future
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30);
    
    const tokenEntity = this.tokensRepository.create();
    tokenEntity.accessToken = accessToken;
    tokenEntity.refreshToken = refreshToken;
    tokenEntity.accessTokenExpiresAt = accessTokenExpiresAt;
    tokenEntity.refreshTokenExpiresAt = refreshTokenExpiresAt;
    tokenEntity.scopes = scopes;
    tokenEntity.client = client;
    
    if (user !== null) {
      tokenEntity.user = user;
    }
    
    const savedToken = await this.tokensRepository.save(tokenEntity);
    return savedToken;
  }

  async generateRefreshToken(
    client: Client,
    user: User | null,
    scopes: string[],
  ): Promise<string> {
    // This is just a helper method that calls generateAccessToken
    // and returns the refresh token part
    const token = await this.generateAccessToken(client, user, scopes);
    return token.refreshToken;
  }

  async validateToken(token: string): Promise<Token | null> {
    const foundToken = await this.tokensRepository.findOne({
      where: { accessToken: token },
      relations: ['client', 'user'],
    });
    
    if (!foundToken) {
      return null;
    }
    
    if (new Date() > foundToken.accessTokenExpiresAt) {
      return null;
    }
    
    return foundToken;
  }

  async validateRefreshToken(refreshToken: string): Promise<Token | null> {
    const foundToken = await this.tokensRepository.findOne({
      where: { refreshToken },
      relations: ['client', 'user'],
    });
    
    if (!foundToken) {
      return null;
    }
    
    if (new Date() > foundToken.refreshTokenExpiresAt) {
      return null;
    }
    
    return foundToken;
  }

  async revokeToken(token: string): Promise<boolean> {
    const foundToken = await this.tokensRepository.findOne({
      where: [
        { accessToken: token },
        { refreshToken: token }
      ]
    });
    
    if (!foundToken) {
      return false;
    }
    
    await this.tokensRepository.remove(foundToken);
    return true;
  }

  async validateClient(
    clientId: string,
    clientSecret: string,
    grantType: string,
  ): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { clientId, active: true }
    });
    
    if (!client) {
      throw new UnauthorizedException('Invalid client');
    }
    
    // For public clients, we don't need to validate the client_secret
    if (!client.isPublic) {
      if (client.clientSecret !== clientSecret) {
        throw new UnauthorizedException('Invalid client credentials');
      }
    }
    
    // Check if grant type is allowed for this client
    const allowedGrantTypes = typeof client.allowedGrantTypes === 'string'
      ? client.allowedGrantTypes.split(',')
      : client.allowedGrantTypes;
      
    if (!allowedGrantTypes.includes(grantType)) {
      throw new UnauthorizedException(`Grant type ${grantType} not allowed for this client`);
    }
    
    return client;
  }

  validateRedirectUri(client: Client, redirectUri: string): boolean {
    return client.redirectUris.includes(redirectUri);
  }

  validateScopes(client: Client, scopes: string[]): string[] {
    if (!client.scopes) {
      return scopes;
    }
    
    const allowedScopes = client.scopes;
    return scopes.filter(scope => allowedScopes.includes(scope));
  }

  // Utility methods
  private generateRandomToken(size: number): string {
    return randomBytes(size).toString('hex');
  }

  // Method from previous implementation (keeping it for backward compatibility)
  getHello(): string {
    return 'OAuth 2.0 Server is running!';
  }
}
