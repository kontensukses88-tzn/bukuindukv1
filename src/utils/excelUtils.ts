import * as XLSX from 'xlsx';
import { StudentDetail } from '../types';

export const EXCEL_COLUMNS = [
  'NIS',
  'NISN',
  'Nama Lengkap',
  'Nama Panggilan',
  'Jenis Kelamin (L/P)',
  'Tempat Lahir',
  'Tanggal Lahir (DD MMMM YYYY)',
  'Agama',
  'Kewarganegaraan',
  'Status Anak (Kandung/Tiri/Angkat)',
  'Anak Ke',
  'Jumlah Saudara Kandung',
  'Bahasa Sehari-hari',
  'Alamat Siswa',
  'RT/RW',
  'Dusun/Desa',
  'Kecamatan',
  'Kabupaten/Kota',
  'Tinggal Dengan (Orang Tua/Wali/Kos)',
  'Jarak ke Sekolah',
  'Transportasi',
  'Sekolah Asal (TK/PAUD)',
  'Diterima di Kelas',
  'Tanggal Diterima',
  'Status Siswa (Aktif/Lulus/Pindah/Keluar)',
  'Nama Ayah',
  'NIK Ayah',
  'Pekerjaan Ayah',
  'Nama Ibu',
  'NIK Ibu',
  'Pekerjaan Ibu',
  'No HP Orang Tua',
  'Nama Wali',
  'Pekerjaan Wali',
  'Alamat Orang Tua',
  'Tinggi Badan (cm)',
  'Berat Badan (kg)',
  'Golongan Darah (A/B/AB/O)',
  'Pendengaran (Baik/Kurang)',
  'Penglihatan (Normal/Kacamata)',
  'Gigi (Baik/Berlubang)'
];

