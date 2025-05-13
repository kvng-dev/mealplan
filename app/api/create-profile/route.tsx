import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "user not found in clerk" },
        { status: 404 }
      );
    }
    const email = clerkUser?.emailAddresses[0].emailAddress || "";
    if (!email) {
      return NextResponse.json(
        { error: "user does not have an email address" },
        { status: 404 }
      );
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });

    if (existingProfile) {
      return NextResponse.json({ error: "user already exists" });
    }

    await prisma.profile.create({
      data: {
        userId: clerkUser.id,
        email,
        subTier: null,
        stripeSubId: null,
        subActive: false,
      },
    });
    return NextResponse.json(
      { success: "Profile created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.log("error in creating profile", error);
    return NextResponse.json(
      {
        error: "internal server error",
      },
      { status: 500 }
    );
  }
}
