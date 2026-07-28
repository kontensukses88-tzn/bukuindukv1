import { doc, setDoc, onSnapshot, collection, getDocs, deleteDoc, disableNetwork } from 'firebase/firestore';
import { db } from './firebase';
import { AcademicYearData, SchoolData, StudentDetail, StudentSemesterRecord, SubjectItem } from '../types';

const CONFIG_DOC_ID = 'app_config';
const COLLECTION_PREFIX = 'buku_induk';

export interface FirebaseSyncData {
  schoolData?: SchoolData;
  academicYear?: AcademicYearData;
  subjects?: SubjectItem[];
  availableAcademicYears?: string[];
  students?: StudentDetail[];
  semesterRecords?: StudentSemesterRecord[];
  updatedAt?: string;
}

// Track if quota was exceeded to avoid repeated failing write calls
let isQuotaExceeded = typeof window !== 'undefined' && sessionStorage.getItem('firestore_quota_exceeded') === 'true';

if (isQuotaExceeded) {
  disableNetwork(db).catch(() => {});
}

export function checkIsQuotaExceeded(): boolean {
  return isQuotaExceeded;
}

function handleQuotaExceeded() {
  if (!isQuotaExceeded) {
    isQuotaExceeded = true;
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('firestore_quota_exceeded', 'true');
      }
    } catch (e) {}
    disableNetwork(db).catch(() => {});
  }
}

// Function to save state to Firebase Firestore using compact snapshot documents (1-3 writes instead of hundreds)
export async function saveToFirebaseFirestore(data: {
  schoolData: SchoolData;
  academicYear: AcademicYearData;
  subjects: SubjectItem[];
  availableAcademicYears: string[];
  students: StudentDetail[];
  semesterRecords: StudentSemesterRecord[];
}): Promise<{ success: boolean; quotaExceeded?: boolean; error?: string }> {
  if (isQuotaExceeded) {
    return {
      success: false,
      quotaExceeded: true,
      error: 'Batas kuota harian Firestore terlampaui. Data disimpan secara lokal dan Google Sheets.'
    };
  }

  try {
    const timestamp = new Date().toISOString();

    // Store snapshot packages to minimize write count (1 write for config + 1 write for students pack + 1 write for records pack)
    const configRef = doc(db, `${COLLECTION_PREFIX}_metadata`, CONFIG_DOC_ID);
    await setDoc(configRef, {
      schoolData: data.schoolData,
      academicYear: data.academicYear,
      subjects: data.subjects,
      availableAcademicYears: data.availableAcademicYears,
      studentsCount: data.students.length,
      recordsCount: data.semesterRecords.length,
      updatedAt: timestamp,
    }, { merge: true });

    // Store students in compact snapshot docs (chunks of 150 items to stay safely under 1MB doc limit)
    const studentChunks = chunkArray(data.students, 150);
    for (let i = 0; i < studentChunks.length; i++) {
      const snapRef = doc(db, `${COLLECTION_PREFIX}_snapshots`, `students_pack_${i}`);
      await setDoc(snapRef, {
        index: i,
        students: studentChunks[i],
        updatedAt: timestamp
      });
    }

    // Store semester records in compact snapshot docs (chunks of 250 items)
    const recordChunks = chunkArray(data.semesterRecords, 250);
    for (let i = 0; i < recordChunks.length; i++) {
      const snapRef = doc(db, `${COLLECTION_PREFIX}_snapshots`, `records_pack_${i}`);
      await setDoc(snapRef, {
        index: i,
        records: recordChunks[i],
        updatedAt: timestamp
      });
    }

    return { success: true };
  } catch (err: any) {
    const errStr = String(err?.message || err || '');
    if (errStr.includes('resource-exhausted') || errStr.includes('Quota limit exceeded')) {
      handleQuotaExceeded();
      console.warn('Firestore quota exceeded. Falling back gracefully to LocalStorage & Apps Script.', errStr);
      return {
        success: false,
        quotaExceeded: true,
        error: 'Batas kuota harian Firestore terlampaui. Aplikasi tetap berjalan menggunakan penyimpanan lokal & Google Sheets.'
      };
    }
    console.error('Firebase save error:', err);
    return { success: false, error: err?.message || 'Gagal menyimpan ke Firebase Cloud Database' };
  }
}

