/**
 * Normalize a free-text topic for matching.
 * Lowercase, strip punctuation, collapse whitespace.
 */
export function normalizeTopic(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
