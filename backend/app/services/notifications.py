import httpx
from app.config import settings

async def send_sms(to_number: str, text: str):
    if not settings.twilio_account_sid or not settings.twilio_auth_token:
        print(f"MOCK SMS to {to_number}: {text}")
        return
        
    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json"
    auth = (settings.twilio_account_sid, settings.twilio_auth_token)
    data = {
        "From": settings.twilio_from_number,
        "To": to_number,
        "Body": text
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(url, auth=auth, data=data)
            print("Twilio Response:", resp.status_code)
        except Exception as e:
            print(f"Twilio Error: {e}")

async def send_email(to_email: str, subject: str, html_content: str):
    if not settings.sendgrid_api_key:
        print(f"MOCK EMAIL to {to_email}: {subject}")
        return
        
    url = "https://api.sendgrid.com/v3/mail/send"
    headers = {
        "Authorization": f"Bearer {settings.sendgrid_api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "personalizations": [{"to": [{"email": to_email}]}],
        "from": {"email": "alerts@smart-supply-chain.com", "name": "Smart Supply Chain Alerts"},
        "subject": subject,
        "content": [{"type": "text/html", "value": html_content}]
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(url, headers=headers, json=data)
            print("SendGrid Response:", resp.status_code)
        except Exception as e:
            print(f"SendGrid Error: {e}")
