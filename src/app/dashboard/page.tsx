"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ProgressChart = dynamic(
  () => import("./components/ProgressChart"),
  { ssr: false }
);

interface DashboardData {
  wordsLearned: number;
  sectionsCompleted: number;
  studyStreak: number;
}

export default function DashboardPage() {
  const { data: _session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/dashboard");
          if (!response.ok) {
            throw new Error("Failed to fetch dashboard data");
          }
          const data = await response.json();
          setDashboardData(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [status]);

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (status === "authenticated" && dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="text-lg font-semibold">Words Learned</h3>
            <p className="text-3xl font-bold">{dashboardData.wordsLearned}</p>
          </div>
          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="text-lg font-semibold">Sections Completed</h3>
            <p className="text-3xl font-bold">{dashboardData.sectionsCompleted}</p>
          </div>
          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="text-lg font-semibold">Study Streak</h3>
            <p className="text-3xl font-bold">{dashboardData.studyStreak} days</p>
          </div>
        </div>

        <ProgressChart />
      </div>
    );
  }

  return null;
}