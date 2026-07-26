import { Calendar, CheckCircle2, Save } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { useApp } from '../context/AppContext';
import { PengaturanMataPelajaranCard } from './PengaturanMataPelajaranCard';

export const DataAwalView: React.FC = () => {
  const { academicYear, setAcademicYear } = useApp();
  const [formData, setFormData] = useState({ ...academicYear });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync formData when academicYear from context changes (e.g. from Google Sheets sync)
  useEffect(() => {
    setFormData({ ...academicYear });
  }, [academicYear]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAcademicYear({
      ...formData
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header title="DATA AWAL & PENGATURAN TAHUN AJARAN" />

      <main className="max-w-5xl mx-auto w-full p-4 sm:p-6 flex-1">
        {savedSuccess && (
          <div className="mb-4 bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 animate-fade-in shadow">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-sm">Data Awal & Pengaturan berhasil disimpan!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* General Academic Config Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-lg mb-4 border-b border-slate-100 pb-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h2>Pengaturan Tahun Ajaran & Kurikulum</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  value={formData.tahunAjaran}
                  onChange={e => setFormData({ ...formData, tahunAjaran: e.target.value })}
                  placeholder="Contoh: 2026/2027"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kurikulum Digunakan
                </label>
                <select
                  value={formData.kurikulum}
                  onChange={e => setFormData({ ...formData, kurikulum: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                  <option value="Kurikulum 2013">Kurikulum 2013 (K13)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Semester Aktif
                </label>
                <select
                  value={formData.semesterAktif}
                  onChange={e => setFormData({ ...formData, semesterAktif: Number(e.target.value) as 1 | 2 })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value={1}>Semester 1 (Ganjil)</option>
                  <option value={2}>Semester 2 (Genap)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 transition cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>Simpan Data Awal</span>
            </button>
          </div>
        </form>

        {/* Pengaturan Mata Pelajaran Card */}
        <div className="mt-6">
          <PengaturanMataPelajaranCard />
        </div>
      </main>
    </div>
  );
};
