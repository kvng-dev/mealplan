"use client";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { Loader, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type ApiResponse = {
  message: string;
  error?: string;
};

async function CreateProfileReq() {
  const response = await fetch("/api/create-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data as ApiResponse;
}

const CreateProfile = () => {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { mutate, isPending } = useMutation<ApiResponse, Error>({
    mutationFn: CreateProfileReq,
    onSuccess: () => {
      router.push("/subscribe");
    },
    onError(error, variables, context) {
      console.log(error);
    },
  });

  useEffect(() => {
    if (isLoaded && isSignedIn && !isPending) {
      mutate();
    }
  }, [isLoaded, isSignedIn]);
  return (
    <div className="flex items-center mt-30 border border-primary/40 p-32 rounded-md">
      Creating user profile <Loader2 className="animate-spin" />
    </div>
  );
};
export default CreateProfile;
