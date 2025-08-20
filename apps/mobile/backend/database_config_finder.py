#!/usr/bin/env python3
"""
Find and fix database configuration issues
"""

import os
import re
from pathlib import Path

def find_database_configs():
    """Find all files containing database configuration"""
    print("🔍 Searching for database configuration files...")
    
    # Common files that might contain database config
    config_files = [
        ".env",
        ".env.local", 
        ".env.development",
        "app/config.py",
        "app/database.py",
        "app/utils/database.py",
        "app/core/config.py",
        "config/database.py",
        "settings.py"
    ]
    
    # Patterns to search for
    patterns = [
        r'DATABASE_URL.*=.*',
        r'SQLALCHEMY_DATABASE_URL.*=.*',
        r'DB_.*=.*',
        r'postgresql://.*',
        r'sqlite://.*',
        r'create_engine.*'
    ]
    
    found_configs = {}
    
    # Check specific config files
    for config_file in config_files:
        file_path = Path(config_file)
        if file_path.exists():
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                matches = []
                for pattern in patterns:
                    found_matches = re.findall(pattern, content, re.IGNORECASE)
                    matches.extend(found_matches)
                
                if matches:
                    found_configs[str(file_path)] = matches
                    print(f"📄 Found config in {file_path}:")
                    for match in matches:
                        print(f"   {match}")
                        
            except Exception as e:
                print(f"⚠️  Error reading {file_path}: {e}")
    
    # Search all Python files for database URLs
    print("\n🔍 Searching Python files for database configurations...")
    
    for py_file in Path(".").rglob("*.py"):
        if "venv" in str(py_file) or "__pycache__" in str(py_file):
            continue
            
        try:
            with open(py_file, 'r') as f:
                content = f.read()
            
            matches = []
            for pattern in patterns:
                found_matches = re.findall(pattern, content, re.IGNORECASE)
                matches.extend(found_matches)
            
            if matches:
                if str(py_file) not in found_configs:
                    found_configs[str(py_file)] = matches
                    print(f"📄 Found config in {py_file}:")
                    for match in matches:
                        print(f"   {match}")
                        
        except Exception as e:
            continue
    
    return found_configs

def check_environment_variables():
    """Check current environment variables"""
    print("\n🌍 Checking environment variables...")
    
    db_env_vars = [
        'DATABASE_URL',
        'SQLALCHEMY_DATABASE_URL', 
        'DB_HOST',
        'DB_USER',
        'DB_PASSWORD',
        'DB_NAME',
        'DB_PORT'
    ]
    
    found_vars = {}
    for var in db_env_vars:
        value = os.getenv(var)
        if value:
            found_vars[var] = value
            # Mask password for security
            if 'PASSWORD' in var:
                print(f"   {var} = {value[:3]}***")
            else:
                print(f"   {var} = {value}")
    
    return found_vars

def fix_database_config():
    """Create or fix database configuration"""
    print("\n🔧 Creating/fixing database configuration...")
    
    # Create a working .env file
    env_content = """# SafeMeet Database Configuration
# Option 1: SQLite (for development - easiest)
DATABASE_URL=sqlite:///./safemeet.db

# Option 2: PostgreSQL (comment out SQLite above and uncomment below)
# DATABASE_URL=postgresql://leonard:LENARDTH%40%25@localhost:5432/safemeet

# Other settings
SECRET_KEY=your-secret-key-here
DEBUG=True
"""
    
    env_file = Path(".env")
    
    # Backup existing .env if it exists
    if env_file.exists():
        backup_file = Path(".env.backup")
        with open(env_file, 'r') as f:
            original_content = f.read()
        with open(backup_file, 'w') as f:
            f.write(original_content)
        print(f"📦 Backed up existing .env to {backup_file}")
    
    # Write new .env file
    with open(env_file, 'w') as f:
        f.write(env_content)
    
    print(f"✅ Created new .env file with SQLite configuration")
    print("📝 Note: Using SQLite for development. You can switch to PostgreSQL later.")

def test_database_connection():
    """Test database connection with current config"""
    print("\n🧪 Testing database connection...")
    
    try:
        import sys
        sys.path.insert(0, '.')
        
        # Try to import and test the database connection
        from sqlalchemy import create_engine, text
        
        # Get DATABASE_URL from environment
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            print("❌ No DATABASE_URL found in environment")
            return False
        
        print(f"🔗 Attempting to connect to: {database_url}")
        
        # Create engine and test connection
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
            return True
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def create_postgresql_setup_script():
    """Create a script to set up PostgreSQL"""
    script_content = '''#!/bin/bash
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
\\q
EOF

echo "✅ PostgreSQL setup complete!"
echo "📝 Update your .env file with:"
echo "DATABASE_URL=postgresql://safemeet_user:LENARDTH%40%25@localhost:5432/safemeet"
'''
    
    script_file = Path("setup_postgresql.sh")
    with open(script_file, 'w') as f:
        f.write(script_content)
    
    # Make script executable
    script_file.chmod(0o755)
    
    print(f"📜 Created PostgreSQL setup script: {script_file}")
    print("   Run with: ./setup_postgresql.sh")

def main():
    """Main execution function"""
    print("🚀 SafeMeet Database Configuration Debugger")
    print("=" * 50)
    
    # Find existing configurations
    configs = find_database_configs()
    
    # Check environment variables
    env_vars = check_environment_variables()
    
    # If no working config found, create one
    if not configs and not env_vars:
        print("\n❌ No database configuration found!")
        fix_database_config()
    elif any('%@localhost' in str(config) for config in configs.values()):
        print("\n❌ Found broken database configuration with '%@localhost'")
        fix_database_config()
    
    # Create PostgreSQL setup script for future use
    create_postgresql_setup_script()
    
    # Test connection
    test_database_connection()
    
    print("\n" + "=" * 50)
    print("🎯 Next Steps:")
    print("1. Check the .env file created")
    print("2. Restart your application: uvicorn app.main:app --reload") 
    print("3. If you want PostgreSQL instead of SQLite, run ./setup_postgresql.sh")

if __name__ == "__main__":
    main()
