export const formatIndonesianDate = (dateString?: string): string => {
  if (!dateString) return '-';

  // If already formatted like '14 Mei 2014', return as is
  if (/[a-zA-Z]/.test(dateString) && !dateString.includes('T')) {
    return dateString;
  }

  // Handle YYYY-MM-DD or ISO string
  const cleanDateStr = dateString.split('T')[0];
  const isoMatch = cleanDateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  
  if (isoMatch) {
    const year = isoMatch[1];
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const monthName = monthNames[month - 1] || isoMatch[2];
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    return `${formattedDay} ${monthName} ${year}`;
  }

  return dateString;
};
