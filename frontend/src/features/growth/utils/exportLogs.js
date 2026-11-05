









export function escapeCsvCell(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}






export function formatLogsToCsv(logs = []) {
  const headers = ["Date", "Platform", "Problems Solved", "Difficulty", "Category", "Notes"];
  const rows = logs.map((log) => [
    escapeCsvCell(log.date || ""),
    escapeCsvCell(log.platform || ""),
    escapeCsvCell(log.problemsSolved ?? 0),
    escapeCsvCell(log.difficulty || ""),
    escapeCsvCell(log.category || ""),
    escapeCsvCell(log.notes || ""),
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
}







export function triggerFileDownload(content, filename, mimeType = "text/plain") {
  if (typeof window === "undefined" || !window.Blob) return;

  let url;
  let link;
  try {
    const blob = new Blob([content], { type: mimeType });
    url = URL.createObjectURL(blob);
    link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error("Could not export the file:", error);
  } finally {
    try {
      if (link?.parentNode) link.parentNode.removeChild(link);
      if (url) URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("Could not clean up the exported file:", error);
    }
  }
}






export function exportLogsAsCsv(logs = [], filename = "practice_history.csv") {
  const csvContent = formatLogsToCsv(logs);
  triggerFileDownload(csvContent, filename, "text/csv;charset=utf-8;");
}






export function exportLogsAsJson(logs = [], filename = "practice_history.json") {
  const jsonContent = JSON.stringify(logs, null, 2);
  triggerFileDownload(jsonContent, filename, "application/json;charset=utf-8;");
}
