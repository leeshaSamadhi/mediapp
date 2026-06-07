"""
Test script to check and create appointments.
"""
import os
import sys
from dotenv import load_dotenv

# Add parent directory to path to import database module
sys.path.insert(0, os.path.dirname(__file__))

from database import get_connection

load_dotenv()


def check_appointments():
    """Check existing appointments."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # Check existing appointments
        cursor.execute("SELECT * FROM public.appointments ORDER BY created_at DESC LIMIT 5")
        appointments = cursor.fetchall()
        
        print("=" * 50)
        print("Existing Appointments:")
        print("=" * 50)
        
        if not appointments:
            print("No appointments found in database!")
        else:
            for apt in appointments:
                print(f"ID: {apt['id']}")
                print(f"User ID: {apt['user_id']}")
                print(f"Doctor ID: {apt['doctor_id']}")
                print(f"Date: {apt['date']}")
                print(f"Time: {apt['time']}")
                print(f"Status: {apt['status']}")
                print(f"Patient Name: {apt['patient_name']}")
                print(f"Created At: {apt['created_at']}")
                print("-" * 30)
        
        # Get a user ID
        cursor.execute("SELECT id, full_name FROM public.users LIMIT 1")
        user = cursor.fetchone()
        
        if user:
            print(f"\nAvailable User: {user['full_name']} (ID: {user['id']})")
        
        # Get a doctor ID
        cursor.execute("SELECT id, name FROM public.doctors LIMIT 1")
        doctor = cursor.fetchone()
        
        if doctor:
            print(f"Available Doctor: {doctor['name']} (ID: {doctor['id']})")
        
        cursor.close()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()


def create_test_appointment():
    """Create a test appointment."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # Get a user ID
        cursor.execute("SELECT id FROM public.users LIMIT 1")
        user = cursor.fetchone()
        
        if not user:
            print("No users found! Please create a user first.")
            return
        
        # Get a doctor ID
        cursor.execute("SELECT id FROM public.doctors LIMIT 1")
        doctor = cursor.fetchone()
        
        if not doctor:
            print("No doctors found! Please seed doctors first.")
            return
        
        # Create test appointment
        cursor.execute(
            """
            INSERT INTO public.appointments (user_id, doctor_id, date, time, patient_name, for_self, notes, amount)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (user['id'], doctor['id'], '2026-06-15', '10:00 AM', 'Test Patient', True, 'Test appointment', 150.0)
        )
        
        result = cursor.fetchone()
        conn.commit()
        
        print("=" * 50)
        print("Test Appointment Created Successfully!")
        print("=" * 50)
        print(f"Appointment ID: {result['id']}")
        print(f"User ID: {result['user_id']}")
        print(f"Doctor ID: {result['doctor_id']}")
        print(f"Date: {result['date']}")
        print(f"Time: {result['time']}")
        print(f"Status: {result['status']}")
        print(f"Patient Name: {result['patient_name']}")
        print(f"Created At: {result['created_at']}")
        
        cursor.close()
    except Exception as e:
        print(f"Error creating appointment: {e}")
        conn.rollback()
    finally:
        conn.close()


if __name__ == "__main__":
    print("\n1. Checking existing appointments...")
    check_appointments()
    
    print("\n2. Creating test appointment...")
    create_test_appointment()
    
    print("\n3. Checking appointments again...")
    check_appointments()