/**
 * Utilitas untuk mengekspor data sensor ke format CSV dan JSON
 */

export function exportToCsv(data, filename = 'grainguard-data.csv') {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diekspor.");
    return;
  }

  const headers = ['Waktu', 'Suhu (C)', 'Kelembapan (%)', 'LDR (ADC)', 'Status Tutup', 'Kipas', 'Alarm'];
  const rows = data.map(item => [
    `"${item.time || item.timestamp || ''}"`,
    item.temperature !== undefined ? item.temperature : '',
    item.humidity !== undefined ? item.humidity : '',
    item.light !== undefined ? item.light : '',
    `"${item.lid || 'N/A'}"`,
    item.fan ? 'ON' : 'OFF',
    item.alarm ? 'ON' : 'OFF'
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJson(data, filename = 'grainguard-data.json') {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diekspor.");
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
