"""
Check Database Tables
Verifies that all required tables exist in the database.
"""
import os
import sys
from dotenv import load_dotenv
import psycopg2

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Required tables
REQUIRED_TABLES = ["users", "fingerprint_auth"]


def mask_url(url: str) -> str:
    """Mask password in database URL for safe printing."""
    if not url:
        return "NOT SET"
    try:
        if "@" in url:
            parts = url.split("@")
            user_part = parts[0]
            if ":" in user_part:
                scheme_end = user_part.find("://")
                if scheme_end != -1:
                    prefix = user_part[:scheme_end + 3]
                    remaining = user_part[scheme_end + 3:]
                    if ":" in remaining:
                        user, _ = remaining.split(":", 1)
                        return f"{prefix}{user}:****@{parts[1]}"
        return "URL format unexpected"
    except Exception:
        return "URL format unexpected"


def check_tables():
    """Check if all required tables exist."""
    if not DATABASE_URL:
        print("ERROR: DATABASE_URL environment variable is not set")
        sys.exit(1)

    print(f"Connecting to: {mask_url(DATABASE_URL)}")
    print()

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # Query for existing tables in public schema
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        """)
        
        existing_tables = [row[0] for row in cursor.fetchall()]
        
        print("Checking tables in public schema...")
        print()

        all_found = True
        for table in REQUIRED_TABLES:
            if table in existing_tables:
                print(f"Table found: public.{table}")
            else:
                print(f"Table MISSING: public.{table}")
                all_found = False

        print()
        print("All existing tables in public schema:")
        for table in existing_tables:
            print(f"  - public.{table}")

        print()

        # Check for triggers
        print("Checking triggers...")
        cursor.execute("""
            SELECT trigger_name, event_object_table
            FROM information_schema.triggers
            WHERE trigger_schema = 'public'
            ORDER BY event_object_table, trigger_name
        """)
        
        triggers = cursor.fetchall()
        if triggers:
            print("Found triggers:")
            for trigger_name, table_name in triggers:
                print(f"  - {trigger_name} on {table_name}")
        else:
            print("No triggers found (triggers may be on auth schema)")

        print()

        # Check for functions
        print("Checking functions...")
        cursor.execute("""
            SELECT routine_name
            FROM information_schema.routines
            WHERE routine_schema = 'public'
            ORDER BY routine_name
        """)
        
        functions = cursor.fetchall()
        if functions:
            print("Found functions:")
            for (func_name,) in functions:
                print(f"  - {func_name}")
        else:
            print("No functions found in public schema")

        cursor.close()
        conn.close()

        print()
        if all_found:
            print("All required tables are present!")
            return True
        else:
            print("Some tables are missing. Run database.py to initialize.")
            return False

    except Exception as e:
        print(f"Error checking tables: {str(e)}")
        return False


if __name__ == "__main__":
    success = check_tables()
    sys.exit(0 if success else 1)