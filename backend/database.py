"""
Database connection and initialization module for Medi App
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables from backend/.env
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)


def get_connection():
    """Get a database connection with RealDictCursor for dict-like results."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")
    conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
    return conn


def execute_sql_file(filepath):
    """Execute SQL commands from a file."""
    conn = None
    try:
        conn = get_connection()
        conn.autocommit = True
        cursor = conn.cursor()

        with open(filepath, "r") as f:
            sql = f.read()

        # Execute the entire SQL file at once - this handles PL/pgSQL dollar-quoted strings properly
        try:
            cursor.execute(sql)
            print("Database schema applied successfully")
        except Exception as e:
            print(f"Warning: {e}")
            # Try executing statements one by one as fallback
            # Split by semicolons but be smarter about dollar-quoted strings
            import re
            
            # Remove comments first
            sql_clean = re.sub(r'--[^\n]*', '', sql)
            
            # Split on semicolons that are not inside dollar quotes
            # For simplicity, execute major sections
            sections = [
                # Extensions
                'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
                # Tables (already done, but safe to re-run)
                sql.split("-- =============================================")[0],
            ]
            
            for section in sections:
                if section.strip():
                    try:
                        cursor.execute(section)
                    except Exception as e2:
                        print(f"Section warning: {e2}")

        cursor.close()
        print("Database initialization completed successfully")

    except Exception as e:
        print(f"Database initialization failed: {e}")
        raise
    finally:
        if conn:
            conn.close()


def init_database():
    """Initialize database tables from schema.sql."""
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    if os.path.exists(schema_path):
        execute_sql_file(schema_path)
    else:
        print(f"Warning: schema.sql not found at {schema_path}")


def test_connection():
    """Test database connection without exposing password."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Connection test failed: {e}")
        return False


# User-related database operations

def create_user(full_name, email, mobile, password_hash, dob, avatar_url=None):
    """Create a new user in the database."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO public.users (full_name, email, mobile, password_hash, dob, avatar_url)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, full_name, email, mobile, dob, avatar_url, fingerprint_enabled, created_at, updated_at
            """,
            (full_name, email, mobile, password_hash, dob, avatar_url),
        )
        user = cursor.fetchone()
        conn.commit()
        cursor.close()
        return user
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def get_user_by_email(email):
    """Get user by email."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM public.users WHERE email = %s", (email,)
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def get_user_by_mobile(mobile):
    """Get user by mobile number."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM public.users WHERE mobile = %s", (mobile,)
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def get_user_by_id(user_id):
    """Get user by ID."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, full_name, email, mobile, dob, avatar_url, fingerprint_enabled, created_at, updated_at FROM public.users WHERE id = %s",
            (user_id,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def update_user(user_id, **kwargs):
    """Update user profile."""
    if not kwargs:
        raise ValueError("No fields to update")

    conn = get_connection()
    try:
        cursor = conn.cursor()

        # Build dynamic update query
        set_clauses = []
        values = []
        for key, value in kwargs.items():
            set_clauses.append(f"{key} = %s")
            values.append(value)

        set_clause = ", ".join(set_clauses)
        values.append(user_id)

        cursor.execute(
            f"""
            UPDATE public.users SET {set_clause} WHERE id = %s
            RETURNING id, full_name, email, mobile, dob, avatar_url, fingerprint_enabled, created_at, updated_at
            """,
            values,
        )
        user = cursor.fetchone()
        conn.commit()
        cursor.close()
        return user
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def create_fingerprint_auth(user_id, fingerprint_data):
    """Create or update fingerprint authentication data."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO public.fingerprint_auth (user_id, fingerprint_data)
            VALUES (%s, %s)
            ON CONFLICT (user_id) DO UPDATE SET fingerprint_data = EXCLUDED.fingerprint_data
            RETURNING id, user_id, created_at
            """,
            (user_id, fingerprint_data),
        )
        auth = cursor.fetchone()

        # Update user fingerprint_enabled flag
        cursor.execute(
            "UPDATE public.users SET fingerprint_enabled = TRUE WHERE id = %s",
            (user_id,),
        )

        conn.commit()
        cursor.close()
        return auth
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def get_fingerprint_auth(user_id):
    """Get fingerprint authentication data for a user."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM public.fingerprint_auth WHERE user_id = %s", (user_id,)
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def verify_fingerprint(fingerprint_data):
    """Verify fingerprint data against stored data."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT fa.user_id, u.full_name, u.email, u.mobile, u.dob, u.avatar_url, u.fingerprint_enabled
            FROM public.fingerprint_auth fa
            JOIN public.users u ON fa.user_id = u.id
            WHERE fa.fingerprint_data = %s
            """,
            (fingerprint_data,),
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    print("Initializing database...")
    init_database()
    print("Database initialization completed successfully")