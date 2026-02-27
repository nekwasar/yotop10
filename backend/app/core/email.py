import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from app.core.config import settings


def _get_api():
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key["api-key"] = settings.BREVO_API_KEY
    return sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))


def send_verification_email(to_email: str, to_name: str, token: str) -> bool:
    verify_url = f"https://yotop10.com/verify-email?token={token}"
    api = _get_api()
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": to_email, "name": to_name}],
        sender={"email": settings.EMAIL_FROM, "name": "YoTop10"},
        subject="Verify your YoTop10 account",
        html_content=f"""
        <h2>Welcome to YoTop10, {to_name}!</h2>
        <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
        <p><a href="{verify_url}" style="background:#ff4500;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;">Verify Email</a></p>
        <p>Or copy this link: {verify_url}</p>
        <p>If you didn't sign up, ignore this email.</p>
        """,
    )
    try:
        api.send_transac_email(send_smtp_email)
        return True
    except ApiException:
        return False


def send_password_reset_email(to_email: str, to_name: str, token: str) -> bool:
    reset_url = f"https://yotop10.com/reset-password?token={token}"
    api = _get_api()
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": to_email, "name": to_name}],
        sender={"email": settings.EMAIL_FROM, "name": "YoTop10"},
        subject="Reset your YoTop10 password",
        html_content=f"""
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <p><a href="{reset_url}" style="background:#ff4500;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;">Reset Password</a></p>
        <p>Or copy this link: {reset_url}</p>
        <p>If you didn't request a reset, ignore this email.</p>
        """,
    )
    try:
        api.send_transac_email(send_smtp_email)
        return True
    except ApiException:
        return False
