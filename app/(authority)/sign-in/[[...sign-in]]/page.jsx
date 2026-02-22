import { SignIn } from "@clerk/nextjs";

export default function AuthoritySignInPage() {
  return (
    <div className="flex justify-center items-center bg-blue-50 min-h-screen">
      <div className="w-full max-w-md">
        <h1 className="mb-2 font-bold text-blue-700 text-2xl text-center">
          🏛️ Authority Portal
        </h1>
        <p className="mb-6 text-gray-500 text-center">
          SajhaSamasaya — Authority Access
        </p>
        <SignIn afterSignInUrl="/authority/dashboard" />
      </div>
    </div>
  );
}
