import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  defaultSubjects,
  initialAcademicYear,
  initialSchoolData,
  initialSemesterRecords,
  initialStudents
} from '../data/initialData';
import {
  AcademicYearData,
  ActiveView,
  AssessmentMode,
  SchoolData,
  StudentDetail,
  StudentSemesterRecord,
  SubjectGrade,
  SubjectItem
} from '../types';
import {
  getSavedAppsScriptConfig,
  loadDataFromAppsScript,
  saveAppsScriptConfig,
  syncAllDataToAppsScript
} from '../lib/googleAppsScript';
import {
  getSavedSpreadsheetConfig,
  saveSpreadsheetConfig,
  syncAllDataToGoogleSheets
} from '../lib/googleSheets';
import { getCachedAccessToken } from '../lib/googleAuth';
import {
  deleteStudentFromFirestore,
  loadFromFirebaseFirestore,
  saveToFirebaseFirestore,
  subscribeToFirebaseChanges
} from '../lib/firebaseSync';

interface AppContextType {
  schoolData: SchoolData;
  setSchoolData: React.Dispatch<React.SetStateAction<SchoolData>>;
  academicYear: AcademicYearData;
  setAcademicYear: React.Dispatch<React.SetStateAction<AcademicYearData>>;
  students: StudentDetail[];
  setStudents: React.Dispatch<React.SetStateAction<StudentDetail[]>>;
  semesterRecords: StudentSemesterRecord[];
  setSemesterRecords: React.Dispatch<React.SetStateAction<StudentSemesterRecord[]>>;
  
