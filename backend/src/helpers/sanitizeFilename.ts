import path from "node:path";

const CYRILLIC_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function transliterate(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC_MAP[char] ?? char)
    .join("");
}

export function sanitizeFilename(filename: string): string {
  const originalName = path.basename(filename);
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext);

  const transliteratedBase = transliterate(baseName);

  const safeBase = transliteratedBase
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 120);

  const safeExt = ext.replace(/[^a-z0-9.]/g, "").slice(0, 10);

  return `${safeBase || `file_${Date.now()}`}${safeExt}`;
}
