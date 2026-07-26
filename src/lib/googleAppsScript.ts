import { AcademicYearData, SchoolData, StudentDetail, StudentSemesterRecord, SubjectItem } from '../types';

export interface AppsScriptConfig {
  webAppUrl: string;
  spreadsheetId?: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

const STORAGE_CONFIG_KEY = 'buku_induk_apps_script_config';

export const getSavedAppsScriptConfig = (): AppsScriptConfig | null => {
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse Apps Script config from localStorage:', err);
    return null;
  }
};

export const saveAppsScriptConfig = (config: Partial<AppsScriptConfig>) => {
  try {
    const existing = getSavedAppsScriptConfig() || {
      webAppUrl: '',
      autoSync: true,
    };
    const updated = { ...existing, ...config };
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save Apps Script config:', err);
    return null;
  }
};

export const clearAppsScriptConfig = () => {
  localStorage.removeItem(STORAGE_CONFIG_KEY);
};

export interface SyncReport {
  success: boolean;
  webAppUrl?: string;
  errors: string[];
  lastSyncedAt?: Date;
  details?: string;
}

/**
 * Standard Google Apps Script (Code.gs) template to paste into Google Sheets -> Extensions -> Apps Script
 */
export const RECOMMENDED_GS_CODE = `/**
 * BUKU INDUK SISWA SD - GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * -------------------------------------------------------------
 * Petunjuk Penggunaan:
 * 1. Buka Google Spreadsheet Anda.
 * 2. Klik menu Ekstensi -> Apps Script.
 * 3. Hapus semua kode default, lalu Paste (Tempel) seluruh kode di bawah ini.
 * 4. Klik "Simpan" (ikon disket).
 * 5. Jalankan fungsi "setupDatabase" sekali ATAU klik menu di Spreadsheet:
 *    "Buku Induk Database" -> "Inisialisasi / Setup Database Sheets".
 * 6. Klik tombol "Terapkan" (Deploy) -> "Terapkan sebagai Aplikasi Web" (New Deployment).
 * 7. Pilih:
 *    - Jalankan sebagai (Execute as): Saya (Me / email Anda)
 *    - Yang memiliki akses (Who has access): Siapa saja (Anyone)
 * 8. Klik "Terapkan" (Deploy), lalu Salin (Copy) URL Aplikasi Web (Web App URL).
 * 9. Tempelkan URL tersebut ke dalam aplikasi Buku Induk Siswa.
 */

// Menu kustom di Google Sheets untuk membuat & memformat tabel otomatis
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Buku Induk Database')
      .addItem('1. Inisialisasi / Setup Database Sheets (initDatabase)', 'initDatabase')
      .addSeparator()
      .addItem('2. Cek Status Database', 'checkDatabaseStatus')
      .addToUi();
  } catch (e) {
    // Abaikan jika dipanggil diluar Spreadsheet UI
  }
}

/**
 * ALIAS UNTUK SETUP DATABASE (initDatabase)
 */
function initDatabase() {
  return setupDatabase();
}

/**
 * MENGATUR & MEMBUAT SELURUH TABEL DATABASE OTOMATIS
 */
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet Data_Sekolah
  var sheetSekolah = getOrCreateSheet(ss, "Data_Sekolah");
  if (sheetSekolah.getLastRow() === 0) {
    sheetSekolah.appendRow([
      "NPSN", "Nama Sekolah", "NSS", "Alamat", "Kelurahan", "Kecamatan",
      "Kabupaten/Kota", "Provinsi", "Kode Pos", "Telepon", "Email", "Website",
      "Kepala Sekolah", "NIP Kepala Sekolah", "Logo URL"
    ]);
  }
  formatHeaderRow(sheetSekolah, "#047857");

  // 2. Sheet Tahun_Ajaran
  var sheetTahun = getOrCreateSheet(ss, "Tahun_Ajaran");
  if (sheetTahun.getLastRow() === 0) {
    sheetTahun.appendRow(["Tahun Ajaran", "Kurikulum", "Semester Aktif", "Tanggal Rapor", "Rombel List (JSON)", "Wali Kelas (JSON)"]);
    sheetTahun.appendRow([
      "2026/2027", "Kurikulum Merdeka", 1, "",
      JSON.stringify(["Tingkat 1", "Tingkat 2", "Tingkat 3", "Tingkat 4", "Tingkat 5", "Tingkat 6"]),
      JSON.stringify({
        "Tingkat 1": { "nama": "Ahmad Syafi'i, S.Pd.", "nip": "198205122008011001" },
        "Tingkat 2": { "nama": "Siti Rahmawati, M.Pd.", "nip": "198503142010012003" },
        "Tingkat 3": { "nama": "Budi Kurniawan, S.Pd.", "nip": "198709212011011005" },
        "Tingkat 4": { "nama": "Dewi Lestari, S.Pd.", "nip": "199001052014022002" },
        "Tingkat 5": { "nama": "Eko Prasetyo, S.Pd.", "nip": "199204182018011004" },
        "Tingkat 6": { "nama": "Hj. Nurlaila, M.Pd.", "nip": "197911102005012001" }
      })
    ]);
  }
  formatHeaderRow(sheetTahun, "#047857");

  // 3. Sheet Mata_Pelajaran
  var sheetSubj = getOrCreateSheet(ss, "Mata_Pelajaran");
  if (sheetSubj.getLastRow() === 0) {
    sheetSubj.appendRow(["Kode", "Nama Mata Pelajaran", "KKM", "Kelompok"]);
    var defaultSubjects = [
      ["PAI", "Pendidikan Agama dan Budi Pekerti", 75, "Wajib"],
      ["PPKN", "Pendidikan Pancasila", 75, "Wajib"],
      ["BINDO", "Bahasa Indonesia", 75, "Wajib"],
      ["MTK", "Matematika", 75, "Wajib"],
      ["IPAS", "IPAS", 75, "Wajib"],
      ["PJOK", "PJOK", 75, "Wajib"],
      ["SBDP", "Seni Budaya dan Prakarya", 75, "Wajib"],
      ["BING", "Bahasa Inggris", 70, "Muatan Lokal"],
      ["BJAWA", "Bahasa Daerah / Jawa", 70, "Muatan Lokal"]
    ];
    for (var i = 0; i < defaultSubjects.length; i++) {
      sheetSubj.appendRow(defaultSubjects[i]);
    }
  }
  formatHeaderRow(sheetSubj, "#047857");

  // 4. Sheet Data_Siswa
  var sheetSiswa = getOrCreateSheet(ss, "Data_Siswa");
  if (sheetSiswa.getLastRow() === 0) {
    sheetSiswa.appendRow([
      "ID", "NIS", "NISN", "Nama Lengkap", "Nama Panggilan", "Jenis Kelamin",
      "Tempat Lahir", "Tanggal Lahir", "Agama", "Kewarganegaraan", "Status Anak",
      "Anak Ke", "Jumlah Saudara Kandung", "Bahasa Sehari-hari", "Alamat Siswa",
      "RT RW", "Desa/Dusun", "Kecamatan", "Kabupaten", "Tinggal Dengan",
      "Jarak ke Sekolah", "Transportasi", "Sekolah Asal", "Diterima di Kelas",
      "Tanggal Diterima", "Status Siswa", "Tahun Lulus", "No Ijazah", "Foto URL",
      "Ayah", "NIK Ayah", "Pekerjaan Ayah", "Ibu", "NIK Ibu", "Pekerjaan Ibu",
      "No HP Orang Tua", "Wali", "Pekerjaan Wali", "Alamat Orang Tua",
      "Parent Data (JSON)", "Physical Data (JSON)"
    ]);
  }
  formatHeaderRow(sheetSiswa, "#047857");

  // 5. Sheet Catatan_Semester
  var sheetRec = getOrCreateSheet(ss, "Catatan_Semester");
  if (sheetRec.getLastRow() === 0) {
    sheetRec.appendRow([
      "Student ID", "Kelas", "Semester", "Tahun Ajaran",
      "Sakit", "Izin", "Tanpa Keterangan", "Catatan Wali Kelas",
      "Ekstrakurikuler (JSON)", "Nilai Grades (JSON)"
    ]);
  }
  formatHeaderRow(sheetRec, "#047857");

  // 6. Sheet Aplikasi_Backup_JSON
  var sheetBackup = getOrCreateSheet(ss, "Aplikasi_Backup_JSON");
  if (sheetBackup.getLastRow() === 0) {
    sheetBackup.appendRow(["Key", "JSON_Value", "Updated_At"]);
  }
  formatHeaderRow(sheetBackup, "#1e293b");

  try {
    SpreadsheetApp.getUi().alert("Setup Database Berhasil!\\nSeluruh worksheet Buku Induk Siswa (6 tabel) siap digunakan.");
  } catch (e) {
    // Abaikan jika dipanggil via Web App API
  }

  return { success: true, message: "Database sheets initialized successfully" };
}

function checkDatabaseStatus() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ["Data_Sekolah", "Tahun_Ajaran", "Mata_Pelajaran", "Data_Siswa", "Catatan_Semester", "Aplikasi_Backup_JSON"];
  var statusList = [];
  for (var i = 0; i < sheets.length; i++) {
    var sh = ss.getSheetByName(sheets[i]);
    statusList.push(sheets[i] + ": " + (sh ? "ADA (" + sh.getLastRow() + " baris)" : "BELUM ADA"));
  }
  try {
    SpreadsheetApp.getUi().alert("Status Database Buku Induk:\\n\\n" + statusList.join("\\n"));
  } catch (e) {
    // Abaikan
  }
}

function formatHeaderRow(sheet, bgColor) {
  if (sheet.getLastRow() > 0) {
    var range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    range.setFontWeight("bold");
    range.setFontColor("#ffffff");
    range.setBackground(bgColor || "#047857");
    sheet.setFrozenRows(1);
  }
}

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : "getAllData";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "ping") {
    return ContentService.createTextOutput(JSON.stringify({
      status: "ok",
      message: "Apps Script Buku Induk terhubung aktif!",
      spreadsheetName: ss.getName(),
      spreadsheetId: ss.getId(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "setupDatabase" || action === "initDatabase") {
    var setupRes = setupDatabase();
    return ContentService.createTextOutput(JSON.stringify(setupRes)).setMimeType(ContentService.MimeType.JSON);
  }

  // Get all data
  try {
    var data = loadAllDataFromSheets(ss);
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var contents = e.postData.contents;
    var payload = JSON.parse(contents);

    var action = payload.action || "saveAllData";
    var data = payload.data || {};

    if (action === "setupDatabase" || action === "initDatabase") {
      setupDatabase();
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Inisialisasi database worksheet (initDatabase) berhasil dibuat!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "saveAllData") {
      saveAllDataToSheets(ss, data);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Seluruh data Buku Induk berhasil disimpan ke Google Spreadsheet!",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Aksi tidak dikenal: " + action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function saveAllDataToSheets(ss, data) {
  var now = new Date().toISOString();

  // 1. Data Sekolah
  if (data.schoolData) {
    var sheetDataSekolah = getOrCreateSheet(ss, "Data_Sekolah");
    sheetDataSekolah.clear();
    var s = data.schoolData;
    sheetDataSekolah.appendRow([
      "NPSN", "Nama Sekolah", "NSS", "Alamat", "Kelurahan", "Kecamatan",
      "Kabupaten/Kota", "Provinsi", "Kode Pos", "Telepon", "Email", "Website",
      "Kepala Sekolah", "NIP Kepala Sekolah", "Logo URL"
    ]);
    sheetDataSekolah.appendRow([
      s.npsn || "", s.namaSekolah || "", s.nss || "", s.alamat || "",
      s.kelurahan || "", s.kecamatan || "", s.kabupaten || "", s.provinsi || "",
      s.kodePos || "", s.telepon || "", s.email || "", s.website || "",
      s.namaKepalaSekolah || "", s.nipKepalaSekolah || "", s.logoUrl || ""
    ]);
  }

  // 2. Tahun Ajaran
  if (data.academicYear) {
    var sheetTahun = getOrCreateSheet(ss, "Tahun_Ajaran");
    sheetTahun.clear();
    var a = data.academicYear;
    sheetTahun.appendRow(["Tahun Ajaran", "Kurikulum", "Semester Aktif", "Tanggal Rapor", "Rombel List (JSON)", "Wali Kelas (JSON)"]);
    sheetTahun.appendRow([
      a.tahunAjaran || "", a.kurikulum || "", a.semesterAktif || 1, a.tanggalRapor || "",
      JSON.stringify(a.rombelList || []), JSON.stringify(a.waliKelasMap || {})
    ]);
  }

  // 3. Mata Pelajaran
  if (data.subjects && Array.isArray(data.subjects)) {
    var sheetSubj = getOrCreateSheet(ss, "Mata_Pelajaran");
    sheetSubj.clear();
    sheetSubj.appendRow(["Kode", "Nama Mata Pelajaran", "KKM", "Kelompok"]);
    for (var i = 0; i < data.subjects.length; i++) {
      var sub = data.subjects[i];
      sheetSubj.appendRow([
        sub.code || "", sub.namaMataPelajaran || "", sub.kKM || 75, sub.kelompok || "Wajib"
      ]);
    }
  }

  // 4. Data Siswa
  if (data.students && Array.isArray(data.students)) {
    var sheetSiswa = getOrCreateSheet(ss, "Data_Siswa");
    sheetSiswa.clear();
    sheetSiswa.appendRow([
      "ID", "NIS", "NISN", "Nama Lengkap", "Nama Panggilan", "Jenis Kelamin",
      "Tempat Lahir", "Tanggal Lahir", "Agama", "Kewarganegaraan", "Status Anak",
      "Anak Ke", "Jumlah Saudara Kandung", "Bahasa Sehari-hari", "Alamat Siswa",
      "RT RW", "Desa/Dusun", "Kecamatan", "Kabupaten", "Tinggal Dengan",
      "Jarak ke Sekolah", "Transportasi", "Sekolah Asal", "Diterima di Kelas",
      "Tanggal Diterima", "Status Siswa", "Tahun Lulus", "No Ijazah", "Foto URL",
      "Ayah", "NIK Ayah", "Pekerjaan Ayah", "Ibu", "NIK Ibu", "Pekerjaan Ibu",
      "No HP Orang Tua", "Wali", "Pekerjaan Wali", "Alamat Orang Tua",
      "Parent Data (JSON)", "Physical Data (JSON)"
    ]);
    for (var j = 0; j < data.students.length; j++) {
      var std = data.students[j];
      var p = std.parentData || {};
      sheetSiswa.appendRow([
        std.id || "", std.nis || "", std.nisn || "", std.namaLengkap || "",
        std.namaPanggilan || "", std.jenisKelamin || "L", std.tempatLahir || "",
        std.tanggalLahir || "", std.agama || "Islam", std.kewarganegaraan || "Indonesia",
        std.statusAnak || "Kandung", std.anakKe || 1, std.jumlahSaudaraKandung || 0,
        std.bahasaSehariHari || "Indonesia", std.alamatSiswa || "", std.rtRw || "",
        std.dusunDesa || "", std.kecamatan || "", std.kabupaten || "",
        std.tinggalDengan || "Orang Tua", std.jarakKeSekolah || "", std.transportasi || "",
        std.sekolahAsal || "", std.diterimaDiKelas || "1A", std.tanggalDiterima || "",
        std.statusSiswa || "Aktif", std.tahunLulus || "", std.noIjazah || "",
        std.fotoUrl || "", p.namaAyah || "", p.nikAyah || "", p.pekerjaanAyah || "",
        p.namaIbu || "", p.nikIbu || "", p.pekerjaanIbu || "", p.noHpOrangTua || "",
        p.namaWali || "", p.pekerjaanWali || "", p.alamatOrangTua || std.alamatSiswa || "",
        JSON.stringify(p), JSON.stringify(std.physicalData || {})
      ]);
    }
  }

  // 5. Catatan Semester
  if (data.semesterRecords && Array.isArray(data.semesterRecords)) {
    var sheetRec = getOrCreateSheet(ss, "Catatan_Semester");
    sheetRec.clear();
    sheetRec.appendRow([
      "Student ID", "Kelas", "Semester", "Tahun Ajaran",
      "Sakit", "Izin", "Tanpa Keterangan", "Catatan Wali Kelas",
      "Ekstrakurikuler (JSON)", "Nilai Grades (JSON)"
    ]);
    for (var k = 0; k < data.semesterRecords.length; k++) {
      var rec = data.semesterRecords[k];
      sheetRec.appendRow([
        String(rec.studentId || "").trim(), String(rec.kelas || "1A").trim(),
        rec.semester || 1, rec.tahunAjaran || "", rec.sakit || 0,
        rec.izin || 0, rec.tanpaKeterangan || 0, rec.catatanWaliKelas || "",
        JSON.stringify(rec.ekstrakurikuler || []), JSON.stringify(rec.grades || [])
      ]);
    }
  }

  // 6. Backup JSON Cadangan
  var sheetBackup = getOrCreateSheet(ss, "Aplikasi_Backup_JSON");
  sheetBackup.clear();
  sheetBackup.appendRow(["Key", "JSON_Value", "Updated_At"]);
  sheetBackup.appendRow(["school_data", JSON.stringify(data.schoolData || {}), now]);
  sheetBackup.appendRow(["academic_year", JSON.stringify(data.academicYear || {}), now]);
  sheetBackup.appendRow(["subjects", JSON.stringify(data.subjects || []), now]);
  sheetBackup.appendRow(["students", JSON.stringify(data.students || []), now]);
  sheetBackup.appendRow(["semester_records", JSON.stringify(data.semesterRecords || []), now]);
}

function loadAllDataFromSheets(ss) {
  // 1. First attempt to read directly from Tabular Worksheets (Data_Sekolah, Data_Siswa, etc.)
  var schoolData = {};
  var sheetSekolah = ss.getSheetByName("Data_Sekolah");
  if (sheetSekolah && sheetSekolah.getLastRow() > 1) {
    var row = sheetSekolah.getRange(2, 1, 1, 15).getValues()[0];
    if (row && (row[0] || row[1])) {
      schoolData = {
        npsn: String(row[0] || ""), namaSekolah: String(row[1] || ""), nss: String(row[2] || ""),
        alamat: String(row[3] || ""), kelurahan: String(row[4] || ""), kecamatan: String(row[5] || ""),
        kabupaten: String(row[6] || ""), provinsi: String(row[7] || ""), kodePos: String(row[8] || ""),
        telepon: String(row[9] || ""), email: String(row[10] || ""), website: String(row[11] || ""),
        namaKepalaSekolah: String(row[12] || ""), nipKepalaSekolah: String(row[13] || ""), logoUrl: String(row[14] || "")
      };
    }
  }

  var academicYear = {};
  var sheetTahun = ss.getSheetByName("Tahun_Ajaran");
  if (sheetTahun && sheetTahun.getLastRow() > 1) {
    var aRow = sheetTahun.getRange(2, 1, 1, 6).getValues()[0];
    if (aRow && aRow[0]) {
      var rombelList = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B", "6A", "6B"];
      var waliKelasMap = {};
      try { if (aRow[4]) rombelList = JSON.parse(aRow[4]); } catch(e){}
      try { if (aRow[5]) waliKelasMap = JSON.parse(aRow[5]); } catch(e){}
      academicYear = {
        tahunAjaran: String(aRow[0] || "2024/2025"),
        kurikulum: String(aRow[1] || "Kurikulum Merdeka"),
        semesterAktif: Number(aRow[2]) === 2 ? 2 : 1,
        tanggalRapor: String(aRow[3] || ""),
        rombelList: rombelList,
        waliKelasMap: waliKelasMap
      };
    }
  }

  var subjects = [];
  var sheetSubj = ss.getSheetByName("Mata_Pelajaran");
  if (sheetSubj && sheetSubj.getLastRow() > 1) {
    var subRows = sheetSubj.getRange(2, 1, sheetSubj.getLastRow() - 1, 4).getValues();
    for (var s = 0; s < subRows.length; s++) {
      if (!subRows[s][0] && !subRows[s][1]) continue;
      subjects.push({
        code: String(subRows[s][0] || ""),
        namaMataPelajaran: String(subRows[s][1] || ""),
        kKM: Number(subRows[s][2]) || 75,
        kelompok: String(subRows[s][3] || "Wajib")
      });
    }
  }

  var students = [];
  var sheetSiswa = ss.getSheetByName("Data_Siswa");
  if (sheetSiswa && sheetSiswa.getLastRow() > 1) {
    var stdRows = sheetSiswa.getRange(2, 1, sheetSiswa.getLastRow() - 1, 41).getValues();
    for (var m = 0; m < stdRows.length; m++) {
      var r = stdRows[m];
      var namaLengkap = String(r[3] || "").trim();
      var nis = String(r[1] || "").trim();
      if (!namaLengkap && !nis) continue;

      var parentData = {};
      try {
        if (r[39]) parentData = JSON.parse(r[39]);
      } catch (e) {}

      var physicalData = {};
      try {
        if (r[40]) physicalData = JSON.parse(r[40]);
        else if (r[36] && String(r[36]).trim().startsWith("{")) physicalData = JSON.parse(r[36]);
      } catch (e) {}

      students.push({
        id: String(r[0] ? String(r[0]).trim() : (nis ? "STD-" + nis : "STD-IDX-" + (m + 1))),
        nis: nis,
        nisn: String(r[2] || "").trim(),
        namaLengkap: namaLengkap,
        namaPanggilan: String(r[4] || "").trim(),
        jenisKelamin: String(r[5] || "").toUpperCase().startsWith("P") ? "P" : "L",
        tempatLahir: String(r[6] || "").trim(),
        tanggalLahir: String(r[7] || "").trim(),
        agama: String(r[8] || "Islam").trim(),
        kewarganegaraan: String(r[9] || "Indonesia").trim(),
        statusAnak: String(r[10] || "Kandung").trim(),
        anakKe: Number(r[11]) || 1,
        jumlahSaudaraKandung: Number(r[12]) || 0,
        jumlahSaudaraTiri: 0,
        jumlahSaudaraAngkat: 0,
        bahasaSehariHari: String(r[13] || "Indonesia").trim(),
        alamatSiswa: String(r[14] || "").trim(),
        rtRw: String(r[15] || "").trim(),
        dusunDesa: String(r[16] || "").trim(),
        kecamatan: String(r[17] || "").trim(),
        kabupaten: String(r[18] || "").trim(),
        tinggalDengan: String(r[19] || "Orang Tua").trim(),
        jarakKeSekolah: String(r[20] || "").trim(),
        transportasi: String(r[21] || "").trim(),
        sekolahAsal: String(r[22] || "").trim(),
        diterimaDiKelas: String(r[23] || "1A").trim(),
        tanggalDiterima: String(r[24] || "").trim(),
        statusSiswa: String(r[25] || "Aktif").trim(),
        tahunLulus: String(r[26] || "").trim(),
        noIjazah: String(r[27] || "").trim(),
        fotoUrl: String(r[28] || "").trim(),
        parentData: {
          namaAyah: parentData.namaAyah || String(r[29] || "").trim(),
          nikAyah: parentData.nikAyah || String(r[30] || "").trim(),
          tahunLahirAyah: parentData.tahunLahirAyah || '1980',
          pendidikanAyah: parentData.pendidikanAyah || 'SMA',
          pekerjaanAyah: parentData.pekerjaanAyah || String(r[31] || "").trim(),
          penghasilanAyah: parentData.penghasilanAyah || 'Rp 3.000.000 - Rp 5.000.000',
          namaIbu: parentData.namaIbu || String(r[32] || "").trim(),
          nikIbu: parentData.nikIbu || String(r[33] || "").trim(),
          tahunLahirIbu: parentData.tahunLahirIbu || '1982',
          pendidikanIbu: parentData.pendidikanIbu || 'SMA',
          pekerjaanIbu: parentData.pekerjaanIbu || String(r[34] || "").trim(),
          penghasilanIbu: parentData.penghasilanIbu || 'Tidak Berpenghasilan',
          noHpOrangTua: parentData.noHpOrangTua || String(r[35] || "").trim(),
          namaWali: parentData.namaWali || String(r[36] || "").trim(),
          pekerjaanWali: parentData.pekerjaanWali || String(r[37] || "").trim(),
          alamatOrangTua: parentData.alamatOrangTua || String(r[38] || r[14] || "").trim()
        },
        physicalData: physicalData
      });
    }
  }

  var semesterRecords = [];
  var sheetRec = ss.getSheetByName("Catatan_Semester");
  if (sheetRec && sheetRec.getLastRow() > 1) {
    var recRows = sheetRec.getRange(2, 1, sheetRec.getLastRow() - 1, 10).getValues();
    for (var n = 0; n < recRows.length; n++) {
      var rowR = recRows[n];
      var stdId = String(rowR[0] || "").trim();
      if (!stdId) continue;
      var eks = []; var grd = [];
      try { if (rowR[8]) eks = JSON.parse(rowR[8]); } catch(e){}
      try { if (rowR[9]) grd = JSON.parse(rowR[9]); } catch(e){}
      semesterRecords.push({
        studentId: stdId,
        kelas: String(rowR[1] || "1A").trim(),
        semester: Number(rowR[2]) === 2 ? 2 : 1,
        tahunAjaran: String(rowR[3] || ""),
        sakit: Number(rowR[4]) || 0,
        izin: Number(rowR[5]) || 0,
        tanpaKeterangan: Number(rowR[6]) || 0,
        catatanWaliKelas: String(rowR[7] || ""),
        ekstrakurikuler: eks,
        grades: grd
      });
    }
  }

  // If tabular sheets contain data, return it directly
  if (students.length > 0 || (schoolData && schoolData.namaSekolah)) {
    return {
      schoolData: schoolData,
      academicYear: academicYear,
      subjects: subjects,
      students: students,
      semesterRecords: semesterRecords
    };
  }

  // Fallback to Aplikasi_Backup_JSON if tabular is uninitialized or empty
  var sheetBackup = ss.getSheetByName("Aplikasi_Backup_JSON");
  if (sheetBackup) {
    var values = sheetBackup.getDataRange().getValues();
    if (values.length > 1) {
      var result = {};
      for (var i = 1; i < values.length; i++) {
        var key = values[i][0];
        var valStr = values[i][1];
        if (key && valStr) {
          try {
            result[key] = JSON.parse(valStr);
          } catch(e) {}
        }
      }
      if (result.school_data || result.students) {
        return {
          schoolData: result.school_data,
          academicYear: result.academic_year,
          subjects: result.subjects,
          students: result.students || [],
          semesterRecords: result.semester_records || []
        };
      }
    }
  }

  return {
    schoolData: schoolData,
    academicYear: academicYear,
    subjects: subjects,
    students: students,
    semesterRecords: semesterRecords
  };
}
`;

