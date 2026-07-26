import React, { useState } from 'react';
import { downloadExcelTemplate, parseExcelFile } from '../utils/excelUtils';
import { StudentDetail } from '../types';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedStudents: Omit<StudentDetail, 'id'>[]) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Omit<StudentDetail, 'id'>[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMsg(null);
    setLoading(true);

    try {
      const parsed = await parseExcelFile(selectedFile);
      if (parsed.length === 0) {
        setErrorMsg('Tidak ada baris data siswa yang valid ditemukan dalam file Excel.');
        setPreviewData([]);
      } else {
        setPreviewData(parsed);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal membaca file Excel. Pastikan format file sesuai template.');
      setPreviewData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (previewData.length === 0) return;
    onImportSuccess(previewData);
    setFile(null);
    setPreviewData([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black uppercase tracking-wide">Import Data Siswa Via Excel (.xlsx)</h3>
            <p className="text-xs text-emerald-200">Tambah banyak siswa sekaligus menggunakan berkas spreadsheet</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-amber-300 font-black text-xl px-2 py-1 cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-slate-800 text-xs">
          
          {/* Step 1: Download Template */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-0.5">1. Unduh Template Excel</h4>
              <p className="text-slate-600">Gunakan format kolom baku agar proses impor berjalan lancar tanpa error.</p>
            </div>
            <button
              onClick={downloadExcelTemplate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2.5 rounded-xl shadow transition flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              <span>📥 Download Template .XLSX</span>
            </button>
          </div>

          {/* Step 2: Upload File */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">2. Unggah Berkas Excel (.xlsx / .xls / .csv)</h4>
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center bg-emerald-50/30 transition">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                onChange={handleFileChange}
                className="hidden"
                id="excel-file-input"
              />
              <label htmlFor="excel-file-input" className="cursor-pointer block space-y-2">
                <div className="text-3xl">📊</div>
                <div className="font-bold text-slate-800 text-sm">
                  {file ? file.name : 'Klik untuk memilih berkas Excel'}
                </div>
                <p className="text-slate-500 text-xs">
                  {file ? `Ukuran: ${(file.size / 1024).toFixed(1)} KB` : 'Format disukai: .xlsx (Excel Workbook)'}
                </p>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded-xl font-semibold text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="text-center py-4 text-emerald-700 font-bold animate-pulse">
              Sedang memproses dan memvalidasi berkas Excel...
            </div>
          )}

          {/* Step 3: Data Preview */}
          {previewData.length > 0 && !loading && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-900 text-sm">
                  Pratinjau Data Siswa Ready ({previewData.length} Siswa)
                </h4>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Valid
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-2">No</th>
                      <th className="p-2">NIS / NISN</th>
                      <th className="p-2">Nama Lengkap</th>
                      <th className="p-2">L/P</th>
                      <th className="p-2">Kelas</th>
                      <th className="p-2">Orang Tua / No HP</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-bold">{idx + 1}</td>
                        <td className="p-2 font-semibold">{s.nis} / {s.nisn}</td>
                        <td className="p-2 font-black text-slate-900">{s.namaLengkap}</td>
                        <td className="p-2 font-bold">{s.jenisKelamin}</td>
                        <td className="p-2">Kelas {s.diterimaDiKelas}</td>
                        <td className="p-2 text-slate-600">
                          <div className="font-semibold text-slate-800">{s.parentData?.namaAyah || s.parentData?.namaIbu || '-'}</div>
                          <div className="text-[10px] text-slate-500">{s.parentData?.noHpOrangTua || '-'}</div>
                        </td>
                        <td className="p-2 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                            s.statusSiswa === 'Aktif' ? 'bg-emerald-100 text-emerald-800' :
                            s.statusSiswa === 'Lulus' ? 'bg-sky-100 text-sky-800' :
                            s.statusSiswa === 'Pindah' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {s.statusSiswa}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 px-6 py-4 flex justify-end space-x-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold px-4 py-2 rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={previewData.length === 0}
            className={`font-black px-6 py-2 rounded-xl shadow transition cursor-pointer ${
              previewData.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            Simpan {previewData.length} Siswa Ke Aplikasi
          </button>
        </div>

      </div>
    </div>
  );
};
