import React from 'react';

export const StudentGroupIllustrationLeft: React.FC = () => {
  return (
    <div className="flex items-end space-x-1 sm:space-x-2 select-none pointer-events-none">
      {/* Sun icon */}
      <div className="absolute -top-8 left-4 animate-bounce duration-1000">
        <svg className="w-8 h-8 text-amber-300 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Girl 1 with Hijab */}
      <div className="flex flex-col items-center">
        {/* Head + Hijab */}
        <div className="w-8 h-9 bg-white rounded-t-full border-2 border-gray-800 relative flex items-center justify-center">
          <div className="w-5 h-5 bg-amber-100 rounded-full border border-amber-300 flex items-center justify-center">
            <div className="flex space-x-1">
              <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
              <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
            </div>
          </div>
        </div>
        {/* Shirt */}
        <div className="w-8 h-6 bg-white border-2 border-gray-800 flex flex-col items-center justify-start">
          <div className="w-1.5 h-3 bg-red-600 rounded-b"></div>
        </div>
        {/* Skirt */}
        <div className="w-10 h-7 bg-red-600 rounded-b border-2 border-gray-800"></div>
        {/* Legs */}
        <div className="flex space-x-2">
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
        </div>
      </div>

      {/* Girl 2 with Pigtails */}
      <div className="flex flex-col items-center">
        {/* Head */}
        <div className="w-7 h-7 bg-amber-100 rounded-full border-2 border-gray-800 relative flex flex-col items-center justify-center">
          {/* Hair pigtails */}
          <div className="absolute -top-1 -left-2 w-3 h-3 bg-amber-900 rounded-full"></div>
          <div className="absolute -top-1 -right-2 w-3 h-3 bg-amber-900 rounded-full"></div>
          <div className="flex space-x-1 mb-0.5">
            <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
            <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
          </div>
          <div className="w-2 h-0.5 bg-red-500 rounded-full"></div>
        </div>
        {/* Shirt */}
        <div className="w-7 h-5 bg-white border-2 border-gray-800 flex justify-center">
          <div className="w-1 h-3 bg-red-600"></div>
        </div>
        {/* Skirt */}
        <div className="w-9 h-6 bg-red-600 border-2 border-gray-800"></div>
        {/* Legs */}
        <div className="flex space-x-2">
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
        </div>
      </div>

      {/* Boy 1 with Songkok / Cap */}
      <div className="flex flex-col items-center">
        {/* Head */}
        <div className="w-7 h-7 bg-amber-100 rounded-full border-2 border-gray-800 relative flex flex-col items-center justify-center">
          <div className="absolute -top-2 w-6 h-2 bg-gray-900 rounded-t-sm"></div>
          <div className="flex space-x-1 mb-0.5">
            <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
            <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
          </div>
        </div>
        {/* Shirt */}
        <div className="w-7 h-6 bg-white border-2 border-gray-800 flex justify-center">
          <div className="w-1.5 h-3.5 bg-red-600"></div>
        </div>
        {/* Shorts */}
        <div className="w-8 h-5 bg-red-600 border-2 border-gray-800 flex justify-between px-1">
          <div className="w-3 h-full border-r border-gray-800"></div>
          <div className="w-3 h-full"></div>
        </div>
        {/* Legs */}
        <div className="flex space-x-2">
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
        </div>
      </div>

      {/* Boy 2 waving */}
      <div className="flex flex-col items-center">
        {/* Head */}
        <div className="w-7 h-7 bg-amber-100 rounded-full border-2 border-gray-800 relative flex flex-col items-center justify-center">
          <div className="absolute -top-1 w-7 h-3 bg-amber-900 rounded-t-full"></div>
          <div className="flex space-x-1 mb-0.5">
            <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
            <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
          </div>
        </div>
        {/* Shirt */}
        <div className="w-7 h-6 bg-white border-2 border-gray-800 flex justify-center relative">
          <div className="w-1.5 h-3.5 bg-red-600"></div>
          {/* Book held */}
          <div className="absolute -right-2 top-1 w-3 h-4 bg-sky-500 border border-gray-800"></div>
        </div>
        {/* Shorts */}
        <div className="w-8 h-5 bg-red-600 border-2 border-gray-800"></div>
        {/* Legs */}
        <div className="flex space-x-2">
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
        </div>
      </div>
    </div>
  );
};

