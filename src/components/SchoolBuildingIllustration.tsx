import React from 'react';

export const GrandSchoolBuildingIllustration: React.FC = () => {
  return (
    <div className="w-full relative overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-100 rounded-2xl border-2 border-white/60 shadow-2xl p-4 sm:p-6 text-slate-800">
      {/* Animated Clouds & Sun */}
      <div className="absolute top-2 left-6 animate-pulse opacity-90">
        <svg className="w-12 h-12 text-amber-300 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" />
          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
        </svg>
      </div>

      <div className="absolute top-4 right-12 opacity-80 animate-bounce duration-1000">
        <svg className="w-16 h-8 text-white fill-current" viewBox="0 0 24 12">
          <path d="M 0,8 A 4,4 0 0,1 6,4 A 5,5 0 0,1 16,4 A 4,4 0 0,1 24,8 A 2,2 0 0,1 22,10 L 2,10 A 2,2 0 0,1 0,8 Z" />
        </svg>
      </div>

      {/* Main Vector School Building Container */}
      <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10 pt-2">
        
        {/* SVG Drawing of Grand SD Building */}
        <svg className="w-full max-w-2xl h-48 sm:h-64 drop-shadow-xl" viewBox="0 0 800 360" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ground & Grass */}
          <rect x="0" y="300" width="800" height="60" fill="#22c55e" />
          <rect x="0" y="315" width="800" height="45" fill="#15803d" />
          {/* Paved Front Yard Walkway */}
          <polygon points="320,360 480,360 450,300 350,300" fill="#cbd5e1" />
          <line x1="320" y1="360" x2="350" y2="300" stroke="#94a3b8" strokeWidth="3" />
          <line x1="480" y1="360" x2="450" y2="300" stroke="#94a3b8" strokeWidth="3" />

          {/* Side Wings (Left & Right Building Blocks) */}
          {/* Left Wing */}
          <rect x="100" y="180" width="180" height="120" fill="#f8fafc" stroke="#334155" strokeWidth="3" />
          <polygon points="90,180 190,120 290,180" fill="#dc2626" stroke="#334155" strokeWidth="3" /> {/* Roof */}
          {/* Left Wing Windows */}
          <rect x="120" y="200" width="35" height="40" fill="#38bdf8" stroke="#0369a1" strokeWidth="2" />
          <rect x="175" y="200" width="35" height="40" fill="#38bdf8" stroke="#0369a1" strokeWidth="2" />
          <rect x="230" y="200" width="35" height="40" fill="#38bdf8" stroke="#0369a1" strokeWidth="2" />

          {/* Right Wing */}
          <rect x="520" y="180" width="180" height="120" fill="#f8fafc" stroke="#334155" strokeWidth="3" />
          <polygon points="510,180 610,120 710,180" fill="#dc2626" stroke="#334155" strokeWidth="3" /> {/* Roof */}
          {/* Right Wing Windows */}
          <rect x="535" y="200" width="35" height="40" fill="#38bdf8" stroke="#0369a1" strokeWidth="2" />
          <rect x="590" y="200" width="35" height="40" fill="#38bdf8" stroke="#0369a1" strokeWidth="2" />
          <rect x="645" y="200" width="35" height="40" fill="#38bdf8" stroke="#0369a1" strokeWidth="2" />

          {/* Main Center Building Block (Grand Central Hall) */}
          <rect x="260" y="130" width="280" height="170" fill="#ffffff" stroke="#334155" strokeWidth="4" />
          {/* Grand Main Roof */}
          <polygon points="240,130 400,60 560,130" fill="#b91c1c" stroke="#334155" strokeWidth="4" />
          
          {/* Pediment Gold Signboard */}
          <polygon points="280,125 400,80 520,125" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
          <text x="400" y="112" textAnchor="middle" fill="#78350f" fontSize="18" fontWeight="900" fontFamily="Arial, sans-serif">SD NEGERI</text>

          {/* Clock / Crest Tower on Roof */}
          <rect x="360" y="20" width="80" height="45" fill="#f1f5f9" stroke="#334155" strokeWidth="3" />
          <polygon points="350,20 400,0 450,20" fill="#dc2626" stroke="#334155" strokeWidth="3" />
          <circle cx="400" cy="42" r="14" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
          <line x1="400" y1="42" x2="400" y2="33" stroke="#000" strokeWidth="2" />
          <line x1="400" y1="42" x2="407" y2="42" stroke="#000" strokeWidth="2" />

          {/* Pillars (Columns) */}
          <rect x="290" y="190" width="16" height="110" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
          <rect x="345" y="190" width="16" height="110" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
          <rect x="439" y="190" width="16" height="110" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
          <rect x="494" y="190" width="16" height="110" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />

          {/* 2nd Floor Center Windows */}
          <rect x="300" y="145" width="45" height="35" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
          <rect x="377" y="145" width="46" height="35" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" /> {/* Lighted Window */}
          <rect x="455" y="145" width="45" height="35" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />

          {/* Grand Double Entrance Door */}
          <rect x="370" y="215" width="60" height="85" fill="#78350f" stroke="#451a03" strokeWidth="3" />
          <rect x="375" y="220" width="22" height="75" fill="#92400e" stroke="#451a03" strokeWidth="1" />
          <rect x="403" y="220" width="22" height="75" fill="#92400e" stroke="#451a03" strokeWidth="1" />
          <circle cx="393" cy="260" r="3" fill="#fef08a" />
          <circle cx="407" cy="260" r="3" fill="#fef08a" />

          {/* Flagpole & Waving Indonesian Flag */}
          {/* Flagpole */}
          <line x1="210" y1="310" x2="210" y2="130" stroke="#94a3b8" strokeWidth="4" />
          <circle cx="210" cy="128" r="4" fill="#f59e0b" />
          {/* Flag (Red and White) */}
          <g className="animate-pulse">
            <rect x="212" y="132" width="55" height="18" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
            <rect x="212" y="150" width="55" height="18" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          </g>

          {/* Garden Bushes & Trees */}
          {/* Left Bush */}
          <circle cx="70" cy="295" r="25" fill="#16a34a" />
          <circle cx="90" cy="290" r="20" fill="#22c55e" />
          <circle cx="50" cy="300" r="18" fill="#15803d" />

          {/* Right Bush */}
          <circle cx="730" cy="295" r="25" fill="#16a34a" />
          <circle cx="710" cy="290" r="20" fill="#22c55e" />
          <circle cx="750" cy="300" r="18" fill="#15803d" />

          {/* Flowers */}
          <circle cx="80" cy="305" r="4" fill="#f43f5e" />
          <circle cx="95" cy="310" r="4" fill="#f59e0b" />
          <circle cx="720" cy="305" r="4" fill="#f43f5e" />
          <circle cx="735" cy="310" r="4" fill="#3b82f6" />
        </svg>

        <div className="text-center mt-2">
          <span className="inline-block bg-white/90 text-emerald-900 font-extrabold text-xs sm:text-sm px-4 py-1.5 rounded-full shadow border border-emerald-300 uppercase tracking-wider">
            Gedung Sekolah Dasar Negeri Berkarakter & Megah
          </span>
        </div>
      </div>
    </div>
  );
};
