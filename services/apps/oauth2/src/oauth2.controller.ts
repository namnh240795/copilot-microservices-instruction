import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Oauth2Service } from './oauth2.service';

import { CreateClientDto, ClientResponseDto, UpdateClientDto } from './dto/client.dto';
import { CreateUserDto, UserResponseDto, LoginDto, UpdateUserDto } from './dto/user.dto';
import {
  AuthorizeDto,
  TokenDto,
  TokenResponseDto,
  IntrospectionRequestDto,
  IntrospectionResponseDto,
} from './dto/oauth.dto';
import { Token } from './entities/token.entity';

@Controller()
export class Oauth2Controller {
  constructor(private readonly oauth2Service: Oauth2Service) {}

  @Get()
  getHello(): string {
    return this.oauth2Service.getHello();
  }

  // Client endpoints
  @Post('clients')
  async createClient(@Body() createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    // Handle allowedGrantTypes properly whether it's a string or array
    let allowedGrantTypes = 'authorization_code,refresh_token';
    if (createClientDto.allowedGrantTypes) {
      allowedGrantTypes = Array.isArray(createClientDto.allowedGrantTypes)
        ? createClientDto.allowedGrantTypes.join(',')
        : createClientDto.allowedGrantTypes;
    }

    const client = await this.oauth2Service.createClient({
      name: createClientDto.name,
      redirectUris: createClientDto.redirectUris,
      allowedGrantTypes,
      scopes: createClientDto.scopes,
      isPublic: createClientDto.isPublic || false,
    });

    // Ensure the response has proper types
    return {
      id: client.id,
      name: client.name,
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      redirectUris: client.redirectUris,
      allowedGrantTypes: typeof client.allowedGrantTypes === 'string' 
        ? client.allowedGrantTypes.split(',') 
        : client.allowedGrantTypes,
      scopes: client.scopes,
      isPublic: client.isPublic,
      active: client.active,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }

  @Get('clients/:id')
  async getClient(@Param('id') id: string): Promise<ClientResponseDto> {
    const client = await this.oauth2Service.findClientById(id);

    return {
      id: client.id,
      name: client.name,
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      redirectUris: client.redirectUris,
      allowedGrantTypes: client.allowedGrantTypes.split(','),
      scopes: client.scopes,
      isPublic: client.isPublic,
      active: client.active,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }

  @Put('clients/:id')
  async updateClient(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    // Convert allowedGrantTypes array to comma-separated string if provided
    let allowedGrantTypes;
    if (updateClientDto.allowedGrantTypes) {
      allowedGrantTypes = updateClientDto.allowedGrantTypes.join(',');
    }

    const client = await this.oauth2Service.updateClient(id, {
      name: updateClientDto.name,
      redirectUris: updateClientDto.redirectUris,
      allowedGrantTypes,
      scopes: updateClientDto.scopes,
      active: updateClientDto.active,
    });

    return {
      id: client.id,
      name: client.name,
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      redirectUris: client.redirectUris,
      allowedGrantTypes: client.allowedGrantTypes.split(','),
      scopes: client.scopes,
      isPublic: client.isPublic,
      active: client.active,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }

  @Delete('clients/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteClient(@Param('id') id: string): Promise<void> {
    await this.oauth2Service.deleteClient(id);
  }

  // User endpoints
  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.oauth2Service.createUser(createUserDto);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.oauth2Service.findUserById(id);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.oauth2Service.updateUser(id, updateUserDto);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.oauth2Service.deleteUser(id);
  }

  // OAuth2 endpoints
  @Get('authorize')
  async authorize(
    @Query() query: AuthorizeDto,
    @Res() res: Response,
  ): Promise<void> {
    const { client_id, response_type, redirect_uri, scope, state } = query;

    try {
      // Validate client and redirect_uri
      const client = await this.oauth2Service.findClientByClientId(client_id);
      
      if (!this.oauth2Service.validateRedirectUri(client, redirect_uri)) {
        throw new BadRequestException('Invalid redirect URI');
      }

      // Store authorization request in session and redirect to login page
      // In a real application, you would have a login page and authorization consent page
      // For this example, we'll simulate a successful authorization

      // Mock user for this example
      const user = await this.oauth2Service.findUserByUsername('user1');
      if (!user) {
        // Redirect to error page or login page
        res.redirect(`${redirect_uri}?error=login_required&state=${state || ''}`);
        return;
      }

      // Process based on response_type
      if (response_type === 'code') {
        // Authorization Code Flow
        const scopes = scope ? scope.split(' ') : [];
        const validScopes = this.oauth2Service.validateScopes(client, scopes);
        const code = await this.oauth2Service.generateAuthorizationCode(
          client,
          user,
          validScopes,
          redirect_uri,
        );

        // Redirect back to client with code
        res.redirect(`${redirect_uri}?code=${code}${state ? `&state=${state}` : ''}`);
      } else if (response_type === 'token') {
        // Implicit Flow
        const scopes = scope ? scope.split(' ') : [];
        const validScopes = this.oauth2Service.validateScopes(client, scopes);
        const token = await this.oauth2Service.generateAccessToken(client, user, validScopes);

        // Redirect back to client with token
        res.redirect(
          `${redirect_uri}#access_token=${token.accessToken}&token_type=bearer&expires_in=3600${
            state ? `&state=${state}` : ''
          }`,
        );
      } else {
        // Unsupported response_type
        res.redirect(`${redirect_uri}?error=unsupported_response_type&state=${state || ''}`);
      }
    } catch (error) {
      // If there's any error, redirect with error
      res.redirect(`${redirect_uri}?error=server_error&error_description=${error.message}&state=${state || ''}`);
    }
  }

  @Post('token')
  @HttpCode(HttpStatus.OK)
  async token(@Body() tokenDto: TokenDto): Promise<TokenResponseDto> {
    const {
      grant_type,
      client_id,
      client_secret,
      code,
      redirect_uri,
      refresh_token,
      username,
      password,
      scope,
    } = tokenDto;

    // Validate client
    const client = await this.oauth2Service.validateClient(client_id, client_secret, grant_type);

    let token;
    const scopes = scope ? scope.split(' ') : [];
    const validScopes = this.oauth2Service.validateScopes(client, scopes);

    switch (grant_type) {
      case 'authorization_code':
        if (!code || !redirect_uri) {
          throw new BadRequestException('Code and redirect_uri are required for authorization_code grant');
        }

        const authCode = await this.oauth2Service.validateAuthorizationCode(code, client_id, redirect_uri);
        token = await this.oauth2Service.generateAccessToken(client, authCode.user, validScopes);
        break;

      case 'refresh_token':
        if (!refresh_token) {
          throw new BadRequestException('Refresh token is required');
        }

        const existingToken = await this.oauth2Service.validateRefreshToken(refresh_token);
        if (!existingToken) {
          throw new BadRequestException('Invalid refresh token');
        }

        // Revoke the old token
        await this.oauth2Service.revokeToken(existingToken.accessToken);

        // Generate a new token
        token = await this.oauth2Service.generateAccessToken(
          client,
          existingToken.user,
          validScopes.length > 0 ? validScopes : existingToken.scopes,
        );
        break;

      case 'password':
        if (!username || !password) {
          throw new BadRequestException('Username and password are required for password grant');
        }

        const user = await this.oauth2Service.validateUser(username, password);
        if (!user) {
          throw new UnauthorizedException('Invalid username or password');
        }

        token = await this.oauth2Service.generateAccessToken(client, user, validScopes);
        break;

      case 'client_credentials':
        // No user in this flow, only client
        token = await this.oauth2Service.generateAccessToken(client, null, validScopes);
        break;

      default:
        throw new BadRequestException(`Unsupported grant type: ${grant_type}`);
    }

    return {
      access_token: token.accessToken,
      token_type: 'bearer',
      expires_in: Math.floor((token.accessTokenExpiresAt.getTime() - Date.now()) / 1000),
      refresh_token: token.refreshToken,
      scope: token.scopes ? token.scopes.join(' ') : '',
    };
  }

  @Post('token/revoke')
  @HttpCode(HttpStatus.OK)
  async revokeToken(
    @Body() body: any,
  ): Promise<{ success: boolean }> {
    // Extract token and client credentials from body
    const token = body.token;
    const clientId = body.client_id;
    const clientSecret = body.client_secret;
    
    if (!token || !clientId || !clientSecret) {
      throw new BadRequestException('Missing required parameters');
    }
    
    // Validate client
    await this.oauth2Service.validateClient(clientId, clientSecret, 'revoke_token');

    // Revoke token
    const success = await this.oauth2Service.revokeToken(token);
    return { success };
  }

  @Post('token/introspect')
  @HttpCode(HttpStatus.OK)
  async introspectToken(
    @Body() introspectionDto: IntrospectionRequestDto,
    @Body('client_id') clientId: string,
    @Body('client_secret') clientSecret: string,
  ): Promise<IntrospectionResponseDto> {
    // Validate client
    await this.oauth2Service.validateClient(clientId, clientSecret, 'introspection');

    const { token, token_type_hint } = introspectionDto;
    let tokenData: Token | null = null;

    if (token_type_hint === 'refresh_token') {
      tokenData = await this.oauth2Service.validateRefreshToken(token);
    } else {
      // Default to access token if no hint or unknown hint
      tokenData = await this.oauth2Service.validateToken(token);
    }

    if (!tokenData) {
      return {
        active: false,
      };
    }

    // Calculate expiration in seconds since Unix epoch
    const exp = Math.floor(tokenData.accessTokenExpiresAt.getTime() / 1000);
    const iat = Math.floor(tokenData.createdAt.getTime() / 1000);

    return {
      active: true,
      client_id: tokenData.client.clientId,
      username: tokenData.user ? tokenData.user.username : undefined,
      scope: tokenData.scopes ? tokenData.scopes.join(' ') : '',
      token_type: 'Bearer',
      exp,
      iat,
      sub: tokenData.user ? tokenData.user.id : undefined,
    };
  }

  @Get('userinfo')
  async userInfo(@Req() req: Request): Promise<any> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access token is required');
    }

    const token = authHeader.split(' ')[1];
    const tokenData = await this.oauth2Service.validateToken(token);

    if (!tokenData || !tokenData.user) {
      throw new UnauthorizedException('Invalid token or token has expired');
    }

    const user = tokenData.user;
    
    return {
      sub: user.id,
      username: user.username,
      email: user.email,
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
      given_name: user.firstName,
      family_name: user.lastName,
    };
  }
}
