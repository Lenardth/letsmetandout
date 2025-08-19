"""
SMS utilities for SafeMeet application
"""
from twilio.rest import Client
from twilio.base.exceptions import TwilioException
from typing import Optional
import logging

from app.config import settings

logger = logging.getLogger(__name__)

# Initialize Twilio client
twilio_client = None
if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
    twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)


def send_sms(to_phone: str, message: str) -> bool:
    """Send SMS message using Twilio"""
    if not twilio_client:
        logger.warning("Twilio not configured. SMS not sent.")
        # In development, just log the message
        logger.info(f"SMS to {to_phone}: {message}")
        return True
    
    try:
        # Ensure phone number is in E.164 format
        if not to_phone.startswith('+'):
            to_phone = '+' + to_phone
        
        message_obj = twilio_client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to_phone
        )
        
        logger.info(f"SMS sent successfully. SID: {message_obj.sid}")
        return True
        
    except TwilioException as e:
        logger.error(f"Twilio error sending SMS to {to_phone}: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Error sending SMS to {to_phone}: {str(e)}")
        return False


def send_verification_sms(phone: str, code: str) -> bool:
    """Send verification code via SMS"""
    message = (
        f"Your SafeMeet verification code is: {code}\n"
        f"This code expires in 10 minutes.\n"
        f"If you didn't request this, please ignore."
    )
    return send_sms(phone, message)


def send_emergency_sms(phone: str, user_name: str, message: str, location: Optional[str] = None) -> bool:
    """Send emergency alert SMS"""
    sms_message = (
        f"🚨 EMERGENCY ALERT - SafeMeet 🚨\n"
        f"{user_name} needs help!\n"
        f"Message: {message}"
    )
    
    if location:
        sms_message += f"\nLocation: {location}"
    
    sms_message += (
        f"\nTime: Now\n"
        f"If this is a real emergency, contact 10111 (Police) or 10177 (Ambulance) immediately."
    )
    
    return send_sms(phone, sms_message)


def send_check_in_sms(phone: str, user_name: str, message: str, location: Optional[str] = None) -> bool:
    """Send safety check-in SMS"""
    sms_message = (
        f"✅ SafeMeet Check-in\n"
        f"{user_name}: {message}"
    )
    
    if location:
        sms_message += f"\nLocation: {location}"
    
    return send_sms(phone, sms_message)


def send_welcome_sms(phone: str, first_name: str) -> bool:
    """Send welcome SMS to new users"""
    message = (
        f"Welcome to SafeMeet, {first_name}! 🎉\n"
        f"Your account has been created successfully.\n"
        f"Please verify your phone number to complete setup.\n"
        f"Stay safe! - SafeMeet Team"
    )
    return send_sms(phone, message)


def format_sa_phone_number(phone: str) -> str:
    """Format phone number to South African E.164 format"""
    import re
    
    # Remove all non-digit characters except +
    clean_phone = re.sub(r'[^\d+]', '', phone)
    
    # Handle different input formats
    if clean_phone.startswith('+27'):
        return clean_phone
    elif clean_phone.startswith('27'):
        return '+' + clean_phone
    elif clean_phone.startswith('0') and len(clean_phone) == 10:
        return '+27' + clean_phone[1:]
    else:
        # Assume it's a local number without country code
        return '+27' + clean_phone
    

def validate_sms_message_length(message: str) -> bool:
    """Validate SMS message length (160 chars for single SMS)"""
    return len(message) <= 160


def estimate_sms_cost(message: str, recipient_count: int = 1) -> float:
    """Estimate SMS cost (for budgeting purposes)"""
    # Twilio pricing for South Africa (approximate)
    sms_segments = max(1, (len(message) + 159) // 160)  # 160 chars per segment
    cost_per_segment = 0.0075  # USD per segment (example rate)
    
    return sms_segments * cost_per_segment * recipient_count