export const StudentGroupIllustrationRight: React.FC = () => {
  return (
    <div className="flex items-end space-x-1 sm:space-x-2 select-none pointer-events-none">
      {/* Sun icon right */}
      <div className="absolute -top-8 right-4 animate-bounce duration-1000">
        <svg className="w-8 h-8 text-amber-300 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Girl 1 with Hijab */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-9 bg-white rounded-t-full border-2 border-gray-800 relative flex items-center justify-center">
          <div className="w-5 h-5 bg-amber-100 rounded-full border border-amber-300 flex items-center justify-center">
            <div className="flex space-x-1">
              <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
              <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
            </div>
          </div>
        </div>
        <div className="w-8 h-6 bg-white border-2 border-gray-800 flex flex-col items-center justify-start">
          <div className="w-1.5 h-3 bg-red-600 rounded-b"></div>
        </div>
        <div className="w-10 h-7 bg-red-600 rounded-b border-2 border-gray-800"></div>
        <div className="flex space-x-2">
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
        </div>
      </div>

      {/* Girl 2 smiling */}
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 bg-amber-100 rounded-full border-2 border-gray-800 relative flex flex-col items-center justify-center">
          <div className="absolute -top-1 -left-2 w-3 h-3 bg-amber-900 rounded-full"></div>
          <div className="absolute -top-1 -right-2 w-3 h-3 bg-amber-900 rounded-full"></div>
          <div className="flex space-x-1 mb-0.5">
            <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
            <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
          </div>
        </div>
        <div className="w-7 h-5 bg-white border-2 border-gray-800 flex justify-center">
          <div className="w-1 h-3 bg-red-600"></div>
        </div>
        <div className="w-9 h-6 bg-red-600 border-2 border-gray-800"></div>
        <div className="flex space-x-2">
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
        </div>
      </div>

      {/* Boy 1 */}
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 bg-amber-100 rounded-full border-2 border-gray-800 relative flex flex-col items-center justify-center">
          <div className="absolute -top-2 w-6 h-2 bg-gray-900 rounded-t-sm"></div>
          <div className="flex space-x-1 mb-0.5">
            <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
            <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
          </div>
        </div>
        <div className="w-7 h-6 bg-white border-2 border-gray-800 flex justify-center">
          <div className="w-1.5 h-3.5 bg-red-600"></div>
        </div>
        <div className="w-8 h-5 bg-red-600 border-2 border-gray-800"></div>
        <div className="flex space-x-2">
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
        </div>
      </div>

      {/* Boy 2 holding book */}
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 bg-amber-100 rounded-full border-2 border-gray-800 relative flex flex-col items-center justify-center">
          <div className="absolute -top-1 w-7 h-3 bg-amber-900 rounded-t-full"></div>
          <div className="flex space-x-1 mb-0.5">
            <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
            <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
          </div>
        </div>
        <div className="w-7 h-6 bg-white border-2 border-gray-800 flex justify-center relative">
          <div className="w-1.5 h-3.5 bg-red-600"></div>
          <div className="absolute -left-2 top-1 w-3 h-4 bg-emerald-500 border border-gray-800"></div>
        </div>
        <div className="w-8 h-5 bg-red-600 border-2 border-gray-800"></div>
        <div className="flex space-x-2">
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
          <div className="w-1.5 h-3 bg-amber-100 border border-gray-800"></div>
        </div>
      </div>
    </div>
  );
};
