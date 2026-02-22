"use client";

import { useUser } from "@clerk/nextjs";
import { ClipboardList, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AuthorityDashboard() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="border-blue-600 border-t-2 rounded-full w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bold text-blue-700 text-2xl">
          🏛️ Authority Dashboard
        </h1>
        <p className="text-gray-500 text-sm">
          Welcome back, {user?.firstName || "Officer"}
        </p>
      </div>

      {/* Stats cards */}
      <div className="gap-3 grid grid-cols-2 mb-8">
        <div className="bg-white p-4 border rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-4 h-4 text-blue-500" />
            <span className="text-gray-500 text-xs">Total Reports</span>
          </div>
          <p className="font-bold text-2xl">0</p>
        </div>
        <div className="bg-white p-4 border rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-500 text-xs">Pending</span>
          </div>
          <p className="font-bold text-2xl">0</p>
        </div>
        <div className="bg-white p-4 border rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-500 text-xs">Resolved</span>
          </div>
          <p className="font-bold text-2xl">0</p>
        </div>
        <div className="bg-white p-4 border rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-gray-500 text-xs">Urgent</span>
          </div>
          <p className="font-bold text-2xl">0</p>
        </div>
      </div>

      {/* Recent reports placeholder */}
      <div>
        <h2 className="mb-3 font-semibold text-gray-700">Recent Reports</h2>
        <div className="flex flex-col items-center gap-2 py-12 border border-dashed rounded-xl text-center">
          <ClipboardList className="w-8 h-8 text-gray-300" />
          <p className="text-gray-400 text-sm">No reports assigned yet.</p>
          <p className="text-gray-400 text-xs">
            Reports from citizens will appear here.
          </p>
        </div>
      </div>

      {/* Quick link */}
      <div className="mt-6 text-center">
        <Link href="/" className="text-blue-600 text-sm hover:underline">
          ← View public feed
        </Link>
      </div>
    </div>
  );
}