// Delete student from Firestore
export async function deleteStudentFromFirestore(studentId: string): Promise<void> {
  if (isQuotaExceeded) return;
  try {
    const studentRef = doc(db, `${COLLECTION_PREFIX}_students`, String(studentId));
    await deleteDoc(studentRef);
  } catch (err: any) {
    const errStr = String(err?.message || err || '');
    if (errStr.includes('resource-exhausted') || errStr.includes('Quota limit exceeded')) {
      handleQuotaExceeded();
    }
  }
}

// Function to load all data from Firestore (supports both snapshot packages and legacy individual collection docs)
export async function loadFromFirebaseFirestore(): Promise<FirebaseSyncData | null> {
  if (isQuotaExceeded) return null;
  try {
    const metadataSnap = await getDocs(collection(db, `${COLLECTION_PREFIX}_metadata`));
    let metadata: any = {};
    metadataSnap.forEach(docSnap => {
      if (docSnap.id === CONFIG_DOC_ID) {
        metadata = docSnap.data();
      }
    });

    const students: StudentDetail[] = [];
    const semesterRecords: StudentSemesterRecord[] = [];

    // Try loading from compact snapshots first
    const snapshotsSnap = await getDocs(collection(db, `${COLLECTION_PREFIX}_snapshots`));
    if (!snapshotsSnap.empty) {
      const studentPacks: { index: number; students: StudentDetail[] }[] = [];
      const recordPacks: { index: number; records: StudentSemesterRecord[] }[] = [];

      snapshotsSnap.forEach(d => {
        const data = d.data();
        if (d.id.startsWith('students_pack_') && Array.isArray(data.students)) {
          studentPacks.push({ index: data.index ?? 0, students: data.students });
        } else if (d.id.startsWith('records_pack_') && Array.isArray(data.records)) {
          recordPacks.push({ index: data.index ?? 0, records: data.records });
        }
      });

      studentPacks.sort((a, b) => a.index - b.index).forEach(p => students.push(...p.students));
      recordPacks.sort((a, b) => a.index - b.index).forEach(p => semesterRecords.push(...p.records));
    }

    // Fallback to legacy individual documents if snapshots were empty
    if (students.length === 0) {
      const studentsSnap = await getDocs(collection(db, `${COLLECTION_PREFIX}_students`));
      studentsSnap.forEach(d => {
        if (d.exists()) {
          students.push(d.data() as StudentDetail);
        }
      });
    }

    if (semesterRecords.length === 0) {
      const recordsSnap = await getDocs(collection(db, `${COLLECTION_PREFIX}_records`));
      recordsSnap.forEach(d => {
        if (d.exists()) {
          semesterRecords.push(d.data() as StudentSemesterRecord);
        }
      });
    }

    if (students.length === 0 && !metadata.schoolData) {
      return null; // Empty database
    }

    return {
      schoolData: metadata.schoolData,
      academicYear: metadata.academicYear,
      subjects: metadata.subjects,
      availableAcademicYears: metadata.availableAcademicYears,
      students: students.length > 0 ? students : undefined,
      semesterRecords: semesterRecords.length > 0 ? semesterRecords : undefined,
      updatedAt: metadata.updatedAt,
    };
  } catch (err: any) {
    const errStr = String(err?.message || err || '');
    if (errStr.includes('resource-exhausted') || errStr.includes('Quota limit exceeded')) {
      handleQuotaExceeded();
      console.warn('Firestore load quota exceeded.', errStr);
    } else {
      console.error('Firebase load error:', err);
    }
    return null;
  }
}

// Subscribe to real-time metadata changes in Firestore
export function subscribeToFirebaseChanges(
  onDataUpdate: (data: FirebaseSyncData) => void,
  onError?: (err: Error) => void
) {
  if (isQuotaExceeded) return () => {};
  const configRef = doc(db, `${COLLECTION_PREFIX}_metadata`, CONFIG_DOC_ID);
  
  return onSnapshot(configRef, async (snap) => {
    if (snap.exists() && !isQuotaExceeded) {
      const fullData = await loadFromFirebaseFirestore();
      if (fullData) {
        onDataUpdate(fullData);
      }
    }
  }, (err) => {
    const errStr = String(err?.message || err || '');
    if (errStr.includes('resource-exhausted') || errStr.includes('Quota limit exceeded')) {
      handleQuotaExceeded();
      console.warn('Firestore subscription paused due to daily quota limit.');
      return;
    }
    console.error('Firestore subscription error:', err);
    if (onError) onError(err);
  });
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

