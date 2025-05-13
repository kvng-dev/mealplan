import { getPriceIdFromType } from "@/lib/plan";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { planType, userId, email } = await request.json();

    if (!planType || !userId || !email) {
      return NextResponse.json(
        {
          error: "Plan type, email and user id are required",
        },
        {
          status: 400,
        }
      );
    }
    const allowedPlanTypes = ["week", "month", "year"];

    if (!allowedPlanTypes.includes(planType)) {
      return NextResponse.json(
        {
          error: "Invalid plan type",
        },
        {
          status: 400,
        }
      );
    }

    const priceID = getPriceIdFromType(planType);

    if (!priceID) {
      return NextResponse.json(
        {
          error: "Invalide price ID",
        },
        {
          status: 400,
        }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceID,
          quantity: 1,
        },
      ],
      customer_email: email,
      mode: "subscription",
      metadata: {
        clerkUserId: userId,
        planType,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/subscribe`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Internal Server error",
      },
      {
        status: 500,
      }
    );
  }
}
