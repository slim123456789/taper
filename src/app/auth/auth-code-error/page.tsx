"use client";

import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <h1 className="text-2xl font-bold text-red-500">Authentication Failed</h1>
      <p className="mt-2 text-slate-400">
        This link has expired or has already been used.
      </p>
      <Link 
        href="/" 
        className="mt-6 rounded-full bg-white px-6 py-2 text-sm font-bold text-black hover:bg-slate-200"
      >
        Try Again
      </Link>
    </div>
  );
}