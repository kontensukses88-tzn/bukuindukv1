import { BookOpen, CheckCircle2, FileSpreadsheet, FileText, Plus, Save, Search, Trash2, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { useApp } from '../context/AppContext';
import { StudentSemesterRecord, SubjectGrade } from '../types';
import { ImportPdfModal } from './ImportPdfModal';
import { ImportCatatanExcelModal } from './ImportCatatanExcelModal';

export const CatatanSiswaView: React.FC = () => {
  const {
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
    getSemesterRecord,
    saveSemesterRecord,
    assessmentMode,
    setActiveView,
    rombelList
  } = useApp();

  const activeStudents = studentsForActiveYear;
  const currentStudent = activeStudents.find(s => s.id === selectedStudentId) || activeStudents[0];

  const [record, setRecord] = useState<StudentSemesterRecord>(() => {
    return getSemesterRecord(
      currentStudent?.id || '',
      selectedClass,
      selectedSemester
    );
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);

  const filteredStudents = activeStudents.filter(s =>
    s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.nisn && s.nisn.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sync state when selected student, class, or semester changes
  useEffect(() => {
    if (currentStudent) {
      setRecord(getSemesterRecord(currentStudent.id, selectedClass, selectedSemester));
    }
  }, [selectedStudentId, selectedClass, selectedSemester, currentStudent?.id]);

  const commitRecord = (rec: StudentSemesterRecord) => {
    if (!currentStudent) return;
    const cleanedGrades = rec.grades.map(g => {
      const rawScore = (g.nilaiAkhir as any);
      const rawKKM = (g.kKM as any);
      const numScore = rawScore === '' || rawScore == null ? 0 : Number(rawScore);
      const numKKM = rawKKM === '' || rawKKM == null ? 70 : Number(rawKKM);
      return {
        ...g,
        kKM: isNaN(numKKM) ? 70 : numKKM,
        nilaiPengetahuan: isNaN(numScore) ? 0 : numScore,
        nilaiKeterampilan: isNaN(numScore) ? 0 : numScore,
        nilaiAkhir: isNaN(numScore) ? 0 : numScore,
        deskripsiCapaian: g.deskripsiCapaian || ''
      };
    });

    const cleanedRecord: StudentSemesterRecord = {
      ...rec,
      studentId: currentStudent.id,
      kelas: selectedClass,
      semester: selectedSemester,
      sakit: Number(rec.sakit) || 0,
      izin: Number(rec.izin) || 0,
      tanpaKeterangan: Number(rec.tanpaKeterangan) || 0,
      grades: cleanedGrades
    };

    saveSemesterRecord(cleanedRecord);
    return cleanedRecord;
  };

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
  };

  const handleGradeChange = (index: number, field: keyof SubjectGrade, value: any) => {
    setRecord(prev => {
      const copyGrades = [...prev.grades];
      const target = { ...copyGrades[index] };

      if (field === 'nilaiAkhir' || field === 'nilaiPengetahuan' || field === 'nilaiKeterampilan') {
        const rawVal = value;
        target.nilaiAkhir = rawVal;
        target.nilaiPengetahuan = rawVal;
        target.nilaiKeterampilan = rawVal;

        const numScore = rawVal === '' || rawVal === null || rawVal === undefined ? 0 : Number(rawVal);
        if (numScore >= 90) target.predikat = 'A';
        else if (numScore >= 80) target.predikat = 'B';
        else if (numScore >= 70) target.predikat = 'C';
        else target.predikat = 'D';
      } else if (field === 'kKM') {
        target.kKM = value;
      } else {
        (target as any)[field] = value;
      }

      copyGrades[index] = target;
      const updated = { ...prev, grades: copyGrades };
      commitRecord(updated);
      return updated;
    });
  };

  const handleEskulChange = (idx: number, field: string, value: string) => {
    setRecord(prev => {
      const copyEskul = [...prev.ekstrakurikuler];
      copyEskul[idx] = { ...copyEskul[idx], [field]: value };
      const updated = { ...prev, ekstrakurikuler: copyEskul };
      commitRecord(updated);
      return updated;
    });
  };

  const addEskul = () => {
    setRecord(prev => {
      const updated = {
        ...prev,
        ekstrakurikuler: [
          ...prev.ekstrakurikuler,
          { nama: 'Olahraga / Seni', nilai: 'B', keterangan: 'Baik' }
        ]
      };
      commitRecord(updated);
      return updated;
    });
  };

  const removeEskul = (idx: number) => {
    setRecord(prev => {
      const updated = {
        ...prev,
        ekstrakurikuler: prev.ekstrakurikuler.filter((_, i) => i !== idx)
      };
      commitRecord(updated);
      return updated;
    });
  };

  const handleAttendanceChange = (field: 'sakit' | 'izin' | 'tanpaKeterangan', value: number) => {
    setRecord(prev => {
      const updated = { ...prev, [field]: value };
      commitRecord(updated);
      return updated;
    });
  };

  const handleCatatanWaliKelasChange = (value: string) => {
    setRecord(prev => {
      const updated = { ...prev, catatanWaliKelas: value };
      commitRecord(updated);
      return updated;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedRecord = commitRecord(record);
    if (cleanedRecord) setRecord(cleanedRecord);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!currentStudent) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <p className="text-slate-600">Siswa tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header
        title={`CATATAN NILAI SISWA - KELAS ${selectedClass} SEMESTER ${selectedSemester}`}
        subtitle={`Mode Aktif: ${assessmentMode === 'tanpa' ? 'Tanpa Deskripsi (Nilai Angka)' : 'Dengan Deskripsi Capaian'}`}
      />

      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 flex-1 space-y-4">
        {/* Top Selectors Panel */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          
          {/* Row 1: Student Selection & Quick Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 shrink-0">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">PILIH SISWA</h3>
                <p className="text-[11px] text-slate-500 font-medium">Pilih atau cari nama/NIS siswa</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 lg:max-w-3xl">
              {/* Academic Year Selector */}
              <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl">
                <span className="text-[11px] font-black text-emerald-800 uppercase shrink-0">T.A:</span>
                <select
                  value={academicYear.tahunAjaran}
                  onChange={e => setAcademicYear(prev => ({ ...prev, tahunAjaran: e.target.value }))}
                  className="bg-white text-emerald-950 font-extrabold text-xs px-2 py-0.5 rounded-lg border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {availableAcademicYears.map(yr => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
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
                  className="w-full pl-9 pr-7 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                    title="Bersihkan pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Student Dropdown Select */}
              <select
                value={currentStudent?.id || ''}
                onChange={e => handleStudentChange(e.target.value)}
                className="border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 truncate"
              >
                {filteredStudents.length === 0 ? (
                  <option value="" disabled>Tidak ada siswa yang cocok</option>
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

          {/* Row 2: Class/Rombel & Semester Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">Tingkat / Kelas:</span>
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200/60">
                {rombelList.map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setSelectedClass(k)}
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                      String(selectedClass) === String(k)
                        ? 'bg-emerald-600 text-white shadow-sm scale-105'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Semester:</span>
              <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 space-x-1">
                {[1, 2].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSemester(s as 1 | 2)}
                    className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                      selectedSemester === s
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    Semester {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {savedSuccess && (
          <div className="bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 shadow">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-sm">Catatan nilai semester berhasil disimpan!</span>
          </div>
        )}

        {/* Grade Entry Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 text-white p-3 font-bold text-sm flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>DAFTAR NILAI MATA PELAJARAN</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowExcelModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 cursor-pointer transition shadow-md border border-emerald-400/40"
                  title="Input cepat nilai, deskripsi, & catatan wali kelas via Template Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                  <span>Import Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPdfModal(true)}
                  className="bg-teal-700 hover:bg-teal-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 cursor-pointer transition shadow-md border border-teal-400/40"
                  title="Otomatis baca Nilai, Deskripsi, Ketidakhadiran, & Catatan Wali Kelas dari PDF e-Rapor"
                >
                  <FileText className="w-4 h-4 text-teal-200" />
                  <span>Import PDF e-Rapor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('data-awal')}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-2.5 py-1.5 rounded-lg font-semibold flex items-center space-x-1 cursor-pointer transition shadow-sm border border-slate-600"
                  title="Pengaturan Mata Pelajaran (Tambah, Edit, Hapus, Duplikasi)"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Kelola Mapel</span>
                </button>
                <span className="text-xs text-amber-300 font-normal hidden sm:inline">
                  Siswa: {currentStudent.namaLengkap} (NIS: {currentStudent.nis})
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase border-b">
                    <th className="p-3 text-center w-10">No</th>
                    <th className="p-3">Mata Pelajaran</th>
                    <th className="p-3 text-center w-20">KKM</th>
                    <th className="p-3 text-center w-24">Nilai</th>
                    <th className="p-3 text-center w-20">Predikat</th>
                    {assessmentMode === 'dengan' && (
                      <th className="p-3">Deskripsi Capaian Pembelajaran</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {record.grades.map((g, idx) => (
                    <tr key={g.code} className="hover:bg-slate-50">
                      <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-900">
                        {g.namaMataPelajaran}
                        <span className="text-xs text-slate-400 block font-normal">{g.code}</span>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={g.kKM === 0 ? '' : g.kKM}
                          onChange={e => handleGradeChange(idx, 'kKM', e.target.value)}
                          onFocus={e => e.target.select()}
                          className="w-14 text-center border border-slate-300 rounded px-1 py-1 text-xs focus:ring-2 focus:ring-emerald-500 font-semibold"
                          placeholder="70"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={g.nilaiAkhir === 0 && g.nilaiPengetahuan === 0 ? (g.nilaiAkhir ?? '') : g.nilaiAkhir}
                          onChange={e => handleGradeChange(idx, 'nilaiAkhir', e.target.value)}
                          onFocus={e => e.target.select()}
                          className="w-16 text-center font-bold border border-emerald-400 bg-emerald-50 rounded px-1.5 py-1 text-sm text-emerald-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 shadow-sm"
                          min={0}
                          max={100}
                          placeholder="0"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-black ${
                          g.predikat === 'A' ? 'bg-emerald-100 text-emerald-800' :
                          g.predikat === 'B' ? 'bg-sky-100 text-sky-800' :
                          g.predikat === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {g.predikat}
                        </span>
                      </td>
                      {assessmentMode === 'dengan' && (
                        <td className="p-3">
                          <textarea
                            value={g.deskripsiCapaian}
                            onChange={e => handleGradeChange(idx, 'deskripsiCapaian', e.target.value)}
                            rows={2}
                            placeholder="Tuliskan deskripsi kualitatif capaian siswa..."
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kehadiran & Ekstrakurikuler Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kehadiran */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
              <h3 className="font-bold text-slate-800 border-b pb-2 text-sm uppercase">Catatan Kehadiran (Hari)</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Sakit</label>
                  <input
                    type="number"
                    value={record.sakit === 0 ? '' : record.sakit}
                    onChange={e => handleAttendanceChange('sakit', e.target.value === '' ? 0 : Number(e.target.value))}
                    onFocus={e => e.target.select()}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-center font-bold focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Izin</label>
                  <input
                    type="number"
                    value={record.izin === 0 ? '' : record.izin}
                    onChange={e => handleAttendanceChange('izin', e.target.value === '' ? 0 : Number(e.target.value))}
                    onFocus={e => e.target.select()}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-center font-bold focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tanpa Keterangan</label>
                  <input
                    type="number"
                    value={record.tanpaKeterangan === 0 ? '' : record.tanpaKeterangan}
                    onChange={e => handleAttendanceChange('tanpaKeterangan', e.target.value === '' ? 0 : Number(e.target.value))}
                    onFocus={e => e.target.select()}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-center font-bold focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                    min={0}
                  />
                </div>
              </div>
            </div>

            {/* Ekstrakurikuler */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-slate-800 text-sm uppercase">Kegiatan Ekstrakurikuler</h3>
                <button
                  type="button"
                  onClick={addEskul}
                  className="text-xs bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {record.ekstrakurikuler.map((esk, i) => (
                  <div key={i} className="flex items-center space-x-2 text-xs">
                    <input
                      type="text"
                      value={esk.nama}
                      onChange={e => handleEskulChange(i, 'nama', e.target.value)}
                      placeholder="Nama Ekskul"
                      className="border border-slate-300 rounded-lg px-2 py-1 w-1/3"
                    />
                    <select
                      value={esk.nilai}
                      onChange={e => handleEskulChange(i, 'nilai', e.target.value)}
                      className="border border-slate-300 rounded-lg px-2 py-1 bg-white font-bold"
                    >
                      <option value="A">A (Sangat Baik)</option>
                      <option value="B">B (Baik)</option>
                      <option value="C">C (Cukup)</option>
                    </select>
                    <input
                      type="text"
                      value={esk.keterangan}
                      onChange={e => handleEskulChange(i, 'keterangan', e.target.value)}
                      placeholder="Keterangan"
                      className="border border-slate-300 rounded-lg px-2 py-1 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeEskul(i)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Catatan Wali Kelas */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-2">
            <h3 className="font-bold text-slate-800 text-sm uppercase">Catatan Wali Kelas</h3>
            <textarea
              value={record.catatanWaliKelas}
              onChange={e => handleCatatanWaliKelasChange(e.target.value)}
              rows={3}
              placeholder="Catatan perkembangan dan motivasi belajar dari wali kelas..."
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 transition cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>Simpan Catatan Nilai</span>
            </button>
          </div>
        </form>

        {/* Modal Import Excel Catatan Nilai */}
        <ImportCatatanExcelModal
          isOpen={showExcelModal}
          onClose={() => setShowExcelModal(false)}
          onImportSuccess={() => {
            if (currentStudent) {
              setRecord(getSemesterRecord(currentStudent.id, selectedClass, selectedSemester));
            }
          }}
        />

        {/* Modal Import PDF e-Rapor */}
        <ImportPdfModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          onImportSuccess={() => {
            if (currentStudent) {
              setRecord(getSemesterRecord(currentStudent.id, selectedClass, selectedSemester));
            }
          }}
        />
      </main>
    </div>
  );
};
