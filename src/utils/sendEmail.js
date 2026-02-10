import axios from "axios";

export const sendEmailBrevo = async ({ to, subject, html }) => {
  console.log("📧 [Brevo] Preparing email");
  console.log("➡️ To:", to);
  console.log("➡️ Subject:", subject);
  console.log(
    "🔑 API Key present:",
    !!process.env.BREVO_API_KEY
  );
  console.log(
    "📨 Sender:",
    process.env.EMAIL_FROM,
    "|",
    process.env.EMAIL_FROM_NAME
  );

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.EMAIL_FROM,
          name: process.env.EMAIL_FROM_NAME,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          accept: "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("✅ [Brevo] Email accepted");
    console.log("🆔 Message ID:", response.data?.messageId);

    return response.data;
  } catch (error) {
    console.error("❌ [Brevo] Email failed");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Brevo message:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }

    throw error;
  }
};
