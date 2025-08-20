"use client";

import React from 'react';

const ProgressChart = () => {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-4">Progress Chart</h2>
      <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Chart will be displayed here</p>
      </div>
    </div>
  );
};

export default ProgressChart;