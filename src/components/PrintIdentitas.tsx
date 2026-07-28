import React, { useState } from 'react';
import { PrintWrapper } from './PrintWrapper';
import { useApp } from '../context/AppContext';
import { formatIndonesianDate } from '../utils/dateUtils';
import { formatGoogleDriveImageUrl } from '../utils/imageUtils';

export const PrintIdentitas: React.FC = () => {
  const { schoolData, academicYear, getStudentById, selectedStudentId, students, studentsForActiveYear } = useApp();
  const activeStudents = studentsForActiveYear;
  const currentStudent = activeStudents.find(s => s.id === selectedStudentId) || activeStudents[0];
  const [fallbackIdx, setFallbackIdx] = useState(0);

  if (!currentStudent) return null;

  return (
    <PrintWrapper documentTitle="LEMBAR IDENTITAS SISWA">
      <div className="font-serif text-sm space-y-6">
        
        {/* Kop Surat Sekolah */}
        <div className="border-b-4 border-double border-black pb-3 text-center space-y-1">
          <h2 className="font-extrabold text-base tracking-wider uppercase">
            PEMERINTAH KOTA / KABUPATEN {schoolData.kabupaten.toUpperCase()}
          </h2>
          <h1 className="font-black text-xl uppercase tracking-widest text-slate-900">
            {schoolData.namaSekolah}
          </h1>
          <p className="text-xs font-sans text-slate-700">
            {schoolData.alamat}, Kel. {schoolData.kelurahan}, Kec. {schoolData.kecamatan}, {schoolData.kabupaten}
          </p>
          <p className="text-xs font-sans text-slate-600">
            Telp: {schoolData.telepon} &bull; Email: {schoolData.email} &bull; NPSN: {schoolData.npsn}
          </p>
        </div>

        {/* Title */}
        <div className="text-center font-bold">
          <h2 className="text-lg uppercase tracking-widest underline decoration-2">
            LEMBAR IDENTITAS SISWA
          </h2>
          <p className="text-xs font-sans text-slate-600">
            Nomor Induk Siswa (NIS): <span className="font-bold text-black">{currentStudent.nis}</span> &bull; NISN: <span className="font-bold text-black">{currentStudent.nisn}</span>
          </p>
        </div>

        {/* Form Data Fields */}
        <div className="space-y-4 font-sans text-xs">
          
          {/* Section A */}
          <div>
            <h3 className="font-bold text-sm bg-slate-100 p-1.5 uppercase border border-slate-300 mb-2">
              A. KETERANGAN IDENTITAS DIRI SISWA
            </h3>
            <div className="grid grid-cols-12 gap-y-1.5 pl-2">
              <span className="col-span-1 text-slate-500 font-bold">1.</span>
              <span className="col-span-4">Nama Lengkap Siswa</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6 font-bold text-slate-900 uppercase">{currentStudent.namaLengkap}</span>

              <span className="col-span-1 text-slate-500 font-bold">2.</span>
              <span className="col-span-4">Nama Panggilan</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6">{currentStudent.namaPanggilan}</span>

              <span className="col-span-1 text-slate-500 font-bold">3.</span>
              <span className="col-span-4">Jenis Kelamin</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6 font-bold">{currentStudent.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>

              <span className="col-span-1 text-slate-500 font-bold">4.</span>
              <span className="col-span-4">Tempat, Tanggal Lahir</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6">{currentStudent.tempatLahir}, {formatIndonesianDate(currentStudent.tanggalLahir)}</span>

              <span className="col-span-1 text-slate-500 font-bold">5.</span>
              <span className="col-span-4">Agama & Kewarganegaraan</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6">{currentStudent.agama} / {currentStudent.kewarganegaraan}</span>

              <span className="col-span-1 text-slate-500 font-bold">6.</span>
              <span className="col-span-4">Anak Ke- / Status Anak</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6">Anak Ke-{currentStudent.anakKe} / {currentStudent.statusAnak}</span>

              <span className="col-span-1 text-slate-500 font-bold">7.</span>
              <span className="col-span-4">Alamat Tempat Tinggal</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6">{currentStudent.alamatSiswa}, RT/RW {currentStudent.rtRw}</span>

              <span className="col-span-1 text-slate-500 font-bold">8.</span>
              <span className="col-span-4">Tinggal Dengan</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6">{currentStudent.tinggalDengan}</span>

              <span className="col-span-1 text-slate-500 font-bold">9.</span>
              <span className="col-span-4">Sekolah Asal</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6">{currentStudent.sekolahAsal}</span>

              <span className="col-span-1 text-slate-500 font-bold">10.</span>
              <span className="col-span-4">Diterima di Kelas / T.A. Diterima</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6">Kelas {currentStudent.diterimaDiKelas} / T.A. {currentStudent.taDiterima || currentStudent.tahunAjaran || '-'}</span>

              <span className="col-span-1 text-slate-500 font-bold">11.</span>
              <span className="col-span-4">Tanggal Diterima Sekolah</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6">{formatIndonesianDate(currentStudent.tanggalDiterima)}</span>
            </div>
          </div>

          {/* Section B */}
          <div>
            <h3 className="font-bold text-sm bg-slate-100 p-1.5 uppercase border border-slate-300 mb-2">
              B. KETERANGAN ORANG TUA / WALI
            </h3>
            <div className="grid grid-cols-12 gap-y-1.5 pl-2">
              <span className="col-span-1 text-slate-500 font-bold">12.</span>
              <span className="col-span-4">Nama Ayah Kandung</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6 font-bold">{currentStudent.parentData.namaAyah}</span>

              <span className="col-span-1 text-slate-500 font-bold">13.</span>
              <span className="col-span-4">Nama Ibu Kandung</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6 font-bold">{currentStudent.parentData.namaIbu}</span>

              <span className="col-span-1 text-slate-500 font-bold">14.</span>
              <span className="col-span-4">Pekerjaan Ayah / Ibu</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6">{currentStudent.parentData.pekerjaanAyah} / {currentStudent.parentData.pekerjaanIbu}</span>

              <span className="col-span-1 text-slate-500 font-bold">15.</span>
              <span className="col-span-4">No. HP Orang Tua</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6">{currentStudent.parentData.noHpOrangTua}</span>
            </div>
          </div>

          {/* Section C */}
          <div>
            <h3 className="font-bold text-sm bg-slate-100 p-1.5 uppercase border border-slate-300 mb-2">
              C. KETERANGAN CIRI FISIK & KESEHATAN
            </h3>
            <div className="grid grid-cols-12 gap-y-1.5 pl-2">
              <span className="col-span-1 text-slate-500 font-bold">16.</span>
              <span className="col-span-4">Tinggi / Berat Badan</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6">{currentStudent.physicalData.tinggiBadan} cm / {currentStudent.physicalData.beratBadan} kg</span>

              <span className="col-span-1 text-slate-500 font-bold">17.</span>
              <span className="col-span-4">Golongan Darah</span>
              <span className="col-span-1 font-bold">:</span>
              <span className="col-span-6">{currentStudent.physicalData.golonganDarah}</span>
            </div>
          </div>

        </div>

        {/* Photo Frame & Official Signatures */}
        <div className="grid grid-cols-12 gap-4 items-end pt-6 font-sans text-xs">
          {/* Photo Frame */}
          <div className="col-span-4 flex justify-center">
            <div className="w-28 h-36 border-2 border-slate-800 flex items-center justify-center overflow-hidden bg-slate-50 relative p-1">
              {currentStudent.fotoUrl ? (
                <img
                  src={formatGoogleDriveImageUrl(currentStudent.fotoUrl, fallbackIdx)}
                  alt={currentStudent.namaLengkap}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (fallbackIdx < 2) setFallbackIdx(prev => prev + 1);
                  }}
                />
              ) : (
                <span className="text-[10px] text-slate-400 text-center font-bold uppercase">Pas Foto 3x4</span>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div className="col-span-8 space-y-1 text-center font-serif">
            <p className="text-xs text-slate-700">
              {schoolData.kabupaten}, {academicYear.tanggalRapor}
            </p>
            <p className="font-bold uppercase text-xs">Kepala Sekolah {schoolData.namaSekolah}</p>
            
            <div className="h-16"></div>

            <p className="font-black underline uppercase text-sm">{schoolData.namaKepalaSekolah}</p>
            <p className="text-xs font-sans">NIP. {schoolData.nipKepalaSekolah}</p>
          </div>
        </div>

      </div>
    </PrintWrapper>
  );
};
