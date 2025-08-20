#!/bin/bash
# PostgreSQL Setup Script for SafeMeet

echo "🐘 Setting up PostgreSQL for SafeMeet..."

# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE safemeet;
CREATE USER safemeet_user WITH PASSWORD 'LENARDTH@%';
GRANT ALL PRIVILEGES ON DATABASE safemeet TO safemeet_user;
\q
EOF

echo "✅ PostgreSQL setup complete!"
echo "📝 Update your .env file with:"
echo "DATABASE_URL=postgresql://safemeet_user:LENARDTH%40%25@localhost:5432/safemeet"
