import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

// Function to validate Lynk.id webhook signature
function validateLynkSignature(
  refId: string,
  amount: string,
  messageId: string,
  receivedSignature: string,
  secretKey: string
) {
  const signatureString = amount + refId + messageId + secretKey;
  const calculatedSignature = crypto
    .createHash("sha256")
    .update(signatureString)
    .digest("hex");
    
  return calculatedSignature === receivedSignature;
}

export async function POST(req: Request) {
  try {
    // Read the signature from headers
    const signature = req.headers.get("X-Lynk-Signature") || req.headers.get("x-lynk-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing X-Lynk-Signature header" }, { status: 401 });
    }

    const payload = await req.json();

    // Verify it's the correct event
    if (payload.event !== "payment.received") {
      return NextResponse.json({ message: "Ignored event type" }, { status: 200 });
    }

    const eventData = payload.data;
    if (!eventData || eventData.message_action !== "SUCCESS") {
      return NextResponse.json({ message: "Ignored incomplete or failed transaction" }, { status: 200 });
    }

    const { message_id, message_data } = eventData;
    const { refId, totals, customer, items, voucherCode, createdAt } = message_data;

    // Validate Signature
    const lynkSecretKey = process.env.LYNK_SECRET_KEY;
    if (!lynkSecretKey) {
      console.error("LYNK_SECRET_KEY is not configured in environment variables.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Amount must be a string for validation, matching exactly what the webhook expects
    const amountStr = String(totals.grandTotal);
    
    const isValid = validateLynkSignature(
      refId,
      amountStr,
      message_id,
      signature,
      lynkSecretKey
    );

    if (!isValid) {
      console.error(`Invalid webhook signature for refId: ${refId}`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Extract item details
    const primaryItem = items?.[0] || {};
    const itemTitle = primaryItem.title || "Unknown Product";

    // Insert into Supabase lynk_payments table
    const { error: dbError } = await supabase.from("lynk_payments").insert([
      {
        message_id: message_id,
        ref_id: refId,
        customer_name: customer.name || "Unknown",
        customer_email: customer.email || "Unknown",
        customer_phone: customer.phone || null,
        grand_total: totals.grandTotal || 0,
        total_price: totals.totalPrice || 0,
        convenience_fee: totals.convenienceFee || 0,
        discount: totals.discount || 0,
        voucher_code: voucherCode === "" || voucherCode === "unlimited" ? null : voucherCode,
        event: itemTitle,
        created_at: new Date().toISOString() // Use current time or createdAt from payload
      }
    ]);

    if (dbError) {
      console.error("Supabase Insertion Error:", dbError);
      return NextResponse.json({ error: "Database error", details: dbError }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Payment processed" }, { status: 200 });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