export const downloadExcelTemplate = () => {
  const sampleData = [
    {
      'NIS': '2122010',
      'NISN': '0149982310',
      'Nama Lengkap': 'Budi Santoso Putra',
      'Nama Panggilan': 'Budi',
      'Jenis Kelamin (L/P)': 'L',
      'Tempat Lahir': 'Bandung',
      'Tanggal Lahir (DD MMMM YYYY)': '10 Mei 2015',
      'Agama': 'Islam',
      'Kewarganegaraan': 'WNI',
      'Status Anak (Kandung/Tiri/Angkat)': 'Kandung',
      'Anak Ke': 1,
      'Jumlah Saudara Kandung': 2,
      'Bahasa Sehari-hari': 'Bahasa Indonesia',
      'Alamat Siswa': 'Jl. Merdeka No. 100',
      'RT/RW': '001/002',
      'Dusun/Desa': 'Citarum',
      'Kecamatan': 'Bandung Wetan',
      'Kabupaten/Kota': 'Kota Bandung',
      'Tinggal Dengan (Orang Tua/Wali/Kos)': 'Orang Tua',
      'Jarak ke Sekolah': '1 km',
      'Transportasi': 'Jalan Kaki',
      'Sekolah Asal (TK/PAUD)': 'TK Pembina Bandung',
      'Diterima di Kelas': '1A',
      'Tanggal Diterima': '12 Juli 2021',
      'Status Siswa (Aktif/Lulus/Pindah/Keluar)': 'Aktif',
      'Nama Ayah': 'Rahmat Santoso',
      'NIK Ayah': '3273011005800001',
      'Pekerjaan Ayah': 'Wiraswasta',
      'Nama Ibu': 'Siti Rohmah',
      'NIK Ibu': '3273015008820002',
      'Pekerjaan Ibu': 'Ibu Rumah Tangga',
      'No HP Orang Tua': '081234567890',
      'Nama Wali': '-',
      'Pekerjaan Wali': '-',
      'Alamat Orang Tua': 'Jl. Merdeka No. 100, Bandung',
      'Tinggi Badan (cm)': 128,
      'Berat Badan (kg)': 27,
      'Golongan Darah (A/B/AB/O)': 'O',
      'Pendengaran (Baik/Kurang)': 'Baik',
      'Penglihatan (Normal/Kacamata)': 'Normal',
      'Gigi (Baik/Berlubang)': 'Baik'
    },
    {
      'NIS': '2122011',
      'NISN': '0149982311',
      'Nama Lengkap': 'Siti Aminah Lestari',
      'Nama Panggilan': 'Siti',
      'Jenis Kelamin (L/P)': 'P',
      'Tempat Lahir': 'Jakarta',
      'Tanggal Lahir (DD MMMM YYYY)': '15 Agustus 2015',
      'Agama': 'Islam',
      'Kewarganegaraan': 'WNI',
      'Status Anak (Kandung/Tiri/Angkat)': 'Kandung',
      'Anak Ke': 2,
      'Jumlah Saudara Kandung': 1,
      'Bahasa Sehari-hari': 'Bahasa Indonesia',
      'Alamat Siswa': 'Jl. Riau No. 45',
      'RT/RW': '003/004',
      'Dusun/Desa': 'Merdeka',
      'Kecamatan': 'Sumur Bandung',
      'Kabupaten/Kota': 'Kota Bandung',
      'Tinggal Dengan (Orang Tua/Wali/Kos)': 'Orang Tua',
      'Jarak ke Sekolah': '2 km',
      'Transportasi': 'Sepeda Motor',
      'Sekolah Asal (TK/PAUD)': 'TK Al-Azhar Bandung',
      'Diterima di Kelas': '1A',
      'Tanggal Diterima': '12 Juli 2021',
      'Status Siswa (Aktif/Lulus/Pindah/Keluar)': 'Aktif',
      'Nama Ayah': 'Herman Lestari',
      'NIK Ayah': '3273021508780003',
      'Pekerjaan Ayah': 'Pegawai Negeri Sipil',
      'Nama Ibu': 'Dewi Sartika',
      'NIK Ibu': '3273026010810004',
      'Pekerjaan Ibu': 'Guru',
      'No HP Orang Tua': '085712345678',
      'Nama Wali': '-',
      'Pekerjaan Wali': '-',
      'Alamat Orang Tua': 'Jl. Riau No. 45, Bandung',
      'Tinggi Badan (cm)': 125,
      'Berat Badan (kg)': 24,
      'Golongan Darah (A/B/AB/O)': 'A',
      'Pendengaran (Baik/Kurang)': 'Baik',
      'Penglihatan (Normal/Kacamata)': 'Normal',
      'Gigi (Baik/Berlubang)': 'Baik'
    },
    {
      'NIS': '2122012',
      'NISN': '0149982312',
      'Nama Lengkap': 'Ahmad Fauzi Nurrahman',
      'Nama Panggilan': 'Ahmad',
      'Jenis Kelamin (L/P)': 'L',
      'Tempat Lahir': 'Cimahi',
      'Tanggal Lahir (DD MMMM YYYY)': '20 November 2015',
      'Agama': 'Islam',
      'Kewarganegaraan': 'WNI',
      'Status Anak (Kandung/Tiri/Angkat)': 'Kandung',
      'Anak Ke': 1,
      'Jumlah Saudara Kandung': 0,
      'Bahasa Sehari-hari': 'Bahasa Indonesia',
      'Alamat Siswa': 'Jl. Aceh No. 12',
      'RT/RW': '002/001',
      'Dusun/Desa': 'Babakan Ciamis',
      'Kecamatan': 'Sumur Bandung',
      'Kabupaten/Kota': 'Kota Bandung',
      'Tinggal Dengan (Orang Tua/Wali/Kos)': 'Orang Tua',
      'Jarak ke Sekolah': '1.5 km',
      'Transportasi': 'Jalan Kaki',
      'Sekolah Asal (TK/PAUD)': 'PAUD Kasih Ibu',
      'Diterima di Kelas': '1B',
      'Tanggal Diterima': '12 Juli 2021',
      'Status Siswa (Aktif/Lulus/Pindah/Keluar)': 'Aktif',
      'Nama Ayah': 'Nurrahman Hidayat',
      'NIK Ayah': '3273032011790005',
      'Pekerjaan Ayah': 'Karyawan Swasta',
      'Nama Ibu': 'Endang Kusuma',
      'NIK Ibu': '3273034504830006',
      'Pekerjaan Ibu': 'Wiraswasta',
      'No HP Orang Tua': '081398765432',
      'Nama Wali': '-',
      'Pekerjaan Wali': '-',
      'Alamat Orang Tua': 'Jl. Aceh No. 12, Bandung',
      'Tinggi Badan (cm)': 130,
      'Berat Badan (kg)': 29,
      'Golongan Darah (A/B/AB/O)': 'B',
      'Pendengaran (Baik/Kurang)': 'Baik',
      'Penglihatan (Normal/Kacamata)': 'Normal',
      'Gigi (Baik/Berlubang)': 'Baik'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: EXCEL_COLUMNS });
  
  // Set column widths for better readability in Excel
  worksheet['!cols'] = [
    { wch: 12 }, // NIS
    { wch: 15 }, // NISN
    { wch: 28 }, // Nama Lengkap
    { wch: 15 }, // Nama Panggilan
    { wch: 18 }, // Jenis Kelamin
    { wch: 15 }, // Tempat Lahir
    { wch: 25 }, // Tanggal Lahir
    { wch: 12 }, // Agama
    { wch: 16 }, // Kewarganegaraan
    { wch: 20 }, // Status Anak
    { wch: 10 }, // Anak Ke
    { wch: 20 }, // Saudar Kandung
    { wch: 20 }, // Bahasa
    { wch: 30 }, // Alamat Siswa
    { wch: 12 }, // RT/RW
    { wch: 18 }, // Dusun/Desa
    { wch: 18 }, // Kecamatan
    { wch: 18 }, // Kabupaten
    { wch: 20 }, // Tinggal Dengan
    { wch: 16 }, // Jarak
    { wch: 16 }, // Transportasi
    { wch: 25 }, // Sekolah Asal
    { wch: 18 }, // Diterima di Kelas
    { wch: 18 }, // Tanggal Diterima
    { wch: 25 }, // Status Siswa
    { wch: 22 }, // Nama Ayah
    { wch: 20 }, // NIK Ayah
    { wch: 20 }, // Pekerjaan Ayah
    { wch: 22 }, // Nama Ibu
    { wch: 20 }, // NIK Ibu
    { wch: 20 }, // Pekerjaan Ibu
    { wch: 18 }, // No HP
    { wch: 20 }, // Nama Wali
    { wch: 20 }, // Pekerjaan Wali
    { wch: 30 }, // Alamat Ortu
    { wch: 16 }, // Tinggi
    { wch: 16 }, // Berat
    { wch: 16 }, // Gol Darah
    { wch: 18 }, // Pendengaran
    { wch: 18 }, // Penglihatan
    { wch: 18 }, // Gigi
  ];

  const instructionsData = [
    {
      'NAMA KOLOM': 'NIS',
      'KEWAJIBAN': 'Opsional (Disarankan)',
      'KETERANGAN & FORMAT': 'Nomor Induk Siswa lokal. Contoh: 2122010. Jika kosong akan dibuatkan otomatis.'
    },
    {
      'NAMA KOLOM': 'NISN',
      'KEWAJIBAN': 'Opsional',
      'KETERANGAN & FORMAT': 'Nomor Induk Siswa Nasional (10 digit). Contoh: 0149982310.'
    },
    {
      'NAMA KOLOM': 'Nama Lengkap',
      'KEWAJIBAN': 'WAJIB',
      'KETERANGAN & FORMAT': 'Nama lengkap sesuai ijazah/akta kelahiran. Contoh: Budi Santoso'
    },
    {
      'NAMA KOLOM': 'Jenis Kelamin (L/P)',
      'KEWAJIBAN': 'WAJIB',
      'KETERANGAN & FORMAT': 'Isi L untuk Laki-laki, P untuk Perempuan.'
    },
    {
      'NAMA KOLOM': 'Diterima di Kelas',
      'KEWAJIBAN': 'Opsional (Default: 1A)',
      'KETERANGAN & FORMAT': 'Pilihan Rombel/Kelas: 1A, 1B, 2A, 2B, 3A, 3B, 4A, 4B, 5A, 5B, 6A, 6B.'
    },
    {
      'NAMA KOLOM': 'Status Siswa',
      'KEWAJIBAN': 'Opsional (Default: Aktif)',
      'KETERANGAN & FORMAT': 'Pilihan status: Aktif, Lulus, Pindah, atau Keluar.'
    },
    {
      'NAMA KOLOM': 'Data Orang Tua & Fisik',
      'KEWAJIBAN': 'Opsional',
      'KETERANGAN & FORMAT': 'Isikan Nama/NIK/Pekerjaan Ayah & Ibu, No HP, Serta Tinggi/Berat Badan & Kesehatan Siswa.'
    }
  ];

  const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
  instructionsSheet['!cols'] = [
    { wch: 25 },
    { wch: 25 },
    { wch: 65 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Petunjuk Pengisian');

  XLSX.writeFile(workbook, 'Template_Import_Siswa_SD_Lengkap.xlsx');
};

// Helper function to extract normalized value from Excel row regardless of header variations
const getFlexibleValue = (row: Record<string, any>, possibleKeys: string[], defaultVal: string = ''): string => {
  const rowKeys = Object.keys(row);
  for (const pKey of possibleKeys) {
    const normalizedTarget = pKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const rKey of rowKeys) {
      const normalizedRowKey = rKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedRowKey === normalizedTarget || normalizedRowKey.includes(normalizedTarget)) {
        const val = row[rKey];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          // Clean up numeric formatting like 2.122e+06 or trailing decimals
          let strVal = String(val).trim();
          if (/^\d+\.0+$/.test(strVal)) {
            strVal = strVal.replace(/\.0+$/, '');
          }
          return strVal;
        }
      }
    }
  }
  return defaultVal;
};

