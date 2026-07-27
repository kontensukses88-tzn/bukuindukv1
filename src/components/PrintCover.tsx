import React, { useState } from 'react';
import { PrintWrapper } from './PrintWrapper';
import { useApp } from '../context/AppContext';
import { formatGoogleDriveImageUrl } from '../utils/imageUtils';

export const PrintCover: React.FC = () => {
  const { schoolData, academicYear, getStudentById, selectedStudentId, students, studentsForActiveYear } = useApp();
  const activeStudents = studentsForActiveYear;
  const currentStudent = activeStudents.find(s => s.id === selectedStudentId) || activeStudents[0];
  const [logoFallback, setLogoFallback] = useState(0);

  return (
    <PrintWrapper documentTitle="COVER BUKU INDUK SISWA">
      <div className="border-4 border-double border-slate-900 p-8 min-h-[250mm] flex flex-col justify-between items-center text-center font-serif">
        
        {/* Top Ministry Badge */}
        <div className="space-y-3 mt-6">
          <div className="w-24 h-24 mx-auto flex items-center justify-center border-2 border-slate-800 rounded-full p-2">
            {schoolData.logoUrl ? (
              <img
                src={formatGoogleDriveImageUrl(schoolData.logoUrl, logoFallback)}
                alt="Logo Sekolah"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={() => {
                  if (logoFallback < 2) setLogoFallback(prev => prev + 1);
                }}
              />
            ) : (
              <span className="text-3xl font-black">SD</span>
            )}
          </div>
          <h2 className="text-xl font-bold tracking-widest uppercase">
            PEMERINTAH {schoolData.kabupaten.toUpperCase()}
          </h2>
          <h3 className="text-base font-semibold uppercase tracking-wider">
            {schoolData.namaSekolah.toUpperCase()}
          </h3>
        </div>

        {/* Big Title Section */}
        <div className="my-10 space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black tracking-widest uppercase border-y-2 border-slate-900 py-4 px-6">
            BUKU INDUK SISWA
          </h1>
          <p className="text-lg font-bold tracking-widest uppercase">
            SEKOLAH DASAR (SD)
          </p>
          <div className="text-sm font-semibold italic text-slate-700">
            {academicYear.kurikulum} &bull; T.A {academicYear.tahunAjaran}
          </div>
        </div>

        {/* Student Info Frame */}
        {currentStudent && (
          <div className="w-full max-w-md border-2 border-slate-800 p-6 rounded-lg bg-slate-50 text-left font-sans text-sm space-y-2 my-6">
            <div className="grid grid-cols-12">
              <span className="col-span-4 font-bold">NAMA SISWA</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-7 font-extrabold text-base uppercase text-slate-900">{currentStudent.namaLengkap}</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 font-bold">N I S</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-7 font-mono font-bold">{currentStudent.nis}</span>
            </div>
            <div className="grid grid-cols-12">
              <span className="col-span-4 font-bold">N I S N</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-7 font-mono">{currentStudent.nisn}</span>
            </div>
          </div>
        )}

        {/* Footer School Details */}
        <div className="space-y-1 mt-auto pb-4">
          <h3 className="text-2xl font-black uppercase text-slate-900">
            {schoolData.namaSekolah}
          </h3>
          <p className="text-sm">NPSN: {schoolData.npsn} | NSS: {schoolData.nss}</p>
          <p className="text-xs text-slate-700">{schoolData.alamat}, {schoolData.kelurahan}, {schoolData.kecamatan}</p>
          <p className="text-xs font-semibold text-slate-800">{schoolData.kabupaten}, {schoolData.provinsi}</p>
        </div>

      </div>
    </PrintWrapper>
  );
};
