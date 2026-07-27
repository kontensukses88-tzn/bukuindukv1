import { doc, setDoc, onSnapshot, collection, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
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

// Function to save state to Firebase Firestore
export async function saveToFirebaseFirestore(data: {
  schoolData: SchoolData;
  academicYear: AcademicYearData;
  subjects: SubjectItem[];
  availableAcademicYears: string[];
  students: StudentDetail[];
  semesterRecords: StudentSemesterRecord[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const timestamp = new Date().toISOString();

    // 1. Save global config / school metadata
    const configRef = doc(db, `${COLLECTION_PREFIX}_metadata`, CONFIG_DOC_ID);
    await setDoc(configRef, {
      schoolData: data.schoolData,
      academicYear: data.academicYear,
      subjects: data.subjects,
      availableAcademicYears: data.availableAcademicYears,
      studentsCount: data.students.length,
      updatedAt: timestamp,
    }, { merge: true });

    // 2. Batch save students
    const studentsCollection = collection(db, `${COLLECTION_PREFIX}_students`);
    const studentChunks = chunkArray(data.students, 400); // Firestore batch limit is 500
    for (const chunk of studentChunks) {
      const batch = writeBatch(db);
      for (const student of chunk) {
        const studentRef = doc(studentsCollection, String(student.id));
        batch.set(studentRef, student, { merge: true });
      }
      await batch.commit();
    }

    // 3. Batch save semester records
    const recordsCollection = collection(db, `${COLLECTION_PREFIX}_records`);
    const recordChunks = chunkArray(data.semesterRecords, 400);
    for (const chunk of recordChunks) {
      const batch = writeBatch(db);
      for (const record of chunk) {
        const recId = `${record.studentId}_${record.kelas}_${record.semester}`;
        const recordRef = doc(recordsCollection, recId);
        batch.set(recordRef, record, { merge: true });
      }
      await batch.commit();
    }

    return { success: true };
  } catch (err: any) {
    console.error('Firebase save error:', err);
    return { success: false, error: err?.message || 'Gagal menyimpan ke Firebase Cloud Database' };
  }
}

// Delete student from Firestore
export async function deleteStudentFromFirestore(studentId: string): Promise<void> {
  try {
    const studentRef = doc(db, `${COLLECTION_PREFIX}_students`, String(studentId));
    await deleteDoc(studentRef);
  } catch (err) {
    console.error('Error deleting student from Firestore:', err);
  }
}

// Function to load all data from Firestore
export async function loadFromFirebaseFirestore(): Promise<FirebaseSyncData | null> {
  try {
    const metadataSnap = await getDocs(collection(db, `${COLLECTION_PREFIX}_metadata`));
    let metadata: any = {};
    metadataSnap.forEach(docSnap => {
      if (docSnap.id === CONFIG_DOC_ID) {
        metadata = docSnap.data();
      }
    });

    const studentsSnap = await getDocs(collection(db, `${COLLECTION_PREFIX}_students`));
    const students: StudentDetail[] = [];
    studentsSnap.forEach(d => {
      if (d.exists()) {
        students.push(d.data() as StudentDetail);
      }
    });

    const recordsSnap = await getDocs(collection(db, `${COLLECTION_PREFIX}_records`));
    const semesterRecords: StudentSemesterRecord[] = [];
    recordsSnap.forEach(d => {
      if (d.exists()) {
        semesterRecords.push(d.data() as StudentSemesterRecord);
      }
    });

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
  } catch (err) {
    console.error('Firebase load error:', err);
    return null;
  }
}

// Subscribe to real-time metadata changes in Firestore
export function subscribeToFirebaseChanges(
  onDataUpdate: (data: FirebaseSyncData) => void,
  onError?: (err: Error) => void
) {
  const configRef = doc(db, `${COLLECTION_PREFIX}_metadata`, CONFIG_DOC_ID);
  
  return onSnapshot(configRef, async (snap) => {
    if (snap.exists()) {
      const fullData = await loadFromFirebaseFirestore();
      if (fullData) {
        onDataUpdate(fullData);
      }
    }
  }, (err) => {
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