export const parseExcelFile = (file: File): Promise<Omit<StudentDetail, 'id'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true, raw: false });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('Lembar kerja (sheet) tidak ditemukan dalam berkas Excel.');
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

        if (!rawRows || rawRows.length === 0) {
          throw new Error('File Excel kosong atau format tidak sesuai.');
        }

        const parsedStudents: Omit<StudentDetail, 'id'>[] = rawRows.map((row) => {
          const namaLengkap = getFlexibleValue(row, ['Nama Lengkap', 'Nama Siswa', 'Nama', 'NamaLengkap', 'Fullname']);

          if (!namaLengkap) return null;

          const nis = getFlexibleValue(row, ['NIS', 'No Induk', 'Nomor Induk']);
          const nisn = getFlexibleValue(row, ['NISN', 'No Induk Nasional']);

          const jkRaw = getFlexibleValue(row, ['Jenis Kelamin (L/P)', 'Jenis Kelamin', 'JK', 'Gender', 'Sex'], 'L').toUpperCase();
          const jenisKelamin: 'L' | 'P' = jkRaw.startsWith('P') || jkRaw.includes('PEREMPUAN') ? 'P' : 'L';

          const statusRaw = getFlexibleValue(row, ['Status Siswa (Aktif/Lulus/Pindah/Keluar)', 'Status Siswa', 'Status'], 'Aktif');
          let statusSiswa: 'Aktif' | 'Lulus' | 'Pindah' | 'Keluar' = 'Aktif';
          
          if (/lulus/i.test(statusRaw)) statusSiswa = 'Lulus';
          else if (/pindah/i.test(statusRaw)) statusSiswa = 'Pindah';
          else if (/keluar|putus|do/i.test(statusRaw)) statusSiswa = 'Keluar';

          const kelasVal = getFlexibleValue(row, ['Diterima di Kelas', 'Kelas Diterima', 'Kelas', 'Rombel'], '1A');
          let diterimaDiKelas: string | number = kelasVal || '1A';

          const namaPanggilan = getFlexibleValue(row, ['Nama Panggilan', 'Panggilan'], namaLengkap.split(' ')[0]);
          const tempatLahir = getFlexibleValue(row, ['Tempat Lahir', 'TempatLahir', 'Tempat'], 'Bandung');
          const tanggalLahir = getFlexibleValue(row, ['Tanggal Lahir (DD MMMM YYYY)', 'Tanggal Lahir', 'Tgl Lahir'], '01 Januari 2015');
          const agama = getFlexibleValue(row, ['Agama', 'Religion'], 'Islam');
          const kewarganegaraan = getFlexibleValue(row, ['Kewarganegaraan', 'Warga Negara'], 'WNI');

          const statusAnak = getFlexibleValue(row, ['Status Anak (Kandung/Tiri/Angkat)', 'Status Anak', 'StatusAnak'], 'Kandung') as 'Kandung' | 'Tiri' | 'Angkat';
          const anakKe = parseInt(getFlexibleValue(row, ['Anak Ke', 'Anak Ke-', 'AnakKe'], '1'), 10) || 1;
          const jumlahSaudaraKandung = parseInt(getFlexibleValue(row, ['Jumlah Saudara Kandung', 'Saudara Kandung'], '1'), 10) || 1;
          const bahasaSehariHari = getFlexibleValue(row, ['Bahasa Sehari-hari', 'Bahasa'], 'Bahasa Indonesia');

          const alamatSiswa = getFlexibleValue(row, ['Alamat Siswa', 'Alamat', 'AlamatSiswa'], 'Bandung');
          const rtRw = getFlexibleValue(row, ['RT/RW', 'RT RW', 'RTRW'], '001/001');
          const dusunDesa = getFlexibleValue(row, ['Dusun/Desa', 'Desa/Dusun', 'Desa', 'Dusun'], 'Citarum');
          const kecamatan = getFlexibleValue(row, ['Kecamatan'], 'Bandung Wetan');
          const kabupaten = getFlexibleValue(row, ['Kabupaten/Kota', 'Kabupaten', 'Kota'], 'Kota Bandung');

          const tinggalDengan = getFlexibleValue(row, ['Tinggal Dengan (Orang Tua/Wali/Kos)', 'Tinggal Dengan', 'TinggalDengan'], 'Orang Tua') as any;
          const jarakKeSekolah = getFlexibleValue(row, ['Jarak ke Sekolah', 'Jarak'], '1 km');
          const transportasi = getFlexibleValue(row, ['Transportasi', 'Angkutan'], 'Jalan Kaki');
          const sekolahAsal = getFlexibleValue(row, ['Sekolah Asal (TK/PAUD)', 'Sekolah Asal', 'Asal Sekolah'], 'TK/PAUD');
          const tanggalDiterima = getFlexibleValue(row, ['Tanggal Diterima', 'Tgl Diterima'], '12 Juli 2021');

          // Parent Data
          const namaAyah = getFlexibleValue(row, ['Nama Ayah', 'Ayah'], '-');
          const nikAyah = getFlexibleValue(row, ['NIK Ayah', 'NIKAyah'], '-');
          const pekerjaanAyah = getFlexibleValue(row, ['Pekerjaan Ayah', 'PekerjaanAyah'], 'Wiraswasta');

          const namaIbu = getFlexibleValue(row, ['Nama Ibu', 'Ibu'], '-');
          const nikIbu = getFlexibleValue(row, ['NIK Ibu', 'NIKIbu'], '-');
          const pekerjaanIbu = getFlexibleValue(row, ['Pekerjaan Ibu', 'PekerjaanIbu'], 'Ibu Rumah Tangga');

          const noHpOrangTua = getFlexibleValue(row, ['No HP Orang Tua', 'No HP', 'HP', 'Telepon Orang Tua'], '-');
          const namaWali = getFlexibleValue(row, ['Nama Wali', 'Wali'], '-');
          const pekerjaanWali = getFlexibleValue(row, ['Pekerjaan Wali'], '-');
          const alamatOrangTua = getFlexibleValue(row, ['Alamat Orang Tua'], alamatSiswa);

          // Physical Data
          const tinggiBadan = parseInt(getFlexibleValue(row, ['Tinggi Badan (cm)', 'Tinggi Badan', 'Tinggi'], '130'), 10) || 130;
          const beratBadan = parseInt(getFlexibleValue(row, ['Berat Badan (kg)', 'Berat Badan', 'Berat'], '30'), 10) || 30;
          const golonganDarah = getFlexibleValue(row, ['Golongan Darah (A/B/AB/O)', 'Golongan Darah', 'Gol Darah'], 'O');
          const pendengaran = getFlexibleValue(row, ['Pendengaran (Baik/Kurang)', 'Pendengaran'], 'Baik');
          const penglihatan = getFlexibleValue(row, ['Penglihatan (Normal/Kacamata)', 'Penglihatan'], 'Normal');
          const gigi = getFlexibleValue(row, ['Gigi (Baik/Berlubang)', 'Gigi'], 'Baik');

          return {
            nis: nis || `2122${Math.floor(100 + Math.random() * 900)}`,
            nisn: nisn || `014${Math.floor(1000000 + Math.random() * 9000000)}`,
            namaLengkap,
            namaPanggilan,
            jenisKelamin,
            tempatLahir,
            tanggalLahir,
            agama,
            kewarganegaraan,
            anakKe,
            jumlahSaudaraKandung,
            jumlahSaudaraTiri: 0,
            jumlahSaudaraAngkat: 0,
            statusAnak,
            bahasaSehariHari,
            alamatSiswa,
            rtRw,
            dusunDesa,
            kecamatan,
            kabupaten,
            tinggalDengan,
            jarakKeSekolah,
            transportasi,
            sekolahAsal,
            diterimaDiKelas,
            tanggalDiterima,
            statusSiswa,
            parentData: {
              namaAyah,
              nikAyah,
              tahunLahirAyah: '1980',
              pendidikanAyah: 'SMA',
              pekerjaanAyah,
              penghasilanAyah: 'Rp 3.000.000 - Rp 5.000.000',
              namaIbu,
              nikIbu,
              tahunLahirIbu: '1982',
              pendidikanIbu: 'SMA',
              pekerjaanIbu,
              penghasilanIbu: 'Tidak Berpenghasilan',
              namaWali,
              pekerjaanWali,
              alamatOrangTua,
              noHpOrangTua
            },
            physicalData: {
              tinggiBadan,
              beratBadan,
              golonganDarah,
              pendengaran,
              penglihatan,
              gigi
            }
          };
        }).filter(Boolean) as Omit<StudentDetail, 'id'>[];

        if (parsedStudents.length === 0) {
          throw new Error('Tidak ada baris siswa valid ditemukan. Pastikan kolom "Nama Lengkap" atau "Nama Siswa" terisi.');
        }

        resolve(parsedStudents);
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export interface ParsedCatatanExcelReport {
  studentNis: string;
  studentNisn: string;
  studentName: string;
  kelas: string | number;
  semester: 1 | 2;
  matchedStudentId?: string;
  grades: {
    code: string;
    namaMataPelajaran: string;
    nilaiAkhir: number;
    kKM: number;
    predikat: 'A' | 'B' | 'C' | 'D';
    deskripsiCapaian: string;
  }[];
  sakit: number;
  izin: number;
  tanpaKeterangan: number;
  catatanWaliKelas: string;
}

