import { ArrowLeft, Calendar, Layers, Printer, Search, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface PrintWrapperProps {
  documentTitle: string;
  children: React.ReactNode;
  showStudentPicker?: boolean;
  showClassSemesterPicker?: boolean;
  orientation?: 'portrait' | 'landscape';
}

export const PrintWrapper: React.FC<PrintWrapperProps> = ({
  documentTitle,
  children,
  showStudentPicker = true,
  showClassSemesterPicker = false,
  orientation = 'portrait'
}) => {
  const {
    setActiveView,
    students,
    studentsForActiveYear,
    academicYear,
    setAcademicYear,
    availableAcademicYears,
    selectedStudentId,
    setSelectedStudentId,
    getStudentById,
    selectedClass,
    setSelectedClass,
    selectedSemester,
    setSelectedSemester,
    rombelList
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const activeStudents = studentsForActiveYear;

  const filteredStudents = activeStudents.filter(s =>
    s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.nisn && s.nisn.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePrint = () => {
    window.print();
  };

  const currentStudent = activeStudents.find(s => s.id === selectedStudentId) || activeStudents[0];

  return (
    <div className="min-h-screen bg-slate-700 text-slate-900 flex flex-col">
      {/* Top Controls Toolbar (Hidden when printing) */}
      <header className="print:hidden bg-slate-900 text-white p-3 sm:p-4 sticky top-0 z-50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setActiveView('dashboard')}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Menu Utama</span>
          </button>
          <div className="border-l border-slate-700 pl-3">
            <h1 className="font-extrabold text-sm sm:text-base text-emerald-400 uppercase tracking-wide">
              {documentTitle}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Global Academic Year Selector in Toolbar */}
          <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-amber-400/50">
            <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="text-[10px] font-extrabold text-amber-300 uppercase">T.A:</span>
            <select
              value={academicYear.tahunAjaran}
              onChange={e => setAcademicYear(prev => ({ ...prev, tahunAjaran: e.target.value }))}
              className="bg-slate-900 text-amber-300 border border-amber-500/40 rounded-lg px-2 py-0.5 text-xs font-black focus:outline-none focus:ring-1 focus:ring-amber-300 cursor-pointer"
            >
              {availableAcademicYears.map(yr => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {showClassSemesterPicker && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
              {/* Class/Rombel Selector */}
              <div className="flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                <span className="text-[10px] font-bold text-slate-300 uppercase">Kelas:</span>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="bg-slate-900 text-emerald-300 border border-slate-700 rounded-lg px-2 py-1 text-xs font-black focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {rombelList.map(r => (
                    <option key={r} value={r}>
                      {String(r).startsWith('Tingkat') ? r : `Tingkat ${r}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester Selector */}
              <div className="flex items-center space-x-1 border-l border-slate-700 pl-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[10px] font-bold text-slate-300 uppercase">Sem:</span>
                <select
                  value={selectedSemester}
                  onChange={e => setSelectedSemester(Number(e.target.value) as 1 | 2)}
                  className="bg-slate-900 text-emerald-300 border border-slate-700 rounded-lg px-2 py-1 text-xs font-black focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value={1}>Semester 1 (Ganjil)</option>
                  <option value={2}>Semester 2 (Genap)</option>
                </select>
              </div>
            </div>
          )}

          {showStudentPicker && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Quick Search Input */}
              <div className="relative min-w-[150px] sm:w-44">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama / NIS..."
                  value={searchQuery}
                  onChange={e => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    const matches = activeStudents.filter(s =>
                      s.namaLengkap.toLowerCase().includes(val.toLowerCase()) ||
                      s.nis.toLowerCase().includes(val.toLowerCase())
                    );
                    if (matches.length > 0 && !matches.some(m => m.id === selectedStudentId)) {
                      setSelectedStudentId(matches[0].id);
                    }
                  }}
                  className="w-full pl-8 pr-7 py-1.5 bg-slate-800 text-white border border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-white p-0.5 rounded-full"
                    title="Bersihkan"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Student Dropdown */}
              <div className="flex items-center space-x-1.5">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={currentStudent ? currentStudent.id : ''}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[180px] sm:max-w-[240px] truncate cursor-pointer"
                >
                  {filteredStudents.length === 0 ? (
                    <option value="" disabled>Siswa tidak ditemukan (T.A {academicYear.tahunAjaran})</option>
                  ) : (
                    filteredStudents.map((s, idx) => (
                      <option key={`${s.id}-${idx}`} value={s.id}>
                        {s.nis} - {s.namaLengkap}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          )}

          <button
            onClick={handlePrint}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 shadow-lg transition cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Export PDF</span>
          </button>
        </div>
      </header>

      {/* Printable Sheet Canvas Container */}
      <main className="flex-1 p-2 sm:p-8 flex justify-center items-start overflow-y-auto">
        <div className={`bg-white text-black p-6 sm:p-10 shadow-2xl rounded-none w-full print:shadow-none print:m-0 print:w-full print:max-w-none print:p-0 ${
          orientation === 'landscape' ? 'max-w-[297mm] min-h-[210mm]' : 'max-w-[210mm] min-h-[297mm]'
        }`}>
          {children}
        </div>
      </main>

      {/* Embedded CSS for Print Styling */}
      <style>{`
        @media print {
          html, body {
            background-color: white !important;
            color: black !important;
            font-size: 10pt !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          tr, .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          @page {
            size: A4 ${orientation};
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
};
