import { getPriceIdFromType } from "@/lib/plan";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" });
    }

    const { newPlan } = await req.json();

    if (!newPlan) {
      return NextResponse.json({ error: "New plan is required" });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });

    if (!profile?.stripeSubId) {
      return NextResponse.json({ error: "No Active sub found" });
    }

    const subId = profile.stripeSubId;

    const sub = await stripe.subscriptions.retrieve(subId);
    const subItemId = sub.items.data[0]?.id;

    if (!subItemId) {
      return NextResponse.json({ error: "No Active sub found" });
    }

    const updateSub = await stripe.subscriptions.update(subId, {
      cancel_at_period_end: false,
      items: [{ id: subItemId, price: getPriceIdFromType(newPlan) }],
      proration_behavior: "create_prorations",
    });

    await prisma.profile.update({
      where: { userId: clerkUser.id },
      data: {
        subTier: newPlan,
        stripeSubId: updateSub.id,
        subActive: true,
      },
    });

    return NextResponse.json({ subscription: updateSub });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
