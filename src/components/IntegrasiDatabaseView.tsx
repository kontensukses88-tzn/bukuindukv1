import React, { useState } from 'react';
import { Header } from './Header';
import { SpreadsheetSyncCard } from './SpreadsheetSyncCard';
import { useApp } from '../context/AppContext';
import { Database, Trash2, CheckCircle2, ShieldCheck, Zap, Cloud, Smartphone, Laptop } from 'lucide-react';

export const IntegrasiDatabaseView: React.FC = () => {
  const { students, semesterRecords, schoolData, resetAllData, firebaseConnected, firebaseSyncing, firebaseLastSynced } = useApp();
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
        title="PENGATURAN DATABASE & SINKRONISASI CLOUD"
        subtitle="Solusi Otomatis Bebas Pindah Device (Firebase Cloud Database) & Backup Google Sheets"
      />

      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 flex-1 space-y-6">
        {resetSuccess && (
          <div className="bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 animate-fade-in shadow">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-sm">Database lokal telah dikosongkan secara total!</span>
          </div>
        )}

        {/* Primary Firebase Cloud Database Card */}
        <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Cloud className="w-64 h-64 text-emerald-300" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="p-3.5 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-400/30 shrink-0">
                <Zap className="w-8 h-8 fill-emerald-400" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-black text-emerald-300 tracking-wide uppercase">
                    Cloud Database Utama (Aktif)
                  </h2>
                  <span className="px-3 py-0.5 bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 rounded-full text-xs font-extrabold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    Bebas Pindah Device
                  </span>
                </div>

                <p className="text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed">
                  Aplikasi telah dikonfigurasi dengan <strong className="text-emerald-300">Firebase Cloud Database</strong>. Ketika Anda membuka aplikasi di laptop lain, smartphone, atau tablet, <strong className="text-white">Anda TIDAK perlu lagi menyematkan link URL database</strong>. Semua data ({students.length} Siswa, catatan nilai, profil) akan langsung otomatis muncul dan tersinkron secara real-time!
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-bold">
                  <span className="bg-slate-800/80 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-400" />
                    {students.length} Siswa Terdaftar
                  </span>
                  <span className="bg-slate-800/80 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {semesterRecords.length} Record Nilai Semester
                  </span>
                  <span className="bg-slate-800/80 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-amber-300" />
                    <Smartphone className="w-4 h-4 text-amber-300" />
                    Otomatis di Semua Device
                  </span>
                  {firebaseLastSynced && (
                    <span className="text-slate-400 font-normal self-center ml-1">
                      Terakhir tersinkron: {firebaseLastSynced.toLocaleTimeString('id-ID')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={handleResetDatabase}
                className="px-4 py-2.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer border border-red-500/50"
                title="Kosongkan seluruh data lokal di memori aplikasi"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Google Sheets Integration Card */}
        <SpreadsheetSyncCard />
      </main>
    </div>
  );
};