/**
 * Downloads a pre-filled Excel template for Catatan Siswa (Grades, Descriptions, Attendance, & Teacher Notes)
 */
export const downloadCatatanExcelTemplate = (
  students: StudentDetail[],
  subjects: { code: string; namaMataPelajaran: string; kKM: number }[],
  activeClass: string | number,
  activeSemester: 1 | 2
) => {
  // Filter students by active class, fallback to all students or sample list
  let targetStudents = students.filter(
    s => String(s.diterimaDiKelas).toLowerCase() === String(activeClass).toLowerCase()
  );

  if (targetStudents.length === 0) {
    targetStudents = students.slice(0, 10);
  }

  if (targetStudents.length === 0) {
    targetStudents = [
      {
        id: '1',
        nis: '2122010',
        nisn: '0149982310',
        namaLengkap: 'Budi Santoso Putra',
        diterimaDiKelas: activeClass,
      } as StudentDetail,
      {
        id: '2',
        nis: '2122011',
        nisn: '0149982311',
        namaLengkap: 'Siti Aminah Lestari',
        diterimaDiKelas: activeClass,
      } as StudentDetail
    ];
  }

  // 1. Sheet Matrix Format (1 Baris Per Siswa)
  const matrixRows = targetStudents.map(s => {
    const row: Record<string, any> = {
      'NIS': s.nis,
      'NISN': s.nisn,
      'Nama Siswa': s.namaLengkap,
      'Kelas': activeClass,
      'Semester': activeSemester,
    };

    subjects.forEach(sub => {
      row[`${sub.code} - Nilai`] = 85;
      row[`${sub.code} - Deskripsi Capaian`] = `Mencapai kompetensi dengan sangat baik dalam materi ${sub.namaMataPelajaran}.`;
    });

    row['Sakit (Hari)'] = 0;
    row['Izin (Hari)'] = 0;
    row['Tanpa Keterangan (Hari)'] = 0;
    row['Catatan Wali Kelas'] = 'Tingkatkan terus prestasi belajar, semangat, dan keaktifan di kelas.';

    return row;
  });

  const matrixSheet = XLSX.utils.json_to_sheet(matrixRows);
  
  // Set matrix sheet column widths
  const matrixCols = [
    { wch: 12 }, // NIS
    { wch: 14 }, // NISN
    { wch: 28 }, // Nama
    { wch: 10 }, // Kelas
    { wch: 10 }, // Semester
  ];
  subjects.forEach(() => {
    matrixCols.push({ wch: 12 }); // Nilai
    matrixCols.push({ wch: 50 }); // Deskripsi
  });
  matrixCols.push({ wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 50 });
  matrixSheet['!cols'] = matrixCols;

  // 2. Sheet Per Mapel Format (Baris Per Mapel)
  const perMapelRows: any[] = [];
  targetStudents.forEach(s => {
    subjects.forEach(sub => {
      perMapelRows.push({
        'NIS': s.nis,
        'NISN': s.nisn,
        'Nama Siswa': s.namaLengkap,
        'Kelas': activeClass,
        'Semester': activeSemester,
        'Kode Mapel': sub.code,
        'Mata Pelajaran': sub.namaMataPelajaran,
        'Nilai Akhir': 85,
        'KKM': sub.kKM || 70,
        'Deskripsi Capaian Pembelajaran': `Mencapai kompetensi dengan sangat baik dalam materi ${sub.namaMataPelajaran}.`,
        'Sakit': 0,
        'Izin': 0,
        'Tanpa Keterangan': 0,
        'Catatan Wali Kelas': 'Tingkatkan terus prestasi belajar.'
      });
    });
  });

  const perMapelSheet = XLSX.utils.json_to_sheet(perMapelRows);
  perMapelSheet['!cols'] = [
    { wch: 12 }, // NIS
    { wch: 14 }, // NISN
    { wch: 28 }, // Nama
    { wch: 10 }, // Kelas
    { wch: 10 }, // Semester
    { wch: 12 }, // Kode
    { wch: 28 }, // Mapel
    { wch: 12 }, // Nilai
    { wch: 8 },  // KKM
    { wch: 55 }, // Deskripsi
    { wch: 8 },  // Sakit
    { wch: 8 },  // Izin
    { wch: 14 }, // Tanpa Ket
    { wch: 45 }  // Catatan Wali
  ];

  // 3. Instructions Sheet
  const instructionsData = [
    {
      'PETUNJUK': 'FORMAT 1: Matrix (Setiap siswa 1 baris)',
      'PENJELASAN': 'Gunakan Lembar "Catatan Nilai (Matrix)". Setiap kolom memiliki judul [KODE_MAPEL] - Nilai dan [KODE_MAPEL] - Deskripsi Capaian.'
    },
    {
      'PETUNJUK': 'FORMAT 2: Per Mapel (Setiap siswa x mapel)',
      'PENJELASAN': 'Gunakan Lembar "Catatan Nilai (Per Mapel)". Isikan Kode Mapel, Nilai Akhir (0-100), dan Deskripsi Capaian.'
    },
    {
      'PETUNJUK': 'NILAI AKHIR',
      'PENJELASAN': 'Isikan angka rentang 0 - 100. Predikat A (>=90), B (>=80), C (>=70), D (<70) akan dihitung otomatis.'
    },
    {
      'PETUNJUK': 'DESKRIPSI CAPAIAN',
      'PENJELASAN': 'Isi dengan kalimat deskripsi capaian kompetensi siswa (misal: "Mencapai kompetensi dengan sangat baik dalam hal...").'
    },
    {
      'PETUNJUK': 'ABSENSI & CATATAN WALI KELAS',
      'PENJELASAN': 'Isikan jumlah hari Sakit, Izin, Tanpa Keterangan, serta teks Catatan Wali Kelas.'
    }
  ];

  const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
  instructionsSheet['!cols'] = [{ wch: 35 }, { wch: 75 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, matrixSheet, 'Catatan Nilai (Matrix)');
  XLSX.utils.book_append_sheet(workbook, perMapelSheet, 'Catatan Nilai (Per Mapel)');
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Petunjuk Pengisian');

  XLSX.writeFile(
    workbook,
    `Template_Input_Catatan_Nilai_Kelas_${activeClass}_Sem${activeSemester}.xlsx`
  );
};

/**
 * Parses uploaded Excel file for Catatan Siswa (grades, descriptions, attendance, & notes)
 */
export const parseCatatanExcelFile = (
  file: File,
  subjectList: { code: string; namaMataPelajaran: string; kKM: number }[]
): Promise<ParsedCatatanExcelReport[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true, raw: false });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Lembar kerja (sheet) tidak ditemukan dalam berkas Excel.');
        }

        // Try reading first relevant sheet that has data
        let targetSheetName = workbook.SheetNames[0];
        for (const name of workbook.SheetNames) {
          if (!name.toLowerCase().includes('petunjuk')) {
            targetSheetName = name;
            break;
          }
        }

        const worksheet = workbook.Sheets[targetSheetName];
        const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

        if (!rawRows || rawRows.length === 0) {
          throw new Error('File Excel kosong atau format tidak sesuai.');
        }

        const reportsMap = new Map<string, ParsedCatatanExcelReport>();

        rawRows.forEach((row, index) => {
          const nis = getFlexibleValue(row, ['NIS', 'No Induk', 'Nomor Induk']);
          const nisn = getFlexibleValue(row, ['NISN', 'No Induk Nasional']);
          const namaSiswa = getFlexibleValue(row, ['Nama Siswa', 'Nama Lengkap', 'Nama', 'NamaSiswa']);

          if (!nis && !nisn && !namaSiswa) return;

          const studentKey = (nis || nisn || namaSiswa).toLowerCase().trim();

          const kelasVal = getFlexibleValue(row, ['Kelas', 'Rombel', 'Diterima di Kelas'], '1A');
          const semVal = getFlexibleValue(row, ['Semester', 'Sem'], '1');
          const semester: 1 | 2 = String(semVal).includes('2') ? 2 : 1;

          const sakitNum = parseInt(getFlexibleValue(row, ['Sakit (Hari)', 'Sakit', 'S'], '0'), 10) || 0;
          const izinNum = parseInt(getFlexibleValue(row, ['Izin (Hari)', 'Izin', 'I'], '0'), 10) || 0;
          const alpaNum = parseInt(getFlexibleValue(row, ['Tanpa Keterangan (Hari)', 'Tanpa Keterangan', 'Alpa', 'A', 'TK'], '0'), 10) || 0;
          const catatanWali = getFlexibleValue(row, ['Catatan Wali Kelas', 'Catatan Wali', 'Catatan', 'Pesan Wali Kelas'], '');

          // Check if row is Per Mapel format (has 'Kode Mapel' or 'Mata Pelajaran')
          const singleMapelCode = getFlexibleValue(row, ['Kode Mapel', 'Kode', 'Mapel Kode']);
          const singleMapelName = getFlexibleValue(row, ['Mata Pelajaran', 'Nama Mata Pelajaran', 'Nama Mapel', 'Mapel']);

          if (!reportsMap.has(studentKey)) {
            reportsMap.set(studentKey, {
              studentNis: nis,
              studentNisn: nisn,
              studentName: namaSiswa || `Siswa ${index + 1}`,
              kelas: kelasVal,
              semester,
              grades: [],
              sakit: sakitNum,
              izin: izinNum,
              tanpaKeterangan: alpaNum,
              catatanWaliKelas: catatanWali
            });
          }

          const existingReport = reportsMap.get(studentKey)!;
          if (sakitNum > 0) existingReport.sakit = sakitNum;
          if (izinNum > 0) existingReport.izin = izinNum;
          if (alpaNum > 0) existingReport.tanpaKeterangan = alpaNum;
          if (catatanWali) existingReport.catatanWaliKelas = catatanWali;

          // Case A: Row per Subject format
          if (singleMapelCode || singleMapelName) {
            // Find subject match
            const matchedSub = subjectList.find(s =>
              s.code.toLowerCase() === singleMapelCode.toLowerCase() ||
              s.namaMataPelajaran.toLowerCase() === singleMapelName.toLowerCase() ||
              singleMapelName.toLowerCase().includes(s.namaMataPelajaran.toLowerCase()) ||
              s.namaMataPelajaran.toLowerCase().includes(singleMapelName.toLowerCase())
            ) || {
              code: singleMapelCode || `MAPEL_${index}`,
              namaMataPelajaran: singleMapelName || singleMapelCode || 'Mata Pelajaran',
              kKM: 70
            };

            const nilaiRaw = getFlexibleValue(row, ['Nilai Akhir', 'Nilai', 'Nilai Rapor', 'Score']);
            const nilaiAkhir = parseInt(nilaiRaw, 10) || 0;
            const kKM = parseInt(getFlexibleValue(row, ['KKM', 'Kriteria Minimum'], String(matchedSub.kKM || 70)), 10) || 70;
            const descRaw = getFlexibleValue(row, ['Deskripsi Capaian Pembelajaran', 'Deskripsi Capaian', 'Deskripsi', 'Capaian Pembelajaran']);

            let predikat: 'A' | 'B' | 'C' | 'D' = 'C';
            if (nilaiAkhir >= 90) predikat = 'A';
            else if (nilaiAkhir >= 80) predikat = 'B';
            else if (nilaiAkhir >= 70) predikat = 'C';
            else predikat = 'D';

            // Avoid duplicate subject entry in grades list
            const existingIndex = existingReport.grades.findIndex(g => g.code === matchedSub.code);
            const gradeItem = {
              code: matchedSub.code,
              namaMataPelajaran: matchedSub.namaMataPelajaran,
              nilaiAkhir,
              kKM,
              predikat,
              deskripsiCapaian: descRaw || 'Mencapai kompetensi dengan baik.'
            };

            if (existingIndex !== -1) {
              existingReport.grades[existingIndex] = gradeItem;
            } else {
              existingReport.grades.push(gradeItem);
            }
          } else {
            // Case B: Matrix format (Columns per subject)
            subjectList.forEach(sub => {
              const codePattern = sub.code.toLowerCase();
              const namePattern = sub.namaMataPelajaran.toLowerCase();

              // Look for columns like "PAI - Nilai", "PAI Nilai", "Nilai PAI", "Pendidikan Agama Islam - Nilai", etc.
              const possibleNilaiKeys = [
                `${sub.code} - Nilai`,
                `${sub.code} Nilai`,
                `Nilai ${sub.code}`,
                `Nilai_${sub.code}`,
                `${sub.namaMataPelajaran} - Nilai`,
                `${sub.namaMataPelajaran} Nilai`
              ];

              const possibleDescKeys = [
                `${sub.code} - Deskripsi Capaian`,
                `${sub.code} - Deskripsi`,
                `${sub.code} Deskripsi`,
                `Deskripsi ${sub.code}`,
                `Deskripsi_${sub.code}`,
                `${sub.namaMataPelajaran} - Deskripsi Capaian`,
                `${sub.namaMataPelajaran} - Deskripsi`,
                `${sub.namaMataPelajaran} Deskripsi`
              ];

              const nilaiVal = getFlexibleValue(row, possibleNilaiKeys, '');
              const descVal = getFlexibleValue(row, possibleDescKeys, '');

              if (nilaiVal !== '' || descVal !== '') {
                const nilaiAkhir = parseInt(nilaiVal, 10) || 0;
                let predikat: 'A' | 'B' | 'C' | 'D' = 'C';
                if (nilaiAkhir >= 90) predikat = 'A';
                else if (nilaiAkhir >= 80) predikat = 'B';
                else if (nilaiAkhir >= 70) predikat = 'C';
                else predikat = 'D';

                const existingIndex = existingReport.grades.findIndex(g => g.code === sub.code);
                const gradeItem = {
                  code: sub.code,
                  namaMataPelajaran: sub.namaMataPelajaran,
                  nilaiAkhir,
                  kKM: sub.kKM || 70,
                  predikat,
                  deskripsiCapaian: descVal || 'Mencapai kompetensi dengan baik.'
                };

                if (existingIndex !== -1) {
                  existingReport.grades[existingIndex] = gradeItem;
                } else {
                  existingReport.grades.push(gradeItem);
                }
              }
            });
          }
        });

        const results = Array.from(reportsMap.values());
        if (results.length === 0) {
          throw new Error('Tidak ada data catatan/nilai siswa yang dapat dibaca dari berkas Excel ini.');
        }

        resolve(results);
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};


