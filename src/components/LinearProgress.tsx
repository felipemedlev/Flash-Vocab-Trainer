'use client';

import { useEffect, useState } from 'react';

interface LinearProgressProps {
  value: number;
  showPercentage?: boolean;
  animated?: boolean;
}

export function LinearProgress({ value, showPercentage = true, animated = true }: LinearProgressProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);

  const clampedValue = Math.min(100, Math.max(0, displayValue));

  return (
    <div className="w-full">
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-blue-600">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${clampedValue}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-transparent opacity-20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}