"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Section {
  id: number;
  name: string;
  description: string | null;
}

interface WordRow {
  id: string;
  hebrewText: string;
  englishTranslation: string;
}

export default function StudySetupPage() {
  const [section, setSection] = useState<Section | null>(null);
  const [sessionLength, setSessionLength] = useState(10);
  const [focusMode, setFocusMode] = useState("all");
  const [studyMode, setStudyMode] = useState("flashcard");
  const [loading, setLoading] = useState(true);
  const [showWordInput, setShowWordInput] = useState(false);
  const [wordRows, setWordRows] = useState<WordRow[]>([]);
  const [saving, setSaving] = useState(false);
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

  // Initialize word rows when component mounts
  useEffect(() => {
    if (wordRows.length === 0) {
      initializeWordRows();
    }
  }, [wordRows.length]);

  const initializeWordRows = () => {
    const initialRows: WordRow[] = Array.from({ length: 5 }, (_, index) => ({
      id: `row-${Date.now()}-${index}`,
      hebrewText: '',
      englishTranslation: ''
    }));
    setWordRows(initialRows);
  };

  const addNewRow = () => {
    const newRow: WordRow = {
      id: `row-${Date.now()}`,
      hebrewText: '',
      englishTranslation: ''
    };
    setWordRows([...wordRows, newRow]);
  };

  const removeRow = (id: string) => {
    if (wordRows.length > 1) {
      setWordRows(wordRows.filter(row => row.id !== id));
    }
  };

  const updateRow = (id: string, field: 'hebrewText' | 'englishTranslation', value: string) => {
    setWordRows(wordRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>, rowId: string, field: 'hebrewText' | 'englishTranslation') => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text');
    
    // Check if it's multi-line paste (from Excel)
    const lines = pastedText.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length > 1) {
      // Multi-line paste - treat as Excel data
      const currentRowIndex = wordRows.findIndex(row => row.id === rowId);
      if (currentRowIndex === -1) return;
      
      const newRows = [...wordRows];
      
      lines.forEach((line, index) => {
        const cells = line.split('\t');
        const targetIndex = currentRowIndex + index;
        
        if (targetIndex < newRows.length) {
          if (field === 'hebrewText' && cells[0]) {
            newRows[targetIndex].hebrewText = cells[0].trim();
          }
          if (cells[1] && field === 'hebrewText') {
            newRows[targetIndex].englishTranslation = cells[1].trim();
          } else if (field === 'englishTranslation' && cells[0]) {
            newRows[targetIndex].englishTranslation = cells[0].trim();
          }
        } else {
          // Add new rows if needed
          const newRow: WordRow = {
            id: `row-${Date.now()}-${index}`,
            hebrewText: field === 'hebrewText' && cells[0] ? cells[0].trim() : '',
            englishTranslation: cells[1] ? cells[1].trim() : (field === 'englishTranslation' && cells[0] ? cells[0].trim() : '')
          };
          newRows.push(newRow);
        }
      });
      
      setWordRows(newRows);
    } else {
      // Single line paste
      updateRow(rowId, field, pastedText.trim());
    }
  };

  const saveWords = async () => {
    if (!sectionId) return;
    
    const validWords = wordRows.filter(row => 
      row.hebrewText.trim() !== '' && row.englishTranslation.trim() !== ''
    );
    
    if (validWords.length === 0) {
      alert('Please add at least one word with both Hebrew and English text.');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: parseInt(sectionId as string),
          words: validWords.map(row => ({
            hebrewText: row.hebrewText.trim(),
            englishTranslation: row.englishTranslation.trim()
          }))
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`Successfully added ${result.addedCount} words!${result.duplicatesSkipped > 0 ? ` (${result.duplicatesSkipped} duplicates were skipped)` : ''}`);
        // Clear the form
        initializeWordRows();
        setShowWordInput(false);
      } else {
        alert(result.message || 'Failed to save words');
      }
    } catch (error) {
      console.error('Error saving words:', error);
      alert('Failed to save words. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
    <div className="flex items-center justify-center min-h-screen py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl mx-4">
        <h2 className="text-2xl font-bold mb-2 text-center">{section.name}</h2>
        <p className="text-gray-600 mb-6 text-center">{section.description}</p>
        
        {/* Toggle buttons */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setShowWordInput(false)}
              className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500 ${
                !showWordInput 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Study Session
            </button>
            <button
              type="button"
              onClick={() => setShowWordInput(true)}
              className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-500 ${
                showWordInput 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Add Words
            </button>
          </div>
        </div>

        {!showWordInput ? (
          /* Study Session Setup */
          <div className="space-y-6 max-w-md mx-auto">
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
        ) : (
          /* Word Input Table */
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-gray-600">Add new words to this section. You can type directly or paste from Excel (Ctrl+V).</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-bold">Hebrew</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-bold">English</th>
                    <th className="border border-gray-300 px-4 py-2 text-center font-bold w-16">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {wordRows.map((row, index) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-2">
                        <textarea
                          value={row.hebrewText}
                          onChange={(e) => updateRow(row.id, 'hebrewText', e.target.value)}
                          onPaste={(e) => handlePaste(e, row.id, 'hebrewText')}
                          placeholder="Enter Hebrew text..."
                          className="w-full min-h-[40px] resize-none border-none outline-none bg-transparent text-right"
                          dir="rtl"
                          rows={1}
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <textarea
                          value={row.englishTranslation}
                          onChange={(e) => updateRow(row.id, 'englishTranslation', e.target.value)}
                          onPaste={(e) => handlePaste(e, row.id, 'englishTranslation')}
                          placeholder="Enter English translation..."
                          className="w-full min-h-[40px] resize-none border-none outline-none bg-transparent"
                          rows={1}
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {wordRows.length > 1 && (
                          <button
                            onClick={() => removeRow(row.id)}
                            className="text-red-500 hover:text-red-700 font-bold"
                            title="Remove row"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={addNewRow}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                + Add Row
              </button>
              
              <div className="space-x-2">
                <button
                  onClick={() => {
                    initializeWordRows();
                    setShowWordInput(false);
                  }}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={saveWords}
                  disabled={saving}
                  className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                    saving 
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-700 text-white'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Words'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}