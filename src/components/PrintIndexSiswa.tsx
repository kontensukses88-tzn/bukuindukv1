import React, { useState } from 'react';
import { PrintWrapper } from './PrintWrapper';
import { useApp } from '../context/AppContext';
import { formatIndonesianDate } from '../utils/dateUtils';
import { Search, X } from 'lucide-react';

export const PrintIndexSiswa: React.FC = () => {
  const { schoolData, students, studentsForActiveYear, academicYear } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const activeStudents = studentsForActiveYear;

  const filteredStudents = activeStudents.filter(s =>
    s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.nisn && s.nisn.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.diterimaDiKelas && String(s.diterimaDiKelas).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedStudents = [...filteredStudents].sort((a, b) =>
    a.namaLengkap.localeCompare(b.namaLengkap)
  );

  const totalLaki = activeStudents.filter(s => s.jenisKelamin === 'L').length;
  const totalPerempuan = activeStudents.filter(s => s.jenisKelamin === 'P').length;

  return (
    <PrintWrapper documentTitle="INDEX SISWA / DAFTAR ABJAD INDUK SISWA" showStudentPicker={false}>
      <div className="font-sans text-xs space-y-4 text-slate-900">
        
        {/* Screen-only Search Input */}
        <div className="print:hidden bg-slate-100 p-3 rounded-xl border border-slate-300 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama / NIS / NISN / Kelas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
          {searchQuery && (
            <span className="text-xs font-bold text-emerald-700">
              Ditemukan {sortedStudents.length} dari {students.length} siswa
            </span>
          )}
        </div>

        {/* Kop Surat Header */}
        <div className="border-b-2 border-black pb-3 text-center space-y-1">
          <h1 className="font-black text-xl uppercase tracking-wider text-black">{schoolData.namaSekolah}</h1>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            DAFTAR INDEKS ABJAD BUKU INDUK SISWA &bull; TAHUN AJARAN {academicYear.tahunAjaran}
          </p>
        </div>

        <div className="flex justify-between items-center text-xs font-semibold px-1">
          <span>Total Siswa: <strong className="text-black font-extrabold">{students.length} Siswa</strong></span>
          <span>Laki-Laki: <strong className="text-black font-extrabold">{totalLaki}</strong> | Perempuan: <strong className="text-black font-extrabold">{totalPerempuan}</strong></span>
        </div>

        {/* Index Table */}
        <table className="w-full border-collapse border border-black font-sans text-xs">
          <thead>
            <tr className="bg-slate-200 text-black font-bold uppercase text-center border-b border-black">
              <th className="border border-black p-2 w-8">No</th>
              <th className="border border-black p-2 w-20">NIS</th>
              <th className="border border-black p-2 w-24">NISN</th>
              <th className="border border-black p-2 text-left">Nama Lengkap Siswa</th>
              <th className="border border-black p-2 w-10">L/P</th>
              <th className="border border-black p-2 text-left">Tempat, Tgl Lahir</th>
              <th className="border border-black p-2 w-20">Kelas</th>
              <th className="border border-black p-2 w-16">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map((s, idx) => (
              <tr key={`${s.id}-${idx}`} className="border-b border-black text-center hover:bg-slate-50">
                <td className="border border-black p-1.5 font-bold">{idx + 1}</td>
                <td className="border border-black p-1.5 font-bold">{s.nis}</td>
                <td className="border border-black p-1.5 text-[11px]">{s.nisn}</td>
                <td className="border border-black p-1.5 text-left font-bold uppercase">{s.namaLengkap}</td>
                <td className="border border-black p-1.5 font-bold">{s.jenisKelamin}</td>
                <td className="border border-black p-1.5 text-left">{s.tempatLahir}, {formatIndonesianDate(s.tanggalLahir)}</td>
                <td className="border border-black p-1.5">Kelas {s.diterimaDiKelas}</td>
                <td className="border border-black p-1.5 font-bold">{s.statusSiswa}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Improved Signature Section */}
        <div className="flex justify-between pt-8 font-sans text-xs">
          <div className="text-center w-64">
            <p className="font-normal leading-tight">Mengetahui,</p>
            <p className="font-bold leading-tight uppercase">Kepala Sekolah {schoolData.namaSekolah}</p>
            <div className="h-20"></div> {/* Clear space for signature & official stamp */}
            <p className="font-black underline propercase text-sm">{schoolData.namaKepalaSekolah}</p>
            <p className="text-[11px] font-bold text-slate-700">NIP. {schoolData.nipKepalaSekolah}</p>
          </div>

          <div className="text-center w-64">
            <p className="font-normal leading-tight">{schoolData.kabupaten}, {academicYear.tanggalRapor}</p>
            <p className="font-bold leading-tight propercase">Petugas Induk Siswa</p>
            <div className="h-20"></div> {/* Clear space for signature */}
            <p className="font-black underline uppercase text-sm">_______________________</p>
            <p className="text-[11px] font-bold text-slate-700">NIP. .....................................</p>
          </div>
        </div>

      </div>
    </PrintWrapper>
  );
};
