import { Button } from "@/components/ui/button";
import { CheckSquare, File, UserLock } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="px-4 py8 sm:py-12 lg:py-16 max-w-7xl mx-auto text-white font-sans">
      <section className="bg-gradient-to-r from-primary/80 to-primary/50 rounded-lg mb-12 p-8 text-center ">
        <h1 className="text-4xl font-bold mb-4">Personalized AI Meal Plans</h1>
        <p className="font-sans">
          Let our AI do the planning. You focus on cooking and enjoying!
        </p>
        <Button asChild className="mt-12 text-white">
          <Link href="/meal-plan">Get Started</Link>
        </Button>
      </section>

      <div className="space-y-6">
        <div className="flex items-center justify-center flex-col gap-2">
          <h1 className="text-lg font-bold">How It Works</h1>
          <p className="text-muted-foreground">
            Follow these simple steps to get your personlized meal plan
          </p>
        </div>
        <div className="flex gap-4 flex-col md:flex-row sm:px-8 md:px-0">
          <div className="flex justify-between gap-4 items-center flex-col border border-primary/50 rounded-lg p-8 hover:border-primary">
            <div className="rounded-full h-12 w-12 flex items-center justify-center bg-primary">
              <UserLock />
            </div>
            <div className="flex items-center flex-col max-w-sm w-full">
              <h1 className="text-lg text-muted-foreground">
                Create an Account
              </h1>
              <p className="text-muted-foreground  text-center text-sm">
                Sign up or sign in to access your personalized meal plans
              </p>
            </div>
          </div>
          <div className="flex justify-between gap-4 items-center flex-col border border-primary/50 rounded-lg p-8">
            <div className="rounded-full h-12 w-12 flex items-center justify-center bg-primary">
              <File />
            </div>
            <div className="flex items-center flex-col max-w-sm w-full">
              <h1 className="text-lg text-muted-foreground">
                Set Your Preferences
              </h1>
              <p className="text-muted-foreground  text-center text-sm">
                Input your dietary preferences and goals to tailor your meal
                plans
              </p>
            </div>
          </div>
          <div className="flex justify-between gap-4 items-center flex-col border border-primary/50 rounded-lg p-8">
            <div className="rounded-full h-12 w-12 flex items-center justify-center bg-primary">
              <CheckSquare />
            </div>
            <div className="flex items-center flex-col max-w-sm w-full">
              <h1 className="text-lg text-muted-foreground">
                Receive Your Meal Plan
              </h1>
              <p className="text-muted-foreground  text-center text-sm">
                Get your customized meal plan delivered weekly to your account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
