import React from 'react';
import { PrintWrapper } from './PrintWrapper';
import { useApp } from '../context/AppContext';
import { formatIndonesianDate } from '../utils/dateUtils';

export const PrintBukuIndukTanpa: React.FC = () => {
  const { schoolData, academicYear, getStudentById, selectedStudentId, students, studentsForActiveYear, getSemesterRecord, selectedClass, selectedSemester } = useApp();
  const activeStudents = studentsForActiveYear;
  const currentStudent = activeStudents.find(s => s.id === selectedStudentId) || activeStudents[0];

  if (!currentStudent) return null;

  const currentRecord = getSemesterRecord(currentStudent.id, selectedClass, selectedSemester);

  return (
    <PrintWrapper documentTitle="BUKU INDUK SISWA (TANPA DESKRIPSI / FORMAT ANGKA)" showClassSemesterPicker={true} orientation="portrait">
      <div className="font-sans text-xs space-y-4 text-slate-900 w-full">
        
        {/* Header */}
        <div className="border-b-2 border-black pb-2 text-center space-y-0.5">
          <h1 className="font-black text-lg uppercase tracking-wider">{schoolData.namaSekolah}</h1>
          <h2 className="font-bold text-sm uppercase">LEMBAR BUKU INDUK SISWA (NILAI ANGKA & PREDIKAT)</h2>
          <p className="text-[11px] text-slate-700 font-semibold">
            KELAS {selectedClass} &bull; SEMESTER {selectedSemester} &bull; TAHUN AJARAN {academicYear.tahunAjaran}
          </p>
        </div>

        {/* Student Biodata Summary */}
        <div className="grid grid-cols-12 gap-2 border border-black p-2 font-sans text-[11px] bg-slate-50">
          <div className="col-span-6 space-y-1">
            <div><span className="font-bold">Nama Siswa:</span> <span className="font-extrabold uppercase">{currentStudent.namaLengkap}</span> ({currentStudent.jenisKelamin})</div>
            <div><span className="font-bold">Tempat, Tgl Lahir:</span> {currentStudent.tempatLahir}, {formatIndonesianDate(currentStudent.tanggalLahir)}</div>
          </div>
          <div className="col-span-6 space-y-1">
            <div><span className="font-bold">NIS / NISN:</span> {currentStudent.nis} / {currentStudent.nisn}</div>
            <div><span className="font-bold">Nama Orang Tua:</span> {currentStudent.parentData.namaAyah} / {currentStudent.parentData.namaIbu}</div>
          </div>
        </div>

        {/* Numeric Grades Table */}
        <table className="w-full border-collapse border border-black font-sans text-xs table-fixed">
          <thead>
            <tr className="bg-slate-200 border-b border-black font-bold uppercase text-center text-[11px]">
              <th className="border border-black py-2 px-1 w-10">NO</th>
              <th className="border border-black py-2 px-2.5 text-left">MATA PELAJARAN</th>
              <th className="border border-black py-2 px-1 w-20">KKM</th>
              <th className="border border-black py-2 px-1 w-28">NILAI AKHIR</th>
              <th className="border border-black py-2 px-1 w-24">PREDIKAT</th>
            </tr>
          </thead>
          <tbody>
            {currentRecord?.grades.map((g, idx) => (
              <tr key={g.code} className="border-b border-black">
                <td className="border border-black py-2 px-1 text-center font-bold">{idx + 1}</td>
                <td className="border border-black py-2 px-2.5 font-bold text-slate-900">{g.namaMataPelajaran}</td>
                <td className="border border-black py-2 px-1 text-center font-semibold text-slate-700">{g.kKM || 70}</td>
                <td className="border border-black py-2 px-1 text-center font-bold text-sm text-slate-950">{g.nilaiAkhir || '-'}</td>
                <td className="border border-black py-2 px-1 text-center font-extrabold text-slate-900">{g.predikat || '-'}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan={5} className="text-center py-6 text-slate-400 font-semibold">
                  Belum ada catatan nilai untuk Kelas {selectedClass} Semester {selectedSemester}.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Ekstrakurikuler & Kehadiran */}
        {currentRecord && (
          <div className="grid grid-cols-12 gap-4 font-sans text-xs pt-2 avoid-break">
            <div className="col-span-7 border border-black p-2 space-y-1">
              <h4 className="font-bold border-b border-black pb-1 uppercase">Kegiatan Ekstrakurikuler</h4>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {currentRecord.ekstrakurikuler && currentRecord.ekstrakurikuler.length > 0 ? (
                  currentRecord.ekstrakurikuler.map((esk, i) => (
                    <li key={i}>
                      <strong>{esk.nama}</strong> ({esk.nilai}): {esk.keterangan}
                    </li>
                  ))
                ) : (
                  <li className="list-none -ml-4 italic text-slate-500">-</li>
                )}
              </ul>
            </div>

            <div className="col-span-5 border border-black p-2 space-y-1">
              <h4 className="font-bold border-b border-black pb-1 uppercase">Ketidakhadiran</h4>
              <div className="text-[11px] space-y-0.5">
                <div>Sakit: <strong>{currentRecord.sakit}</strong> hari</div>
                <div>Izin: <strong>{currentRecord.izin}</strong> hari</div>
                <div>Tanpa Keterangan: <strong>{currentRecord.tanpaKeterangan}</strong> hari</div>
              </div>
            </div>
          </div>
        )}

        {/* Catatan Wali Kelas */}
        <div className="border border-black p-2 font-sans text-xs avoid-break">
          <span className="font-bold uppercase block mb-0.5">Catatan Wali Kelas:</span>
          <p className="italic text-slate-800 text-[11px]">
            {currentRecord?.catatanWaliKelas ? `"${currentRecord.catatanWaliKelas}"` : '-'}
          </p>
        </div>

        {/* Signature Section */}
        <div className="flex justify-between pt-6 font-sans text-xs avoid-break">
          <div className="text-center w-64">
            <p className="font-normal leading-tight">Mengetahui,</p>
            <p className="font-bold leading-tight uppercase">Kepala Sekolah {schoolData.namaSekolah}</p>
            <div className="h-20"></div>
            <p className="font-black underline uppercase text-sm">{schoolData.namaKepalaSekolah}</p>
            <p className="text-[11px] font-bold text-slate-700">NIP. {schoolData.nipKepalaSekolah}</p>
          </div>

          <div className="text-center w-64">
            <p className="font-normal leading-tight">{schoolData.kabupaten}, {academicYear.tanggalRapor || '........................'}</p>
            <p className="font-bold leading-tight uppercase">Petugas Induk Siswa</p>
            <div className="h-20"></div>
            <p className="font-black underline uppercase text-sm">_______________________</p>
            <p className="text-[11px] font-bold text-slate-700">NIP. .....................................</p>
          </div>
        </div>

      </div>
    </PrintWrapper>
  );
};
