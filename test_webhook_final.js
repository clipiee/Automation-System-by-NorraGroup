const crypto = require('crypto');

async function testWebhook() {
  const secretKey = process.env.LYNK_SECRET_KEY;
  if (!secretKey) throw new Error("LYNK_SECRET_KEY is missing");

  const messageId = `SIMULATION_MSG_${Date.now()}`;
  const refId = `SIMULATION_REF_${Date.now()}`;
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
          name: "Edwin (Simulasi)",
          email: "norragroup@norraclip.com", 
          phone: "08123456789"
        },
        items: [{ title: "NorraClip Activation Code | Life Time Access", qty: 1 }],
        voucherCode: "SIMULASI_VIP",
        totals: {
          grandTotal: grandTotal,
          totalPrice: grandTotal + 10000,
          convenienceFee: 0,
          discount: 10000
        }
      }
    }
  };

  const signatureString = String(grandTotal) + refId + messageId + secretKey;
  const signature = crypto.createHash("sha256").update(signatureString).digest("hex");

  console.log("Menyimulasikan webhook Lynk.id ke server lokal...");
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
