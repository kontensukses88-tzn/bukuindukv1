import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker to use CDN for reliable browser execution
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface ExtractedSubjectGrade {
  subjectName: string;
  matchedCode?: string;
  nilaiAkhir: number;
  deskripsiCapaian: string;
}

export interface ExtractedStudentReport {
  namaMurid: string;
  nis: string;
  nisn: string;
  kelas: string;
  semester: 1 | 2;
  tahunAjaran: string;
  sakit: number;
  izin: number;
  tanpaKeterangan: number;
  catatanWaliKelas: string;
  grades: ExtractedSubjectGrade[];
  matchedStudentId?: string;
}

export interface SubjectMatcher {
  code: string;
  keywords: string[];
  displayName: string;
}

export const EXCLUDED_SUBJECT_KEYWORDS = [
  'koding dan kecerdasan artifisial',
  'koding & kecerdasan artifisial',
  'koding dan ai',
  'koding & ai',
  'kecerdasan artifisial',
  'koding',
  'coding dan kecerdasan artifisial',
  'coding & kecerdasan artifisial',
  'coding'
];

export const DEFAULT_SUBJECT_MATCHERS: SubjectMatcher[] = [
  {
    code: 'PAI',
    keywords: ['pendidikan agama islam', 'pendidikan agama', 'agama islam', 'budi pekerti', 'pai'],
    displayName: 'Pendidikan Agama Islam dan Budi Pekerti'
  },
  {
    code: 'PPKN',
    keywords: ['pendidikan pancasila', 'kewarganegaraan', 'pkn', 'ppkn'],
    displayName: 'Pendidikan Pancasila'
  },
  {
    code: 'BIND',
    keywords: ['bahasa indonesia', 'bind'],
    displayName: 'Bahasa Indonesia'
  },
  {
    code: 'MTK',
    keywords: ['matematika', 'mtk'],
    displayName: 'Matematika'
  },
  {
    code: 'IPAS',
    keywords: ['ilmu pengetahuan alam dan sosial', 'ilmu pengetahuan alam', 'ipas'],
    displayName: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)'
  },
  {
    code: 'SBDP',
    keywords: ['seni rupa', 'seni musik', 'seni tari', 'seni teater', 'seni budaya', 'sbdp', 'seni'],
    displayName: 'Seni Rupa / SBdP'
  },
  {
    code: 'PJOK',
    keywords: ['pendidikan jasmani', 'olahraga dan kesehatan', 'pjok'],
    displayName: 'Pendidikan Jasmani, Olahraga, dan Kesehatan'
  },
  {
    code: 'SUNDA',
    keywords: ['muatan lokal bahasa daerah', 'bahasa daerah', 'bahasa sunda', 'sunda', 'mulok'],
    displayName: 'Muatan Lokal Bahasa Daerah'
  },
  {
    code: 'BING',
    keywords: ['bahasa inggris', 'english', 'bing'],
    displayName: 'Bahasa Inggris'
  }
];

/**
 * Cleans extracted description text to keep ONLY the competence description (Capaian Kompetensi),
 * stripping out extraneous table headers, row indices, score numbers, and next subject names.
 */
