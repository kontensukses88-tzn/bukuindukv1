import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  RECOMMENDED_GS_CODE,
  getSavedAppsScriptConfig,
  saveAppsScriptConfig,
  pingAppsScriptUrl,
  syncAllDataToAppsScript,
  loadDataFromAppsScript,
} from '../lib/googleAppsScript';
import {
  createGoogleSpreadsheet,
  getSavedSpreadsheetConfig,
  saveSpreadsheetConfig,
  syncAllDataToGoogleSheets,
  loadDataFromGoogleSheets,
  clearSpreadsheetConfig,
  extractSpreadsheetId,
} from '../lib/googleSheets';
import {
  signInWithGoogle,
  initAuthListener,
  logoutGoogle,
  getCachedAccessToken,
} from '../lib/googleAuth';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Code2,
  CloudUpload,
  CloudDownload,
  Info,
  ShieldCheck,
  Zap,
  Globe,
  ChevronDown,
  ChevronUp,
  LogIn,
  LogOut,
  PlusCircle,
  Key,
  Database,
  Layers,
  FolderSync,
} from 'lucide-react';

export const SpreadsheetSyncCard: React.FC = () => {
  const {
    schoolData,
    academicYear,
    students,
    semesterRecords,
    subjects,
    setSchoolData,
    setAcademicYear,
    setStudents,
    setSemesterRecords,
    setSubjects,
    webAppUrl,
    setWebAppUrl,
    spreadsheetId,
    setSpreadsheetId,
    accessToken,
    setAccessToken,
    autoSyncEnabled,
    setAutoSyncEnabled,
    lastSyncedAt,
    setLastSyncedAt,
    syncError,
    setSyncError,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'oauth' | 'apps_script'>('oauth');
  
  // Apps Script State
  const [inputUrl, setInputUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [copiedGs, setCopiedGs] = useState(false);
  const [showGsCodeModal, setShowGsCodeModal] = useState(false);

  // Direct Google OAuth State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [inputSpreadsheetId, setInputSpreadsheetId] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);

  // Common Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize saved configurations and Google Auth listener
  useEffect(() => {
    // Apps Script Config
    const savedGs = getSavedAppsScriptConfig();
    if (savedGs?.webAppUrl) {
      setInputUrl(savedGs.webAppUrl);
      if (!webAppUrl) setWebAppUrl(savedGs.webAppUrl);
    }

    // Google OAuth / Sheets Config
    const savedSheets = getSavedSpreadsheetConfig();
    if (savedSheets?.spreadsheetId) {
      setInputSpreadsheetId(savedSheets.spreadsheetId);
      if (!spreadsheetId) setSpreadsheetId(savedSheets.spreadsheetId);
    }
    if (savedSheets?.accessToken && !accessToken) {
      setAccessToken(savedSheets.accessToken);
    }

    // Firebase Auth State Listener
    const unsubscribe = initAuthListener(
      (user, token) => {
        setGoogleUser(user);
        if (token) {
          setAccessToken(token);
          saveSpreadsheetConfig({
            accessToken: token,
            googleUserEmail: user.email || '',
            googleUserName: user.displayName || '',
          });
        }
      },
      () => {
        setGoogleUser(null);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update input fields when context changes
  useEffect(() => {
    if (webAppUrl) setInputUrl(webAppUrl);
  }, [webAppUrl]);

  useEffect(() => {
    if (spreadsheetId) setInputSpreadsheetId(spreadsheetId);
  }, [spreadsheetId]);

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setSyncError(null);
    setSuccessMessage(null);
    try {
      const res = await signInWithGoogle();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        saveSpreadsheetConfig({
          accessToken: res.accessToken,
          googleUserEmail: res.user.email || '',
          googleUserName: res.user.displayName || '',
        });
        setSuccessMessage(`Berhasil masuk sebagai ${res.user.displayName || res.user.email}! Akses Google Drive & Sheets diaktifkan.`);
      }
    } catch (err: any) {
      setSyncError(`Gagal melakukan Sign-In Google: ${err.message || String(err)}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Google Logout
  const handleGoogleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin memutuskan akun Google dari aplikasi ini?')) {
      await logoutGoogle();
      setGoogleUser(null);
      setAccessToken('');
      saveSpreadsheetConfig({ accessToken: '' });
      setSuccessMessage('Akun Google berhasil diputuskan.');
    }
  };

  // Create new Google Spreadsheet directly in Google Drive
  const handleCreateNewSpreadsheet = async () => {
    const activeToken = accessToken || getCachedAccessToken();
    if (!activeToken) {
      setSyncError('Token Akses Google belum tersedia. Silakan hubungkan akun Google terlebih dahulu.');
      return;
    }

    const titlePrompt = prompt('Masukkan Nama File Google Spreadsheet Baru:', `Buku Induk Siswa - ${schoolData.namaSekolah || 'SD'}`);
    if (!titlePrompt) return;

    setIsCreatingSheet(true);
    setSyncError(null);
    setSuccessMessage(null);

    const res = await createGoogleSpreadsheet(activeToken, titlePrompt);
    setIsCreatingSheet(false);

    if (res.success && res.spreadsheetId) {
      setSpreadsheetId(res.spreadsheetId);
      setInputSpreadsheetId(res.spreadsheetId);
      saveSpreadsheetConfig({ spreadsheetId: res.spreadsheetId });
      setSuccessMessage(`Berhasil membuat Google Spreadsheet baru! (ID: ${res.spreadsheetId})`);
    } else {
      setSyncError(res.error || 'Gagal membuat Google Spreadsheet baru.');
    }
  };

  // Save Spreadsheet ID manually
  const handleSaveSpreadsheetId = () => {
    const rawInput = inputSpreadsheetId.trim();
    if (!rawInput) {
      setSyncError('Masukkan ID atau URL Google Spreadsheet terlebih dahulu.');
      return;
    }

    if (rawInput.includes('script.google.com') || rawInput.includes('/macros/s/')) {
      setWebAppUrl(rawInput);
      setInputUrl(rawInput);
      saveAppsScriptConfig({ webAppUrl: rawInput });
      setActiveTab('appsScript');
      setSuccessMessage('URL Google Apps Script terdeteksi! Berhasil dipindahkan & disimpan ke Tab Google Apps Script (GAS).');
      return;
    }

    const cleanId = extractSpreadsheetId(rawInput);
    if (!cleanId) {
      setSyncError('ID atau URL Google Spreadsheet tidak valid. Pastikan formatnya URL Spreadsheet "https://docs.google.com/spreadsheets/d/ID" atau ID 44 karakter.');
      return;
    }
    setSpreadsheetId(cleanId);
    setInputSpreadsheetId(cleanId);
    saveSpreadsheetConfig({ spreadsheetId: cleanId });
    setSuccessMessage('ID Google Spreadsheet berhasil disimpan!');
  };

  // Direct Push to Google Sheets API
  const handlePushDirectToSheets = async () => {
    const rawInput = (inputSpreadsheetId || spreadsheetId).trim();
    if (rawInput.includes('script.google.com') || rawInput.includes('/macros/s/')) {
      setWebAppUrl(rawInput);
      setInputUrl(rawInput);
      saveAppsScriptConfig({ webAppUrl: rawInput });
      return handlePushToAppsScript();
    }

    let targetId = extractSpreadsheetId(spreadsheetId || inputSpreadsheetId);
    let activeToken = accessToken || getCachedAccessToken();

    // Fallback to Apps Script if configured and Direct OAuth is unconfigured
    if (!activeToken && !targetId && (webAppUrl || inputUrl.trim())) {
      return handlePushToAppsScript();
    }

    if (!activeToken) {
      setSyncError('Meminta otorisasi Google... Silakan masuk dengan akun Google.');
      try {
        const res = await signInWithGoogle();
        if (res) {
          activeToken = res.accessToken;
          setGoogleUser(res.user);
          setAccessToken(res.accessToken);
        }
      } catch (e: any) {
        setSyncError(`Gagal Login Google: ${e.message || String(e)}`);
        return;
      }
    }

    if (!targetId) {
      const promptRes = prompt('Masukkan ID atau URL Google Spreadsheet Target:', inputSpreadsheetId);
      if (!promptRes) return;

      if (promptRes.includes('script.google.com') || promptRes.includes('/macros/s/')) {
        setWebAppUrl(promptRes.trim());
        setInputUrl(promptRes.trim());
        saveAppsScriptConfig({ webAppUrl: promptRes.trim() });
        return handlePushToAppsScript();
      }

      targetId = extractSpreadsheetId(promptRes);
      if (!targetId) {
        setSyncError('ID Google Spreadsheet tidak valid.');
        return;
      }
      setSpreadsheetId(targetId);
      setInputSpreadsheetId(targetId);
      saveSpreadsheetConfig({ spreadsheetId: targetId });
    }

    if (!confirm(`Apakah Anda yakin ingin menyimpan seluruh data ke Google Spreadsheet?\n\nFile ID: ${targetId}\n\nData di Google Sheets akan diperbarui dengan data saat ini (${students.length} Siswa, ${semesterRecords.length} Catatan Semester).`)) {
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    setSuccessMessage(null);

    let report = await syncAllDataToGoogleSheets(
      targetId,
      activeToken,
      schoolData,
      academicYear,
      students,
      semesterRecords,
      subjects
    );

    // Auto retry if token expired
    if (!report.success && report.errors.some(e => e.includes('TOKEN_EXPIRED') || e.includes('401') || e.includes('UNAUTHENTICATED'))) {
      try {
        const loginRes = await signInWithGoogle();
        if (loginRes?.accessToken) {
          setAccessToken(loginRes.accessToken);
          report = await syncAllDataToGoogleSheets(
            targetId,
            loginRes.accessToken,
            schoolData,
            academicYear,
            students,
            semesterRecords,
            subjects
          );
        }
      } catch (e) {
        // ignore login error
      }
    }

    setIsSyncing(false);

    if (report.success) {
      setLastSyncedAt(new Date());
      setSuccessMessage(
        `Sukses! Data ${students.length} Siswa & ${semesterRecords.length} Catatan Semester berhasil tersimpan di Google Spreadsheet!`
      );
    } else {
      setSyncError(report.errors.join(' | '));
    }
  };

  // Direct Pull from Google Sheets API
  const handlePullDirectFromSheets = async () => {
    const rawInput = (inputSpreadsheetId || spreadsheetId).trim();
    if (rawInput.includes('script.google.com') || rawInput.includes('/macros/s/')) {
      setWebAppUrl(rawInput);
      setInputUrl(rawInput);
      saveAppsScriptConfig({ webAppUrl: rawInput });
      return handlePullFromAppsScript();
    }

    let targetId = extractSpreadsheetId(spreadsheetId || inputSpreadsheetId);
    let activeToken = accessToken || getCachedAccessToken();

    // Fallback to Apps Script if configured and Direct OAuth is unconfigured
    if (!activeToken && !targetId && (webAppUrl || inputUrl.trim())) {
      return handlePullFromAppsScript();
    }

    if (!activeToken) {
      setSyncError('Meminta otorisasi Google... Silakan masuk dengan akun Google.');
      try {
        const res = await signInWithGoogle();
        if (res) {
          activeToken = res.accessToken;
          setGoogleUser(res.user);
          setAccessToken(res.accessToken);
        }
      } catch (e: any) {
        setSyncError(`Gagal Login Google: ${e.message || String(e)}`);
        return;
      }
    }

    if (!targetId) {
      const promptRes = prompt('Masukkan ID atau URL Google Spreadsheet Target:', inputSpreadsheetId);
      if (!promptRes) return;

      if (promptRes.includes('script.google.com') || promptRes.includes('/macros/s/')) {
        setWebAppUrl(promptRes.trim());
        setInputUrl(promptRes.trim());
        saveAppsScriptConfig({ webAppUrl: promptRes.trim() });
        return handlePullFromAppsScript();
      }

      targetId = extractSpreadsheetId(promptRes);
      if (!targetId) {
        setSyncError('ID Google Spreadsheet tidak valid.');
        return;
      }
      setSpreadsheetId(targetId);
      setInputSpreadsheetId(targetId);
      saveSpreadsheetConfig({ spreadsheetId: targetId });
    }

    if (!confirm('Apakah Anda yakin ingin memuat data dari Google Spreadsheet?\n\nData di aplikasi lokal akan diperbarui berdasarkan data yang ada di Google Sheets.')) {
      return;
    }

    setIsPulling(true);
    setSyncError(null);
    setSuccessMessage(null);

    let result = await loadDataFromGoogleSheets(targetId, activeToken);

    // Auto retry if token expired
    if (!result.success && result.error && (result.error.includes('401') || result.error.includes('UNAUTHENTICATED') || result.error.includes('TOKEN_EXPIRED'))) {
      try {
        const loginRes = await signInWithGoogle();
        if (loginRes?.accessToken) {
          setAccessToken(loginRes.accessToken);
          result = await loadDataFromGoogleSheets(targetId, loginRes.accessToken);
        }
      } catch (e) {
        // ignore login error
      }
    }

    setIsPulling(false);

    if (result.success) {
      if (result.schoolData) setSchoolData(result.schoolData);
      if (result.academicYear) setAcademicYear(result.academicYear);
      if (result.students && result.students.length > 0) setStudents(result.students);
      if (result.semesterRecords && result.semesterRecords.length > 0) setSemesterRecords(result.semesterRecords);
      if (result.subjects && result.subjects.length > 0) setSubjects(result.subjects);

      setLastSyncedAt(new Date());
      const loadedStudentsCount = result.students ? result.students.length : 0;
      setSuccessMessage(`Data berhasil diunduh dan diperbarui dari Google Spreadsheet! (${loadedStudentsCount} Siswa terdaftar)`);
    } else {
      setSyncError(result.error || 'Gagal memuat data dari Google Spreadsheet.');
    }
  };

  // Apps Script Handlers
  const handleCopyGsCode = () => {
    navigator.clipboard.writeText(RECOMMENDED_GS_CODE);
    setCopiedGs(true);
    setTimeout(() => setCopiedGs(false), 3000);
  };

  const handleTestConnection = async () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setSyncError('Masukkan URL Web App Google Apps Script (.gs) terlebih dahulu.');
      return;
    }

    setIsTesting(true);
    setSyncError(null);
    setSuccessMessage(null);

    const res = await pingAppsScriptUrl(trimmed);
    setIsTesting(false);

    if (res.success) {
      setWebAppUrl(trimmed);
      saveAppsScriptConfig({ webAppUrl: trimmed });
      setSuccessMessage(res.message || 'Berhasil terhubung ke Google Apps Script Web App!');
    } else {
      setSyncError(res.message || 'Gagal terhubung ke Google Apps Script.');
    }
  };

  const handlePushToAppsScript = async () => {
    const targetUrl = webAppUrl || inputUrl.trim();
    if (!targetUrl) {
      setSyncError('URL Google Apps Script belum diisi/dihubungkan.');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menyimpan seluruh data ke Google Spreadsheet via Apps Script?\n\nURL: ${targetUrl}`)) {
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    setSuccessMessage(null);

    const report = await syncAllDataToAppsScript(
      targetUrl,
      schoolData,
      academicYear,
      students,
      semesterRecords,
      subjects
    );

    setIsSyncing(false);

    if (report.success) {
      setLastSyncedAt(new Date());
      setSuccessMessage(
        `Sukses! Seluruh data (${students.length} Siswa & ${semesterRecords.length} Catatan Semester) telah tersimpan di Google Spreadsheet via Apps Script.`
      );
    } else {
      setSyncError(report.errors.join(' | '));
    }
  };

  const handleSetupRemoteDatabase = async () => {
    const targetUrl = webAppUrl || inputUrl.trim();
    if (!targetUrl) {
      setSyncError('URL Google Apps Script belum diisi/dihubungkan.');
      return;
    }

    setIsTesting(true);
    setSyncError(null);
    setSuccessMessage(null);

    try {
      const setupUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}action=setupDatabase`;
      const response = await fetch(setupUrl, { method: 'GET', redirect: 'follow' });
      const data = await response.json();
      setIsTesting(false);

      if (data.success) {
        setSuccessMessage('Berhasil! Seluruh lembar kerja database (Worksheet) telah dibuat dan diformat di Google Spreadsheet!');
      } else {
        setSyncError(data.error || 'Gagal menginisialisasi database di Google Sheets.');
      }
    } catch (err: any) {
      setIsTesting(false);
      setSyncError(`Gagal menjalankan setup database: ${err.message || String(err)}`);
    }
  };

  const handlePullFromAppsScript = async () => {
    const targetUrl = webAppUrl || inputUrl.trim();
    if (!targetUrl) {
      setSyncError('URL Google Apps Script belum diisi/dihubungkan.');
      return;
    }

    if (!confirm('Apakah Anda yakin ingin memuat data dari Google Spreadsheet via Apps Script? Data lokal saat ini akan diperbarui.')) {
      return;
    }

    setIsPulling(true);
    setSyncError(null);
    setSuccessMessage(null);

    const result = await loadDataFromAppsScript(targetUrl);

    setIsPulling(false);

    if (result.success) {
      if (result.schoolData) setSchoolData(result.schoolData);
      if (result.academicYear) setAcademicYear(result.academicYear);
      if (result.students && result.students.length > 0) setStudents(result.students);
      if (result.semesterRecords && result.semesterRecords.length > 0) setSemesterRecords(result.semesterRecords);
      if (result.subjects && result.subjects.length > 0) setSubjects(result.subjects);

      setLastSyncedAt(new Date());
      const loadedCount = result.students ? result.students.length : 0;
      setSuccessMessage(`Data berhasil diunduh dan diperbarui dari Google Spreadsheet via Apps Script! (${loadedCount} Siswa terdaftar)`);
    } else {
      setSyncError(result.error || 'Gagal memuat data dari Google Spreadsheet.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">Database & Integrasi Google Sheets</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Google Workspace API
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-0.5">
              Hubungkan aplikasi dengan Google Drive & Google Sheets untuk backup cloud dan sinkronisasi real-time.
            </p>
          </div>
        </div>

        {/* Sync status badge */}
        <div className="flex items-center gap-2">
          {googleUser || accessToken || webAppUrl ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Google API Terhubung</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Belum Terhubung</span>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Berhasil!</p>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {syncError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Perhatian / Status Sync:</p>
            <p>{syncError}</p>
          </div>
        </div>
      )}

      {/* Tab Selection */}
      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('oauth')}
          className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'oauth'
              ? 'bg-white text-emerald-800 shadow-xs border border-slate-200 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderSync className="w-4 h-4 text-emerald-600" />
          <span>Google Drive & Sheets Direct API (Recommended)</span>
        </button>
        <button
          onClick={() => setActiveTab('apps_script')}
          className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'apps_script'
              ? 'bg-white text-emerald-800 shadow-xs border border-slate-200 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4 text-emerald-600" />
          <span>Google Apps Script Web App (Kode .gs)</span>
        </button>
      </div>

      {/* TAB 1: GOOGLE DRIVE & SHEETS DIRECT OAUTH */}
      {activeTab === 'oauth' && (
        <div className="space-y-6">
          {/* STEP 1: GOOGLE AUTH SIGN IN */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogIn className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-sm">Langkah 1: Hubungkan Akun Google Anda</h3>
              </div>

              {googleUser && (
                <button
                  onClick={handleGoogleLogout}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Putuskan Akun</span>
                </button>
              )}
            </div>

            {googleUser ? (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt={googleUser.displayName || 'Google User'}
                      className="w-10 h-10 rounded-full border border-emerald-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                      {(googleUser.displayName || googleUser.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="overflow-hidden text-xs">
                    <p className="font-bold text-emerald-950 truncate">{googleUser.displayName || 'Pengguna Google'}</p>
                    <p className="text-emerald-700 font-mono truncate">{googleUser.email}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terhubung dengan Akses Google Drive & Sheets
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div>
                  <p className="text-xs font-semibold text-gray-800">Masuk dengan Akun Google untuk sinkronisasi otomatis</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Memungkinkan aplikasi membuat dan membaca Spreadsheet langsung di Google Drive Anda.</p>
                </div>

                {/* Google Standard Material Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="gsi-material-button hover:bg-slate-50 transition-all cursor-pointer shrink-0"
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-2xs">
                    <div className="gsi-material-button-icon">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-gray-700">
                      {isLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: SPREADSHEET TARGET */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-sm">Langkah 2: Tentukan Target Google Spreadsheet</h3>
              </div>

              <button
                onClick={handleCreateNewSpreadsheet}
                disabled={isCreatingSheet}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isCreatingSheet ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PlusCircle className="w-3.5 h-3.5" />
                )}
                <span>Buat Spreadsheet Baru di Drive</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={inputSpreadsheetId}
                onChange={e => setInputSpreadsheetId(e.target.value)}
                placeholder="ID Spreadsheet (contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms) atau URL"
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 font-mono bg-white"
              />
              <button
                onClick={handleSaveSpreadsheetId}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer"
              >
                Simpan Target ID
              </button>
            </div>

            {spreadsheetId && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-medium overflow-hidden">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Target ID: <code className="font-mono font-bold">{spreadsheetId}</code></span>
                </div>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-300 rounded-lg flex items-center gap-1 transition-colors shrink-0"
                >
                  <span>Buka di Google Sheets</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* STEP 3: SYNC ACTIONS FOR DIRECT OAUTH */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <CloudUpload className="w-4 h-4 text-emerald-600" />
                <span>Langkah 3: Sinkronkan Data Aplikasi</span>
              </h3>

              <div className="flex items-center gap-2 bg-slate-100 p-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold">
                <span className={autoSyncEnabled ? "text-emerald-700 font-bold" : "text-slate-600"}>
                  Auto-Sync: {autoSyncEnabled ? 'Aktif' : 'Nonaktif'}
                </span>
                <button
                  type="button"
                  onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoSyncEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoSyncEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handlePushDirectToSheets}
                disabled={isSyncing || isPulling || !spreadsheetId}
                className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Menyimpan ke Google Sheets...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-5 h-5" />
                    <span>Simpan Data ke Google Sheets</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePullDirectFromSheets}
                disabled={isSyncing || isPulling || !spreadsheetId}
                className="p-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isPulling ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Memuat dari Google Sheets...</span>
                  </>
                ) : (
                  <>
                    <CloudDownload className="w-5 h-5" />
                    <span>Muat Data dari Google Sheets</span>
                  </>
                )}
              </button>
            </div>

            {lastSyncedAt && (
              <p className="text-xs text-gray-500 text-center pt-1">
                Terakhir disinkronkan: <strong>{lastSyncedAt.toLocaleString('id-ID')}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE APPS SCRIPT WEB APP */}
      {activeTab === 'apps_script' && (
        <div className="space-y-6">
          {/* STEP 1: PETUNJUK & SALIN KODE .GS */}
          <div className="bg-slate-900 rounded-xl p-5 text-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-emerald-300 text-base">Langkah 1: Salin Kode Apps Script (Code.gs)</h3>
              </div>
              <button
                onClick={handleCopyGsCode}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {copiedGs ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedGs ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Kode .gs'}</span>
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-slate-800/80 p-4 rounded-lg border border-slate-700">
              <ol className="list-decimal pl-4 space-y-1">
                <li>Buka Google Spreadsheet Anda di Google Drive.</li>
                <li>Klik menu <strong>Ekstensi (Extensions)</strong> &rarr; <strong>Apps Script</strong>.</li>
                <li>Hapus semua kode default, lalu <strong>Paste (Tempel)</strong> kode GS yang sudah disalin di atas.</li>
                <li>Klik <strong>Terapkan (Deploy)</strong> &rarr; <strong>Terapkan sebagai Aplikasi Web (New Deployment)</strong>.</li>
                <li>Pilih akses: <em>Execute as: <strong>Me (Saya)</strong></em> dan <em>Who has access: <strong>Anyone (Siapa Saja)</strong></em>.</li>
                <li>Salin <strong>URL Web App</strong> (contoh: <code>https://script.google.com/macros/s/.../exec</code>) lalu tempel di Langkah 2 di bawah.</li>
              </ol>
            </div>

            {/* View Code Toggle */}
            <div>
              <button
                onClick={() => setShowGsCodeModal(!showGsCodeModal)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 underline cursor-pointer"
              >
                <span>{showGsCodeModal ? 'Sembunyikan Pratinjau Kode GS' : 'Lihat Pratinjau Kode Code.gs'}</span>
                {showGsCodeModal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showGsCodeModal && (
                <div className="mt-3 relative">
                  <pre className="p-4 bg-slate-950 rounded-lg text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-72 border border-slate-800">
                    {RECOMMENDED_GS_CODE}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: INPUT WEB APP URL */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-sm">Langkah 2: Hubungkan URL Web App Apps Script</h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 font-mono bg-white"
              />
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs shrink-0 cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memeriksa Koneksi...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Tes & Hubungkan URL</span>
                  </>
                )}
              </button>
            </div>

            {webAppUrl && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-medium overflow-hidden">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">URL Aktif: <code className="font-mono">{webAppUrl}</code></span>
                </div>
                <a
                  href={webAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-300 rounded-lg flex items-center gap-1 transition-colors shrink-0"
                >
                  <span>Endpoint</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* STEP 3: SYNC ACTIONS */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <CloudUpload className="w-4 h-4 text-emerald-600" />
                <span>Langkah 3: Sinkronisasi Data Aplikasi</span>
              </h3>

              <div className="flex items-center gap-2 bg-slate-100 p-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold">
                <span className={autoSyncEnabled ? "text-emerald-700 font-bold" : "text-slate-600"}>
                  Auto-Sync: {autoSyncEnabled ? 'Aktif' : 'Nonaktif'}
                </span>
                <button
                  type="button"
                  onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoSyncEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoSyncEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={handleSetupRemoteDatabase}
                disabled={isTesting || isSyncing || isPulling || !webAppUrl}
                className="p-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
                title="Inisialisasi & Buat seluruh lembar kerja di Google Spreadsheet secara otomatis"
              >
                <Zap className="w-5 h-5 text-yellow-300" />
                <span>Setup Tabel Sheets</span>
              </button>

              <button
                onClick={handlePushToAppsScript}
                disabled={isSyncing || isPulling || !webAppUrl}
                className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-5 h-5" />
                    <span>Simpan Data</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePullFromAppsScript}
                disabled={isSyncing || isPulling || !webAppUrl}
                className="p-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isPulling ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Memuat...</span>
                  </>
                ) : (
                  <>
                    <CloudDownload className="w-5 h-5" />
                    <span>Muat Data</span>
                  </>
                )}
              </button>
            </div>

            {lastSyncedAt && (
              <p className="text-xs text-gray-500 text-center pt-1">
                Terakhir disinkronkan: <strong>{lastSyncedAt.toLocaleString('id-ID')}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Structure Information */}
      <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-emerald-950">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Worksheets Database yang Dikelola Otomatis di Google Spreadsheet:</span>
        </div>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 pl-2">
          <li className="bg-white/80 p-2 rounded border border-emerald-100 font-medium">1. Data_Sekolah</li>
          <li className="bg-white/80 p-2 rounded border border-emerald-100 font-medium">2. Tahun_Ajaran</li>
          <li className="bg-white/80 p-2 rounded border border-emerald-100 font-medium">3. Mata_Pelajaran</li>
          <li className="bg-white/80 p-2 rounded border border-emerald-100 font-medium">4. Data_Siswa</li>
          <li className="bg-white/80 p-2 rounded border border-emerald-100 font-medium">5. Catatan_Semester</li>
          <li className="bg-white/80 p-2 rounded border border-emerald-100 font-medium">6. Aplikasi_Backup_JSON</li>
        </ul>
      </div>
    </div>
  );
};
