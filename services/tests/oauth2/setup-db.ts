import { Client } from 'pg';

/**
 * Setup the database for OAuth2 tests
 */
export async function setupDatabase(port: number = 5433) {
  const client = new Client({
    host: 'localhost',
    port: port,
    user: 'oauth',
    password: 'oauth',
    database: 'postgres' // Connect to default database first
  });

  try {
    await client.connect();
    console.log(`Connected to PostgreSQL on port ${port}`);

    // Check if database exists, create if it doesn't
    const dbCheck = await client.query(`
      SELECT 1 FROM pg_database WHERE datname = 'oauth'
    `);

    if (dbCheck.rowCount === 0) {
      console.log('Creating oauth database...');
      await client.query('CREATE DATABASE oauth');
      await client.end(); // Close connection to postgres database
      
      // Connect to the oauth database
      const oauthClient = new Client({
        host: 'localhost',
        port: port,
        user: 'oauth',
        password: 'oauth',
        database: 'oauth'
      });
      
      await oauthClient.connect();
      
      // Create tables if they don't exist
      await oauthClient.query(`
        CREATE TABLE IF NOT EXISTS "user" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          "firstName" VARCHAR(255),
          "lastName" VARCHAR(255),
          email VARCHAR(255) NOT NULL UNIQUE,
          active BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS client (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          "clientId" VARCHAR(255) NOT NULL UNIQUE,
          "clientSecret" VARCHAR(255) NOT NULL,
          "isPublic" BOOLEAN DEFAULT false,
          "redirectUris" TEXT,
          "allowedGrantTypes" VARCHAR(255) DEFAULT 'authorization_code,refresh_token',
          scopes TEXT,
          active BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS token (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "accessToken" VARCHAR(255) NOT NULL UNIQUE,
          "refreshToken" VARCHAR(255) UNIQUE,
          "accessTokenExpiresAt" TIMESTAMP NOT NULL,
          "refreshTokenExpiresAt" TIMESTAMP,
          scopes TEXT,
          "clientId" UUID REFERENCES client(id),
          "userId" UUID REFERENCES "user"(id),
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "authorization_code" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code VARCHAR(255) NOT NULL UNIQUE,
          "expiresAt" TIMESTAMP NOT NULL,
          "redirectUri" VARCHAR(255),
          scopes TEXT,
          "clientId" UUID REFERENCES client(id),
          "userId" UUID REFERENCES "user"(id),
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      await oauthClient.end();
    } else {
      await client.end();
      console.log('Database already exists');
    }

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}