  subjects: SubjectItem[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectItem[]>>;
  addSubject: (subject: SubjectItem) => void;
  updateSubject: (oldCode: string, updatedSubject: SubjectItem) => void;
  deleteSubject: (code: string) => void;
  duplicateSubject: (code: string) => void;

  assessmentMode: AssessmentMode;
  setAssessmentMode: (mode: AssessmentMode) => void;
  
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  // Firebase Cloud Database Status
  firebaseConnected: boolean;
  firebaseSyncing: boolean;
  firebaseLastSynced: Date | null;

  // Google Apps Script & Sheets Sync Status & Config
  webAppUrl: string;
  setWebAppUrl: (url: string) => void;
  spreadsheetId: string;
  setSpreadsheetId: (id: string) => void;
  accessToken: string;
  setAccessToken: (token: string) => void;
  autoSyncEnabled: boolean;
  setAutoSyncEnabled: (val: boolean) => void;
  isAutoSyncing: boolean;
  setIsAutoSyncing: (val: boolean) => void;
  lastSyncedAt: Date | null;
  setLastSyncedAt: (date: Date | null) => void;
  syncError: string | null;
  setSyncError: (err: string | null) => void;

  // Selected state for student modal or print view
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  
  selectedClass: string | number; // e.g. "Tingkat 1", "Tingkat 2"
  setSelectedClass: (c: string | number) => void;
  selectedSemester: 1 | 2;
  setSelectedSemester: (s: 1 | 2) => void;
  rombelList: string[];

  // Multi-Year Management
  availableAcademicYears: string[];
  addAcademicYear: (year: string) => void;
  studentsForActiveYear: StudentDetail[];

  // Helpers
  addStudent: (student: Omit<StudentDetail, 'id'>) => void;
  addStudentsBulk: (students: Omit<StudentDetail, 'id'>[]) => void;
  updateStudent: (student: StudentDetail) => void;
  deleteStudent: (id: string) => void;
  getStudentById: (id: string) => StudentDetail | undefined;
  getSemesterRecord: (studentId: string, kelas: string | number, semester: 1 | 2) => StudentSemesterRecord;
  saveSemesterRecord: (record: StudentSemesterRecord) => void;
  resetAllData: () => void;
  triggerManualSave: () => Promise<{ success: boolean; syncedCloud: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'buku_induk_sd_v2_clean';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schoolData, setSchoolData] = useState<SchoolData>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_school`);
    return saved ? JSON.parse(saved) : initialSchoolData;
  });

  const [academicYear, setAcademicYear] = useState<AcademicYearData>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_academic`);
    return saved ? JSON.parse(saved) : initialAcademicYear;
  });

  const formatDateStr = (val: any) => {
    if (!val) return '';
    const strVal = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(strVal)) return strVal;
    if (strVal.includes('GMT') || strVal.includes('00:00:00')) {
      const d = new Date(strVal);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    return strVal;
  };

  const formatRtRwStr = (val: any) => {
    if (!val) return '';
    const strVal = String(val).trim();
    if (strVal.includes('GMT') || strVal.includes('00:00:00')) {
      const d = new Date(strVal);
      if (!isNaN(d.getTime())) {
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${month}/${day}`;
      }
    }
    return strVal;
  };

  const sanitizeStudentsList = (rawStudents: StudentDetail[]): StudentDetail[] => {
    if (!Array.isArray(rawStudents)) return [];
    const VALID_STATUSES = ['Aktif', 'Lulus', 'Pindah', 'Keluar', 'Non-Aktif', 'Alumni', 'DO'];
    const seenIds = new Set<string>();
    return rawStudents.map((s, idx) => {
      let id = s.id ? String(s.id).trim() : '';
      if (!id) {
        id = s.nis ? `std-${String(s.nis).trim()}` : `std-idx-${idx + 1}`;
      }
      if (seenIds.has(id)) {
        id = `${id}-dup${idx + 1}`;
      }
      seenIds.add(id);

      const diterimaDiKelas = s.diterimaDiKelas || '1A';
      let statusSiswa = String(s.statusSiswa || 'Aktif').trim();
      let tingkatSaatIni = String(s.tingkatSaatIni || '').trim();

      // Detect if statusSiswa is actually a class level (e.g. "Tingkat 6", "1A", etc.)
      const isInvalidStatus = !VALID_STATUSES.some(v => v.toLowerCase() === statusSiswa.toLowerCase());
      if (isInvalidStatus || /tingkat/i.test(statusSiswa)) {
        if (!tingkatSaatIni || tingkatSaatIni === 'Aktif' || isInvalidStatus) {
          if (/tingkat/i.test(statusSiswa) || /\d/.test(statusSiswa)) {
            tingkatSaatIni = statusSiswa;
          }
        }
        statusSiswa = 'Aktif';
      }

      if (!tingkatSaatIni || tingkatSaatIni === 'Aktif') {
        tingkatSaatIni = String(diterimaDiKelas).startsWith('Tingkat') ? String(diterimaDiKelas) : `Tingkat ${diterimaDiKelas}`;
      }

      return {
        ...s,
        id,
        diterimaDiKelas,
        tingkatSaatIni,
        statusSiswa: statusSiswa as any,
        tanggalLahir: formatDateStr(s.tanggalLahir),
        tanggalDiterima: formatDateStr(s.tanggalDiterima),
        rtRw: formatRtRwStr(s.rtRw)
      };
    });
  };

  const [students, setStudents] = useState<StudentDetail[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_students`);
    const initial = saved ? JSON.parse(saved) : initialStudents;
    return sanitizeStudentsList(initial);
  });

  const [semesterRecords, setSemesterRecords] = useState<StudentSemesterRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_records`);
    return saved ? JSON.parse(saved) : initialSemesterRecords;
  });

  const [subjects, setSubjects] = useState<SubjectItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_subjects`);
    return saved ? JSON.parse(saved) : defaultSubjects;
  });

  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode>('tanpa');
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(students[0]?.id || null);
  
  const rombelList = ['Tingkat 1', 'Tingkat 2', 'Tingkat 3', 'Tingkat 4', 'Tingkat 5', 'Tingkat 6'];

  const [selectedClass, setSelectedClass] = useState<string | number>(() => rombelList[0] || 'Tingkat 1');
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);

  // Available Academic Years State
  const [availableAcademicYears, setAvailableAcademicYears] = useState<string[]>(() => {
    const defaultYears = ['2026/2027', '2025/2026', '2024/2025', '2023/2024', '2022/2023'];
    const yearsFromStudents = students.map(s => s.tahunAjaran).filter(Boolean) as string[];
    const combined = Array.from(new Set([academicYear.tahunAjaran, ...defaultYears, ...yearsFromStudents]));
    return combined.sort().reverse();
  });

  const addAcademicYear = (newYear: string) => {
    const trimmed = newYear.trim();
    if (!trimmed) return;
    setAvailableAcademicYears(prev => {
      if (prev.includes(trimmed)) return prev;
      return [trimmed, ...prev].sort().reverse();
    });
    setAcademicYear(prev => ({ ...prev, tahunAjaran: trimmed }));
  };

  // Filter students active for current selected academic year
  const studentsForActiveYear = students.filter(s => {
    const studentTA = s.tahunAjaran || '2026/2027';
    return studentTA === academicYear.tahunAjaran;
  });

  // Sync selectedStudentId when active academic year or students list changes
  useEffect(() => {
    if (studentsForActiveYear.length > 0) {
      if (!studentsForActiveYear.some(s => s.id === selectedStudentId)) {
        setSelectedStudentId(studentsForActiveYear[0].id);
      }
    } else {
      setSelectedStudentId(null);
    }
  }, [academicYear.tahunAjaran, students]);
  const DEFAULT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzdTtGi3u8FmyJhl9HrWG4JpXCAmx3Vo7jdQKtWXwJKiRy6JBuDqb1ITDK-hC3Jctk3/exec';

  const [webAppUrl, setWebAppUrl] = useState<string>(() => {
    const config = getSavedAppsScriptConfig();
    return config?.webAppUrl || DEFAULT_WEB_APP_URL;
  });

  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    const config = getSavedSpreadsheetConfig();
    return config?.spreadsheetId || '';
  });

  const [accessToken, setAccessToken] = useState<string>(() => {
    const config = getSavedSpreadsheetConfig();
    return config?.accessToken || '';
  });

  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Firebase Cloud Sync States
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);
  const [firebaseSyncing, setFirebaseSyncing] = useState<boolean>(false);
  const [firebaseLastSynced, setFirebaseLastSynced] = useState<Date | null>(null);

  const isRemoteUpdateRef = useRef<boolean>(false);
  const isInitialFirebaseLoadRef = useRef<boolean>(true);

  // Initial load from Firebase & Real-time Listener across devices
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function initFirebase() {
      setFirebaseSyncing(true);
      try {
        const targetUrl = webAppUrl || DEFAULT_WEB_APP_URL;
        let appsScriptSuccess = false;

        if (targetUrl) {
          const appsScriptData = await loadDataFromAppsScript(targetUrl);
          if (appsScriptData.success && (appsScriptData.students?.length || appsScriptData.subjects?.length)) {
            appsScriptSuccess = true;
            isRemoteUpdateRef.current = true;
            if (appsScriptData.schoolData && Object.keys(appsScriptData.schoolData).length > 0) {
              setSchoolData(appsScriptData.schoolData);
            }
            if (appsScriptData.academicYear && Object.keys(appsScriptData.academicYear).length > 0) {
              setAcademicYear(appsScriptData.academicYear);
            }
            if (appsScriptData.subjects && appsScriptData.subjects.length > 0) {
              setSubjects(appsScriptData.subjects);
            }
            if (appsScriptData.students && appsScriptData.students.length > 0) {
              setStudents(sanitizeStudentsList(appsScriptData.students));
            }
            if (appsScriptData.semesterRecords && appsScriptData.semesterRecords.length > 0) {
              setSemesterRecords(appsScriptData.semesterRecords);
            }

            saveAppsScriptConfig({ webAppUrl: targetUrl, lastSyncedAt: new Date().toISOString() });

            await saveToFirebaseFirestore({
              schoolData: appsScriptData.schoolData || schoolData,
              academicYear: appsScriptData.academicYear || academicYear,
              subjects: appsScriptData.subjects || subjects,
              availableAcademicYears,
              students: appsScriptData.students ? sanitizeStudentsList(appsScriptData.students) : students,
              semesterRecords: appsScriptData.semesterRecords || semesterRecords
            });

            setFirebaseLastSynced(new Date());
            setTimeout(() => {
              isRemoteUpdateRef.current = false;
            }, 800);
          }
        }

        if (!appsScriptSuccess) {
          const cloudData = await loadFromFirebaseFirestore();
          if (cloudData && (cloudData.students?.length || cloudData.schoolData)) {
            isRemoteUpdateRef.current = true;
            if (cloudData.schoolData) setSchoolData(cloudData.schoolData);
            if (cloudData.academicYear) setAcademicYear(cloudData.academicYear);
            if (cloudData.subjects && cloudData.subjects.length > 0) setSubjects(cloudData.subjects);
            if (cloudData.availableAcademicYears && cloudData.availableAcademicYears.length > 0) setAvailableAcademicYears(cloudData.availableAcademicYears);
            if (cloudData.students && cloudData.students.length > 0) setStudents(sanitizeStudentsList(cloudData.students));
            if (cloudData.semesterRecords && cloudData.semesterRecords.length > 0) setSemesterRecords(cloudData.semesterRecords);
            setFirebaseLastSynced(new Date());
            setTimeout(() => {
              isRemoteUpdateRef.current = false;
            }, 800);
          } else {
            // If Firestore is empty, seed initial data to Firebase
            await saveToFirebaseFirestore({
              schoolData,
              academicYear,
              subjects,
              availableAcademicYears,
              students,
              semesterRecords
            });
            setFirebaseLastSynced(new Date());
          }
        }
        setFirebaseConnected(true);
      } catch (err) {
        console.error('Firebase/AppsScript initialization error:', err);
      } finally {
        setFirebaseSyncing(false);
        isInitialFirebaseLoadRef.current = false;
      }

      // Realtime listener for multi-device sync
      unsubscribe = subscribeToFirebaseChanges((updated) => {
        if (isRemoteUpdateRef.current) return;
        isRemoteUpdateRef.current = true;
        if (updated.schoolData) setSchoolData(updated.schoolData);
        if (updated.academicYear) setAcademicYear(updated.academicYear);
        if (updated.subjects && updated.subjects.length > 0) setSubjects(updated.subjects);
        if (updated.availableAcademicYears && updated.availableAcademicYears.length > 0) setAvailableAcademicYears(updated.availableAcademicYears);
        if (updated.students && updated.students.length > 0) setStudents(sanitizeStudentsList(updated.students));
        if (updated.semesterRecords) setSemesterRecords(updated.semesterRecords);
        setFirebaseLastSynced(new Date());
        setTimeout(() => {
          isRemoteUpdateRef.current = false;
        }, 800);
      });
    }

    initFirebase();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Automatic Debounced Sync to Firebase Cloud Database on state changes
  useEffect(() => {
    if (isInitialFirebaseLoadRef.current) return;
    if (isRemoteUpdateRef.current) return;

    const timer = setTimeout(async () => {
      setFirebaseSyncing(true);
      const res = await saveToFirebaseFirestore({
        schoolData,
        academicYear,
        subjects,
        availableAcademicYears,
        students,
        semesterRecords
      });
      setFirebaseSyncing(false);
      if (res.success) {
        setFirebaseLastSynced(new Date());
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [schoolData, academicYear, subjects, availableAcademicYears, students, semesterRecords]);

  // Automatic Debounced Auto-Sync to Google Apps Script / Google Sheets when state changes
  useEffect(() => {
    // ONLY sync automatically if autoSyncEnabled is explicitly true
    if (!autoSyncEnabled) return;
    if (!webAppUrl && (!spreadsheetId || !accessToken)) return;
    if (isRemoteUpdateRef.current) return;

    const timer = setTimeout(async () => {
      setIsAutoSyncing(true);
      setSyncError(null);

      let report;
      if (webAppUrl) {
        report = await syncAllDataToAppsScript(
          webAppUrl,
          schoolData,
          academicYear,
          students,
          semesterRecords,
          subjects
        );
      } else {
        report = await syncAllDataToGoogleSheets(
          spreadsheetId,
          accessToken,
          schoolData,
          academicYear,
          students,
          semesterRecords,
          subjects
        );
      }

      setIsAutoSyncing(false);
      if (report.success) {
        setLastSyncedAt(new Date());
      } else if (report.errors && report.errors.length > 0) {
        setSyncError(report.errors[0]);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [autoSyncEnabled, webAppUrl, spreadsheetId, accessToken, schoolData, academicYear, students, semesterRecords, subjects]);

  // Auto save to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_school`, JSON.stringify(schoolData));
  }, [schoolData]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_academic`, JSON.stringify(academicYear));
  }, [academicYear]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_records`, JSON.stringify(semesterRecords));
  }, [semesterRecords]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_subjects`, JSON.stringify(subjects));
  }, [subjects]);

  // Keep selected student valid if students change
  useEffect(() => {
    if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  // Subject management helpers
  const addSubject = (newSub: SubjectItem) => {
    setSubjects(prev => [...prev, newSub]);
  };

  const updateSubject = (oldCode: string, updatedSub: SubjectItem) => {
    setSubjects(prev => prev.map(s => (s.code === oldCode ? updatedSub : s)));
    // Sync semester records if code, name, or KKM changed
    setSemesterRecords(prev =>
      prev.map(rec => ({
        ...rec,
        grades: rec.grades.map(g =>
          g.code === oldCode
            ? {
                ...g,
                code: updatedSub.code,
                namaMataPelajaran: updatedSub.namaMataPelajaran,
                kKM: updatedSub.kKM
              }
            : g
        )
      }))
    );
  };

  const deleteSubject = (code: string) => {
    setSubjects(prev => prev.filter(s => s.code !== code));
    setSemesterRecords(prev =>
      prev.map(rec => ({
        ...rec,
        grades: rec.grades.filter(g => g.code !== code)
      }))
    );
  };

  const duplicateSubject = (code: string) => {
    const target = subjects.find(s => s.code === code);
    if (!target) return;

    let newCode = `${code}_COPY`;
    let counter = 1;
    while (subjects.some(s => s.code === newCode)) {
      counter++;
      newCode = `${code}_COPY${counter}`;
    }

    const newSubject: SubjectItem = {
      ...target,
      code: newCode,
      namaMataPelajaran: `${target.namaMataPelajaran} (Salinan)`
    };

    setSubjects(prev => [...prev, newSubject]);
  };

  const addStudent = (newStudentData: Omit<StudentDetail, 'id'>) => {
    const newId = `std-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const newStudent: StudentDetail = {
      ...newStudentData,
      id: newId,
      tahunAjaran: newStudentData.tahunAjaran || academicYear.tahunAjaran
    };
    setStudents(prev => sanitizeStudentsList([...prev, newStudent]));
    setSelectedStudentId(newId);
  };

  const addStudentsBulk = (newStudentsList: Omit<StudentDetail, 'id'>[]) => {
    const timestamp = Date.now();
    const created: StudentDetail[] = newStudentsList.map((s, idx) => {
      const nisClean = s.nis ? String(s.nis).trim() : '';
      const generatedId = nisClean ? `std-${nisClean}` : `std-${timestamp}-${idx}`;
      return {
        ...s,
        id: generatedId
      };
    });

    setStudents(prev => {
      // Create a set of existing student identifiers (NIS, NISN, and Full Name)
      const existingNisSet = new Set(
        prev
          .map(st => st.nis ? String(st.nis).trim() : '')
          .filter(Boolean)
      );
      const existingNameSet = new Set(
        prev
          .map(st => st.namaLengkap ? String(st.namaLengkap).trim().toLowerCase() : '')
          .filter(Boolean)
      );

      // Filter out duplicate students to prevent endless accumulation
      const uniqueNew = created.filter(c => {
        const nis = c.nis ? String(c.nis).trim() : '';
        const name = c.namaLengkap ? String(c.namaLengkap).trim().toLowerCase() : '';
        if (nis && existingNisSet.has(nis)) return false;
        if (name && existingNameSet.has(name)) return false;
        return true;
      });

      if (uniqueNew.length === 0) {
        return prev;
      }

      return sanitizeStudentsList([...prev, ...uniqueNew]);
    });

    if (created.length > 0) {
      setSelectedStudentId(created[created.length - 1].id);
    }
  };

  const updateStudent = (updatedStudent: StudentDetail) => {
    setStudents(prev => prev.map(s => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  const deleteStudent = (id: string) => {
    if (!id) return;
    const targetId = String(id).trim();

    deleteStudentFromFirestore(targetId);

    setStudents(prev => {
      const remaining = prev.filter(s => String(s.id).trim() !== targetId);
      if (selectedStudentId === targetId || (selectedStudentId && String(selectedStudentId).trim() === targetId)) {
        setSelectedStudentId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });

    setSemesterRecords(prev => prev.filter(r => String(r.studentId).trim() !== targetId));
  };

  const getStudentById = (id: string) => {
    return students.find(s => s.id === id);
  };

  const getSemesterRecord = (studentId: string, kelas: string | number, semester: 1 | 2): StudentSemesterRecord => {
    const targetStudentId = String(studentId || '').trim();
    const targetKelas = String(kelas || '').trim();
    const targetSemester = Number(semester);

    const found = semesterRecords.find(
      r => String(r.studentId || '').trim() === targetStudentId &&
           String(r.kelas || '').trim() === targetKelas &&
           Number(r.semester) === targetSemester
    );

    const gradeMap = new Map<string, SubjectGrade>();
    if (found) {
      found.grades.forEach(g => gradeMap.set(g.code, g));
    }

    // Always align grades strictly with current active `subjects` list and order!
    const activeGrades: SubjectGrade[] = subjects.map(sub => {
      const existing = gradeMap.get(sub.code);
      if (existing) {
        return {
          ...existing,
          namaMataPelajaran: sub.namaMataPelajaran,
          kKM: sub.kKM
        };
      }
      return {
        code: sub.code,
        namaMataPelajaran: sub.namaMataPelajaran,
        kKM: sub.kKM,
        nilaiPengetahuan: 0,
        nilaiKeterampilan: 0,
        nilaiAkhir: 0,
        predikat: '' as any,
        deskripsiCapaian: ''
      };
    });

    if (found) {
      return {
        ...found,
        studentId: targetStudentId,
        kelas,
        semester,
        grades: activeGrades
      };
    }

    return {
      studentId: targetStudentId,
      kelas,
      semester,
      tahunAjaran: academicYear.tahunAjaran,
      grades: activeGrades,
      sakit: 0,
      izin: 0,
      tanpaKeterangan: 0,
      ekstrakurikuler: [],
      catatanWaliKelas: ''
    };
  };

  const saveSemesterRecord = (record: StudentSemesterRecord) => {
    const normalizedRecord: StudentSemesterRecord = {
      ...record,
      studentId: String(record.studentId || '').trim(),
      kelas: String(record.kelas || '1A').trim(),
      semester: Number(record.semester) === 2 ? 2 : 1
    };

    setSemesterRecords(prev => {
      const index = prev.findIndex(
        r => String(r.studentId || '').trim() === normalizedRecord.studentId &&
             String(r.kelas || '').trim() === normalizedRecord.kelas &&
             Number(r.semester) === Number(normalizedRecord.semester)
      );
      let updated: StudentSemesterRecord[];
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = normalizedRecord;
        updated = copy;
      } else {
        updated = [...prev, normalizedRecord];
      }

      // Save directly to localStorage
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_records`, JSON.stringify(updated));
      return updated;
    });
  };

  const resetAllData = () => {
    localStorage.clear();
    setSchoolData(initialSchoolData);
    setAcademicYear(initialAcademicYear);
    setStudents([]);
    setSemesterRecords([]);
    setSubjects(defaultSubjects);
    setSelectedStudentId(null);
  };

  const triggerManualSave = async () => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_school`, JSON.stringify(schoolData));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_academic`, JSON.stringify(academicYear));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_students`, JSON.stringify(students));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_records`, JSON.stringify(semesterRecords));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_subjects`, JSON.stringify(subjects));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }

    setFirebaseSyncing(true);
    await saveToFirebaseFirestore({
      schoolData,
      academicYear,
      subjects,
      availableAcademicYears,
      students,
      semesterRecords
    });
    setFirebaseSyncing(false);
    setFirebaseLastSynced(new Date());

    const activeToken = accessToken || getCachedAccessToken();
    if (webAppUrl || (spreadsheetId && activeToken)) {
      setIsAutoSyncing(true);
      setSyncError(null);
      let report;
      if (webAppUrl) {
        report = await syncAllDataToAppsScript(
          webAppUrl,
          schoolData,
          academicYear,
          students,
          semesterRecords,
          subjects
        );
      } else {
        report = await syncAllDataToGoogleSheets(
          spreadsheetId,
          activeToken!,
          schoolData,
          academicYear,
          students,
          semesterRecords,
          subjects
        );
      }
      setIsAutoSyncing(false);
      if (report.success) {
        setLastSyncedAt(new Date());
        return { success: true, syncedCloud: true };
      } else {
        if (report.errors && report.errors.length > 0) {
          setSyncError(report.errors[0]);
        }
        return { success: true, syncedCloud: false, error: report.errors?.[0] };
      }
    }

    return { success: true, syncedCloud: true };
  };

  return (
    <AppContext.Provider
      value={{
        schoolData,
        setSchoolData,
        academicYear,
        setAcademicYear,
        students,
        setStudents,
        semesterRecords,
        setSemesterRecords,
        subjects,
        setSubjects,
        addSubject,
        updateSubject,
        deleteSubject,
        duplicateSubject,
        assessmentMode,
        setAssessmentMode,
        activeView,
        setActiveView,
        firebaseConnected,
        firebaseSyncing,
        firebaseLastSynced,
        webAppUrl,
        setWebAppUrl,
        spreadsheetId,
        setSpreadsheetId,
        accessToken,
        setAccessToken,
        autoSyncEnabled,
        setAutoSyncEnabled,
        isAutoSyncing,
        setIsAutoSyncing,
        lastSyncedAt,
        setLastSyncedAt,
        syncError,
        setSyncError,
        selectedStudentId,
        setSelectedStudentId,
        selectedClass,
        setSelectedClass,
        selectedSemester,
        setSelectedSemester,
        rombelList,
        availableAcademicYears,
        addAcademicYear,
        studentsForActiveYear,
        addStudent,
        addStudentsBulk,
        updateStudent,
        deleteStudent,
        getStudentById,
        getSemesterRecord,
        saveSemesterRecord,
        resetAllData,
        triggerManualSave
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
