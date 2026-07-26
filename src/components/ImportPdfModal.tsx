import { AlertCircle, CheckCircle, FileText, Upload, User, UserCheck, UserPlus, X } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StudentDetail, StudentSemesterRecord, SubjectGrade } from '../types';
import { cleanCapaianDescription, extractTextFromPdf, ExtractedStudentReport, parsePdfReportText } from '../utils/pdfUtils';

interface ImportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

export const ImportPdfModal: React.FC<ImportPdfModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const {
    students,
    addStudent,
    subjects,
    saveSemesterRecord,
    getSemesterRecord,
    setSelectedStudentId,
    setSelectedClass,
    setSelectedSemester
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedReports, setExtractedReports] = useState<ExtractedStudentReport[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [importCompleted, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setErrorMessage(null);
    setExtractedReports([]);
    setImportSuccess(false);

    try {
      const allReports: ExtractedStudentReport[] = [];

      for (let f = 0; f < files.length; f++) {
        const file = files[f];
        if (!file.name.toLowerCase().endsWith('.pdf')) continue;

        const pages = await extractTextFromPdf(file);
        const parsed = parsePdfReportText(pages, subjects);
        
        // Match with existing students strictly by NISN or NIS
        for (const rep of parsed) {
          let matched = students.find(s => rep.nisn && s.nisn && s.nisn.trim() === rep.nisn.trim());
          if (!matched && rep.nis) {
            matched = students.find(s => s.nis && s.nis.trim() === rep.nis.trim());
          }

          if (matched) {
            rep.matchedStudentId = matched.id;
            // Ensure student name is retrieved from database if PDF name is TANPA NAMA or empty
            if (!rep.namaMurid || rep.namaMurid === 'TANPA NAMA' || rep.namaMurid.startsWith('SISWA (')) {
              rep.namaMurid = matched.namaLengkap;
            }
          } else {
            // Fallback display name if student is not registered in database
            if (!rep.namaMurid || rep.namaMurid === 'TANPA NAMA') {
              const idText = rep.nisn ? `NISN: ${rep.nisn}` : (rep.nis ? `NIS: ${rep.nis}` : 'Baru');
              rep.namaMurid = `SISWA (${idText})`;
            }
          }

          allReports.push(rep);
        }
      }

      if (allReports.length === 0) {
        setErrorMessage('Tidak ditemukan data laporan hasil belajar/e-Rapor yang valid di dalam file PDF tersebut. Pastikan PDF merupakan e-Rapor Kurikulum Merdeka / SD.');
      } else {
        setExtractedReports(allReports);
      }
    } catch (err: any) {
      console.error('Failed to parse PDF:', err);
      setErrorMessage(`Gagal membaca PDF: ${err?.message || 'Terjadi kesalahan saat mengekstrak teks PDF.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyImport = () => {
    if (extractedReports.length === 0) return;

    let importedCount = 0;
    let lastImportedStudentId = '';
    let lastClass = '1A';
    let lastSemester: 1 | 2 = 1;

    for (const report of extractedReports) {
      let targetStudentId = report.matchedStudentId;

      // 1. If student does not exist, create new student in database
      if (!targetStudentId) {
        const newStudentData: Omit<StudentDetail, 'id'> = {
          namaLengkap: report.namaMurid,
          namaPanggilan: report.namaMurid.split(' ')[0] || report.namaMurid,
          nis: report.nis || `2526${Math.floor(10000 + Math.random() * 90000)}`,
          nisn: report.nisn || `3${Math.floor(100000000 + Math.random() * 900000000)}`,
          jenisKelamin: 'L',
          tempatLahir: 'Bandung',
          tanggalLahir: '2018-01-01',
          agama: 'Islam',
          kewarganegaraan: 'WNI',
          anakKe: 1,
          jumlahSaudaraKandung: 1,
          jumlahSaudaraTiri: 0,
          jumlahSaudaraAngkat: 0,
          statusAnak: 'Kandung',
          bahasaSehariHari: 'Bahasa Indonesia',
          alamatSiswa: 'Sesuai Domisili',
          rtRw: '001/001',
          dusunDesa: '-',
          kecamatan: '-',
          kabupaten: 'Kota Bandung',
          tinggalDengan: 'Orang Tua',
          jarakKeSekolah: '1 km',
          transportasi: 'Jalan Kaki',
          sekolahAsal: 'TK / PAUD',
          diterimaDiKelas: report.kelas || '1A',
          tanggalDiterima: '2025-07-15',
          statusSiswa: 'Aktif',
          parentData: {
            namaAyah: '-',
            nikAyah: '-',
            tahunLahirAyah: '1985',
            pendidikanAyah: 'SMA',
            pekerjaanAyah: '-',
            penghasilanAyah: '-',
            namaIbu: '-',
            nikIbu: '-',
            tahunLahirIbu: '1988',
            pendidikanIbu: 'SMA',
            pekerjaanIbu: '-',
            penghasilanIbu: '-',
            alamatOrangTua: '-',
            noHpOrangTua: '-'
          },
          physicalData: {
            tinggiBadan: 120,
            beratBadan: 22,
            golonganDarah: '-',
            pendengaran: 'Baik',
            penglihatan: 'Baik',
            gigi: 'Baik'
          }
        };

        addStudent(newStudentData);

        // Find created student
        const newlyAdded = students.find(s => s.nisn === report.nisn || s.namaLengkap === report.namaMurid);
        targetStudentId = newlyAdded ? newlyAdded.id : `std-${report.nis || report.nisn || Date.now()}`;
      }

      lastImportedStudentId = targetStudentId;
      lastClass = report.kelas || '1A';
      lastSemester = report.semester || 1;

      // 2. Fetch existing or template semester record
      const existingRecord = getSemesterRecord(targetStudentId, report.kelas, report.semester);

      // Map extracted grades to subject list
      const updatedGrades: SubjectGrade[] = subjects.map(sub => {
        const isExcludedSub = /koding|kecerdasan\s+artifisial|coding/i.test(sub.namaMataPelajaran) ||
                              /koding|coding|^ai$/i.test(sub.code);

        // Find extracted grade matching code or subject name keywords (unless excluded subject)
        const ext = !isExcludedSub ? report.grades.find(g =>
          g.matchedCode === sub.code ||
          g.subjectName.toLowerCase().includes(sub.namaMataPelajaran.toLowerCase()) ||
          sub.namaMataPelajaran.toLowerCase().includes(g.subjectName.toLowerCase())
        ) : undefined;

        if (ext) {
          const numScore = ext.nilaiAkhir;
          let predikat: 'A' | 'B' | 'C' | 'D' = 'B';
          if (numScore >= 90) predikat = 'A';
          else if (numScore >= 80) predikat = 'B';
          else if (numScore >= 70) predikat = 'C';
          else predikat = 'D';

          return {
            code: sub.code,
            namaMataPelajaran: sub.namaMataPelajaran,
            kKM: sub.kKM || 70,
            nilaiPengetahuan: numScore,
            nilaiKeterampilan: numScore,
            nilaiAkhir: numScore,
            predikat,
            deskripsiCapaian: cleanCapaianDescription(ext.deskripsiCapaian || '')
          };
        }

        // Return current grade if no extracted data found
        const existingSub = existingRecord.grades.find(g => g.code === sub.code);
        return existingSub || {
          code: sub.code,
          namaMataPelajaran: sub.namaMataPelajaran,
          kKM: sub.kKM || 70,
          nilaiPengetahuan: 0,
          nilaiKeterampilan: 0,
          nilaiAkhir: 0,
          predikat: '' as any,
          deskripsiCapaian: ''
        };
      });

      const updatedRecord: StudentSemesterRecord = {
        ...existingRecord,
        studentId: targetStudentId,
        kelas: report.kelas,
        semester: report.semester,
        sakit: report.sakit,
        izin: report.izin,
        tanpaKeterangan: report.tanpaKeterangan,
        catatanWaliKelas: report.catatanWaliKelas || existingRecord.catatanWaliKelas || '',
        grades: updatedGrades
      };

      saveSemesterRecord(updatedRecord);
      importedCount++;
    }

    setImportSuccess(true);
    if (lastImportedStudentId) {
      setSelectedStudentId(lastImportedStudentId);
      setSelectedClass(lastClass);
      setSelectedSemester(lastSemester);
    }

    if (onImportSuccess) {
      onImportSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Modal Header */}
        <div className="bg-slate-800 px-5 py-4 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-emerald-400">Import Data e-Rapor PDF</h3>
              <p className="text-xs text-slate-400">
                Otomatis mencocokkan siswa berdasarkan NIS/NISN, serta membaca Nilai, Deskripsi Capaian, Ketidakhadiran, & Catatan Wali Kelas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          
          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40 rounded-2xl p-6 text-center transition flex flex-col items-center justify-center relative cursor-pointer group">
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-full mb-3 group-hover:scale-110 transition">
              <Upload className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-sm text-emerald-200">
              Pilih File PDF e-Rapor (bisa upload banyak file sekaligus)
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Mendukung file Laporan Hasil Belajar / e-Rapor SD Kurikulum Merdeka.
            </p>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center space-y-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
              <p className="font-bold text-sm text-emerald-300">
                Sedang membaca dan mengekstrak data dari file PDF...
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-rose-950/40 border border-rose-600/60 rounded-xl p-4 flex items-start space-x-3 text-rose-200 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">Gagal Membaca File</span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Import Success Alert */}
          {importCompleted && (
            <div className="bg-emerald-950/60 border border-emerald-500/60 rounded-xl p-4 flex items-center justify-between text-emerald-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h5 className="font-black text-sm text-white">Berhasil Diimpor!</h5>
                  <p className="text-xs text-emerald-300">
                    Data {extractedReports.length} siswa (Nilai, Deskripsi, Ketidakhadiran, & Catatan Wali Kelas) telah berhasil disimpan ke aplikasi.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition cursor-pointer"
              >
                Tutup Modal
              </button>
            </div>
          )}

          {/* Extracted Reports Review List */}
          {extractedReports.length > 0 && !importCompleted && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700">
                <span className="text-xs font-bold text-slate-300">
                  Ditemukan <strong className="text-emerald-400">{extractedReports.length} Laporan Siswa</strong> dalam PDF:
                </span>
                <span className="text-[11px] text-slate-400">
                  Klik siswa untuk melihat detail nilai & catatan
                </span>
              </div>

              <div className="space-y-3">
                {extractedReports.map((report, idx) => {
                  const isExpanded = expandedIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden text-xs"
                    >
                      {/* Summary Row Header */}
                      <div
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="p-3 bg-slate-800 hover:bg-slate-750 flex flex-wrap items-center justify-between gap-2 cursor-pointer transition"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-slate-700 rounded-lg text-slate-300">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-white uppercase flex items-center gap-2">
                              {report.namaMurid}
                              {report.matchedStudentId ? (
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <UserCheck className="w-3 h-3" /> Siswa Terdaftar
                                </span>
                              ) : (
                                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <UserPlus className="w-3 h-3" /> Siswa Baru
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px] mt-0.5">
                              NIS/NISN: <strong className="text-slate-200">{report.nis || '-'} / {report.nisn || '-'}</strong> &bull; Kelas: <strong className="text-slate-200">{report.kelas}</strong> &bull; Sem: <strong className="text-slate-200">{report.semester}</strong> &bull; TA: <strong className="text-slate-200">{report.tahunAjaran}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 text-[11px]">
                          <div className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300">
                            Sakit: <strong className="text-amber-400">{report.sakit}</strong> | Izin: <strong className="text-blue-400">{report.izin}</strong> | Alpa: <strong className="text-rose-400">{report.tanpaKeterangan}</strong>
                          </div>
                          <div className="bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-700/60 text-emerald-300 font-bold">
                            {report.grades.length} Mapel
                          </div>
                        </div>
                      </div>

                      {/* Expandable Details */}
                      {isExpanded && (
                        <div className="p-4 border-t border-slate-700/80 bg-slate-900/40 space-y-4">
                          {/* Mapel Grades */}
                          <div>
                            <h5 className="font-bold text-emerald-400 uppercase text-[11px] mb-2">
                              Nilai & Deskripsi Capaian Mata Pelajaran:
                            </h5>
                            <div className="space-y-2">
                              {report.grades.map((g, gIdx) => (
                                <div key={gIdx} className="bg-slate-800 p-2.5 rounded-lg border border-slate-700/80 grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-12 sm:col-span-4">
                                    <span className="font-bold text-white block">{g.subjectName}</span>
                                    <span className="text-[10px] text-emerald-400">Kode App: {g.matchedCode || '-'}</span>
                                  </div>
                                  <div className="col-span-4 sm:col-span-2 text-center bg-slate-900 py-1.5 rounded-md border border-slate-700">
                                    <span className="text-[10px] text-slate-400 block">Nilai Akhir</span>
                                    <span className="font-black text-emerald-400 text-sm">{g.nilaiAkhir}</span>
                                  </div>
                                  <div className="col-span-8 sm:col-span-6 text-[11px] text-slate-300 italic bg-slate-900/60 p-1.5 rounded-md border border-slate-700/50">
                                    "{g.deskripsiCapaian || 'Tidak ada deskripsi'}"
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Catatan Wali Kelas */}
                          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                            <span className="font-bold text-amber-400 uppercase block text-[11px] mb-1">
                              Catatan Wali Kelas:
                            </span>
                            <p className="text-slate-200 italic text-[11px]">
                              "{report.catatanWaliKelas || 'Belum ada catatan wali kelas'}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-800 px-5 py-3 border-t border-slate-700 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Batal
          </button>

          {extractedReports.length > 0 && !importCompleted && (
            <button
              onClick={handleApplyImport}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Simpan & Terapkan Data ({extractedReports.length} Siswa)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