export function cleanCapaianDescription(rawDesc: string): string {
  if (!rawDesc) return 'Mencapai kompetensi dengan baik.';

  let desc = rawDesc;

  // 1. Truncate at known e-Rapor section or table headers
  const truncateHeadersRegex = /(?:Mata\s+Pelajaran\s+Pilihan|Muatan\s+Lokal|Mata\s+Pelajaran|Nilai\s+Akhir|Capaian\s+Pembelajaran|Kokurikuler|Ketidakhadiran|Catatan\s+Wali|Ekstrakurikuler|Keterangan\s+Kenaikan|Tanda\s+Tangan|Kepala\s+Sekolah|Wali\s+Kelas|Halaman\s+\d+|Kelompok\s+[A-Z]|Koding\s+(?:dan|&)\s+Kecerdasan\s+Artifisial|Coding\s+(?:dan|&)\s+Kecerdasan\s+Artifisial|Kecerdasan\s+Artifisial|\bNo\b)/i;
  
  desc = desc.split(truncateHeadersRegex)[0];

  // 2. Truncate trailing numbers e.g. " 7 84 ", " 8 90 ", " 7 84", " 84 " at the end
  desc = desc.replace(/\s+\d{1,2}(?:\s+\d{1,3})+\s*$/i, '');
  desc = desc.replace(/\s+\d{1,3}\s*$/i, '');

  // 3. If there is a trailing period, check if text after the last period contains digit/header noise, and strip it
  const lastPeriodIdx = desc.lastIndexOf('.');
  if (lastPeriodIdx !== -1 && lastPeriodIdx < desc.length - 1) {
    const trailingPart = desc.substring(lastPeriodIdx + 1).trim();
    if (
      !trailingPart ||
      /^\d+/i.test(trailingPart) ||
      /^(?:Mata|Muatan|No|Nilai|Kelompok|Kel|\d+)/i.test(trailingPart) ||
      trailingPart.length < 3
    ) {
      desc = desc.substring(0, lastPeriodIdx + 1);
    }
  }

  // 4. Remove leading numbers, subject names, or punctuation noise
  desc = desc.replace(/^[\s\d\.\-\:\,\/]+/, '');

  // 5. Clean whitespace & outer quotes
  desc = desc.replace(/\s+/g, ' ').trim();
  desc = desc.replace(/^["'“”]+|["'“”]+$/g, '').trim();

  // Return cleaned or fallback
  if (!desc || desc.length < 5) {
    return 'Mencapai kompetensi dengan baik.';
  }

  return desc;
}

/**
 * Extracts raw page text array from a PDF File
 */
export async function extractTextFromPdf(file: File): Promise<{ pageNum: number; text: string }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: { pageNum: number; text: string }[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ');

    pages.push({ pageNum: i, text: pageText });
  }

  return pages;
}

/**
 * Parses PDF page text into structured student report card data.
 */
export function parsePdfReportText(
  pages: { pageNum: number; text: string }[],
  appSubjects?: { code: string; namaMataPelajaran: string }[]
): ExtractedStudentReport[] {

  interface PageData {
    pageNum: number;
    text: string;
    nis: string;
    nisn: string;
    nama: string;
    kelas: string;
  }

  // 1. Extract metadata from each page
  const parsedPages: PageData[] = pages.map(page => {
    const text = page.text;

    // NIS & NISN extraction
    let nis = '';
    let nisn = '';

    const nisNisnMatch = text.match(/NIS\/NISN\s*:\s*(\d+)\s*\/\s*(\d+)/i);
    if (nisNisnMatch) {
      nis = nisNisnMatch[1].trim();
      nisn = nisNisnMatch[2].trim();
    } else {
      const nisnOnly = text.match(/NISN\s*:\s*(\d{10})/i);
      if (nisnOnly) nisn = nisnOnly[1].trim();

      const nisOnly = text.match(/NIS\s*:\s*(\d+)/i);
      if (nisOnly) nis = nisOnly[1].trim();
    }

    // Nama extraction
    let nama = '';
    const namaMatch = text.match(/Nama\s*(?:Murid|Siswa|Lengkap|Peserta\s+Didik)?\s*:\s*([A-Za-z\s'\.\-]+?)(?=\s+Kelas|\s+Fase|\s+NIS|\s+Sekolah|\s+Semester|\n|$)/i);
    if (namaMatch) {
      nama = namaMatch[1].trim().toUpperCase();
    } else {
      // Try footer pattern e.g. "1 A | ADZRA NADHIFA SYAFA | 252601003"
      const footerMatch = text.match(/\|\s*([A-Za-z\s'\.\-]{3,})\s*\|\s*\d+/);
      if (footerMatch) {
        nama = footerMatch[1].trim().toUpperCase();
      }
    }

    // Kelas extraction
    let kelas = '';
    const kelasMatch = text.match(/Kelas\s*:\s*(\d+)\s*([A-Za-z]*)/i);
    if (kelasMatch) {
      kelas = kelasMatch[2] ? `${kelasMatch[1]}${kelasMatch[2]}` : kelasMatch[1];
    }

    return { pageNum: page.pageNum, text, nis, nisn, nama, kelas };
  });

  // 2. Group pages strictly by student (by NISN, NIS, or Nama)
  interface StudentGroup {
    nisn: string;
    nis: string;
    nama: string;
    kelas: string;
    pageTexts: string[];
  }

  const studentGroups: StudentGroup[] = [];

  for (const p of parsedPages) {
    // Find matching existing group
    let group = studentGroups.find(g => {
      if (p.nisn && g.nisn && p.nisn === g.nisn) return true;
      if (p.nis && g.nis && p.nis === g.nis) return true;
      if (p.nama && g.nama && p.nama === g.nama && p.nama !== 'TANPA NAMA') return true;
      return false;
    });

    if (group) {
      group.pageTexts.push(p.text);
      if (!group.nisn && p.nisn) group.nisn = p.nisn;
      if (!group.nis && p.nis) group.nis = p.nis;
      if ((!group.nama || group.nama === 'TANPA NAMA') && p.nama) group.nama = p.nama;
      if (!group.kelas && p.kelas) group.kelas = p.kelas;
    } else {
      // Create new group
      if (!p.nisn && !p.nis && (!p.nama || p.nama === 'TANPA NAMA') && studentGroups.length > 0) {
        studentGroups[studentGroups.length - 1].pageTexts.push(p.text);
      } else {
        studentGroups.push({
          nisn: p.nisn,
          nis: p.nis,
          nama: p.nama || 'TANPA NAMA',
          kelas: p.kelas || '1A',
          pageTexts: [p.text]
        });
      }
    }
  }

  // 3. Process each student group
  const reports: ExtractedStudentReport[] = [];

  for (const group of studentGroups) {
    const combinedText = group.pageTexts.join(' ');

    let namaMurid = group.nama;
    if (!namaMurid || namaMurid === 'TANPA NAMA') {
      const namaMatch = combinedText.match(/Nama\s*(?:Murid|Siswa|Lengkap|Peserta\s+Didik)?\s*:\s*([A-Za-z\s'\.\-]+?)(?=\s+Kelas|\s+Fase|\s+NIS|\s+Sekolah|\s+Semester|\n|$)/i);
      if (namaMatch) {
        namaMurid = namaMatch[1].trim().toUpperCase();
      }
    }

    let nis = group.nis;
    let nisn = group.nisn;
    if (!nis || !nisn) {
      const nisNisnMatch = combinedText.match(/NIS\/NISN\s*:\s*(\d+)\s*\/\s*(\d+)/i);
      if (nisNisnMatch) {
        if (!nis) nis = nisNisnMatch[1].trim();
        if (!nisn) nisn = nisNisnMatch[2].trim();
      } else {
        if (!nis) {
          const nisOnly = combinedText.match(/NIS\s*:\s*(\d+)/i);
          if (nisOnly) nis = nisOnly[1].trim();
        }
        if (!nisn) {
          const nisnOnly = combinedText.match(/NISN\s*:\s*(\d+)/i);
          if (nisnOnly) nisn = nisnOnly[1].trim();
        }
      }
    }

    // Kelas
    let kelas = group.kelas;
    if (!kelas || kelas === '1A') {
      const kelasMatch = combinedText.match(/Kelas\s*:\s*(\d+)\s*([A-Za-z]*)/i);
      if (kelasMatch) {
        kelas = kelasMatch[2] ? `${kelasMatch[1]}${kelasMatch[2]}` : kelasMatch[1];
      }
    }

    // Semester
    const semMatch = combinedText.match(/Semester\s*:\s*(1|2)/i);
    const semester: 1 | 2 = semMatch && semMatch[1] === '1' ? 1 : 2;

    // Tahun Ajaran
    const taMatch = combinedText.match(/Tahun\s+Ajaran\s*:\s*(\d{4}\/\d{4})/i);
    const tahunAjaran = taMatch ? taMatch[1].trim() : '2025/2026';

    // Ketidakhadiran
    let sakit = 0;
    let izin = 0;
    let tanpaKeterangan = 0;

    const sakitMatch = combinedText.match(/Sakit\s*:\s*(\d+)\s*hari/i) || combinedText.match(/Sakit\s*:\s*(\d+)/i);
    if (sakitMatch) sakit = parseInt(sakitMatch[1], 10);

    const izinMatch = combinedText.match(/Izin\s*:\s*(\d+)\s*hari/i) || combinedText.match(/Izin\s*:\s*(\d+)/i);
    if (izinMatch) izin = parseInt(izinMatch[1], 10);

    const tkMatch = combinedText.match(/(?:Tanpa\s+Keterangan|Alpa)\s*:\s*(\d+)\s*hari/i) ||
                    combinedText.match(/(?:Tanpa\s+Keterangan|Alpa)\s*:\s*(\d+)/i);
    if (tkMatch) tanpaKeterangan = parseInt(tkMatch[1], 10);

    // Catatan Wali Kelas
    let catatanWaliKelas = '';
    const catatanMatch = combinedText.match(/Catatan\s+Wali\s+Kelas\s*([\s\S]*?)(?:Keterangan\s+Kenaikan|Tanggapan\s+Orang|Bandung|Kepala\s+Sekolah|Wali\s+Kelas|Halaman|\n\n|$)/i);
    if (catatanMatch) {
      catatanWaliKelas = catatanMatch[1]
        .replace(/^[\s:]+/, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // 4. Extract Subjects & Grades
    const grades: ExtractedSubjectGrade[] = [];

    interface SubjectMatch {
      code: string;
      displayName: string;
      index: number;
      isIgnored?: boolean;
    }

    const matches: SubjectMatch[] = [];

    // Table header index anchor to prioritize grade section occurrences over headers/footers
    const tableHeaderMatch = combinedText.match(/(?:Nilai\s+dan\s+Capaian|Mata\s+Pelajaran|Capaian\s+Pembelajaran|Nilai\s+Akhir)/i);
    const tableHeaderIndex = tableHeaderMatch ? tableHeaderMatch.index! : 0;

    // Detect occurrences of Koding / Kecerdasan Artifisial / AI as ignored boundary markers
    const excludedRegex = /\b(?:Koding\s+(?:dan|&)\s+Kecerdasan\s+Artifisial|Coding\s+(?:dan|&)\s+Kecerdasan\s+Artifisial|Kecerdasan\s+Artifisial|Koding|Coding)\b/gi;
    let exMatch: RegExpExecArray | null;
    while ((exMatch = excludedRegex.exec(combinedText)) !== null) {
      if (exMatch.index >= tableHeaderIndex) {
        matches.push({
          code: 'EXCLUDED_KODING_AI',
          displayName: 'Koding dan Kecerdasan Artifisial',
          index: exMatch.index,
          isIgnored: true
        });
      }
    }

    for (const sm of DEFAULT_SUBJECT_MATCHERS) {
      let bestIndex = -1;
      let bestPriority = 0; // 3: score within 80 chars & after header, 2: score within 300 chars & after header, 1: after header, 0: any match

      for (const kw of sm.keywords) {
        const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
        let m: RegExpExecArray | null;

        while ((m = regex.exec(combinedText)) !== null) {
          const matchIdx = m.index;
          const shortWindow = combinedText.substring(matchIdx, matchIdx + 80);
          const longWindow = combinedText.substring(matchIdx, matchIdx + 350);

          const hasCloseScore = /\b([4-9]\d|100)(?:[\.,]\d+)?\b/.test(shortWindow);
          const hasScore = /\b([4-9]\d|100)(?:[\.,]\d+)?\b/.test(longWindow);
          const isAfterHeader = matchIdx >= tableHeaderIndex;

          let priority = 0;
          if (hasCloseScore && isAfterHeader) priority = 3;
          else if (hasScore && isAfterHeader) priority = 2;
          else if (isAfterHeader) priority = 1;

          if (priority > bestPriority) {
            bestPriority = priority;
            bestIndex = matchIdx;
          }

          if (bestPriority === 3) break;
        }

        if (bestPriority === 3) break;
      }

      if (bestIndex !== -1) {
        let targetCode = sm.code;
        if (appSubjects && appSubjects.length > 0) {
          const appSub = appSubjects.find(s => 
            s.code.toUpperCase() === sm.code.toUpperCase() ||
            sm.keywords.some(kw => s.namaMataPelajaran.toLowerCase().includes(kw))
          );
          if (appSub) {
            targetCode = appSub.code;
          }
        }

        matches.push({
          code: targetCode,
          displayName: sm.displayName,
          index: bestIndex
        });
      }
    }

    // Sort matches by position in text
    matches.sort((a, b) => a.index - b.index);

    // End boundary for subject section
    const endBoundaryMatch = combinedText.match(/Kokurikuler|Ketidakhadiran|Catatan\s+Wali|Ekstrakurikuler|Keterangan\s+Kenaikan|Tanda\s+Tangan|Kepala\s+Sekolah/i);
    const endBoundaryIndex = endBoundaryMatch ? endBoundaryMatch.index! : combinedText.length;

    // Parse each subject slice
    for (let i = 0; i < matches.length; i++) {
      const curr = matches[i];
      if (curr.isIgnored) {
        continue; // Skip extracting Koding dan Kecerdasan Artifisial
      }

      const nextIndex = (i + 1 < matches.length) ? matches[i + 1].index : endBoundaryIndex;

      const rawSlice = combinedText.substring(curr.index, nextIndex);

      // Extract score (search for numbers 40-100 or decimal 40.0 - 100.0)
      let score = 0;
      const scoreMatches = rawSlice.match(/\b([4-9]\d|100)(?:[\.,]\d+)?\b/g);
      if (scoreMatches && scoreMatches.length > 0) {
        for (const smStr of scoreMatches) {
          const parsedVal = Math.round(parseFloat(smStr.replace(',', '.')));
          if (parsedVal >= 40 && parsedVal <= 100) {
            score = parsedVal;
            break;
          }
        }
      }

      // Extract description
      let desc = '';
      
      // Look for known Indonesian description starting keywords
      const descStartRegex = /(?:Ananda|Peserta\s+didik|Peserta|Siswa|Murid|Menunjukkan|Mencapai|Perlu|Telah|Sangat|Baik|Cukup|Mampu|Memiliki|Menguasai|Dapat|Memahami|Melakukan|Mengidentifikasi|Menganalisis|Menerapkan|Menjelaskan|Membuat|Anak)\b/i;
      const startMatch = descStartRegex.exec(rawSlice);

      if (startMatch) {
        desc = rawSlice.substring(startMatch.index);
      } else {
        // Fallback: strip subject name & score
        desc = rawSlice;
        // Strip score numbers
        desc = desc.replace(/\b([4-9]\d|100)(?:[\.,]\d+)?\b/g, '');
        // Strip subject name or leading index digits
        desc = desc.replace(/^(?:\d+[\.\s]*)?(?:Pendidikan|Bahasa|Matematika|Ilmu|IPAS|PJOK|Seni|Muatan|Agama|Pancasila|Budi|Jasmani|Olahraga|Kesehatan|Sunda|Inggris|PAI|PPKN|BIND|MTK|SBDP|BING|SUNDA|[\w\s'\.\-]+?)(?=\s+[A-Za-z]{3,})/i, '');
        desc = desc.replace(/^[\s\d\.\-\:\,\/]+/, '');
      }

      // Clean up description to only retain the actual competence text
      desc = cleanCapaianDescription(desc);

      grades.push({
        subjectName: curr.displayName,
        matchedCode: curr.code,
        nilaiAkhir: score,
        deskripsiCapaian: desc
      });
    }

    reports.push({
      namaMurid,
      nis,
      nisn,
      kelas,
      semester,
      tahunAjaran,
      sakit,
      izin,
      tanpaKeterangan,
      catatanWaliKelas,
      grades
    });
  }

  return reports;
}
