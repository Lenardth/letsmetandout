#!/usr/bin/env python3
import os
import sys

# Add the app directory to Python path
sys.path.insert(0, '/home/leonard/Pictures/myproject/letsmetandout/apps/mobile/backend')

try:
    from dotenv import load_dotenv
    load_dotenv()
    
    from sqlalchemy import create_engine, text
    
    database_url = os.getenv('DATABASE_URL')
    print(f"🔍 Testing DATABASE_URL: {database_url}")
    
    if not database_url:
        print("❌ No DATABASE_URL found in environment")
        exit(1)
    
    # Test connection
    engine = create_engine(database_url)
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print("✅ Database connection successful!")
        print("🚀 You can now start your SafeMeet application!")
        
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    print("💡 Try running the app anyway - it might still work with SQLite")
