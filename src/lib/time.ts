export function timeAgo(iso: string, locale: string): string {
	const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
	const diff = new Date(iso).getTime() - Date.now();
	const abs = Math.abs(diff);
	if (abs < 60_000)        return rtf.format(Math.round(diff / 1_000), 'second');
	if (abs < 3_600_000)     return rtf.format(Math.round(diff / 60_000), 'minute');
	if (abs < 86_400_000)    return rtf.format(Math.round(diff / 3_600_000), 'hour');
	if (abs < 2_592_000_000) return rtf.format(Math.round(diff / 86_400_000), 'day');
	if (abs < 31_536_000_000) return rtf.format(Math.round(diff / 2_592_000_000), 'month');
	return rtf.format(Math.round(diff / 31_536_000_000), 'year');
}
