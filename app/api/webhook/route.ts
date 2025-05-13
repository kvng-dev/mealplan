import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature || "",
      webhookSecret
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
      }
      case "invoice.payment_failed": {
        const session = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(session);
      }
      case "customer.subscription.deleted": {
        const session = event.data.object as Stripe.Subscription;
        await handleCustomerSunscriptionDeleted(session);
      }

      default:
        console.log("unhandles event type ", event.type);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({});
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.clerkUserId;

  if (!userId) console.log("No user id");

  const subId = session.subscription as string;

  try {
    await prisma.profile.update({
      where: { userId },
      data: {
        stripeSubId: subId,
        subActive: true,
        subTier: session.metadata?.planType || null,
      },
    });
  } catch (error: any) {
    console.log(error.message);
  }
}
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subId = invoice.subscription as string;

  if (!subId) return;
  let userId: string | undefined;
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        stripeSubId: subId,
      },
      select: {
        userId: true,
      },
    });

    if (!profile?.userId) {
      console.log("No Profile found");
      return;
    }
  } catch (error: any) {
    console.log(error.message);
    return;
  }

  try {
    await prisma.profile.update({
      where: { userId: userId },
      data: {
        subActive: false,
      },
    });
  } catch (error: any) {
    console.log(error.message);
    return;
  }
}
async function handleCustomerSunscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const subId = subscription.id;

  if (!subId) return;
  let userId: string | undefined;
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        stripeSubId: subId,
      },
      select: {
        userId: true,
      },
    });

    if (!profile?.userId) {
      console.log("No Profile found");
      return;
    }
  } catch (error: any) {
    console.log(error.message);
    return;
  }

  try {
    await prisma.profile.update({
      where: { userId: userId },
      data: {
        subActive: false,
        stripeSubId: null,
        subTier: null,
      },
    });
  } catch (error: any) {
    console.log(error.message);
    return;
  }
}
