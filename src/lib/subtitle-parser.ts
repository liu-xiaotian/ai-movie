export interface ParsedEntry {
  index: number;
  startTime: string; // "HH:MM:SS,mmm"
  endTime: string;
  text: string;
}

/** Normalize line endings */
function normalize(content: string): string {
  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

export function parseSRT(content: string): ParsedEntry[] {
  const entries: ParsedEntry[] = [];
  const blocks = normalize(content).split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;

    const index = parseInt(lines[0].trim(), 10);
    if (isNaN(index)) continue;

    const timeMatch = lines[1]
      .trim()
      .match(
        /(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/,
      );
    if (!timeMatch) continue;

    const text = lines
      .slice(2)
      .join("\n")
      .replace(/<[^>]+>/g, "") // strip HTML tags (italic, bold, etc.)
      .trim();
    if (!text) continue;

    entries.push({
      index,
      startTime: timeMatch[1],
      endTime: timeMatch[2],
      text,
    });
  }

  return entries;
}

export function parseVTT(content: string): ParsedEntry[] {
  const entries: ParsedEntry[] = [];
  const blocks = normalize(content).split(/\n\s*\n/);
  let autoIndex = 1;

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (!lines.length) continue;
    if (lines[0].startsWith("WEBVTT")) continue;
    if (lines[0].startsWith("NOTE")) continue;

    // Find timing line (may be preceded by a cue identifier)
    let timingIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("-->")) {
        timingIdx = i;
        break;
      }
    }
    if (timingIdx === -1) continue;

    const timeMatch = lines[timingIdx]
      .trim()
      .match(
        /(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/,
      );
    if (!timeMatch) continue;

    // VTT uses dots, convert to comma for consistency with SRT
    const startTime = timeMatch[1].replace(".", ",");
    const endTime = timeMatch[2].replace(".", ",");

    const text = lines
      .slice(timingIdx + 1)
      .join("\n")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!text) continue;

    entries.push({ index: autoIndex++, startTime, endTime, text });
  }

  return entries;
}

export function parse(filename: string, content: string): ParsedEntry[] {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "vtt") return parseVTT(content);
  return parseSRT(content); // default to SRT (also handles .ass loosely)
}

// ── Export helpers ──────────────────────────────────────────────────────────

type ExportEntry = {
  index: number;
  startTime: string;
  endTime: string;
  original: string;
  translation: string | null;
};

export function entriesToSRT(entries: ExportEntry[]): string {
  return entries
    .map(
      (e) =>
        `${e.index}\n${e.startTime} --> ${e.endTime}\n${e.translation || e.original}`,
    )
    .join("\n\n");
}

export function entriesToVTT(entries: ExportEntry[]): string {
  const lines = ["WEBVTT", ""];
  for (const e of entries) {
    const start = e.startTime.replace(",", ".");
    const end = e.endTime.replace(",", ".");
    lines.push(`${start} --> ${end}`, e.translation || e.original, "");
  }
  return lines.join("\n");
}
