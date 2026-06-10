"""
Email Service for Medi App
Sends password reset codes via Gmail SMTP.
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_reset_code(to_email: str, code: str) -> bool:
    """
    Send a password reset code via email using Gmail SMTP.
    
    Requires environment variables:
      - SMTP_EMAIL: Gmail address used to send emails
      - SMTP_PASSWORD: Gmail App Password (not regular password)
    
    Args:
        to_email: Recipient email address
        code: 6-digit reset code
    
    Returns:
        True if email was sent successfully, False otherwise
    """
    smtp_email = os.getenv("SMTP_EMAIL", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")

    if not smtp_email or not smtp_password:
        print(f"[EMAIL SERVICE] SMTP not configured. Reset code for {to_email}: {code}")
        return False

    try:
        # Build the email
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "MediApp - Password Reset Code"
        msg["From"] = f"MediApp <{smtp_email}>"
        msg["To"] = to_email

        # Plain text version
        text_content = f"""Hello,

You requested a password reset for your MediApp account.

Your verification code is: {code}

This code will expire in 10 minutes.

If you did not request this, please ignore this email.

— MediApp Team
"""

        # HTML version
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }}
        .container {{ max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }}
        .header {{ text-align: center; margin-bottom: 24px; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #2D6A2E; }}
        .code-box {{ background: #f0f7f0; border: 2px dashed #2D6A2E; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }}
        .code {{ font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2D6A2E; }}
        .footer {{ text-align: center; color: #888; font-size: 12px; margin-top: 24px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🩺 MediApp</div>
        </div>
        <h2 style="color: #333; text-align: center;">Password Reset Code</h2>
        <p style="color: #555; line-height: 1.6;">
            You requested a password reset for your MediApp account. 
            Use the code below to verify your identity:
        </p>
        <div class="code-box">
            <div class="code">{code}</div>
        </div>
        <p style="color: #555; line-height: 1.6;">
            This code will expire in <strong>10 minutes</strong>.
        </p>
        <p style="color: #888; font-size: 14px;">
            If you did not request this, please ignore this email.
        </p>
        <div class="footer">
            <p>— MediApp Team</p>
        </div>
    </div>
</body>
</html>
"""

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        # Send via Gmail SMTP
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(smtp_email, smtp_password)
            server.sendmail(smtp_email, to_email, msg.as_string())

        print(f"[EMAIL SERVICE] Reset code sent to {to_email}")
        return True

    except smtplib.SMTPAuthenticationError as e:
        print(f"[EMAIL SERVICE] SMTP Authentication failed for {smtp_email}: {e}")
        print(f"[EMAIL SERVICE] Make sure SMTP_PASSWORD is a valid Gmail App Password (not your regular password)")
        print(f"[EMAIL SERVICE] Generate one at: https://myaccount.google.com/apppasswords")
        return False
    except smtplib.SMTPException as e:
        print(f"[EMAIL SERVICE] SMTP error sending to {to_email}: {e}")
        return False
    except Exception as e:
        print(f"[EMAIL SERVICE] Failed to send email to {to_email}: {type(e).__name__}: {e}")
        return False
