import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from app.core.config import settings


def _get_api():
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key["api-key"] = settings.BREVO_API_KEY
    return sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))


def send_verification_email(to_email: str, to_name: str, code: str) -> bool:
    api = _get_api()
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": to_email, "name": to_name}],
        sender={"email": settings.EMAIL_FROM, "name": "YoTop10"},
        subject="Your YoTop10 verification code",
        html_content=f"""
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#0a0a0a;border-radius:16px;border:1px solid #333;">
          <h1 style="color:#ff4500;font-size:28px;margin:0 0 8px;">YoTop10</h1>
          <p style="color:#aaa;font-size:13px;margin:0 0 32px;">Fact Mine. Debate Ground.</p>

          <p style="color:#fff;font-size:16px;">Hey <strong>{to_name}</strong>,</p>
          <p style="color:#ccc;font-size:15px;line-height:1.6;">
            Use the code below to verify your email. It expires in <strong>5 minutes</strong>.
          </p>

          <div style="text-align:center;margin:32px 0;padding:24px;background:#111;border:2px solid #ff4500;border-radius:12px;">
            <p style="color:#888;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;">Verification Code</p>
            <span style="font-size:52px;font-weight:900;letter-spacing:12px;color:#ff4500;font-family:monospace;">{code}</span>
          </div>

          <p style="color:#888;font-size:13px;line-height:1.6;">
            Enter this code on the verification page to activate your account.<br/>
            If you didn't create a YoTop10 account, you can safely ignore this email.
          </p>
        </div>
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
