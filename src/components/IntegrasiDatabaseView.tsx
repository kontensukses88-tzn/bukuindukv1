import React, { useState } from 'react';
import { Header } from './Header';
import { SpreadsheetSyncCard } from './SpreadsheetSyncCard';
import { useApp } from '../context/AppContext';
import { Database, Trash2, CheckCircle2, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const IntegrasiDatabaseView: React.FC = () => {
  const { students, semesterRecords, schoolData, resetAllData, webAppUrl } = useApp();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDatabase = () => {
    if (confirm('APAKAH ANDA YAKIN ingin menghapus SEMUA data lokal (Siswa, Catatan, Profil)? Data akan menjadi kosong sempurna.')) {
      resetAllData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header
        title="INTEGRASI DATABASE SPREADSHEET (ADMIN)"
        subtitle="Halaman Khusus Pengaturan Database Google Sheets & Google Apps Script (Kode .gs)"
      />

      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 flex-1 space-y-6">
        {resetSuccess && (
          <div className="bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 animate-fade-in shadow">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-sm">Database lokal telah dikosongkan secara total!</span>
          </div>
        )}

        {/* Overview Status Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-black text-emerald-300 tracking-wide uppercase">
                Status Database Utama
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {schoolData.namaSekolah || 'Sekolah Belum Diatur'} &bull; Tersimpan di Local & Cloud Spreadsheet
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-semibold">
                <span className="bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-700">
                  {students.length} Siswa Terdaftar
                </span>
                <span className="bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-700">
                  {semesterRecords.length} Catatan Semester
                </span>
                <span className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                  webAppUrl ? 'bg-emerald-900/60 text-emerald-300 border-emerald-600' : 'bg-amber-900/60 text-amber-300 border-amber-600'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {webAppUrl ? 'Spreadsheet Sync Connected' : 'Belum Terkoneksi GS'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDatabase}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              title="Kosongkan seluruh data lokal di memori aplikasi"
            >
              <Trash2 className="w-4 h-4" />
              <span>Kosongkan Database Lokal</span>
            </button>
          </div>
        </div>

        {/* Main Google Sheets Sync Component */}
        <SpreadsheetSyncCard />
      </main>
    </div>
  );
};
