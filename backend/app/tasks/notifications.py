from celery import shared_task
import asyncio
from app.services.notifications import send_sms, send_email

@shared_task
def send_driver_sms_task(shipment_id: str, message: str):
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    # Mock driver number lookup
    to_number = "+19999999999"
    loop.run_until_complete(send_sms(to_number, message))

@shared_task
def send_manager_email_task(alert_id: str):
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    # Mock manager email lookup
    to_email = "manager@smart-supply-chain.com"
    subject = f"CRITICAL Alert: {alert_id}"
    html = f"<h2>Alert {alert_id}</h2><p>Please review immediately.</p>"
    loop.run_until_complete(send_email(to_email, subject, html))
