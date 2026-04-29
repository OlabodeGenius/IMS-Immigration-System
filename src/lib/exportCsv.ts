/**
 * Converts an array of row objects into a CSV string and triggers a browser download.
 * Handles proper quoting and escaping of values containing commas, quotes, or newlines.
 */
export function exportToCsv(filename: string, rows: Record<string, any>[]): void {
    if (!rows || rows.length === 0) {
        console.warn("exportToCsv: no data to export");
        return;
    }

    const headers = Object.keys(rows[0]);

    const escape = (val: any): string => {
        if (val === null || val === undefined) return "";
        const str = String(val);
        // Wrap in quotes if value contains comma, double-quote, or newline
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvLines = [
        headers.map(escape).join(","),
        ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
    ];

    const csvContent = csvLines.join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // BOM for Excel UTF-8
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
