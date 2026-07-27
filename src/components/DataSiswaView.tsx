import { Edit, FileText, FileSpreadsheet, Search, Trash2, UserCheck, UserPlus, Users, ArrowRightLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { useApp } from '../context/AppContext';
import { formatIndonesianDate } from '../utils/dateUtils';
import { formatGoogleDriveImageUrl } from '../utils/imageUtils';
import { ExcelImportModal } from './ExcelImportModal';
import { ImportPdfModal } from './ImportPdfModal';
import { StudentDetail } from '../types';

export const DataSiswaView: React.FC = () => {
  const { students, studentsForActiveYear, academicYear, availableAcademicYears, addStudent, addStudentsBulk, updateStudent, deleteStudent, setSelectedStudentId, setActiveView, rombelList } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Aktif' | 'Lulus' | 'Pindah' | 'Keluar'>('Semua');
  const [tahunFilter, setTahunFilter] = useState<string>(() => academicYear.tahunAjaran);

  useEffect(() => {
    setTahunFilter(academicYear.tahunAjaran);
  }, [academicYear.tahunAjaran]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  
  // Status Update Modal State
  const [statusModalStudent, setStatusModalStudent] = useState<StudentDetail | null>(null);
  const [targetStatus, setTargetStatus] = useState<'Aktif' | 'Lulus' | 'Pindah' | 'Keluar'>('Aktif');
  const [noIjazah, setNoIjazah] = useState('');
  const [tahunLulus, setTahunLulus] = useState('2026/2027');

  // New Student Form State
  const [newNis, setNewNis] = useState('');
  const [newNisn, setNewNisn] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newJk, setNewJk] = useState<'L' | 'P'>('L');
  const [newTempatLahir, setNewTempatLahir] = useState('Bandung');
  const [newTanggalLahir, setNewTanggalLahir] = useState('2015-01-01');
  const [newKelas, setNewKelas] = useState<string | number>(() => rombelList[0] || '1A');
  const [newTingkatSaatIni, setNewTingkatSaatIni] = useState<string>(() => rombelList[0] || 'Tingkat 1');
  const [newTahunAjaran, setNewTahunAjaran] = useState<string>(() => academicYear.tahunAjaran);
  const [newAnakKe, setNewAnakKe] = useState<number>(1);
  const [newAlamatSiswa, setNewAlamatSiswa] = useState('Jl. Merdeka No. 1');
  const [newTanggalDiterima, setNewTanggalDiterima] = useState('2024-07-15');
  const [newSekolahAsal, setNewSekolahAsal] = useState('TK/PAUD');

  // Status counts
  const countAktif = students.filter(s => s.statusSiswa === 'Aktif').length;
  const countLulus = students.filter(s => s.statusSiswa === 'Lulus').length;
  const countPindah = students.filter(s => s.statusSiswa === 'Pindah').length;
  const countKeluar = students.filter(s => s.statusSiswa === 'Keluar').length;

  const filteredStudents = students.filter(s => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      s.namaLengkap.toLowerCase().includes(query) ||
      s.nis.includes(query) ||
      s.nisn.includes(query)
    );

    const matchesStatus = statusFilter === 'Semua' || s.statusSiswa === statusFilter;
    const matchesTahun = tahunFilter === 'Semua' || !s.tahunAjaran || s.tahunAjaran === tahunFilter;

    return matchesSearch && matchesStatus && matchesTahun;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newNis) return;

    addStudent({
      nis: newNis,
      nisn: newNisn || '0000000000',
      namaLengkap: newNama,
      namaPanggilan: newNama.split(' ')[0],
      jenisKelamin: newJk,
      tempatLahir: newTempatLahir,
      tanggalLahir: newTanggalLahir,
      agama: 'Islam',
      kewarganegaraan: 'WNI',
      anakKe: Number(newAnakKe) || 1,
      jumlahSaudaraKandung: 1,
      jumlahSaudaraTiri: 0,
      jumlahSaudaraAngkat: 0,
      statusAnak: 'Kandung',
      bahasaSehariHari: 'Bahasa Indonesia',
      alamatSiswa: newAlamatSiswa || 'Jl. Merdeka No. 1',
      rtRw: '001/001',
      dusunDesa: 'Citarum',
      kecamatan: 'Bandung Wetan',
      kabupaten: 'Kota Bandung',
      tinggalDengan: 'Orang Tua',
      jarakKeSekolah: '1 km',
      transportasi: 'Jalan Kaki',
      sekolahAsal: newSekolahAsal || 'TK/PAUD',
      diterimaDiKelas: newKelas,
      tanggalDiterima: newTanggalDiterima || '2024-07-15',
      tingkatSaatIni: newTingkatSaatIni || (String(newKelas).startsWith('Tingkat') ? String(newKelas) : `Tingkat ${newKelas}`),
      tahunAjaran: newTahunAjaran || academicYear.tahunAjaran,
      statusSiswa: 'Aktif',
      fotoUrl: newJk === 'L' 
        ? 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=300'
        : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
      parentData: {
        namaAyah: 'Orang Tua Siswa',
        nikAyah: '3273000000000000',
        tahunLahirAyah: '1985',
        pendidikanAyah: 'SMA',
        pekerjaanAyah: 'Wiraswasta',
        penghasilanAyah: 'Rp 3.000.000',
        namaIbu: 'Ibu Siswa',
        nikIbu: '3273000000000001',
        tahunLahirIbu: '1988',
        pendidikanIbu: 'SMA',
        pekerjaanIbu: 'Ibu Rumah Tangga',
        penghasilanIbu: '-',
        alamatOrangTua: newAlamatSiswa || 'Jl. Merdeka No. 1',
        noHpOrangTua: '081200000000'
      },
      physicalData: {
        tinggiBadan: 125,
        beratBadan: 25,
        golonganDarah: 'O',
        pendengaran: 'Baik',
        penglihatan: 'Normal',
        gigi: 'Baik',
        kelainanFisik: '-'
      }
    });

    setShowAddModal(false);
    setNewNis('');
    setNewNisn('');
    setNewNama('');
    setNewAnakKe(1);
    setNewAlamatSiswa('Jl. Merdeka No. 1');
    setNewTanggalDiterima('2024-07-15');
    setNewSekolahAsal('TK/PAUD');
  };

  const handleBulkExcelImport = (importedList: Omit<StudentDetail, 'id'>[]) => {
    addStudentsBulk(importedList);
    alert(`Berhasil mengimpor ${importedList.length} siswa ke dalam Aplikasi Buku Induk!`);
  };

  const handleOpenStatusModal = (s: StudentDetail) => {
    setStatusModalStudent(s);
    setTargetStatus(s.statusSiswa);
    setNoIjazah(s.noIjazah || '');
    setTahunLulus(s.tahunLulus || '2026/2027');
  };

  const handleSaveStatusModal = () => {
    if (!statusModalStudent) return;

    updateStudent({
      ...statusModalStudent,
      statusSiswa: targetStatus,
      noIjazah: targetStatus === 'Lulus' ? noIjazah : undefined,
      tahunLulus: targetStatus === 'Lulus' ? tahunLulus : undefined,
    });

    setStatusModalStudent(null);
  };

  const handleEditLengkap = (id: string) => {
    setSelectedStudentId(id);
    setActiveView('data-lengkap-siswa');
  };

  const handleCatatanSiswa = (id: string) => {
    setSelectedStudentId(id);
    setActiveView('catatan-siswa');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header title="DATA SISWA / DAFTAR INDUK SISWA" />

      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 flex-1 space-y-4">
        
        {/* Top Filter & Status Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => setStatusFilter('Semua')}
            className={`p-3 rounded-2xl border text-left transition shadow-sm cursor-pointer ${
              statusFilter === 'Semua'
                ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/50'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase opacity-80">Semua Siswa</div>
            <div className="text-xl font-black">{students.length}</div>
          </button>

          <button
            onClick={() => setStatusFilter('Aktif')}
            className={`p-3 rounded-2xl border text-left transition shadow-sm cursor-pointer ${
              statusFilter === 'Aktif'
                ? 'bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-600/50'
                : 'bg-white hover:bg-emerald-50 text-emerald-900 border-slate-200'
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase opacity-80">Siswa Aktif</div>
            <div className="text-xl font-black">{countAktif}</div>
          </button>

          <button
            onClick={() => setStatusFilter('Lulus')}
            className={`p-3 rounded-2xl border text-left transition shadow-sm cursor-pointer ${
              statusFilter === 'Lulus'
                ? 'bg-sky-700 text-white border-sky-700 ring-2 ring-sky-600/50'
                : 'bg-white hover:bg-sky-50 text-sky-900 border-slate-200'
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase opacity-80">Lulus / Alumni</div>
            <div className="text-xl font-black">{countLulus}</div>
          </button>

          <button
            onClick={() => setStatusFilter('Pindah')}
            className={`p-3 rounded-2xl border text-left transition shadow-sm cursor-pointer ${
              statusFilter === 'Pindah'
                ? 'bg-amber-700 text-white border-amber-700 ring-2 ring-amber-600/50'
                : 'bg-white hover:bg-amber-50 text-amber-900 border-slate-200'
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase opacity-80">Pindah Sekolah</div>
            <div className="text-xl font-black">{countPindah}</div>
          </button>

          <button
            onClick={() => setStatusFilter('Keluar')}
            className={`p-3 rounded-2xl border text-left transition shadow-sm cursor-pointer ${
              statusFilter === 'Keluar'
                ? 'bg-rose-700 text-white border-rose-700 ring-2 ring-rose-600/50'
                : 'bg-white hover:bg-rose-50 text-rose-900 border-slate-200'
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase opacity-80">Keluar / Putus</div>
            <div className="text-xl font-black">{countKeluar}</div>
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Nama / NIS / NISN..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Filter T.A Diterima */}
            <div className="w-full sm:w-auto flex items-center space-x-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs">
              <span className="font-extrabold text-slate-600 uppercase whitespace-nowrap">Filter T.A Diterima:</span>
              <select
                value={tahunFilter}
                onChange={e => setTahunFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Semua">Semua T.A.</option>
                {availableAcademicYears.map(yr => (
                  <option key={yr} value={yr}>T.A. {yr}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Import PDF Button */}
            <button
              onClick={() => setShowPdfModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl shadow flex items-center space-x-1.5 text-xs transition cursor-pointer"
              title="Import Nilai, Deskripsi, Ketidakhadiran, & Catatan Wali Kelas dari PDF e-Rapor"
            >
              <FileText className="w-4 h-4" />
              <span>Import PDF e-Rapor</span>
            </button>

            {/* Import Excel Button */}
            <button
              onClick={() => setShowExcelModal(true)}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3.5 py-2 rounded-xl shadow flex items-center space-x-1.5 text-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Excel (.xlsx)</span>
            </button>

            {/* Add Student Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl shadow flex items-center space-x-1.5 text-xs transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Siswa Manual</span>
            </button>
          </div>
        </div>

        {/* Student Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-800 text-white text-xs font-bold uppercase tracking-wider">
                  <th className="p-3 text-center w-12">No</th>
                  <th className="p-3">NIS / NISN</th>
                  <th className="p-3">Nama Lengkap Siswa</th>
                  <th className="p-3 text-center">L/P</th>
                  <th className="p-3">Tempat, Tgl Lahir</th>
                  <th className="p-3 text-center">Kelas & T.A. Diterima</th>
                  <th className="p-3 text-center">Tingkat Saat Ini</th>
                  <th className="p-3 text-center">Status Siswa</th>
                  <th className="p-3 text-center w-48">Aksi & Mutasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      Tidak ada data siswa yang cocok dengan kriteria pencarian / filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => (
                    <tr key={`${s.id}-${idx}`} className="hover:bg-slate-50 transition">
                      <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-mono text-xs">
                        <div className="font-bold text-emerald-900">{s.nis}</div>
                        <div className="text-slate-400">{s.nisn}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        <div className="flex items-center space-x-2">
                          {s.fotoUrl && (
                            <img
                              src={formatGoogleDriveImageUrl(s.fotoUrl)}
                              alt={s.namaLengkap}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <span>{s.namaLengkap}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                          s.jenisKelamin === 'L' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {s.jenisKelamin}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-700 font-semibold">
                        {s.tempatLahir}, {formatIndonesianDate(s.tanggalLahir)}
                      </td>
                      <td className="p-3 text-center">
                        <div className="font-bold text-slate-800">
                          {String(s.diterimaDiKelas).startsWith('Tingkat') ? s.diterimaDiKelas : `Kelas ${s.diterimaDiKelas}`}
                        </div>
                        <div className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded mt-0.5 inline-block">
                          T.A. {s.tahunAjaran || academicYear.tahunAjaran}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-extrabold text-slate-900 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg text-xs font-mono inline-block shadow-sm">
                          {s.tingkatSaatIni || (String(s.diterimaDiKelas).startsWith('Tingkat') ? s.diterimaDiKelas : `Tingkat ${s.diterimaDiKelas}`)}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-black px-2.5 py-1 rounded-full text-[10px] uppercase border shadow-sm ${
                          s.statusSiswa === 'Aktif' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          s.statusSiswa === 'Lulus' ? 'bg-sky-100 text-sky-800 border-sky-300' :
                          s.statusSiswa === 'Pindah' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          'bg-rose-100 text-rose-800 border-rose-300'
                        }`}>
                          {s.statusSiswa === 'Keluar' ? 'Keluar / DO' : s.statusSiswa === 'Pindah' ? 'Pindah Sekolah' : s.statusSiswa}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {/* Mutasi Status Button */}
                          <button
                            onClick={() => handleOpenStatusModal(s)}
                            className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-1.5 rounded-lg transition cursor-pointer"
                            title="Ubah Status / Mutasi Siswa (Lulus/Pindah/Keluar)"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleEditLengkap(s.id)}
                            className="bg-sky-100 hover:bg-sky-200 text-sky-800 p-1.5 rounded-lg transition cursor-pointer"
                            title="Edit Data Lengkap"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleCatatanSiswa(s.id)}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-800 p-1.5 rounded-lg transition cursor-pointer"
                            title="Catatan Nilai"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Apakah Anda yakin ingin menghapus data siswa "${s.namaLengkap}" (NIS: ${s.nis})?`)) {
                                deleteStudent(s.id);
                              }
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-1.5 rounded-lg transition cursor-pointer"
                            title="Hapus Data Siswa Ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        onImportSuccess={handleBulkExcelImport}
      />

      {/* Student Mutasi / Status Change Modal */}
      {statusModalStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase">
                Ubah Status / Mutasi Siswa
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                {statusModalStudent.namaLengkap} (NIS: {statusModalStudent.nis})
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Status Keberadaan Siswa
                </label>
                <select
                  value={targetStatus}
                  onChange={e => setTargetStatus(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white font-bold text-sm"
                >
                  <option value="Aktif">Aktif (Siswa Aktif Belajar)</option>
                  <option value="Lulus">Lulus (Alumni / Telah Tamat SD)</option>
                  <option value="Pindah">Pindah Sekolah (Mutasi Keluar)</option>
                  <option value="Keluar">Keluar / Putus Sekolah (DO)</option>
                </select>
              </div>

              {targetStatus === 'Lulus' && (
                <div className="space-y-2 bg-sky-50 p-3 rounded-xl border border-sky-200">
                  <div>
                    <label className="block font-bold text-sky-900 uppercase mb-1">
                      Nomor Ijazah Lulus SD
                    </label>
                    <input
                      type="text"
                      value={noIjazah}
                      onChange={e => setNoIjazah(e.target.value)}
                      placeholder="Contoh: DN-02/D-SD/06/0012345"
                      className="w-full border border-sky-300 rounded-xl px-3 py-2 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sky-900 uppercase mb-1">
                      Tahun Ajaran Kelulusan
                    </label>
                    <input
                      type="text"
                      value={tahunLulus}
                      onChange={e => setTahunLulus(e.target.value)}
                      placeholder="2026/2027"
                      className="w-full border border-sky-300 rounded-xl px-3 py-2 bg-white font-bold"
                    />
                  </div>
                </div>
              )}

              {targetStatus === 'Pindah' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-semibold">
                  ℹ️ Siswa yang diubah menjadi <strong>Pindah Sekolah</strong> akan disimpan di arsip mutasi dan dapat difilter di menu Data Siswa.
                </div>
              )}

              {targetStatus === 'Keluar' && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 font-semibold">
                  ⚠️ Siswa yang diubah menjadi <strong>Keluar / Putus Sekolah</strong> akan disimpan pada catatan khusus siswa non-aktif.
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setStatusModalStudent(null)}
                className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveStatusModal}
                className="px-5 py-2 rounded-xl text-white bg-purple-700 hover:bg-purple-800 font-bold text-xs shadow cursor-pointer"
              >
                Simpan Status Mutasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Manual Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
              Tambah Siswa Baru (Manual)
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NIS (Nomor Induk Siswa) *
                </label>
                <input
                  type="text"
                  value={newNis}
                  onChange={e => setNewNis(e.target.value)}
                  placeholder="Contoh: 2122005"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NISN (Nomor Induk Siswa Nasional)
                </label>
                <input
                  type="text"
                  value={newNisn}
                  onChange={e => setNewNisn(e.target.value)}
                  placeholder="Contoh: 0149921388"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  value={newNama}
                  onChange={e => setNewNama(e.target.value)}
                  placeholder="Nama Lengkap Sesuai Akta"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={newJk}
                    onChange={e => setNewJk(e.target.value as 'L' | 'P')}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    T.A. Diterima
                  </label>
                  <select
                    value={newTahunAjaran}
                    onChange={e => setNewTahunAjaran(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white font-bold"
                  >
                    {availableAcademicYears.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Diterima di Kelas
                  </label>
                  <select
                    value={newKelas}
                    onChange={e => setNewKelas(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white font-bold"
                  >
                    {rombelList.map(k => (
                      <option key={k} value={k}>Kelas / Rombel {k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tingkat Saat Ini
                  </label>
                  <select
                    value={newTingkatSaatIni}
                    onChange={e => setNewTingkatSaatIni(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white font-bold text-emerald-900"
                  >
                    {rombelList.map(k => (
                      <option key={k} value={String(k).startsWith('Tingkat') ? k : `Tingkat ${k}`}>
                        {String(k).startsWith('Tingkat') ? k : `Tingkat ${k}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={newTempatLahir}
                    onChange={e => setNewTempatLahir(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={newTanggalLahir}
                    onChange={e => setNewTanggalLahir(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Anak Ke -
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newAnakKe}
                    onChange={e => setNewAnakKe(parseInt(e.target.value) || 1)}
                    placeholder="Contoh: 1"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tanggal Diterima
                  </label>
                  <input
                    type="date"
                    value={newTanggalDiterima}
                    onChange={e => setNewTanggalDiterima(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Sekolah Asal (TK / PAUD)
                </label>
                <input
                  type="text"
                  value={newSekolahAsal}
                  onChange={e => setNewSekolahAsal(e.target.value)}
                  placeholder="Contoh: TK Pembina / PAUD Kasih Ibu"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Alamat Siswa
                </label>
                <textarea
                  rows={2}
                  value={newAlamatSiswa}
                  onChange={e => setNewAlamatSiswa(e.target.value)}
                  placeholder="Alamat tempat tinggal siswa..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-bold shadow cursor-pointer"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import PDF e-Rapor */}
      <ImportPdfModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
      />
    </div>
  );
};
