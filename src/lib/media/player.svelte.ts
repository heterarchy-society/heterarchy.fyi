export type MediaTrack = {
	id: string;
	title: string;
	subtitle?: string;
	href?: string;
	src: string;
	duration?: string | null;
	durationSeconds?: number | null;
	peaks?: string | null;
	followableText?: boolean;
};

const STORAGE_KEY = 'heterarchy:player';

class MediaPlayerState {
	track = $state<MediaTrack | null>(null);
	currentTime = $state(0);
	duration = $state(0);
	bufferedTime = $state(0);
	playing = $state(false);
	speed = $state(1);
	volume = $state(1);
	minimized = $state(true);
	lastAudibleVolume = 1;
	textFollowRequest = $state(0);
	audio: HTMLAudioElement | null = null;

	constructor() {
		this.restore();

		// Save whenever track/volume/speed/minimized change (not currentTime — too frequent)
		$effect.root(() => {
			$effect(() => {
				void this.track;
				void this.volume;
				void this.speed;
				void this.minimized;
				this.persist();
			});
		});

		if (typeof window !== 'undefined') {
			window.addEventListener('beforeunload', () => this.persist());
		}
	}

	private restore() {
		if (typeof localStorage === 'undefined') return;
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const s = JSON.parse(raw);
			if (!s?.track) return;
			this.track = s.track;
			this.currentTime = s.currentTime ?? 0;
			this.volume = s.volume ?? 1;
			this.lastAudibleVolume = s.volume ?? 1;
			this.speed = s.speed ?? 1;
			this.minimized = s.minimized ?? true;
			if (s.track.durationSeconds) this.duration = s.track.durationSeconds;
		} catch {}
	}

	persist() {
		if (typeof localStorage === 'undefined') return;
		if (!this.track) {
			localStorage.removeItem(STORAGE_KEY);
			return;
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify({
			track: this.track,
			currentTime: this.currentTime,
			volume: this.volume,
			speed: this.speed,
			minimized: this.minimized,
		}));
	}

	setAudio(audio: HTMLAudioElement) {
		this.audio = audio;
		audio.playbackRate = this.speed;
		audio.volume = this.volume;
		if (this.track && audio.src !== this.track.src) audio.src = this.track.src;
	}

	isTrack(id: string) {
		return this.track?.id === id;
	}

	load(track: MediaTrack) {
		const sameTrack = this.track?.id === track.id;
		this.track = track;
		if (track.durationSeconds) this.duration = track.durationSeconds;
		if (!this.audio) return;
		if (!sameTrack || this.audio.src !== track.src) {
			this.audio.src = track.src;
			this.currentTime = 0;
		}
		this.audio.playbackRate = this.speed;
		this.audio.volume = this.volume;
	}

	async play(track?: MediaTrack) {
		if (track) this.load(track);
		if (!this.audio) return;
		await this.audio.play();
	}

	pause() {
		this.audio?.pause();
		this.persist();
	}

	toggle(track?: MediaTrack) {
		if (track && !this.isTrack(track.id)) {
			void this.play(track);
			return;
		}
		if (this.playing) this.pause();
		else void this.play(track);
	}

	seek(seconds: number) {
		if (!this.audio) return;
		this.audio.currentTime = Math.max(0, seconds);
		this.currentTime = this.audio.currentTime;
	}

	reset() {
		this.seek(0);
	}

	clear() {
		this.pause();
		this.seek(0);
		this.track = null;
		this.currentTime = 0;
		this.duration = 0;
		this.bufferedTime = 0;
		this.playing = false;
		this.minimized = true;
		if (this.audio) this.audio.removeAttribute('src');
	}

	setSpeed(rate: number) {
		this.speed = rate;
		if (this.audio) this.audio.playbackRate = rate;
	}

	setVolume(value: number) {
		const volume = Math.min(1, Math.max(0, value));
		this.volume = volume;
		if (volume > 0) this.lastAudibleVolume = volume;
		if (this.audio) this.audio.volume = volume;
	}

	toggleMute() {
		if (this.volume > 0) {
			this.lastAudibleVolume = this.volume;
			this.setVolume(0);
		} else {
			this.setVolume(this.lastAudibleVolume || 1);
		}
	}

	requestTextFollow() {
		this.textFollowRequest += 1;
	}
}

export const mediaPlayer = new MediaPlayerState();
