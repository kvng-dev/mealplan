"use client";
import {
  SignedIn,
  SignedOut,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import { Home, Loader2, Pizza, Salad } from "lucide-react";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";

const Navbar = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <Loader2 size={12} className="animate-spin" />;
  return (
    <div className="border-primary-foreground/50 w-full border-b p-4 sticky top-0 left-0 z-50 backdrop-blur-xl">
      <div className=" items-center  flex justify-between  max-w-7xl mx-auto">
        <Link
          href="/"
          className="h-10 w-10 bg-primary rounded-md flex items-center justify-center"
        >
          <Salad className="" />
        </Link>

        <div className="flex gap-4">
          <Button asChild variant="secondary" className="bg-primary font-mono">
            <Link href={"/meal-plan"}>
              <Home />
              Home
            </Link>
          </Button>
          <Button asChild variant="secondary" className="bg-primary font-mono">
            <Link href={"/meal-plan"}>
              <Pizza />
              Meal Plan
            </Link>
          </Button>
        </div>

        <div className="flex gap-4">
          <SignedIn>
            <div className="flex gap-4">
              {user?.imageUrl && <UserButton />}

              <Button asChild variant="outline">
                <SignOutButton />
              </Button>
            </div>
          </SignedIn>

          <SignedOut>
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </SignedOut>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
};
export default Navbar;
