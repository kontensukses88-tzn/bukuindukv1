import { CheckCircle2, Link2, Save, School, Upload, UserCheck, Image as ImageIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Header } from './Header';
import { useApp } from '../context/AppContext';
import { convertFileToBase64, formatGoogleDriveImageUrl, isGoogleDriveUrl } from '../utils/imageUtils';

export const DataSekolahView: React.FC = () => {
  const { schoolData, setSchoolData } = useApp();
  const [formData, setFormData] = useState({ ...schoolData });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [logoFallbackIndex, setLogoFallbackIndex] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolData(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header title="DATA SEKOLAH & PROFIL SD" />

      <main className="max-w-5xl mx-auto w-full p-4 sm:p-6 flex-1">
        {savedSuccess && (
          <div className="mb-4 bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 animate-fade-in shadow">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-sm">Profil Data Sekolah berhasil diperbarui!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identitas Sekolah Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-lg mb-4 border-b border-slate-100 pb-2">
              <School className="w-5 h-5 text-emerald-600" />
              <h2>Identitas Identitas Sekolah Dasar</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  value={formData.namaSekolah}
                  onChange={e => setFormData({ ...formData, namaSekolah: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NPSN
                </label>
                <input
                  type="text"
                  value={formData.npsn}
                  onChange={e => setFormData({ ...formData, npsn: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NSS / NDS
                </label>
                <input
                  type="text"
                  value={formData.nss}
                  onChange={e => setFormData({ ...formData, nss: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Alamat Jalan
                </label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kelurahan / Desa
                </label>
                <input
                  type="text"
                  value={formData.kelurahan}
                  onChange={e => setFormData({ ...formData, kelurahan: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  value={formData.kecamatan}
                  onChange={e => setFormData({ ...formData, kecamatan: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kabupaten / Kota
                </label>
                <input
                  type="text"
                  value={formData.kabupaten}
                  onChange={e => setFormData({ ...formData, kabupaten: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  value={formData.provinsi}
                  onChange={e => setFormData({ ...formData, provinsi: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={formData.kodePos}
                  onChange={e => setFormData({ ...formData, kodePos: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Telepon Sekolah
                </label>
                <input
                  type="text"
                  value={formData.telepon}
                  onChange={e => setFormData({ ...formData, telepon: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Sekolah
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Website / Blog
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Kepala Sekolah Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-lg mb-4 border-b border-slate-100 pb-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <h2>Pimpinan & Penandatangan Rapor / Buku Induk</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Kepala Sekolah & Gelar
                </label>
                <input
                  type="text"
                  value={formData.namaKepalaSekolah}
                  onChange={e => setFormData({ ...formData, namaKepalaSekolah: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={formData.nipKepalaSekolah}
                  onChange={e => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-3 pt-2 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row items-start gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {/* Logo Preview Box */}
                  <div className="w-20 h-20 border-2 border-emerald-500/40 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-sm shrink-0">
                    {formData.logoUrl ? (
                      <img
                        src={formatGoogleDriveImageUrl(formData.logoUrl, logoFallbackIndex)}
                        alt="Logo Sekolah"
                        className="w-full h-full object-contain p-1"
                        referrerPolicy="no-referrer"
                        onError={() => {
                          if (logoFallbackIndex < 2) setLogoFallbackIndex(prev => prev + 1);
                        }}
                      />
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <ImageIcon className="w-6 h-6 mx-auto text-slate-300" />
                        <span className="text-[9px] font-bold block">Logo SD</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 uppercase flex items-center space-x-1">
                        <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>URL Logo Sekolah (Atau Link Google Drive)</span>
                      </label>
                      {isGoogleDriveUrl(formData.logoUrl) && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md border border-emerald-300 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Google Drive Link Terdeteksi</span>
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      value={formData.logoUrl || ''}
                      onChange={e => {
                        const raw = e.target.value;
                        const formatted = formatGoogleDriveImageUrl(raw);
                        setFormData({ ...formData, logoUrl: formatted });
                        setLogoFallbackIndex(0);
                      }}
                      placeholder="Tempelkan URL gambar atau link Google Drive logo sekolah..."
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <p className="text-[10px] text-slate-500">
                        💡 Bisa gunakan link Google Drive (Public). Dikonversi otomatis untuk kop/cover rapor.
                      </p>

                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          id="school-logo-file-input"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const base64 = await convertFileToBase64(file);
                              setFormData({ ...formData, logoUrl: base64 });
                              setLogoFallbackIndex(0);
                            } catch (err: any) {
                              alert(err?.message || 'Gagal mengunggah logo');
                            }
                          }}
                        />
                        <label
                          htmlFor="school-logo-file-input"
                          className="inline-flex items-center space-x-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1 rounded-lg text-xs cursor-pointer transition active:scale-95"
                        >
                          <Upload className="w-3 h-3 text-slate-600" />
                          <span>Unggah Logo</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 transition cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>Simpan Profil Sekolah</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
