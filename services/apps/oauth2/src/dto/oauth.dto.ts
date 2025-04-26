import { IsString, IsOptional, IsNotEmpty, IsIn, ValidateIf } from 'class-validator';

export class AuthorizeDto {
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['code', 'token'])
  response_type: string;

  @IsString()
  @IsNotEmpty()
  redirect_uri: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsString()
  state?: string;
}

export class TokenDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['authorization_code', 'refresh_token', 'password', 'client_credentials'])
  grant_type: string;

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsNotEmpty()
  client_secret: string;

  @ValidateIf(o => o.grant_type === 'authorization_code')
  @IsString()
  @IsNotEmpty()
  code?: string;

  @ValidateIf(o => o.grant_type === 'authorization_code')
  @IsString()
  @IsNotEmpty()
  redirect_uri?: string;

  @ValidateIf(o => o.grant_type === 'refresh_token')
  @IsString()
  @IsNotEmpty()
  refresh_token?: string;

  @ValidateIf(o => o.grant_type === 'password')
  @IsString()
  @IsNotEmpty()
  username?: string;

  @ValidateIf(o => o.grant_type === 'password')
  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsOptional()
  @IsString()
  scope?: string;
}

export class TokenResponseDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export class IntrospectionRequestDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsOptional()
  @IsString()
  @IsIn(['access_token', 'refresh_token'])
  token_type_hint?: string;
}

export class IntrospectionResponseDto {
  active: boolean;
  scope?: string;
  client_id?: string;
  username?: string;
  token_type?: string;
  exp?: number;
  iat?: number;
  sub?: string;
}