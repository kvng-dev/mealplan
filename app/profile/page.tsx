"use client";
import { availablePlans } from "@/lib/plan";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogIn } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

async function fetchSubStatus() {
  const response = await fetch("/api/profile/subscription-status");
  return response.json();
}

async function updatePlan(newPlan: string) {
  const response = await fetch("/api/profile/change-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newPlan }),
  });
  return response.json();
}

async function unsubscribe() {
  const response = await fetch("/api/profile/unsubscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

const Profile = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const queryClient = useQueryClient();
  const {
    data: subscription,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubStatus,
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000,
  });

  const currentPlan = availablePlans.find(
    (plan) => plan.interval === subscription?.subscription.subTier
  );

  const {
    data: updatedPlan,
    mutate: updatePlanMutate,
    isPending,
  } = useMutation({
    mutationFn: updatePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Plan updated successfully");
      refetch();
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.error("Error unsubscribing. Please try again!");
    },
  });

  const router = useRouter();
  const {
    data: cancelPlan,
    mutate: unsubscribeFn,
    isPending: isUnsubPending,
  } = useMutation({
    mutationFn: unsubscribe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      router.push("/subscribe");
    },
  });

  if (!isLoaded) {
    return (
      <div className="flex gap-2 items-center h-full">
        <p>Loading profile...</p>
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex gap-2 items-center h-full">
        <p>Please sign in to view your profile...</p>
        <LogIn className="" />
      </div>
    );
  }

  const handleUpdate = () => {
    if (selectedPlan) {
      updatePlanMutate(selectedPlan);
    }
    setSelectedPlan("");
  };

  const handleUnsubscribe = () => {
    unsubscribeFn();
  };

  return (
    <div className="flex w-full h-full bg-accent rounded-md overflow-hidden flex-col md:flex-row">
      <div className="bg-primary p-8 flex flex-col items-center space-y-2">
        {user.imageUrl && (
          <Image
            src={user.imageUrl}
            width={100}
            height={100}
            alt="avatar"
            className="rounded-full"
          />
        )}

        <h1 className="text-2xl text-center font-semibold leading-tight">
          {user.firstName} {user.lastName}
        </h1>
        <p className="text-muted/60 text-sm">
          {user.primaryEmailAddress?.emailAddress}
        </p>
      </div>
      <div className="p-6 flex flex-col flex-1 space-y-4">
        <h2 className="text-xl text-primary font-semibold">
          Subscription Details
        </h2>
        {isLoading ? (
          <div>
            <p>Loading Subscription...</p>
            <Loader2 className="animate-spin" />
          </div>
        ) : isError ? (
          <p>{error?.message}</p>
        ) : subscription ? (
          <div>
            {currentPlan && (
              <div className="space-y-2 border border-primary/40 p-2 rounded-md">
                <p>
                  <strong>Current Plan:</strong> {currentPlan.name}
                </p>
                <p>
                  <strong>Amount:</strong>
                  {currentPlan.amount}
                  {currentPlan.currency}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span className="bg-primary/40 text-xs rounded-full px-3 text-white ml-4">
                    ACTIVE
                  </span>
                </p>
              </div>
            )}
          </div>
        ) : (
          <p>Current plan not found</p>
        )}

        <div className="space-y-2 border border-primary/40 p-2 rounded-md">
          <h3 className="text-sm text-muted-foreground">
            Change Subscription Plan
          </h3>
          {currentPlan && (
            <Select
              onValueChange={(value: string) => setSelectedPlan(value)}
              defaultValue={currentPlan?.interval}
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {availablePlans.map((plan, key) => (
                    <SelectItem value={plan.interval} key={key}>
                      {" "}
                      {plan.name} - ${plan.amount} / {plan.interval}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
              <Button onClick={handleUpdate} type="submit" className="w-full">
                Save Change
              </Button>
              {isPending && (
                <div className="flex items-center mt-2">
                  Updating Plan <Loader2 className="animate-spin" />
                </div>
              )}
            </Select>
          )}
        </div>
        <div className="space-y-2 border border-primary/40 p-2 rounded-md">
          <AlertDialog>
            <AlertDialogTitle>Unsubscribe</AlertDialogTitle>
            <AlertDialogTrigger asChild>
              <Button className="w-full" variant="outline">
                Unsubscribe
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will lose access to premium features.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleUnsubscribe}
                  disabled={isUnsubPending}
                >
                  {isUnsubPending ? "Unsubscribing..." : "Continue"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
export default Profile;
