"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Section {
  id: number;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdByUserId: number | null;
  createdAt: string;
  words: any[]; // Assuming words are not directly used here, or can be typed more specifically if needed
}

export default function StudySetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionId = searchParams.get("sectionId");
  const { data: _session, status } = useSession();

  const [sectionName, setSectionName] = useState("Loading Section...");
  const [totalWordsInSections, setTotalWordsInSections] = useState(0);
  const [sessionLength, setSessionLength] = useState(10);
  const [studyMode, setStudyMode] = useState<"all" | "difficult">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSectionDetails = async () => {
      if (!sectionId) {
        setError("No section ID provided.");
        setLoading(false);
        return;
      }
      if (status === "authenticated") {
        try {
          const response = await fetch(`/api/sections?id=${sectionId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          // Assuming the API returns an array, find the specific section
          const currentSection = data.find((s: Section) => s.id === parseInt(sectionId));
          if (currentSection) {
            setSectionName(currentSection.name);
            setTotalWordsInSections(currentSection.totalWords);
          } else {
            setError("Section not found.");
          }
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSectionDetails();
  }, [sectionId, status]);

  const estimatedTime = (sessionLength / 10) * 1; // Estimate 1 minute per 10 words

  const handleStartStudy = () => {
    if (sectionId) {
      router.push(`/study/flashcard?sectionId=${sectionId}&length=${sessionLength}&mode=${studyMode}`);
    }
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  if (status === "authenticated") {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Study Setup for {sectionName}</h1>

          <div className="mb-6">
            <label htmlFor="sessionLength" className="block text-gray-700 text-sm font-bold mb-2">
              Session Length:
            </label>
            <select
              id="sessionLength"
              value={sessionLength}
              onChange={(e) => setSessionLength(parseInt(e.target.value))}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value={10}>10 Words</option>
              <option value={20}>20 Words</option>
              <option value={50}>50 Words</option>
              <option value={totalWordsInSections}>All Words ({totalWordsInSections})</option>
            </select>
            <p className="text-gray-600 text-sm mt-2">Estimated time: {estimatedTime} minutes</p>
          </div>

          <div className="mb-6">
            <span className="block text-gray-700 text-sm font-bold mb-2">Study Mode:</span>
            <div className="mt-2">
              <label className="inline-flex items-center mr-4">
                <input
                  type="radio"
                  className="form-radio"
                  name="studyMode"
                  value="all"
                  checked={studyMode === "all"}
                  onChange={() => setStudyMode("all")}
                />
                <span className="ml-2 text-gray-700">All Words</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="studyMode"
                  value="difficult"
                  checked={studyMode === "difficult"}
                  onChange={() => setStudyMode("difficult")}
                />
                <span className="ml-2 text-gray-700">Difficult Words</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleStartStudy}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Start Study Session
          </button>
        </div>
      </div>
    );
  }

  return null;
}