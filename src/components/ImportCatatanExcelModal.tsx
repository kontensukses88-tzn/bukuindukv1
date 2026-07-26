import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, RefreshCw, Upload, User, UserCheck, X } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { downloadCatatanExcelTemplate, parseCatatanExcelFile, ParsedCatatanExcelReport } from '../utils/excelUtils';
import { cleanCapaianDescription } from '../utils/pdfUtils';

interface ImportCatatanExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

export const ImportCatatanExcelModal: React.FC<ImportCatatanExcelModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const {
    students,
    subjects,
    selectedClass,
    selectedSemester,
    saveSemesterRecord,
    getSemesterRecord,
    setSelectedStudentId
  } = useApp();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedReports, setParsedReports] = useState<ParsedCatatanExcelReport[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    downloadCatatanExcelTemplate(students, subjects, selectedClass, selectedSemester);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMsg(null);
    setLoading(true);
    setImportSuccess(false);

    try {
      const reports = await parseCatatanExcelFile(selectedFile, subjects);

      // Match each report with database students
      for (const rep of reports) {
        let matched = students.find(
          s => rep.studentNisn && s.nisn && s.nisn.trim() === rep.studentNisn.trim()
        );
        if (!matched && rep.studentNis) {
          matched = students.find(s => s.nis && s.nis.trim() === rep.studentNis.trim());
        }
        if (!matched && rep.studentName) {
          matched = students.find(
            s => s.namaLengkap.toLowerCase().trim() === rep.studentName.toLowerCase().trim()
          );
        }

        if (matched) {
          rep.matchedStudentId = matched.id;
          rep.studentName = matched.namaLengkap;
        }
      }

      setParsedReports(reports);
    } catch (err: any) {
      console.error('Failed to parse Excel Catatan:', err);
      setErrorMsg(err?.message || 'Gagal membaca berkas Excel. Pastikan format kolom sesuai template.');
      setParsedReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedReports.length === 0) return;

    let successCount = 0;
    let lastMatchedStudentId = '';

    for (const report of parsedReports) {
      if (!report.matchedStudentId) {
        // Find again by name or NIS
        const matched = students.find(
          s =>
            (s.nis && s.nis === report.studentNis) ||
            (s.nisn && s.nisn === report.studentNisn) ||
            s.namaLengkap.toLowerCase().trim() === report.studentName.toLowerCase().trim()
        );
        if (matched) {
          report.matchedStudentId = matched.id;
        }
      }

      if (report.matchedStudentId) {
        const studentId = report.matchedStudentId;
        const targetClass = report.kelas || selectedClass;
        const targetSemester = report.semester || selectedSemester;

        // Fetch current semester record to merge
        const existingRecord = getSemesterRecord(studentId, targetClass, targetSemester);

        // Map and merge subject grades
        const mergedGrades = subjects.map(sub => {
          const parsedGrade = report.grades.find(g => g.code === sub.code);
          const existingGrade = existingRecord.grades.find(g => g.code === sub.code);

          if (parsedGrade) {
            return {
              code: sub.code,
              namaMataPelajaran: sub.namaMataPelajaran,
              kKM: parsedGrade.kKM || sub.kKM || 70,
              nilaiPengetahuan: parsedGrade.nilaiAkhir,
              nilaiKeterampilan: parsedGrade.nilaiAkhir,
              nilaiAkhir: parsedGrade.nilaiAkhir,
              predikat: parsedGrade.predikat,
              deskripsiCapaian: cleanCapaianDescription(parsedGrade.deskripsiCapaian)
            };
          } else if (existingGrade) {
            return existingGrade;
          } else {
            return {
              code: sub.code,
              namaMataPelajaran: sub.namaMataPelajaran,
              kKM: sub.kKM || 70,
              nilaiPengetahuan: 0,
              nilaiKeterampilan: 0,
              nilaiAkhir: 0,
              predikat: 'D' as const,
              deskripsiCapaian: ''
            };
          }
        });

        const updatedRecord = {
          ...existingRecord,
          studentId,
          kelas: targetClass,
          semester: targetSemester,
          grades: mergedGrades,
          sakit: report.sakit ?? existingRecord.sakit ?? 0,
          izin: report.izin ?? existingRecord.izin ?? 0,
          tanpaKeterangan: report.tanpaKeterangan ?? existingRecord.tanpaKeterangan ?? 0,
          catatanWaliKelas: report.catatanWaliKelas || existingRecord.catatanWaliKelas || ''
        };

        saveSemesterRecord(updatedRecord);
        lastMatchedStudentId = studentId;
        successCount++;
      }
    }

    if (lastMatchedStudentId) {
      setSelectedStudentId(lastMatchedStudentId);
    }

    setImportSuccess(true);
    if (onImportSuccess) onImportSuccess();

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-700/60 rounded-xl border border-emerald-500/40">
              <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wide">
                IMPORT CATATAN NILAI SISWA VIA EXCEL (.XLSX)
              </h3>
              <p className="text-xs text-emerald-200">
                Input cepat nilai, deskripsi capaian, absensi, & catatan wali kelas Kelas {selectedClass} Sem {selectedSemester}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-amber-300 font-black text-2xl p-1 cursor-pointer transition"
          >
            &times;
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-slate-800 text-xs">
          
          {/* Success Banner */}
          {importSuccess && (
            <div className="bg-emerald-100 border-2 border-emerald-500 text-emerald-950 p-4 rounded-xl flex items-center space-x-3 shadow-md animate-bounce">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-extrabold text-sm">Catatan Nilai Berhasil Diimpor Ke Aplikasi!</p>
                <p className="text-xs text-emerald-800">Sistem telah menyimpan data nilai dan catatan wali kelas untuk siswa terdaftar.</p>
              </div>
            </div>
          )}

          {/* Action Step 1: Download Template */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center space-x-1.5 justify-center sm:justify-start">
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">LANGKAH 1</span>
                <h4 className="font-bold text-slate-900 text-sm">Unduh Template Excel .xlsx</h4>
              </div>
              <p className="text-slate-600">
                Template otomatis disesuaikan dengan daftar siswa Kelas {selectedClass} dan {subjects.length} mata pelajaran aktif.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2 shrink-0 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>Download Template Excel</span>
            </button>
          </div>

          {/* Action Step 2: Upload File */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5">
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">LANGKAH 2</span>
              <h4 className="font-bold text-slate-900 text-sm">Unggah Berkas Excel Catatan (.xlsx / .xls / .csv)</h4>
            </div>

            <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-emerald-50/20 transition group">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                onChange={handleFileChange}
                className="hidden"
                id="catatan-excel-file-input"
              />
              <label htmlFor="catatan-excel-file-input" className="cursor-pointer block space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-extrabold text-slate-800 text-sm">
                  {file ? file.name : 'Klik untuk memilih berkas Excel Catatan Nilai'}
                </div>
                <p className="text-slate-500 text-xs">
                  {file ? `Ukuran: ${(file.size / 1024).toFixed(1)} KB` : 'Dukungan format: .xlsx Workbook, .xls, atau .csv'}
                </p>
              </label>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3.5 rounded-xl font-bold flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Loading Pulse */}
          {loading && (
            <div className="text-center py-6 text-emerald-800 font-bold flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span>Memproses & mencocokkan data nilai Excel dengan data siswa...</span>
            </div>
          )}

          {/* Step 3: Parsed Results Preview */}
          {parsedReports.length > 0 && !loading && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    PRATINJAU DATA NILAI SISWA ({parsedReports.length} SISWA)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sistem mendeteksi {parsedReports.filter(r => r.matchedStudentId).length} siswa terdaftar di database.
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full text-xs border border-emerald-300">
                  {parsedReports.filter(r => r.matchedStudentId).length} Cocok Terdaftar
                </span>
              </div>

              {/* Accordion / List of Student Reports */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {parsedReports.map((rep, idx) => {
                  const isMatched = Boolean(rep.matchedStudentId);
                  const isExpanded = expandedIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`border rounded-xl overflow-hidden transition ${
                        isMatched
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : 'border-amber-300 bg-amber-50/30'
                      }`}
                    >
                      {/* Accordion Header */}
                      <div
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 cursor-pointer hover:bg-slate-100/60 transition"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg font-black text-xs ${
                            isMatched ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-xs sm:text-sm flex items-center space-x-2">
                              <span>{rep.studentName}</span>
                              <span className="text-[11px] font-normal text-slate-500">
                                (NIS: {rep.studentNis || '-'} | NISN: {rep.studentNisn || '-'})
                              </span>
                            </div>
                            <div className="flex items-center space-x-3 text-[11px] text-slate-600 mt-0.5">
                              <span>Mapel: <strong>{rep.grades.length}</strong></span>
                              <span>Sakit: <strong>{rep.sakit}</strong></span>
                              <span>Izin: <strong>{rep.izin}</strong></span>
                              <span>Alpa: <strong>{rep.tanpaKeterangan}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {isMatched ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Siswa Ditemukan</span>
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center space-x-1">
                              <User className="w-3.5 h-3.5" />
                              <span>Nama / NIS Belum Cocok</span>
                            </span>
                          )}
                          <button className="text-xs text-slate-500 font-bold hover:text-slate-800 underline">
                            {isExpanded ? 'Tutup' : 'Lihat Detail'}
                          </button>
                        </div>
                      </div>

                      {/* Accordion Content Details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-slate-200/80 bg-white space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                              <span className="font-bold text-slate-700 block mb-1">Catatan Wali Kelas:</span>
                              <p className="text-slate-800 italic">
                                "{rep.catatanWaliKelas || 'Tidak ada catatan khusus'}"
                              </p>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                              <span className="font-bold text-slate-700 block mb-1">Rekap Kehadiran:</span>
                              <p className="text-slate-800 font-semibold">
                                Sakit: {rep.sakit} hari | Izin: {rep.izin} hari | Tanpa Keterangan: {rep.tanpaKeterangan} hari
                              </p>
                            </div>
                          </div>

                          {/* Subject Grades Table */}
                          {rep.grades.length > 0 ? (
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                              <table className="w-full text-left text-[11px]">
                                <thead className="bg-slate-100 font-bold text-slate-700 border-b">
                                  <tr>
                                    <th className="p-2">Kode / Mapel</th>
                                    <th className="p-2 text-center w-16">Nilai</th>
                                    <th className="p-2 text-center w-16">Predikat</th>
                                    <th className="p-2">Deskripsi Capaian</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {rep.grades.map((g, gIdx) => (
                                    <tr key={gIdx} className="hover:bg-slate-50">
                                      <td className="p-2 font-bold text-slate-800">
                                        {g.namaMataPelajaran} <span className="text-slate-400 font-normal">({g.code})</span>
                                      </td>
                                      <td className="p-2 text-center font-black text-emerald-800">{g.nilaiAkhir}</td>
                                      <td className="p-2 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                          g.predikat === 'A' ? 'bg-emerald-100 text-emerald-800' :
                                          g.predikat === 'B' ? 'bg-sky-100 text-sky-800' :
                                          g.predikat === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                          {g.predikat}
                                        </span>
                                      </td>
                                      <td className="p-2 text-slate-700 text-[10px]">{g.deskripsiCapaian}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-amber-800 text-[11px] font-semibold bg-amber-50 p-2 rounded">
                              ⚠️ Tidak ada rincian nilai mata pelajaran terdeteksi di baris siswa ini.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-200 shrink-0">
          <p className="text-slate-500 text-[11px]">
            {parsedReports.length > 0
              ? `Siap mengimpor ${parsedReports.filter(r => r.matchedStudentId).length} catatan siswa.`
              : 'Silakan unduh template & unggah berkas Excel.'}
          </p>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold px-4 py-2 rounded-xl cursor-pointer text-xs"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={parsedReports.length === 0 || importSuccess}
              className={`font-black px-6 py-2 rounded-xl shadow transition cursor-pointer text-xs ${
                parsedReports.length > 0 && !importSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {importSuccess ? 'Berhasil Disimpan!' : `Terapkan ${parsedReports.length} Catatan Siswa`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
