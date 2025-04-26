#!/bin/bash
set -e

# Create backend database and user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER backend WITH PASSWORD 'backend';
    CREATE DATABASE backend;
    GRANT ALL PRIVILEGES ON DATABASE backend TO backend;
    \c backend
    GRANT ALL ON SCHEMA public TO backend;
EOSQL

# Create oauth database and user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER oauth WITH PASSWORD 'oauth';
    CREATE DATABASE oauth;
    GRANT ALL PRIVILEGES ON DATABASE oauth TO oauth;
    \c oauth
    GRANT ALL ON SCHEMA public TO oauth;
EOSQL

echo "PostgreSQL initialization complete!"