import { CheckCircle2, Heart, Home, Image as ImageIcon, Link2, Save, Search, Trash2, Upload, User, Users, X } from 'lucide-react';
import React, { useState } from 'react';
import { Header } from './Header';
import { useApp } from '../context/AppContext';
import { StudentDetail } from '../types';
import { convertFileToBase64, formatGoogleDriveImageUrl, isGoogleDriveUrl } from '../utils/imageUtils';

export const DataLengkapSiswaView: React.FC = () => {
  const { students, selectedStudentId, setSelectedStudentId, updateStudent, deleteStudent, getStudentById, rombelList, availableAcademicYears } = useApp();
  
  const currentStudent = getStudentById(selectedStudentId || '') || students[0];
  const [formData, setFormData] = useState<StudentDetail>(currentStudent);
  const [activeTab, setActiveTab] = useState<'identitas' | 'orangtua' | 'fisik' | 'foto'>('identitas');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [imgFallbackIndex, setImgFallbackIndex] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  React.useEffect(() => {
    if (currentStudent) {
      setFormData(currentStudent);
    }
  }, [selectedStudentId, currentStudent?.id]);

  const filteredStudents = students.filter(s =>
    s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.nisn && s.nisn.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // When selected student changes in dropdown
  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    const target = getStudentById(id);
    if (target) {
      setFormData(target);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudent(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!currentStudent) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <p className="text-slate-600">Belum ada siswa terdaftar. Silakan tambah data siswa terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header title="DATA LENGKAP SISWA (BIODATA BUKU INDUK)" />

      <main className="max-w-5xl mx-auto w-full p-4 sm:p-6 flex-1">
        {/* Student Switcher Dropdown Bar with Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-emerald-600 shrink-0" />
              <label className="text-xs font-bold text-slate-700 uppercase shrink-0">Pilih Siswa:</label>
            </div>

            {/* Quick Search Input */}
            <div className="relative min-w-[180px] flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama / NIS..."
                value={searchQuery}
                onChange={e => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  const matches = students.filter(s =>
                    s.namaLengkap.toLowerCase().includes(val.toLowerCase()) ||
                    s.nis.toLowerCase().includes(val.toLowerCase())
                  );
                  if (matches.length > 0 && !matches.some(m => m.id === formData.id)) {
                    handleStudentSelect(matches[0].id);
                  }
                }}
                className="w-full pl-9 pr-7 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                  title="Bersihkan"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Select Dropdown */}
            <select
              value={formData.id}
              onChange={e => handleStudentSelect(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 sm:w-72 truncate"
            >
              {filteredStudents.length === 0 ? (
                <option value="" disabled>Tidak ada siswa cocok</option>
              ) : (
                filteredStudents.map((s, idx) => (
                  <option key={`${s.id}-${idx}`} value={s.id}>
                    {s.nis} - {s.namaLengkap} ({s.jenisKelamin})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            NISN: <span className="font-bold text-slate-800">{formData.nisn}</span>
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-4 bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 shadow">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-sm">Biodata Lengkap Siswa berhasil diperbarui!</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-2 pt-2 space-x-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('identitas')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'identitas'
                ? 'bg-slate-100 border-emerald-600 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Identitas Diri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orangtua')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'orangtua'
                ? 'bg-slate-100 border-emerald-600 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. Orang Tua / Wali</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fisik')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'fisik'
                ? 'bg-slate-100 border-emerald-600 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>3. Fisik & Kesehatan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('foto')}
            className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'foto'
                ? 'bg-slate-100 border-emerald-600 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>4. Foto & Mutasi</span>
          </button>
        </div>

        {/* Tab Content Box */}
        <form onSubmit={handleSave} className="bg-white p-5 sm:p-6 rounded-b-2xl shadow-sm border border-slate-200 border-t-0 space-y-6">
          
          {/* TAB 1: IDENTITAS DIRI */}
          {activeTab === 'identitas' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-800 border-b pb-2 text-base">Identitas Diri Siswa</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">NIS Sekolah *</label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={e => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">NISN *</label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={e => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jenisKelamin}
                    onChange={e => setFormData({ ...formData, jenisKelamin: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    value={formData.namaLengkap}
                    onChange={e => setFormData({ ...formData, namaLengkap: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Panggilan</label>
                  <input
                    type="text"
                    value={formData.namaPanggilan}
                    onChange={e => setFormData({ ...formData, namaPanggilan: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.tempatLahir}
                    onChange={e => setFormData({ ...formData, tempatLahir: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={e => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Agama</label>
                  <input
                    type="text"
                    value={formData.agama}
                    onChange={e => setFormData({ ...formData, agama: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kewarganegaraan</label>
                  <input
                    type="text"
                    value={formData.kewarganegaraan}
                    onChange={e => setFormData({ ...formData, kewarganegaraan: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Anak Ke-</label>
                  <input
                    type="number"
                    value={formData.anakKe}
                    onChange={e => setFormData({ ...formData, anakKe: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Anak</label>
                  <select
                    value={formData.statusAnak}
                    onChange={e => setFormData({ ...formData, statusAnak: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option value="Kandung">Kandung</option>
                    <option value="Tiri">Tiri</option>
                    <option value="Angkat">Angkat</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Alamat Tempat Tinggal</label>
                  <input
                    type="text"
                    value={formData.alamatSiswa}
                    onChange={e => setFormData({ ...formData, alamatSiswa: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tinggal Dengan</label>
                  <select
                    value={formData.tinggalDengan}
                    onChange={e => setFormData({ ...formData, tinggalDengan: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Wali">Wali</option>
                    <option value="Kos">Kos / Asrama</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sekolah Asal (TK / PAUD)</label>
                  <input
                    type="text"
                    value={formData.sekolahAsal || ''}
                    onChange={e => setFormData({ ...formData, sekolahAsal: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Diterima di Kelas / Rombel</label>
                  <select
                    value={formData.diterimaDiKelas}
                    onChange={e => setFormData({ ...formData, diterimaDiKelas: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white font-bold"
                  >
                    {rombelList.map(k => (
                      <option key={k} value={k}>Kelas / Rombel {k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">T.A. Diterima</label>
                  <select
                    value={formData.taDiterima || formData.tahunAjaran || ''}
                    onChange={e => setFormData({ ...formData, taDiterima: e.target.value, tahunAjaran: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white font-bold"
                  >
                    {availableAcademicYears.map(yr => (
                      <option key={yr} value={yr}>T.A. {yr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tingkat Saat Ini</label>
                  <select
                    value={formData.tingkatSaatIni || (String(formData.diterimaDiKelas).startsWith('Tingkat') ? String(formData.diterimaDiKelas) : `Tingkat ${formData.diterimaDiKelas}`)}
                    onChange={e => setFormData({ ...formData, tingkatSaatIni: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white font-bold text-emerald-900"
                  >
                    {rombelList.map(k => (
                      <option key={k} value={String(k).startsWith('Tingkat') ? k : `Tingkat ${k}`}>
                        {String(k).startsWith('Tingkat') ? k : `Tingkat ${k}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tanggal Diterima Sekolah</label>
                  <input
                    type="date"
                    value={formData.tanggalDiterima || ''}
                    onChange={e => setFormData({ ...formData, tanggalDiterima: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATA ORANG TUA / WALI */}
          {activeTab === 'orangtua' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-800 border-b pb-2 text-base">Data Ayah & Ibu Kandung / Wali</h3>
              
              <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
                <h4 className="font-bold text-emerald-800 text-sm">AYAH KANDUNG</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Nama Ayah</label>
                    <input
                      type="text"
                      value={formData.parentData.namaAyah}
                      onChange={e => setFormData({
                        ...formData,
                        parentData: { ...formData.parentData, namaAyah: e.target.value }
                      })}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">NIK Ayah</label>
                    <input
                      type="text"
                      value={formData.parentData.nikAyah}
                      onChange={e => setFormData({
                        ...formData,
                        parentData: { ...formData.parentData, nikAyah: e.target.value }
                      })}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Pekerjaan Ayah</label>
                    <input
                      type="text"
                      value={formData.parentData.pekerjaanAyah}
                      onChange={e => setFormData({
                        ...formData,
                        parentData: { ...formData.parentData, pekerjaanAyah: e.target.value }
                      })}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
                <h4 className="font-bold text-emerald-800 text-sm">IBU KANDUNG</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Nama Ibu</label>
                    <input
                      type="text"
                      value={formData.parentData.namaIbu}
                      onChange={e => setFormData({
                        ...formData,
                        parentData: { ...formData.parentData, namaIbu: e.target.value }
                      })}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">NIK Ibu</label>
                    <input
                      type="text"
                      value={formData.parentData.nikIbu}
                      onChange={e => setFormData({
                        ...formData,
                        parentData: { ...formData.parentData, nikIbu: e.target.value }
                      })}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Pekerjaan Ibu</label>
                    <input
                      type="text"
                      value={formData.parentData.pekerjaanIbu}
                      onChange={e => setFormData({
                        ...formData,
                        parentData: { ...formData.parentData, pekerjaanIbu: e.target.value }
                      })}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">No. HP / Kontak Orang Tua</label>
                  <input
                    type="text"
                    value={formData.parentData.noHpOrangTua}
                    onChange={e => setFormData({
                      ...formData,
                      parentData: { ...formData.parentData, noHpOrangTua: e.target.value }
                    })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Alamat Orang Tua</label>
                  <input
                    type="text"
                    value={formData.parentData.alamatOrangTua}
                    onChange={e => setFormData({
                      ...formData,
                      parentData: { ...formData.parentData, alamatOrangTua: e.target.value }
                    })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERKEMBANGAN FISIK & KESEHATAN */}
          {activeTab === 'fisik' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-800 border-b pb-2 text-base">Ciri Fisik & Riwayat Kesehatan Siswa</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    value={formData.physicalData.tinggiBadan}
                    onChange={e => setFormData({
                      ...formData,
                      physicalData: { ...formData.physicalData, tinggiBadan: Number(e.target.value) }
                    })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Berat Badan (kg)</label>
                  <input
                    type="number"
                    value={formData.physicalData.beratBadan}
                    onChange={e => setFormData({
                      ...formData,
                      physicalData: { ...formData.physicalData, beratBadan: Number(e.target.value) }
                    })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Golongan Darah</label>
                  <input
                    type="text"
                    value={formData.physicalData.golonganDarah}
                    onChange={e => setFormData({
                      ...formData,
                      physicalData: { ...formData.physicalData, golonganDarah: e.target.value }
                    })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pendengaran</label>
                  <input
                    type="text"
                    value={formData.physicalData.pendengaran}
                    onChange={e => setFormData({
                      ...formData,
                      physicalData: { ...formData.physicalData, pendengaran: e.target.value }
                    })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Penglihatan</label>
                  <input
                    type="text"
                    value={formData.physicalData.penglihatan}
                    onChange={e => setFormData({
                      ...formData,
                      physicalData: { ...formData.physicalData, penglihatan: e.target.value }
                    })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kondisi Gigi</label>
                  <input
                    type="text"
                    value={formData.physicalData.gigi}
                    onChange={e => setFormData({
                      ...formData,
                      physicalData: { ...formData.physicalData, gigi: e.target.value }
                    })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FOTO & MUTASI */}
          {activeTab === 'foto' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-800 border-b pb-2 text-base">Foto Pas Siswa & Status Keberadaan</h3>
              <div className="flex flex-col sm:flex-row items-start gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                
                {/* Photo Preview Frame */}
                <div className="flex flex-col items-center shrink-0 space-y-2">
                  <div className="w-32 h-40 border-2 border-emerald-500/40 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-md relative group">
                    {formData.fotoUrl ? (
                      <img
                        src={formatGoogleDriveImageUrl(formData.fotoUrl, imgFallbackIndex)}
                        alt={formData.namaLengkap}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={() => {
                          if (imgFallbackIndex < 2) {
                            setImgFallbackIndex(prev => prev + 1);
                          }
                        }}
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-400 space-y-1">
                        <ImageIcon className="w-8 h-8 mx-auto text-slate-300" />
                        <span className="text-[10px] font-bold block">Foto 3x4 Pas Siswa</span>
                      </div>
                    )}
                  </div>
                  {formData.fotoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, fotoUrl: '' });
                        setImgFallbackIndex(0);
                      }}
                      className="text-[11px] text-rose-600 font-bold hover:underline"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                {/* Photo URL & Local Upload Input */}
                <div className="space-y-3.5 flex-1 w-full">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-800 uppercase flex items-center space-x-1.5">
                        <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>URL Foto Pas Siswa (3x4) / Link Google Drive</span>
                      </label>
                      {isGoogleDriveUrl(formData.fotoUrl) && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md border border-emerald-300 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Google Drive Link Terdeteksi</span>
                        </span>
                      )}
                    </div>
                    
                    <input
                      type="text"
                      value={formData.fotoUrl || ''}
                      onChange={e => {
                        const raw = e.target.value;
                        const formatted = formatGoogleDriveImageUrl(raw);
                        setFormData({ ...formData, fotoUrl: formatted });
                        setImgFallbackIndex(0);
                      }}
                      placeholder="Tempelkan URL gambar atau link berbagi Google Drive..."
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                    />

                    {/* Google Drive Tip */}
                    <div className="mt-1.5 p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 space-y-0.5">
                      <p className="font-extrabold flex items-center space-x-1">
                        <span>💡 Dukungan Google Drive:</span>
                      </p>
                      <p className="text-slate-600">
                        Anda dapat menyematkan link berbagi dari Google Drive (contoh: <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-950 font-mono text-[10px]">https://drive.google.com/file/d/XXX/view</code>). Sistem secara otomatis mengonversinya menjadi URL foto langsung.
                      </p>
                      <p className="text-amber-800 font-semibold text-[10px]">
                        ⚠️ Pastikan akses berkas di Google Drive diatur ke: <strong>"Siapa saja yang memiliki link" (Public/Anyone with link)</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Alternative: Local File Upload */}
                  <div className="border-t border-slate-200 pt-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1.5">
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>Atau Unggah Berkas Foto dari Komputer / Perangkat</span>
                    </label>
                    
                    <input
                      type="file"
                      accept="image/*"
                      id="photo-file-upload-input"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploadError(null);
                          const base64 = await convertFileToBase64(file);
                          setFormData({ ...formData, fotoUrl: base64 });
                          setImgFallbackIndex(0);
                        } catch (err: any) {
                          setUploadError(err?.message || 'Gagal mengunggah gambar.');
                        }
                      }}
                    />

                    <label
                      htmlFor="photo-file-upload-input"
                      className="inline-flex items-center space-x-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold px-3.5 py-1.5 rounded-xl text-xs cursor-pointer transition active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>Pilih Berkas Foto (JPG / PNG)</span>
                    </label>

                    {uploadError && (
                      <p className="text-rose-600 text-[11px] font-bold mt-1">{uploadError}</p>
                    )}
                  </div>

                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Siswa</label>
                  <select
                    value={formData.statusSiswa}
                    onChange={e => setFormData({ ...formData, statusSiswa: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white font-bold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Pindah">Pindah Sekolah</option>
                    <option value="Keluar">Keluar / Putus Sekolah</option>
                  </select>
                </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">No. Ijazah (Jika Lulus)</label>
                      <input
                        type="text"
                        value={formData.noIjazah || ''}
                        onChange={e => setFormData({ ...formData, noIjazah: e.target.value })}
                        placeholder="DN-02/D-SD/06/..."
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tahun Lulus (Jika Lulus)</label>
                      <input
                        type="text"
                        value={formData.tahunLulus || ''}
                        onChange={e => setFormData({ ...formData, tahunLulus: e.target.value })}
                        placeholder="2026/2027"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold"
                      />
                    </div>
                  </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Apakah Anda yakin ingin menghapus data siswa "${formData.namaLengkap}" (NIS: ${formData.nis})?`)) {
                  deleteStudent(formData.id);
                }
              }}
              className="w-full sm:w-auto bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Siswa Ini</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>Simpan Perubahan Biodata</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
