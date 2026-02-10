export const resetPasswordTemplate = ({
  name = "User",
  otp,
  expiryMinutes = 10,
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f6f8;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      .container {
        max-width: 520px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      }
      .header {
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        padding: 24px;
        text-align: center;
        color: #ffffff;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
        letter-spacing: 1px;
      }
      .content {
        padding: 30px;
        color: #333333;
      }
      .content p {
        font-size: 14px;
        line-height: 1.6;
        margin: 0 0 16px;
      }
      .otp-box {
        margin: 24px 0;
        text-align: center;
      }
      .otp {
        display: inline-block;
        padding: 14px 28px;
        font-size: 26px;
        letter-spacing: 6px;
        font-weight: 600;
        color: #4f46e5;
        background: #eef2ff;
        border-radius: 10px;
      }
      .note {
        font-size: 13px;
        color: #6b7280;
      }
      .divider {
        height: 1px;
        background: #e5e7eb;
        margin: 28px 0;
      }
      .cta {
        text-align: center;
        margin: 20px 0;
      }
      .cta a {
        display: inline-block;
        padding: 12px 22px;
        background: #4f46e5;
        color: #ffffff;
        text-decoration: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
      }
      .link-section {
        text-align: center;
        font-size: 13px;
        margin-top: 10px;
      }
      .link-section a {
        color: #4f46e5;
        text-decoration: none;
        font-weight: 500;
      }
      .about {
        font-size: 13px;
        color: #4b5563;
        line-height: 1.6;
      }
      .footer {
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #9ca3af;
        background: #f9fafb;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="header">
        <h1>BBD UTKARSH 2026</h1>
      </div>

      <div class="content">
        <p>Hi <strong>${name}</strong>,</p>

        <p>
          We received a request to reset your password.  
          Use the OTP below to continue:
        </p>

        <div class="otp-box">
          <span class="otp">${otp}</span>
        </div>

        <p class="note">
          This OTP is valid for <strong>${expiryMinutes} minutes</strong>.  
          Please do not share this code with anyone.
        </p>

        <p>
          If you did not request a password reset, you can safely ignore this
          email.
        </p>

        <div class="divider"></div>

        <!-- UTKARSH Website -->
        <div class="cta">
          <a href="https://bbd-utkarsh.org" target="_blank">
            Visit Our Official Website
          </a>
        </div>

        <div class="divider"></div>

        <!-- About BBD University -->
        <div class="about">
          <strong>About BBD University</strong><br />
          Babu Banarasi Das University (BBDU) is a leading private university in
          Lucknow, committed to excellence in education, innovation, and
          holistic student development. The UTKARSH initiative reflects the
          university’s vision to empower students through technology-driven
          platforms and academic excellence.
        </div>

        <!-- BBDU Official Website -->
        <div class="divider"></div>

        <div class="link-section">
          View BBD Official Website:  
          <a href="https://bbdu.ac.in" target="_blank">
            https://bbdu.ac.in
          </a>
        </div>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} BBD UTKARSH · All rights reserved
      </div>
    </div>
  </body>
  </html>
  `;
};
