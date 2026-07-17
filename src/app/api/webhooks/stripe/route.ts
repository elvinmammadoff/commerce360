import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.orbittify.com";
const SERVICE_TOKEN = process.env.API_SERVICE_TOKEN ?? "";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-06-24.dahlia" });
}

async function servicePost(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${SERVICE_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} → ${res.status}: ${text}`);
  }
}

// Stripe requires raw body for signature verification
export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const rawBody = await req.text();

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const { workspaceId, credits, packId } = pi.metadata as {
      workspaceId: string;
      credits: string;
      packId: string;
    };

    await servicePost("/api/credits/grant", {
      workspace_id: workspaceId,
      credits: parseInt(credits, 10),
      pack_id: packId,
      stripe_payment_intent_id: pi.id,
      amount_cents: pi.amount,
    });
  }

  return NextResponse.json({ received: true });
}
