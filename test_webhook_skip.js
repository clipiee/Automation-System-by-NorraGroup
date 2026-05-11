const crypto = require('crypto');

async function testWebhook() {
  const secretKey = process.env.LYNK_SECRET_KEY;
  if (!secretKey) throw new Error("LYNK_SECRET_KEY is missing");

  const messageId = `SIMULATION_SKIP_${Date.now()}`;
  const refId = `SIMULATION_SKIP_REF_${Date.now()}`;
  const grandTotal = 50000;

  const payload = {
    event: "payment.received",
    data: {
      message_action: "SUCCESS",
      message_id: messageId,
      message_data: {
        refId: refId,
        createdAt: new Date().toISOString(),
        customer: {
          name: "Budi (Course)",
          email: "norragroup@norraclip.com", 
          phone: "08123456789"
        },
        items: [{ title: "Digital Course Masterclass", qty: 1 }],
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

  console.log("Menyimulasikan produk non-aktivasi...");
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
