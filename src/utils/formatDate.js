function pad(number) {
  return String(number).padStart(2, '0');
}

// Aceita um Date ou o texto do SQLite ("2026-10-28 14:05:00").
function toDate(value) {
  return value instanceof Date ? value : new Date(String(value).replace(' ', 'T'));
}

// "28/10 14:05"
export function formatShortDateTime(value) {
  const date = toDate(value);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// "28/10/2026 14:05"
export function formatDateTime(value) {
  const date = toDate(value);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// "14:05"
export function formatTime(value) {
  const date = toDate(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
