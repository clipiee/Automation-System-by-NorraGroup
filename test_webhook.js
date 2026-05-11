const crypto = require('crypto');

async function testWebhook() {
  const secretKey = process.env.LYNK_SECRET_KEY;
  if (!secretKey) throw new Error("LYNK_SECRET_KEY is missing");

  const messageId = `TEST_MSG_${Date.now()}`;
  const refId = `TEST_REF_${Date.now()}`;
  const grandTotal = 99000;

  const payload = {
    event: "payment.received",
    data: {
      message_action: "SUCCESS",
      message_id: messageId,
      message_data: {
        refId: refId,
        createdAt: new Date().toISOString(),
        customer: {
          name: "Test User",
          email: "delivered@resend.dev", // Resend test email
          phone: "08123456789"
        },
        items: [{ title: "NorraClip Activation Code", qty: 1 }],
        voucherCode: "",
        totals: {
          grandTotal: grandTotal,
          totalPrice: grandTotal,
          convenienceFee: 0,
          discount: 0
        }
      }
    }
  };

  const signatureString = String(grandTotal) + refId + messageId + secretKey;
  const signature = crypto.createHash("sha256").update(signatureString).digest("hex");

  console.log("Sending Webhook...");
  const res = await fetch("http://localhost:3000/api/webhook/lynk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Lynk-Signature": signature
    },
    body: JSON.stringify(payload)
  });

  const responseText = await res.text();
  console.log(`Status: ${res.status}`);
  console.log(`Response: ${responseText}`);
}

testWebhook().catch(console.error);
