"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Section {
  id: number;
  name: string;
  description: string | null;
}

export default function StudySetupPage() {
  const [section, setSection] = useState<Section | null>(null);
  const [sessionLength, setSessionLength] = useState(10);
  const [focusMode, setFocusMode] = useState("all");
  const [studyMode, setStudyMode] = useState("flashcard");
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const sectionId = params.sectionId;
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (!sectionId) {
      router.replace("/sections");
      return;
    }
    async function fetchSection() {
      if (status === 'authenticated') {
        try {
          const response = await fetch(`/api/sections/${sectionId}`);
          if (response.ok) {
            const data = await response.json();
            setSection(data);
          }
        } catch (error) {
          console.error("Failed to fetch section:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchSection();
  }, [sectionId, router, status]);

  const handleStartSession = () => {
    const sessionUrl = `/study/flashcard?sectionId=${sectionId}&length=${sessionLength}&focus=${focusMode}&mode=${studyMode}`;
    router.push(sessionUrl);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  if (!section) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Section not found.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-2 text-center">{section.name}</h2>
        <p className="text-gray-600 mb-6 text-center">{section.description}</p>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="sessionLength"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Session Length
            </label>
            <select
              id="sessionLength"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={sessionLength}
              onChange={(e) => setSessionLength(parseInt(e.target.value))}
            >
              <option value={10}>10 words</option>
              <option value={20}>20 words</option>
              <option value={50}>50 words</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="focusMode"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Focus Mode
            </label>
            <select
              id="focusMode"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={focusMode}
              onChange={(e) => setFocusMode(e.target.value)}
            >
              <option value="all">Mix of all words</option>
              <option value="difficult">Focus on difficult words</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="studyMode"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Study Mode
            </label>
            <select
              id="studyMode"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={studyMode}
              onChange={(e) => setStudyMode(e.target.value)}
            >
              <option value="flashcard">Classic Flashcards</option>
              <option value="quiz">Multiple Choice Quiz</option>
              <option value="typing">Typing Practice</option>
            </select>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={handleStartSession}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Start Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}