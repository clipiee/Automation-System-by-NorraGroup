const { Resend } = require('resend');

async function testResend() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log("Sending email...");
  const response = await resend.emails.send({
    from: "NorraClip <norragroup@norraclip.com>",
    to: ["delivered@resend.dev"],
    subject: "Test Domain Setup",
    html: "<p>Domain test successful!</p>"
  });
  console.log("Response:", JSON.stringify(response, null, 2));
}

testResend().catch(console.error);
