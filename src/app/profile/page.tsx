"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    async function fetchProfileData() {
      if (session?.user) {
        setUsername(session.user.name || "");
        setEmail(session.user.email || "");

        try {
          const response = await fetch("/api/profile");
          if (response.ok) {
            const data = await response.json();
            setCurrentStreak(data.user.currentStreak);
            setLongestStreak(data.user.longestStreak);
          }
        } catch (err) {
          console.error("Failed to fetch profile data:", err);
        }
      }
    }
    fetchProfileData();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
      } else {
        setError(data.message || "Profile update failed.");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Access Denied</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>
        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
          <div>
            <p className="text-2xl font-bold">{currentStreak}</p>
            <p className="text-sm text-gray-600">Current Streak</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{longestStreak}</p>
            <p className="text-sm text-gray-600">Longest Streak</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-sm text-center">{success}</p>
          )}
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}