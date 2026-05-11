const { Resend } = require('resend');

async function testResend() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log("Sending email...");
  const response = await resend.emails.send({
    from: "NorraClip <onboarding@resend.dev>",
    to: ["delivered@resend.dev"],
    subject: "Test from API",
    html: "<p>Test</p>"
  });
  console.log("Response:", JSON.stringify(response, null, 2));
}

testResend().catch(console.error);
