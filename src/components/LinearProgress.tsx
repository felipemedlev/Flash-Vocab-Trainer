'use client';

interface LinearProgressProps {
  value: number;
}

export function LinearProgress({ value }: LinearProgressProps) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5">
      <div
        className="bg-gradient-to-r from-correct to-green-700 h-2.5 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}