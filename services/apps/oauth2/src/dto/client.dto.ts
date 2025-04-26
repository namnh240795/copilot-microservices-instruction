import { IsString, IsOptional, IsBoolean, IsArray, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  // Use more lenient URL validation to handle localhost URIs
  @IsUrl({ protocols: ['http', 'https'], require_tld: false }, { each: true })
  redirectUris: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedGrantTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class ClientResponseDto {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  allowedGrantTypes: string[];
  scopes: string[];
  isPublic: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  // Use more lenient URL validation to handle localhost URIs
  @IsUrl({ protocols: ['http', 'https'], require_tld: false }, { each: true })
  redirectUris?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedGrantTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}