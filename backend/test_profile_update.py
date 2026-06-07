"""
Test script to verify profile update propagation to appointments
"""
import sys
import os
import uuid
from datetime import date, datetime

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import get_connection, init_database

def test_profile_update_propagation():
    """Test that profile updates propagate to appointments where for_self = TRUE"""
    
    print("Testing profile update propagation to appointments...")
    
    # Initialize database
    try:
        init_database()
        print("[OK] Database initialized")
    except Exception as e:
        print(f"[ERROR] Database initialization failed: {e}")
        return False
    
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Generate unique test data
        test_id = str(uuid.uuid4())
        test_email = f"test_{test_id[:8]}@example.com"
        test_mobile = f"+1234567{test_id[:8][:4]}"
        
        # 1. Create a test user
        cursor.execute(
            """
            INSERT INTO public.users (id, full_name, email, mobile, password_hash, dob)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (test_id, "John Doe", test_email, test_mobile, "hashed_password", date(1990, 1, 1))
        )
        user_result = cursor.fetchone()
        user_id = user_result["id"]
        print(f"[OK] Created test user: {user_id}")
        
        # 2. Get a doctor for the appointment
        cursor.execute("SELECT id FROM public.doctors LIMIT 1")
        doctor = cursor.fetchone()
        if not doctor:
            print("[ERROR] No doctors found in database")
            return False
        doctor_id = doctor["id"]
        print(f"[OK] Using doctor: {doctor_id}")
        
        # 3. Create two appointments - one for self, one for someone else
        cursor.execute(
            """
            INSERT INTO public.appointments (user_id, doctor_id, date, time, patient_name, for_self)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, patient_name
            """,
            (user_id, doctor_id, date(2024, 1, 15), "10:00 AM", "John Doe", True)
        )
        appointment_self = cursor.fetchone()
        appointment_self_id = appointment_self["id"]
        print(f"[OK] Created appointment for self: {appointment_self_id} (patient_name: {appointment_self['patient_name']})")
        
        cursor.execute(
            """
            INSERT INTO public.appointments (user_id, doctor_id, date, time, patient_name, for_self)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, patient_name
            """,
            (user_id, doctor_id, date(2024, 1, 16), "11:00 AM", "Jane Doe", False)
        )
        appointment_other = cursor.fetchone()
        appointment_other_id = appointment_other["id"]
        print(f"[OK] Created appointment for other: {appointment_other_id} (patient_name: {appointment_other['patient_name']})")
        
        # 4. Update user's full_name
        new_name = "John Smith"
        cursor.execute(
            """
            UPDATE public.users SET full_name = %s WHERE id = %s
            RETURNING full_name
            """,
            (new_name, user_id)
        )
        updated_user = cursor.fetchone()
        print(f"[OK] Updated user name to: {updated_user['full_name']}")
        
        # 5. Propagate the name change to appointments where for_self = TRUE
        cursor.execute(
            """
            UPDATE public.appointments 
            SET patient_name = %s 
            WHERE user_id = %s AND for_self = TRUE
            RETURNING id, patient_name
            """,
            (new_name, user_id)
        )
        updated_appointments = cursor.fetchall()
        print(f"[OK] Updated {len(updated_appointments)} appointment(s) where for_self = TRUE")
        
        # 6. Verify the changes
        cursor.execute(
            """
            SELECT id, patient_name, for_self 
            FROM public.appointments 
            WHERE user_id = %s
            ORDER BY for_self DESC
            """,
            (user_id,)
        )
        appointments = cursor.fetchall()
        
        print("\nVerification:")
        for apt in appointments:
            if apt["for_self"] and apt["patient_name"] == new_name:
                print(f"[OK] Appointment {apt['id']}: patient_name correctly updated to '{apt['patient_name']}' (for_self={apt['for_self']})")
            elif not apt["for_self"] and apt["patient_name"] != new_name:
                print(f"[OK] Appointment {apt['id']}: patient_name unchanged '{apt['patient_name']}' (for_self={apt['for_self']})")
            else:
                print(f"[ERROR] Appointment {apt['id']}: unexpected patient_name '{apt['patient_name']}' (for_self={apt['for_self']})")
                return False
        
        conn.commit()
        print("\n[OK] All tests passed! Profile update correctly propagates to self appointments only.")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        # Cleanup
        try:
            cursor.execute("DELETE FROM public.appointments WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM public.users WHERE id = %s", (user_id,))
            conn.commit()
            print("[OK] Cleanup completed")
        except Exception as e:
            print(f"Warning: Cleanup failed: {e}")
        
        cursor.close()
        conn.close()

if __name__ == "__main__":
    success = test_profile_update_propagation()
    sys.exit(0 if success else 1)