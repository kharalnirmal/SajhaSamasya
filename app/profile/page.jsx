"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { Mail, Shield } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="border-green-600 border-t-2 rounded-full w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 pt-20 text-center">
        <p className="text-gray-500">
          You need to sign in to view your profile.
        </p>
        <Link
          href="/sign-in"
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-white transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const role = user.publicMetadata?.role || "citizen";

  return (
    <div className="mx-auto px-4 py-8 max-w-md">
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3">
        <UserButton
          appearance={{
            elements: { avatarBox: "w-20 h-20" },
          }}
        />
        <h2 className="font-bold text-xl">
          {user.fullName || user.firstName || "User"}
        </h2>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
            role === "authority"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          <Shield className="w-3 h-3" />
          {role === "authority" ? "Authority" : "Citizen"}
        </span>
      </div>

      {/* Info card */}
      <div className="space-y-4 bg-white shadow-sm mt-8 p-5 border rounded-xl">
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700 text-sm">
            {user.primaryEmailAddress?.emailAddress}
          </span>
        </div>
        <div className="flex items-center gap-3 text-gray-400 text-xs">
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Placeholder posts section */}
      <div className="mt-8">
        <h3 className="mb-3 font-semibold text-gray-700 text-sm">Your Posts</h3>
        <div className="flex flex-col items-center gap-2 py-10 border border-dashed rounded-xl text-center">
          <p className="text-gray-400 text-sm">No posts yet.</p>
          <a
            href="/create-post"
            className="text-green-600 text-sm hover:underline"
          >
            Create your first post →
          </a>
        </div>
      </div>
    </div>
  );
}
