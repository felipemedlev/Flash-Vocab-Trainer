"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Section {
  id: number;
  name: string;
  description: string | null;
  totalWords: number;
  learnedWords: number;
}

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSections() {
      try {
        const response = await fetch("/api/sections");
        if (response.ok) {
          const data = await response.json();
          setSections(data);
        }
      } catch (error) {
        console.error("Failed to fetch sections:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSections();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Select a Section</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link href={`/study/${section.id}`} key={section.id}>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
              <h2 className="text-2xl font-bold mb-2">{section.name}</h2>
              <p className="text-gray-600 mb-4 flex-grow">
                {section.description}
              </p>
              <p className="text-gray-800 font-semibold">
                {section.learnedWords} / {section.totalWords} words learned
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}