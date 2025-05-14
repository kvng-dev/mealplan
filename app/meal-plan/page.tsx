"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { availablePlans } from "@/lib/plan";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React from "react";
interface MealPlanInput {
  dietType: string;
  calories: number;
  allergies: string;
  cuisine: string;
  snacks: string;
  days?: number;
}

interface DailyMealPlan {
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  Snacks?: string;
}

interface WeeklyMealPlan {
  [day: string]: DailyMealPlan;
}

interface MealPlanResponse {
  mealPlan?: WeeklyMealPlan;
  error?: string;
}

async function fetchSubStatus() {
  const response = await fetch("/api/profile/subscription-status");
  return response.json();
}

async function generateMealPlan(payload: MealPlanInput) {
  const response = await fetch("/api/generate-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}
const MealPlan = () => {
  const { mutate, isPending, data, isSuccess } = useMutation<
    MealPlanResponse,
    Error,
    MealPlanInput
  >({
    mutationFn: generateMealPlan,
  });

  const {
    data: subscription,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubStatus,
  });

  const currentPlan = availablePlans.find(
    (plan) => plan.interval === subscription?.subscription.subTier
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const payload: MealPlanInput = {
      dietType: formData.get("dietType")?.toString() || "",
      calories: Number(formData.get("calories") || 2000),
      allergies: formData.get("allergies")?.toString() || "",
      cuisine: formData.get("cuisine")?.toString() || "",
      snacks: formData.get("snacks")?.toString() || "",
      days: Number(formData.get("days") || 7),
    };
    mutate(payload);
  }

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const getMealPlanForDay = (day: string): DailyMealPlan | undefined => {
    if (!data?.mealPlan) return undefined;
    return data?.mealPlan[day];
  };

  return (
    <div>
      <div className="grid md:grid-cols-4 grid-cols-1 bg-muted-foreground/40 h-full rounded-lg overflow-hidden font-sans">
        <div className="bg-primary/70 px-4 py-4 space-y-4">
          <h1 className="text-xl font-semibold text-center max-w-[200px] mx-auto ">
            AI Meal Plan Generator
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dietType">Diet Type</Label>
              <Input
                className="border-white placeholder:text-white/50"
                type="text"
                name="dietType"
                id="dietType"
                required
                placeholder="e.g. Vegetarian, Vegan, Keto..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories">Daily Calorie Goal</Label>
              <Input
                className="border-white placeholder:text-white/50"
                type="number"
                name="calories"
                id="calories"
                required
                min={500}
                max={15000}
                placeholder="e.g. 2000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                className="border-white placeholder:text-white/50"
                type="text"
                name="allergies"
                id="allergies"
                required
                placeholder="e.g. Nuts, Dairy, None..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuisine">Preferred Cuisine</Label>
              <Input
                className="border-white placeholder:text-white/50"
                type="text"
                name="cuisine"
                id="cuisine"
                required
                placeholder="e.g. Italian, Chinese..."
              />
            </div>
            <div className="flex gap-2 items-center">
              <Input
                name="snacks"
                type="checkbox"
                id="snacks"
                className="inline size-4 bg-white"
              />
              <Label htmlFor="snacks">Snacks</Label>
            </div>

            <div className="my-4">
              <Button
                className="w-full text-white"
                type="submit"
                disabled={isPending || !currentPlan}
              >
                {isPending ? "Generating..." : "Generate Meal Plan"}
              </Button>
            </div>
          </form>
        </div>

        <div className="col-span-3 p-6">
          <h2 className="text-xl text-primary font-semibold mb-8">
            Weekly Meal Plan
          </h2>

          {data?.mealPlan && isSuccess ? (
            <div className="h-[600px] overflow-y-auto">
              <div className="space-y-6">
                {daysOfWeek.map((day) => {
                  const mealPlan = getMealPlanForDay(day);
                  return (
                    <div
                      key={day}
                      className="bg-white shadow-md rounded-lg p-4 border border-emerald-200"
                    >
                      <h3 className="text-xl font-semibold mb-2 text-primary">
                        {day}
                      </h3>
                      {mealPlan ? (
                        <div className="space-y-2 text-muted">
                          <div></div>
                          <div>
                            <strong>Lunch:</strong> {mealPlan.Lunch}
                          </div>
                          <div>
                            <strong>Dinner:</strong> {mealPlan.Dinner}
                          </div>
                          {mealPlan.Snacks && (
                            <div>
                              <strong>Snacks:</strong> {mealPlan.Snacks}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>No meal plan available.</>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isPending ? (
            <Loader2 className="animate-spin text-primary" />
          ) : (
            <p>Please generate a meal plan to see it here.</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default MealPlan;
