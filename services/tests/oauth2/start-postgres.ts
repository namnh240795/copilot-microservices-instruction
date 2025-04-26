import { execSync } from 'child_process';
import { setupDatabase } from './setup-db';

// Use a different port to avoid conflicts with existing PostgreSQL installations
const POSTGRES_PORT = 5433;

/**
 * Start PostgreSQL using Docker for tests
 */
export async function startPostgres() {
  console.log('Starting PostgreSQL container for testing...');
  
  try {
    // Check if container is already running
    const containerCheck = execSync('docker ps -q -f name=oauth2-postgres-test').toString().trim();
    
    if (!containerCheck) {
      // Check if container exists but is stopped
      const stoppedContainerCheck = execSync('docker ps -aq -f name=oauth2-postgres-test').toString().trim();
      if (stoppedContainerCheck) {
        // Remove the existing container to avoid port conflicts
        execSync('docker rm oauth2-postgres-test');
        console.log('Removed existing PostgreSQL container');
      }
      
      // Run new container with a different port mapping
      execSync(`
        docker run --name oauth2-postgres-test -e POSTGRES_USER=oauth -e POSTGRES_PASSWORD=oauth \
        -e POSTGRES_DB=oauth -p ${POSTGRES_PORT}:5432 -d postgres:15
      `);
      console.log(`Created and started new PostgreSQL container on port ${POSTGRES_PORT}`);
      
      // Wait for PostgreSQL to be ready
      console.log('Waiting for PostgreSQL to be ready...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log('PostgreSQL container is already running');
    }

    // Set up database schema
    await setupDatabase(POSTGRES_PORT);
    console.log('PostgreSQL is ready for testing');
    
    return POSTGRES_PORT;
  } catch (error) {
    console.error('Error starting PostgreSQL:', error);
    throw error;
  }
}

/**
 * Run this script directly 
 */
if (require.main === module) {
  startPostgres()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}