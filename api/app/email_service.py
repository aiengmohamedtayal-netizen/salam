from __future__ import annotations

import logging
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

from app.config import settings

logger = logging.getLogger("amal.email")


def generate_otp_html(code: str, name: str = "") -> str:
    greeting = f"مرحباً {name}،" if name else "مرحباً،"
    return f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>رمز التحقق - منصة أمل</title>
  <style>
    body {{
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 24px;
      color: #1e293b;
      direction: rtl;
    }}
    .container {{
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }}
    .header {{
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }}
    .header h1 {{
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }}
    .header p {{
      margin: 8px 0 0;
      font-size: 14px;
      opacity: 0.9;
    }}
    .content {{
      padding: 32px 24px;
      text-align: center;
    }}
    .greeting {{
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #0f172a;
    }}
    .description {{
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 28px;
    }}
    .otp-box {{
      background: #f5f3ff;
      border: 2px dashed #7c3aed;
      border-radius: 12px;
      padding: 20px;
      margin: 0 auto 28px;
      display: inline-block;
      min-width: 220px;
    }}
    .otp-code {{
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #6d28d9;
      font-family: monospace;
      margin: 0;
      user-select: all;
    }}
    .timer {{
      font-size: 13px;
      color: #64748b;
      margin-top: 8px;
    }}
    .footer {{
      padding: 20px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>منصة أمل | AMAL</h1>
      <p>الرعاية والتوعية النفسية بالذكاء الاصطناعي</p>
    </div>
    <div class="content">
      <div class="greeting">{greeting}</div>
      <div class="description">
        شكراً لانضمامك إلى منصة <strong>أمل</strong>. لتأكيد حسابك وإتمام عملية التسجيل، يُرجى استخدام رمز التحقق لمرة واحدة (OTP) التالي:
      </div>
      <div class="otp-box">
        <div class="otp-code">{code}</div>
        <div class="timer">ينتهي الرمز خلال 10 دقائق</div>
      </div>
      <div class="description" style="font-size: 13px; color: #94a3b8; margin-bottom: 0;">
        إذا لم تقم بإنشاء حساب في منصة أمل، يمكنك تجاهل هذه الرسالة بأمان.
      </div>
    </div>
    <div class="footer">
      هذه رسالة آلية تم إرسالها لتأكيد التسجيل في منصة أمل.<br>
      © 2026 AMAL Platform. جميع الحقوق محفوظة.
    </div>
  </div>
</body>
</html>"""


def send_otp_email(to_email: str, code: str, name: str = "") -> dict[str, Any]:
    """
    Sends an OTP verification email using Gmail SMTP or configured SMTP provider.
    Falls back gracefully in development mode if credentials fail.
    """
    if settings.env == "test":
        logger.info("[TEST ENV] Mocking OTP email dispatch to %s (code=%s)", to_email, code)
        return {"sent": True, "to": to_email, "mocked": True}
    if not settings.smtp_user or not settings.smtp_password:
        logger.warning(
            "SMTP credentials not fully configured (user=%s). Generated OTP for %s: %s",
            settings.smtp_user,
            to_email,
            code,
        )
        return {"sent": False, "reason": "SMTP_NOT_CONFIGURED", "code": code}

    subject = f"رمز التحقق الخاص بك في منصة أمل: {code}"
    from_header = f"{settings.smtp_from_name} <{settings.smtp_user}>"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_header
    msg["To"] = to_email

    plain_text = f"""مرحباً {name}،
رمز التحقق الخاص بك لتأكيد حسابك في منصة أمل هو: {code}
هذا الرمز صالح لمدة 10 دقائق.
إذا لم تقم بإنشاء حساب، يُرجى تجاهل هذه الرسالة.
"""
    html_text = generate_otp_html(code, name)

    msg.attach(MIMEText(plain_text, "plain", "utf-8"))
    msg.attach(MIMEText(html_text, "html", "utf-8"))

    # Try Port 587 (STARTTLS) first, then Port 465 (SSL)
    server_variants = [
        {"port": settings.smtp_port, "ssl": False},
        {"port": 465, "ssl": True},
    ]

    last_error: Exception | None = None
    for variant in server_variants:
        try:
            port = variant["port"]
            use_ssl = variant["ssl"]
            context = ssl.create_default_context()

            if use_ssl:
                with smtplib.SMTP_SSL(settings.smtp_host, port, context=context, timeout=10) as server:
                    server.login(settings.smtp_user, settings.smtp_password)
                    server.sendmail(settings.smtp_user, [to_email], msg.as_string())
            else:
                with smtplib.SMTP(settings.smtp_host, port, timeout=10) as server:
                    server.ehlo()
                    server.starttls(context=context)
                    server.ehlo()
                    server.login(settings.smtp_user, settings.smtp_password)
                    server.sendmail(settings.smtp_user, [to_email], msg.as_string())

            logger.info("Successfully sent OTP email to %s via SMTP port %d", to_email, port)
            return {"sent": True, "to": to_email}
        except Exception as e:
            last_error = e
            logger.warning("Failed sending email via port %d: %s", variant["port"], e)

    logger.error("Could not dispatch OTP email to %s: %s. OTP Code: %s", to_email, last_error, code)
    return {"sent": False, "reason": str(last_error), "code": code}
