import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function AuthoritySignInPage() {
  return (
    <div className="flex justify-center items-center bg-blue-50 min-h-screen">
      <div className="w-full max-w-md">
        <Link
          href="/sign-in"
          className="inline-block mb-4 text-gray-500 text-sm hover:underline"
        >
          ← Back
        </Link>
        <h1 className="mb-2 font-bold text-blue-700 text-2xl text-center">
          🏛️ Authority Portal
        </h1>
        <p className="mb-6 text-gray-500 text-sm text-center">
          SajhaSamasya — Authority Access
        </p>
        <SignIn afterSignInUrl="/authority/dashboard" />
        <p className="mt-4 text-gray-400 text-xs text-center">
          Don&apos;t have an authority account?{" "}
          <Link
            href="/authority/sign-up"
            className="text-blue-600 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
