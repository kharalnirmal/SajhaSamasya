import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center bg-gray-50 min-h-screen">
      <div className="w-full max-w-md">
        <h1 className="mb-6 font-bold text-green-700 text-2xl text-center">
          🏔️ SajhaSamasaya
        </h1>
        <SignIn />
      </div>
    </div>
  );
}
