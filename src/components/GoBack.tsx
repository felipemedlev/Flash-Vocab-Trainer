"use client";

import { useRouter } from "next/navigation";

export default function GoBack() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="text-blue-500 hover:underline"
    >
      &larr; Go Back
    </button>
  );
}