"""
Seed data script for MediApp database.
Populates doctors, FAQs, services, and other initial data.
"""
import os
import sys
from dotenv import load_dotenv

# Add parent directory to path to import database module
sys.path.insert(0, os.path.dirname(__file__))

from database import get_connection

load_dotenv()


def seed_doctors():
    """Seed doctors data."""
    doctors = [
        {
            "name": "Dr. Sarah Johnson",
            "specialty": "Cardiologist",
            "gender": "female",
            "rating": 4.9,
            "messages": 124,
            "photo_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300",
            "experience": 12,
            "focus": "Heart Disease Prevention",
            "about": "Dr. Sarah Johnson is a board-certified cardiologist with over 12 years of experience in treating cardiovascular diseases. She specializes in preventive cardiology and cardiac rehabilitation.",
            "availability_days": "Mon, Wed, Fri",
            "availability_time": "9:00 AM - 5:00 PM",
            "schedule": [
                {"day": "Monday", "slots": ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"]},
                {"day": "Wednesday", "slots": ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"]},
                {"day": "Friday", "slots": ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"]}
            ]
        },
        {
            "name": "Dr. Michael Chen",
            "specialty": "Dermatologist",
            "gender": "male",
            "rating": 4.8,
            "messages": 98,
            "photo_url": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300",
            "experience": 8,
            "focus": "Skin Cancer Treatment",
            "about": "Dr. Michael Chen is a dermatologist specializing in skin cancer detection and treatment. He is passionate about skin health education and preventive care.",
            "availability_days": "Tue, Thu, Sat",
            "availability_time": "10:00 AM - 6:00 PM",
            "schedule": [
                {"day": "Tuesday", "slots": ["10:00 AM", "11:00 AM", "12:00 PM", "3:00 PM", "4:00 PM"]},
                {"day": "Thursday", "slots": ["10:00 AM", "11:00 AM", "12:00 PM", "3:00 PM", "4:00 PM"]},
                {"day": "Saturday", "slots": ["10:00 AM", "11:00 AM", "12:00 PM"]}
            ]
        },
        {
            "name": "Dr. Emily Rodriguez",
            "specialty": "Pediatrician",
            "gender": "female",
            "rating": 4.95,
            "messages": 156,
            "photo_url": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300",
            "experience": 15,
            "focus": "Child Development",
            "about": "Dr. Emily Rodriguez is a pediatrician with 15 years of experience in child healthcare. She focuses on developmental pediatrics and adolescent medicine.",
            "availability_days": "Mon, Tue, Wed, Thu, Fri",
            "availability_time": "8:00 AM - 4:00 PM",
            "schedule": [
                {"day": "Monday", "slots": ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM"]},
                {"day": "Tuesday", "slots": ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM"]},
                {"day": "Wednesday", "slots": ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM"]},
                {"day": "Thursday", "slots": ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM"]},
                {"day": "Friday", "slots": ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM"]}
            ]
        },
        {
            "name": "Dr. James Wilson",
            "specialty": "Orthopedic Surgeon",
            "gender": "male",
            "rating": 4.7,
            "messages": 87,
            "photo_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300",
            "experience": 20,
            "focus": "Sports Medicine",
            "about": "Dr. James Wilson is an orthopedic surgeon specializing in sports medicine and joint replacement surgery. He has worked with professional athletes and teams.",
            "availability_days": "Mon, Wed, Fri",
            "availability_time": "9:00 AM - 5:00 PM",
            "schedule": [
                {"day": "Monday", "slots": ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"]},
                {"day": "Wednesday", "slots": ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"]},
                {"day": "Friday", "slots": ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"]}
            ]
        },
        {
            "name": "Dr. Lisa Park",
            "specialty": "Psychiatrist",
            "gender": "female",
            "rating": 4.85,
            "messages": 112,
            "photo_url": "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=300",
            "experience": 10,
            "focus": "Anxiety & Depression",
            "about": "Dr. Lisa Park is a psychiatrist specializing in mood disorders and anxiety. She takes a holistic approach to mental health, combining medication management with therapy.",
            "availability_days": "Mon, Tue, Wed, Thu",
            "availability_time": "10:00 AM - 6:00 PM",
            "schedule": [
                {"day": "Monday", "slots": ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]},
                {"day": "Tuesday", "slots": ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]},
                {"day": "Wednesday", "slots": ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]},
                {"day": "Thursday", "slots": ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]}
            ]
        },
        {
            "name": "Dr. David Kim",
            "specialty": "General Physician",
            "gender": "male",
            "rating": 4.6,
            "messages": 203,
            "photo_url": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300",
            "experience": 18,
            "focus": "Family Medicine",
            "about": "Dr. David Kim is a general physician providing comprehensive primary care for patients of all ages. He focuses on preventive care and chronic disease management.",
            "availability_days": "Mon, Tue, Wed, Thu, Fri",
            "availability_time": "8:00 AM - 6:00 PM",
            "schedule": [
                {"day": "Monday", "slots": ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]},
                {"day": "Tuesday", "slots": ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]},
                {"day": "Wednesday", "slots": ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]},
                {"day": "Thursday", "slots": ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]},
                {"day": "Friday", "slots": ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]}
            ]
        }
    ]
    
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # Clear existing doctors
        cursor.execute("DELETE FROM public.doctor_schedule")
        cursor.execute("DELETE FROM public.doctors")
        
        for doc in doctors:
            # Insert doctor
            cursor.execute(
                """
                INSERT INTO public.doctors (name, specialty, gender, rating, messages, photo_url, experience, focus, about, availability_days, availability_time)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (doc["name"], doc["specialty"], doc["gender"], doc["rating"], doc["messages"], 
                 doc["photo_url"], doc["experience"], doc["focus"], doc["about"], 
                 doc["availability_days"], doc["availability_time"])
            )
            doctor_id = cursor.fetchone()["id"]
            
            # Insert schedule
            for schedule in doc["schedule"]:
                cursor.execute(
                    """
                    INSERT INTO public.doctor_schedule (doctor_id, day, slots)
                    VALUES (%s, %s, %s)
                    """,
                    (doctor_id, schedule["day"], schedule["slots"])
                )
        
        conn.commit()
        print(f"[OK] Seeded {len(doctors)} doctors with schedules")
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Error seeding doctors: {e}")
        raise
    finally:
        conn.close()


def seed_faqs():
    """Seed FAQ data."""
    faqs = [
        {
            "question": "How do I book an appointment?",
            "answer": "You can book an appointment by selecting a doctor from the Doctors page, choosing an available time slot, and filling in your details. You'll receive a confirmation once your appointment is booked.",
            "category": "popular"
        },
        {
            "question": "Can I cancel or reschedule my appointment?",
            "answer": "Yes, you can cancel or reschedule your appointment from the Appointments page. Go to your upcoming appointments and select the appointment you want to modify. Please note that cancellations made less than 24 hours before the appointment may incur a fee.",
            "category": "popular"
        },
        {
            "question": "How do I add a payment method?",
            "answer": "Go to Settings > Payment Details to add your payment method. We accept credit cards, debit cards, Apple Pay, PayPal, and Google Pay. You can set a default payment method for quick checkout.",
            "category": "popular"
        },
        {
            "question": "Is my personal information secure?",
            "answer": "Yes, we take your privacy seriously. All your personal and medical information is encrypted and stored securely. We comply with HIPAA regulations and never share your data without your consent.",
            "category": "general"
        },
        {
            "question": "How do I contact customer support?",
            "answer": "You can reach our customer support team through the Help Centre in the app. We're available 24/7 to assist you with any questions or concerns.",
            "category": "general"
        },
        {
            "question": "What services do you offer?",
            "answer": "We offer a wide range of medical services including general consultations, specialist appointments, mental health support, pediatric care, and more. Check our Services page for a complete list.",
            "category": "services"
        },
        {
            "question": "How do I update my profile?",
            "answer": "You can update your profile by going to the Profile page and tapping on the edit button. You can change your name, email, phone number, date of birth, and profile picture.",
            "category": "general"
        },
        {
            "question": "Can I chat with my doctor?",
            "answer": "Yes, you can send messages to your doctor through the Chats feature. This is useful for follow-up questions or non-urgent medical inquiries. For emergencies, please call 911.",
            "category": "services"
        }
    ]
    
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # Clear existing FAQs
        cursor.execute("DELETE FROM public.faqs")
        
        for faq in faqs:
            cursor.execute(
                """
                INSERT INTO public.faqs (question, answer, category)
                VALUES (%s, %s, %s)
                """,
                (faq["question"], faq["answer"], faq["category"])
            )
        
        conn.commit()
        print(f"[OK] Seeded {len(faqs)} FAQs")
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Error seeding FAQs: {e}")
        raise
    finally:
        conn.close()


def seed_services():
    """Seed services data."""
    services = [
        {
            "name": "General Consultation",
            "brief": "Standard doctor consultation for general health concerns"
        },
        {
            "name": "Specialist Appointment",
            "brief": "Consultation with medical specialists in various fields"
        },
        {
            "name": "Mental Health Support",
            "brief": "Counseling and psychiatric services for mental wellness"
        },
        {
            "name": "Pediatric Care",
            "brief": "Healthcare services for infants, children, and adolescents"
        },
        {
            "name": "Cardiology",
            "brief": "Heart and cardiovascular system diagnosis and treatment"
        },
        {
            "name": "Dermatology",
            "brief": "Skin, hair, and nail conditions diagnosis and treatment"
        },
        {
            "name": "Orthopedics",
            "brief": "Bone, joint, and muscle conditions treatment"
        },
        {
            "name": "Dental Care",
            "brief": "Oral health checkups and dental procedures"
        }
    ]
    
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # Clear existing services
        cursor.execute("DELETE FROM public.services")
        
        for service in services:
            cursor.execute(
                """
                INSERT INTO public.services (name, brief)
                VALUES (%s, %s)
                """,
                (service["name"], service["brief"])
            )
        
        conn.commit()
        print(f"[OK] Seeded {len(services)} services")
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Error seeding services: {e}")
        raise
    finally:
        conn.close()


def main():
    """Run all seed functions."""
    print("=" * 50)
    print("Seeding MediApp Database")
    print("=" * 50)
    
    seed_doctors()
    seed_faqs()
    seed_services()
    
    print("=" * 50)
    print("Database seeding completed!")
    print("=" * 50)


if __name__ == "__main__":
    main()