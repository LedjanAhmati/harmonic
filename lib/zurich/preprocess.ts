export interface PreprocessResult {
  normalized: string;
}

export function preprocessModule(text: string): PreprocessResult {
  const normalized = text
    .replace(/\s+/g, " ")
    .replace(/[""„]/g, '"')
    .trim();

  return { normalized };
}
