/**
 * Pure algorithm for term-of-day selection — no I/O, no framework imports.
 * Used by both the SvelteKit app and the Node CI script.
 */

/** @param {Date} d */
export function localDateLabel(d) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Deterministically shuffle an array for a given year.
 * @template T
 * @param {T[]} pool
 * @param {number} year
 * @returns {T[]}
 */
export function shuffleForYear(pool, year) {
	const result = [...pool];
	let s = (year * 2654435761) >>> 0;
	for (let i = result.length - 1; i > 0; i--) {
		s = Math.imul(s ^ (s >>> 15), 0x45d9f3b) >>> 0;
		const j = s % (i + 1);
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

/**
 * Compute which pool entry is assigned to a given date, ignoring any history.
 * @template T
 * @param {T[]} pool
 * @param {Date} date
 * @returns {T}
 */
export function computeTermForDate(pool, date) {
	const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
	const utcStart = Date.UTC(date.getFullYear(), 0, 1);
	const dayOfYear = Math.round((utcDate - utcStart) / 86400000);
	const shuffled = shuffleForYear(pool, date.getFullYear());
	return shuffled[dayOfYear % shuffled.length];
}

/**
 * Parse a term-history CSV string into a date→id map.
 * @param {string} csv
 * @returns {Record<string, string>}
 */
export function parseHistory(csv) {
	return Object.fromEntries(
		csv.trim().split('\n').filter(Boolean).map((line) => line.split(','))
	);
}