/**
 * Tests connection to Google Apps Script Web App URL
 */
export const pingAppsScriptUrl = async (webAppUrl: string): Promise<{ success: boolean; message?: string; details?: any }> => {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return { success: false, message: 'URL Web App Google Apps Script tidak valid. Harus diawali http:// atau https://' };
  }

  try {
    const pingUrl = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=ping`;
    const response = await fetch(pingUrl, { method: 'GET', redirect: 'follow' });
    
    if (!response.ok) {
      throw new Error(`HTTP Error status: ${response.status}`);
    }

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Menerima respon HTML/Text. Pastikan Web App di-deploy dengan Akses: 'Siapa saja (Anyone)' dan URL berakhiran '/exec'");
    }

    if (data.status === 'ok') {
      return {
        success: true,
        message: data.message || 'Koneksi ke Google Apps Script berhasil!',
        details: data
      };
    }
    return {
      success: false,
      message: data.error || 'Respon dari Apps Script tidak sesuai.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal terhubung ke URL Apps Script. Pastikan URL benar & Otorisasi 'Siapa saja (Anyone)' diaktifkan. (${err.message || String(err)})`
    };
  }
};

/**
 * Syncs all app data to Google Spreadsheet via Google Apps Script Web App API
 */
export const syncAllDataToAppsScript = async (
  webAppUrl: string,
  schoolData: SchoolData,
  academicYear: AcademicYearData,
  students: StudentDetail[],
  semesterRecords: StudentSemesterRecord[],
  subjects: SubjectItem[]
): Promise<SyncReport> => {
  const report: SyncReport = {
    success: false,
    errors: [],
  };

  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    report.errors.push('URL Google Apps Script Web App belum dikonfigurasi.');
    return report;
  }

  try {
    const payload = {
      action: 'saveAllData',
      data: {
        schoolData,
        academicYear,
        students,
        semesterRecords,
        subjects,
      },
    };

    // Note: Google Apps Script Web App POST redirects 302 to googleusercontent.
    // fetch with redirect: 'follow' and text/plain content type bypasses CORS preflight
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const text = await response.text();
    let result: any;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error("Menerima balasan HTML. Pastikan Web App di-deploy dengan Akses: 'Siapa saja (Anyone)' dan URL berakhiran '/exec'");
    }

    if (result.success) {
      report.success = true;
      report.webAppUrl = webAppUrl;
      report.lastSyncedAt = new Date();
      saveAppsScriptConfig({ webAppUrl, lastSyncedAt: report.lastSyncedAt.toISOString() });
      return report;
    } else {
      report.errors.push(result.error || 'Google Apps Script mengembalikan error.');
      return report;
    }
  } catch (err: any) {
    report.errors.push(`Gagal menyimpan ke Google Sheets via Apps Script: ${err.message || String(err)}`);
    return report;
  }
};

