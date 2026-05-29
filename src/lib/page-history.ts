const MAX_HISTORY_ENTRIES = 250;

export const PAGE_HISTORY_STORAGE_KEY = 'heterarchy.pageHistory.v1';
export const PAGE_HISTORY_UPDATED_EVENT = 'heterarchy:page-history-updated';

export type PageHistoryEntry = {
	path: string;
	title: string;
	visitCount: number;
	totalMs: number;
	lastDurationMs: number;
	firstVisitedAt: string;
	lastVisitedAt: string;
};

type VisitInput = {
	path: string;
	title: string;
	now: number;
};

type DurationInput = VisitInput & {
	deltaMs: number;
};

function canUseStorage(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		return typeof window.localStorage !== 'undefined';
	} catch {
		return false;
	}
}

function notifyHistoryUpdated(): void {
	if (typeof window === 'undefined') return;
	window.dispatchEvent(new CustomEvent(PAGE_HISTORY_UPDATED_EVENT));
}

function sanitizeEntry(value: unknown): PageHistoryEntry | null {
	if (!value || typeof value !== 'object') return null;
	const entry = value as Partial<PageHistoryEntry>;
	if (typeof entry.path !== 'string' || entry.path.length === 0) return null;

	const now = new Date().toISOString();
	const title = typeof entry.title === 'string' && entry.title.trim() ? entry.title : entry.path;
	const visitCount = Number.isFinite(entry.visitCount) ? Math.max(1, Math.floor(entry.visitCount ?? 1)) : 1;
	const totalMs = Number.isFinite(entry.totalMs) ? Math.max(0, Math.floor(entry.totalMs ?? 0)) : 0;
	const lastDurationMs = Number.isFinite(entry.lastDurationMs)
		? Math.max(0, Math.floor(entry.lastDurationMs ?? 0))
		: 0;

	return {
		path: entry.path,
		title,
		visitCount,
		totalMs,
		lastDurationMs,
		firstVisitedAt: typeof entry.firstVisitedAt === 'string' ? entry.firstVisitedAt : now,
		lastVisitedAt: typeof entry.lastVisitedAt === 'string' ? entry.lastVisitedAt : now,
	};
}

function sortEntries(entries: PageHistoryEntry[]): PageHistoryEntry[] {
	return [...entries]
		.sort((a, b) => Date.parse(b.lastVisitedAt) - Date.parse(a.lastVisitedAt))
		.slice(0, MAX_HISTORY_ENTRIES);
}

function writePageHistory(entries: PageHistoryEntry[]): void {
	if (!canUseStorage()) return;
	try {
		window.localStorage.setItem(PAGE_HISTORY_STORAGE_KEY, JSON.stringify(sortEntries(entries)));
		notifyHistoryUpdated();
	} catch {
		// Storage can be disabled or full; page history is best-effort by design.
	}
}

export function readPageHistory(): PageHistoryEntry[] {
	if (!canUseStorage()) return [];
	try {
		const raw = window.localStorage.getItem(PAGE_HISTORY_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return sortEntries(parsed.map(sanitizeEntry).filter((entry): entry is PageHistoryEntry => entry !== null));
	} catch {
		return [];
	}
}

function upsertPageHistory(path: string, update: (entry: PageHistoryEntry | null) => PageHistoryEntry): void {
	const entries = readPageHistory();
	const index = entries.findIndex((entry) => entry.path === path);
	const current = index >= 0 ? entries[index] : null;
	const next = update(current);

	if (index >= 0) {
		entries[index] = next;
	} else {
		entries.push(next);
	}

	writePageHistory(entries);
}

export function startPageHistoryVisit({ path, title, now }: VisitInput): void {
	const iso = new Date(now).toISOString();

	upsertPageHistory(path, (entry) => ({
		path,
		title: title || entry?.title || path,
		visitCount: (entry?.visitCount ?? 0) + 1,
		totalMs: entry?.totalMs ?? 0,
		lastDurationMs: 0,
		firstVisitedAt: entry?.firstVisitedAt ?? iso,
		lastVisitedAt: iso,
	}));
}

export function addPageHistoryDuration({ path, title, now, deltaMs }: DurationInput): void {
	const duration = Math.max(0, Math.floor(deltaMs));
	if (duration === 0) return;

	const iso = new Date(now).toISOString();

	upsertPageHistory(path, (entry) => ({
		path,
		title: title || entry?.title || path,
		visitCount: entry?.visitCount ?? 1,
		totalMs: (entry?.totalMs ?? 0) + duration,
		lastDurationMs: (entry?.lastDurationMs ?? 0) + duration,
		firstVisitedAt: entry?.firstVisitedAt ?? iso,
		lastVisitedAt: iso,
	}));
}

export function updatePageHistoryTitle(path: string, title: string): void {
	if (!title.trim()) return;

	upsertPageHistory(path, (entry) => ({
		path,
		title,
		visitCount: entry?.visitCount ?? 1,
		totalMs: entry?.totalMs ?? 0,
		lastDurationMs: entry?.lastDurationMs ?? 0,
		firstVisitedAt: entry?.firstVisitedAt ?? new Date().toISOString(),
		lastVisitedAt: entry?.lastVisitedAt ?? new Date().toISOString(),
	}));
}

export function clearPageHistory(): void {
	if (!canUseStorage()) return;
	try {
		window.localStorage.removeItem(PAGE_HISTORY_STORAGE_KEY);
		notifyHistoryUpdated();
	} catch {
		// Ignore storage failures; the UI will keep showing whatever can be read.
	}
}
