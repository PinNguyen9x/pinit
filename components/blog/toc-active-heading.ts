// Pure part of the table-of-contents highlight, kept out of the .tsx so it can
// be unit-tested (the vitest setup runs plain logic only, no jsx/jsdom).

/** Height of the sticky header, so a heading we jump to doesn't land underneath it. */
export const HEADER_OFFSET = 80

/**
 * Picks the heading the reader is currently on, given each heading's distance
 * from the top of the viewport: the last one that has scrolled up past the
 * header. Everything after it is still ahead of the reader.
 *
 * The trailing sections of a post are often too short to ever reach the top of
 * the screen, so once the page is scrolled to the end the last heading wins.
 */
export function pickActiveHeadingId(
  headings: { id: string; top: number }[],
  atBottom: boolean,
): string {
  if (headings.length === 0) return ''
  if (atBottom) return headings[headings.length - 1].id

  let current = headings[0]
  for (const heading of headings) {
    if (heading.top - HEADER_OFFSET > 1) break
    current = heading
  }
  return current.id
}
