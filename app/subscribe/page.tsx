"use client";
import { Button } from "@/components/ui/button";
import { availablePlans } from "@/lib/plan";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { CheckCircleIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type SubscribeResponse = {
  url: string;
};

type SubcribeError = {
  error: string;
};

async function subscribeToPlan(
  planType: string,
  userId: string,
  email: string
): Promise<SubscribeResponse> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      planType,
      userId,
      email,
    }),
  });
  if (!response.ok) {
    const errorData: SubcribeError = await response.json();
    throw new Error(errorData.error || "Something went wrong");
  }
  const data: SubscribeResponse = await response.json();
  return data;
}
const SubcribePage = () => {
  const { user } = useUser();

  const userId = user?.id;
  const email = user?.emailAddresses[0].emailAddress || "";
  const { mutate, isPending } = useMutation<
    SubscribeResponse,
    Error,
    { planType: string }
  >({
    mutationFn: async ({ planType }) => {
      if (!userId) {
        throw new Error("User not signed in");
      }
      return subscribeToPlan(planType, userId, email);
    },
    onMutate: () => {
      toast.loading("Processing subscription");
    },
    onSuccess: (data) => (window.location.href = data.url),
    onError: () => toast.error("Something went wrong."),
  });
  const router = useRouter();
  const handleSubscribeFn = (planType: string) => {
    if (!userId) router.push("/sign-in");
    mutate({ planType });
  };
  return (
    <div className="max-w-6xl mx-auto flex items-center flex-col">
      <div className="space-y-4 mb-12 flex flex-col items-center">
        <h2 className="text-3xl font-bold t">Pricing</h2>
        <p className="text-muted-foreground">
          Get started on our weekly plan or upgrade to the monthly or yearly
          plan when you're ready
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {availablePlans.map((plan, index) => (
          <div
            key={index}
            className="p-6 border-primary-foreground border relative rounded-lg w-[350px] hover:scale-105 transition-all duration-300 ease-in-out"
          >
            <div>
              {plan.isPopular && (
                <p className="absolute -top-3 left-6 px-4 font-semibold bg-primary rounded-full uppercase text-xs py-1">
                  Most Popular
                </p>
              )}
              <h3 className="text-lg font-semibold mb-4">{plan.name}</h3>
              <p className="font-bold">
                <span className="text-4xl ">${plan.amount}</span>/
                <span>{plan.interval}</span>
              </p>
              <p className="text-muted-foreground text-sm my-6">
                {plan.description}
              </p>
              <ul className="mb-8 space-y-4">
                {plan.features.map((feature, key) => (
                  <li key={key} className="flex gap-2">
                    <CheckCircleIcon className="text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              className={`w-full bg-primary/30 text-primary hover:text-white mt-4 ${
                plan.isPopular && "bg-primary text-white font-semibold"
              }`}
              onClick={() => handleSubscribeFn(plan.interval)}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  "Please wait.."
                  <Loader2 className="animate-spin" />
                </>
              ) : (
                `Subscribe ${plan.name}`
              )}
            </Button>
          </div>
        ))}
      </div>
      <div></div>
    </div>
  );
};
export default SubcribePage;
