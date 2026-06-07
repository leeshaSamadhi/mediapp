"""
Test Database Connection
Tests Supabase PostgreSQL connection without exposing password.
"""
import os
import sys
from dotenv import load_dotenv
import psycopg2

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def mask_url(url: str) -> str:
    """Mask password in database URL for safe printing."""
    if not url:
        return "NOT SET"
    try:
        # Parse URL to mask password
        # Format: postgresql://user:password@host:port/dbname
        if "@" in url:
            parts = url.split("@")
            user_part = parts[0]
            # Find the last : before @ to separate password
            if ":" in user_part:
                # Mask everything between :// and @
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


def test_connection():
    """Test database connection."""
    if not DATABASE_URL:
        print("ERROR: DATABASE_URL environment variable is not set")
        print("Please create a .env file with DATABASE_URL")
        sys.exit(1)

    print(f"Testing connection to: {mask_url(DATABASE_URL)}")
    print()

    try:
        # Attempt connection
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # Test basic query
        cursor.execute("SELECT 1")
        result = cursor.fetchone()

        if result and result[0] == 1:
            print("Database connection successful")
            print("Query execution: OK")
        else:
            print("WARNING: Unexpected query result")

        # Get database version
        cursor.execute("SELECT version()")
        version = cursor.fetchone()
        if version:
            print(f"PostgreSQL version: {version[0][:80]}...")

        # Clean up
        cursor.close()
        conn.close()
        print()
        print("Connection test passed!")
        return True

    except psycopg2.OperationalError as e:
        print(f"Connection failed: {str(e)}")
        print()
        print("Troubleshooting tips:")
        print("1. Check if DATABASE_URL is correctly set in .env")
        print("2. Verify Supabase project is running")
        print("3. Check if IP address is allowed in Supabase settings")
        print("4. Ensure password special characters are URL-encoded")
        return False
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return False


if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)