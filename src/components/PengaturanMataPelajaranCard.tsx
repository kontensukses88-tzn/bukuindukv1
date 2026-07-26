import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubjectItem } from '../types';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { defaultSubjects } from '../data/initialData';

export const PengaturanMataPelajaranCard: React.FC = () => {
  const { subjects, setSubjects, addSubject, updateSubject, deleteSubject, duplicateSubject, setSemesterRecords } = useApp();

  // Modal / Form state for Add or Edit
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);

  const [formData, setFormData] = useState<SubjectItem>({
    code: '',
    namaMataPelajaran: '',
    kKM: 75,
    kelompok: 'Wajib'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [notification, setNotification] = useState('');

  // Custom Modal States
  const [deletingSubject, setDeletingSubject] = useState<SubjectItem | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleOpenAddModal = () => {
    setEditingCode(null);
    setFormData({
      code: '',
      namaMataPelajaran: '',
      kKM: 75,
      kelompok: 'Wajib'
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (sub: SubjectItem) => {
    setEditingCode(sub.code);
    setFormData({ ...sub });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.namaMataPelajaran.trim()) {
      setErrorMsg('Kode dan Nama Mata Pelajaran tidak boleh kosong.');
      return;
    }

    const upperCode = formData.code.trim().toUpperCase().replace(/\s+/g, '_');

    if (editingCode) {
      // Check duplicate code if code changed
      if (upperCode !== editingCode && subjects.some(s => s.code === upperCode)) {
        setErrorMsg(`Kode "${upperCode}" sudah digunakan oleh mata pelajaran lain.`);
        return;
      }
      updateSubject(editingCode, {
        ...formData,
        code: upperCode,
        namaMataPelajaran: formData.namaMataPelajaran.trim()
      });
      setNotification(`Mata pelajaran "${formData.namaMataPelajaran.trim()}" berhasil diperbarui!`);
    } else {
      // Check duplicate code for new subject
      if (subjects.some(s => s.code === upperCode)) {
        setErrorMsg(`Kode "${upperCode}" sudah ada dalam daftar mata pelajaran.`);
        return;
      }
      addSubject({
        ...formData,
        code: upperCode,
        namaMataPelajaran: formData.namaMataPelajaran.trim()
      });
      setNotification(`Mata pelajaran "${formData.namaMataPelajaran.trim()}" berhasil ditambahkan!`);
    }

    setShowModal(false);
    setTimeout(() => setNotification(''), 4000);
  };

  const confirmDeleteSubject = () => {
    if (!deletingSubject) return;
    const { code, namaMataPelajaran } = deletingSubject;
    deleteSubject(code);
    setDeletingSubject(null);
    setNotification(`Mata pelajaran "${namaMataPelajaran}" (${code}) berhasil dihapus.`);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleDuplicate = (code: string) => {
    const target = subjects.find(s => s.code === code);
    if (!target) return;
    duplicateSubject(code);
    setNotification(`Mata pelajaran "${target.namaMataPelajaran}" berhasil diduplikasi.`);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...subjects];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    setSubjects(copy);
  };

  const handleMoveDown = (index: number) => {
    if (index === subjects.length - 1) return;
    const copy = [...subjects];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    setSubjects(copy);
  };

  const confirmResetToDefault = () => {
    setSubjects(defaultSubjects);
    const validCodes = new Set(defaultSubjects.map(s => s.code));
    setSemesterRecords(prev =>
      prev.map(rec => ({
        ...rec,
        grades: rec.grades.filter(g => validCodes.has(g.code))
      }))
    );
    setShowResetModal(false);
    setNotification('Daftar mata pelajaran telah berhasil dikembalikan ke Standar Nasional SD.');
    setTimeout(() => setNotification(''), 4000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
      {notification && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fade-in shadow-sm">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5 text-emerald-800 font-bold text-lg">
          <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2>Pengaturan Kurikulum & Mata Pelajaran</h2>
            <p className="text-xs text-slate-500 font-normal">
              Kelola daftar mata pelajaran, KKM, kelompok muatan, serta urutan rapor siswa
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 flex items-center space-x-1.5 transition cursor-pointer"
            title="Kembalikan ke Mapel Standar SD"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mapel Baru</span>
          </button>
        </div>
      </div>

      {/* Subject List Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-800 text-white font-bold uppercase text-[11px] tracking-wider">
              <th className="p-3 text-center w-12">No</th>
              <th className="p-3 w-28">Kode Mapel</th>
              <th className="p-3">Nama Mata Pelajaran</th>
              <th className="p-3 text-center w-20">KKM</th>
              <th className="p-3 text-center w-32">Kelompok</th>
              <th className="p-3 text-center w-28">Urutan</th>
              <th className="p-3 text-center w-36">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
            {subjects.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                  Belum ada mata pelajaran. Klik tombol "Tambah Mapel Baru" di atas.
                </td>
              </tr>
            ) : (
              subjects.map((sub, index) => (
                <tr key={sub.code} className="hover:bg-slate-50 transition">
                  <td className="p-3 text-center font-bold text-slate-500">{index + 1}</td>
                  <td className="p-3 font-mono font-black text-emerald-800">{sub.code}</td>
                  <td className="p-3 font-bold text-slate-900">{sub.namaMataPelajaran}</td>
                  <td className="p-3 text-center">
                    <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-lg border border-slate-200">
                      {sub.kKM}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                        sub.kelompok === 'Muatan Lokal'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : sub.kelompok === 'Pilihan'
                          ? 'bg-sky-100 text-sky-800 border-sky-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {sub.kelompok || 'Wajib'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Naikkan Urutan"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === subjects.length - 1}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Turunkan Urutan"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(sub)}
                        className="p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 transition cursor-pointer"
                        title="Edit Mata Pelajaran"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate Button */}
                      <button
                        type="button"
                        onClick={() => handleDuplicate(sub.code)}
                        className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 transition cursor-pointer"
                        title="Duplikasi Mata Pelajaran"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeletingSubject(sub)}
                        className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition cursor-pointer"
                        title="Hapus Mata Pelajaran"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add / Edit Subject */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>{editingCode ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveSubject} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Kode Mata Pelajaran (Singkatan/Unik) *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Contoh: BIND, MTK, IPAS, SUNDA"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Digunakan sebagai pengenal unik data nilai pada rapor.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap Mata Pelajaran *
                </label>
                <input
                  type="text"
                  value={formData.namaMataPelajaran}
                  onChange={e => setFormData({ ...formData, namaMataPelajaran: e.target.value })}
                  placeholder="Contoh: Bahasa Indonesia / Muatan Lokal Bahasa Daerah"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    KKM (Nilai Ketuntasan)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={formData.kKM}
                    onChange={e => setFormData({ ...formData, kKM: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-center"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Kelompok Mapel
                  </label>
                  <select
                    value={formData.kelompok || 'Wajib'}
                    onChange={e => setFormData({ ...formData, kelompok: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold bg-white"
                  >
                    <option value="Wajib">Kelompok Wajib</option>
                    <option value="Muatan Lokal">Muatan Lokal</option>
                    <option value="Pilihan">Kelompok Pilihan</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-bold text-xs shadow flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Mapel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation Delete */}
      {deletingSubject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">Konfirmasi Hapus Mapel</h3>
              <p className="text-xs text-slate-600 mt-1">
                Apakah Anda yakin ingin menghapus mata pelajaran{' '}
                <span className="font-bold text-slate-900">"{deletingSubject.namaMataPelajaran}"</span> ({deletingSubject.code})?
              </p>
              <p className="text-[10px] text-red-500 font-medium mt-2">
                Data nilai mapel ini pada seluruh siswa akan ikut dihapus.
              </p>
            </div>

            <div className="flex justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSubject(null)}
                className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteSubject}
                className="px-5 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold text-xs shadow flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Mapel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Reset to Standard */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">Reset Standar Nasional SD</h3>
              <p className="text-xs text-slate-600 mt-1">
                Apakah Anda yakin ingin mengembalikan daftar mata pelajaran ke susunan standar nasional SD?
              </p>
            </div>

            <div className="flex justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmResetToDefault}
                className="px-5 py-2 rounded-xl text-white bg-amber-600 hover:bg-amber-700 font-bold text-xs shadow flex items-center space-x-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Ya, Reset Standar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
