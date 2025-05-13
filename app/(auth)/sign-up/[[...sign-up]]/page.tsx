import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="w-full flex mt-24 justify-center h-full">
      <SignUp signInFallbackRedirectUrl={"/create-profile"} />
    </main>
  );
}