/**
 * Loads all data from Google Spreadsheet via Google Apps Script Web App API
 */
export const loadDataFromAppsScript = async (
  webAppUrl: string
): Promise<{
  success: boolean;
  schoolData?: SchoolData;
  academicYear?: AcademicYearData;
  students?: StudentDetail[];
  semesterRecords?: StudentSemesterRecord[];
  subjects?: SubjectItem[];
  error?: string;
}> => {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return { success: false, error: 'URL Google Apps Script Web App belum diisi.' };
  }

  try {
    const fetchUrl = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=getAllData`;
    const response = await fetch(fetchUrl, { method: 'GET', redirect: 'follow' });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const text = await response.text();
    let result: any;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error("Menerima balasan HTML dari Apps Script. Pastikan Web App di-deploy dengan Akses: 'Siapa saja (Anyone)' dan URL berakhiran '/exec'");
    }

    if (result.success && result.data) {
      const d = result.data;
      return {
        success: true,
        schoolData: d.schoolData && Object.keys(d.schoolData).length > 0 ? d.schoolData : undefined,
        academicYear: d.academicYear && Object.keys(d.academicYear).length > 0 ? d.academicYear : undefined,
        students: Array.isArray(d.students) && d.students.length > 0 ? d.students : undefined,
        semesterRecords: Array.isArray(d.semesterRecords) ? d.semesterRecords : [],
        subjects: Array.isArray(d.subjects) && d.subjects.length > 0 ? d.subjects : undefined,
      };
    } else {
      return { success: false, error: result.error || 'Gagal membaca data dari Google Apps Script.' };
    }
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
};
