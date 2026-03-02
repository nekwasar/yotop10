"""
Email sending via Brevo Transactional Email REST API v3.

Requirements:
  - BREVO_API_KEY = your REST API key from Brevo dashboard
                    → SMTP & API → API Keys → Create a new API key
                    The key starts with: xkeysib-...
  - EMAIL_FROM    = a verified sender address in Brevo (e.g. noreply@yotop10.com)

No SMTP login, no extra username, no SDK dependency.
Just one API key + a plain HTTPS POST.
"""
import json
import logging
import urllib.request
import urllib.error
from app.core.config import settings

logger = logging.getLogger(__name__)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def _send(to_email: str, to_name: str, subject: str, html: str) -> bool:
    """Send a transactional email via Brevo REST API. Returns True on success."""
    if not settings.BREVO_API_KEY:
        logger.warning("Email NOT sent to %s — BREVO_API_KEY not set in .env", to_email)
        return False

    payload = json.dumps({
        "sender": {"email": settings.EMAIL_FROM, "name": "YoTop10"},
        "to": [{"email": to_email, "name": to_name}],
        "subject": subject,
        "htmlContent": html,
    }).encode("utf-8")

    req = urllib.request.Request(
        BREVO_API_URL,
        data=payload,
        headers={
            "accept": "application/json",
            "api-key": settings.BREVO_API_KEY,
            "content-type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            logger.info("Email sent to %s — Subject: %s [HTTP %s]", to_email, subject, resp.status)
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        logger.error("Brevo API error %s sending to %s: %s", e.code, to_email, body)
        if e.code == 401:
            logger.error(
                "BREVO_API_KEY is invalid or is an SMTP key (xsmtpsib-). "
                "Go to Brevo → SMTP & API → API Keys tab and create a REST key (xkeysib-)."
            )
        return False
    except Exception as exc:
        logger.error("Email send error to %s: %s", to_email, str(exc))
        return False


def send_verification_email(to_email: str, to_name: str, code: str) -> bool:
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;
                background:#0a0a0a;border-radius:16px;border:1px solid #333;">
      <h1 style="color:#ff4500;font-size:28px;margin:0 0 8px;">YoTop10</h1>
      <p style="color:#aaa;font-size:13px;margin:0 0 32px;">Fact Mine. Debate Ground.</p>
      <p style="color:#fff;font-size:16px;">Hey <strong>{to_name}</strong>,</p>
      <p style="color:#ccc;font-size:15px;line-height:1.6;">
        Use the code below to verify your email.
        It expires in <strong>5 minutes</strong>.
      </p>
      <div style="text-align:center;margin:32px 0;padding:24px;
                  background:#111;border:2px solid #ff4500;border-radius:12px;">
        <p style="color:#888;font-size:12px;letter-spacing:3px;
                  text-transform:uppercase;margin:0 0 12px;">Verification Code</p>
        <span style="font-size:52px;font-weight:900;letter-spacing:12px;
                     color:#ff4500;font-family:monospace;">{code}</span>
      </div>
      <p style="color:#888;font-size:13px;line-height:1.6;">
        Enter this code on the verification page to activate your account.<br/>
        If you didn't create a YoTop10 account, ignore this email.
      </p>
    </div>
    """
    return _send(to_email, to_name, "Your YoTop10 verification code", html)


def send_password_reset_email(to_email: str, to_name: str, token: str) -> bool:
    reset_url = f"https://yotop10.com/reset-password?token={token}"
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;
                background:#0a0a0a;border-radius:16px;border:1px solid #333;">
      <h1 style="color:#ff4500;font-size:28px;margin:0 0 8px;">YoTop10</h1>
      <p style="color:#aaa;font-size:13px;margin:0 0 32px;">Fact Mine. Debate Ground.</p>
      <p style="color:#fff;font-size:16px;">Hey <strong>{to_name}</strong>,</p>
      <p style="color:#ccc;font-size:15px;line-height:1.6;">
        Click the button below to reset your password.
        This link expires in <strong>1 hour</strong>.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="{reset_url}"
           style="display:inline-block;background:#ff4500;color:#fff;padding:16px 32px;
                  text-decoration:none;border-radius:10px;font-size:15px;font-weight:bold;
                  letter-spacing:1px;">
          Reset Password
        </a>
      </div>
      <p style="color:#888;font-size:12px;line-height:1.6;">
        Or paste this link into your browser:<br/>{reset_url}<br/><br/>
        If you didn't request this, ignore this email.
      </p>
    </div>
    """
    return _send(to_email, to_name, "Reset your YoTop10 password", html)
