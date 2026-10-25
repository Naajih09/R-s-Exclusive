/**
 * Turns what the customer typed into a Postgres tsquery that matches word
 * prefixes, so "ank dre" finds "Ankara Day Dress". Punctuation is dropped so
 * user input can never inject tsquery operators. Returns null for empty input.
 */
export function toPrefixQuery(input: string): string | null {
  const words = input.toLowerCase().match(/[\p{L}\p{N}]+/gu)
  if (!words) return null
  return words.map((word) => `${word}:*`).join(' & ')
}
