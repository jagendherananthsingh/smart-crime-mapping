export const formatDate = (dateInput: string | Date | undefined): string => {
  if (!dateInput) return 'N/A';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateInput: string | Date | undefined): string => {
  if (!dateInput) return 'N/A';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercent = (val: number | undefined, decimals = 1): string => {
  if (val === undefined || val === null || isNaN(val)) return '0.0%';
  // If already in 0-100 range (e.g. 59.2), do not multiply by 100 again
  const num = val > 1.0 ? val : val * 100;
  return `${num.toFixed(decimals)}%`;
};

export const getDayName = (dayIndex: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex % 7] || 'Unknown';
};

export const getMonthName = (monthIndex: number): string => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return months[(monthIndex - 1) % 12] || 'Unknown';
};

export const formatHour = (hour: number): string => {
  const h = hour % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedH = h % 12 === 0 ? 12 : h % 12;
  return `${formattedH}:00 ${ampm}`;
};
