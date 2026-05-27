import { untrack } from 'svelte';

export type MediaTrack = {
	id: string;
	title: string;
	subtitle?: string;
	album?: string;
	href?: string;
	src?: string;
	duration?: string | null;
	durationSeconds?: number | null;
	peaks?: string | null;
	followableText?: boolean;
	youtubeVideoId?: string;
	isVideo?: boolean;
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
	playlist = $state<MediaTrack[]>([]);
	playlistIndex = $state(-1);
	mediaEl: HTMLVideoElement | null = null;
	mediaElReady = $state(false);
	pictureInPicture = $state(false);
	videoDefaultContainer: HTMLElement | null = null;
	ytPlayer: any = null;
	ytPlayerReady = $state(false);
	ytDefaultContainer: HTMLElement | null = null;
	private ytSyncRaf: number | null = null;
	private currentTimePersistTimer: number | null = null;
	private lastCurrentTimePersistAt = 0;
	private playOnMediaReady = false;

	constructor() {
		this.restore();

		$effect.root(() => {
			$effect(() => {
				void this.track;
				void this.volume;
				void this.speed;
				void this.minimized;
				untrack(() => this.persist());
			});

			$effect(() => {
				void this.currentTime;
				this.persistCurrentTimeThrottled();
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
		if (!this.track || this.track.youtubeVideoId) {
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

	setMediaEl(el: HTMLVideoElement) {
		this.mediaEl = el;
		el.playbackRate = this.speed;
		el.volume = this.volume;
		if (this.track?.src && el.src !== this.track.src) el.src = this.track.src;
		this.mediaElReady = true;
		this.pictureInPicture = typeof document !== 'undefined' && document.pictureInPictureElement === el;
		this.setupMediaSessionHandlers();
		if (this.playOnMediaReady) {
			this.playOnMediaReady = false;
			void this.play().catch(() => {});
		}
	}

	setVideoDefaultContainer(el: HTMLElement) {
		this.videoDefaultContainer = el;
	}

	setYTDefaultContainer(el: HTMLElement) {
		this.ytDefaultContainer = el;
	}

	connectYouTubePlayer(player: any) {
		this.ytPlayer = player;
		this.ytPlayer.setVolume?.(this.volume * 100);
		this.ytPlayer.setPlaybackRate?.(this.speed);
		this.ytPlayerReady = true;
		this.startYTSync();
	}

	disconnectYouTubePlayer() {
		this.stopYTSync();
		this.ytPlayer = null;
		this.ytPlayerReady = false;
	}

	startYTSync() {
		this.stopYTSync();
		const sync = () => {
			if (!this.ytPlayer) return;
			this.currentTime = this.ytPlayer.getCurrentTime?.() ?? 0;
			const dur = this.ytPlayer.getDuration?.() ?? 0;
			if (dur > 0) this.duration = dur;
			this.ytSyncRaf = requestAnimationFrame(sync);
		};
		this.ytSyncRaf = requestAnimationFrame(sync);
	}

	stopYTSync() {
		if (this.ytSyncRaf !== null) {
			cancelAnimationFrame(this.ytSyncRaf);
			this.ytSyncRaf = null;
		}
	}

	private persistCurrentTimeThrottled() {
		if (typeof window === 'undefined') return;
		if (this.currentTimePersistTimer) return;

		const elapsed = Date.now() - this.lastCurrentTimePersistAt;
		if (elapsed >= 1000) {
			this.lastCurrentTimePersistAt = Date.now();
			this.persist();
			return;
		}

		this.currentTimePersistTimer = window.setTimeout(() => {
			this.currentTimePersistTimer = null;
			this.lastCurrentTimePersistAt = Date.now();
			this.persist();
		}, 1000 - elapsed);
	}

	private syncMediaSession() {
		if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
		navigator.mediaSession.metadata = this.track
			? new MediaMetadata({
				title: this.track.title,
				artist: this.track.subtitle ?? '',
				album: this.track.album ?? '',
				artwork: [{ src: '/logo.png', type: 'image/png' }],
			})
			: null;
	}

	private setupMediaSessionHandlers() {
		if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
		navigator.mediaSession.setActionHandler('play', () => { void this.play(); });
		navigator.mediaSession.setActionHandler('pause', () => { this.pause(); });
		navigator.mediaSession.setActionHandler('seekbackward', (d) => { this.seek(this.currentTime - (d.seekOffset ?? 10)); });
		navigator.mediaSession.setActionHandler('seekforward', (d) => { this.seek(this.currentTime + (d.seekOffset ?? 10)); });
		navigator.mediaSession.setActionHandler('seekto', (d) => { if (d.seekTime != null) this.seek(d.seekTime); });
	}

	isTrack(id: string) {
		return this.track?.id === id;
	}

	load(track: MediaTrack) {
		const sameTrack = this.track?.id === track.id;
		this.track = track;
		if (track.durationSeconds) this.duration = track.durationSeconds;
		this.syncMediaSession();
		if (!track.youtubeVideoId && this.mediaEl) {
			if (!sameTrack || (track.src && this.mediaEl.src !== track.src)) {
				if (track.src) this.mediaEl.src = track.src;
				this.currentTime = 0;
			}
			this.mediaEl.playbackRate = this.speed;
			this.mediaEl.volume = this.volume;
		}
	}

	async play(track?: MediaTrack) {
		if (track) this.load(track);
		if (this.track?.youtubeVideoId) {
			this.ytPlayer?.playVideo();
			return;
		}
		if (!this.mediaEl) {
			this.playOnMediaReady = true;
			return;
		}
		await this.mediaEl.play();
	}

	pause() {
		if (this.track?.youtubeVideoId) {
			this.ytPlayer?.pauseVideo();
			this.persist();
			return;
		}
		this.mediaEl?.pause();
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

	async togglePictureInPicture() {
		if (!this.mediaEl || !this.track?.isVideo || this.track.youtubeVideoId) return;
		if (!document.pictureInPictureEnabled) return;

		if (document.pictureInPictureElement === this.mediaEl) {
			await document.exitPictureInPicture();
			return;
		}

		await this.mediaEl.requestPictureInPicture();
	}

	playFromPlaylist(tracks: MediaTrack[], index = 0) {
		this.playlist = tracks;
		this.playlistIndex = index;
		void this.play(tracks[index]);
	}

	togglePlaylist(tracks: MediaTrack[]) {
		const inPlaylist = this.playlistIndex >= 0 && tracks.some(t => t.id === this.track?.id);
		if (inPlaylist) {
			if (this.playing) this.pause();
			else void this.play();
		} else {
			this.playFromPlaylist(tracks);
		}
	}

	ended() {
		this.playing = false;
		this.currentTime = 0;
		if (this.mediaEl) this.mediaEl.currentTime = 0;
		const next = this.playlistIndex + 1;
		if (next < this.playlist.length) {
			this.playlistIndex = next;
			void this.play(this.playlist[next]);
		} else {
			this.playlist = [];
			this.playlistIndex = -1;
			this.clear();
		}
	}

	seek(seconds: number) {
		const t = Math.max(0, seconds);
		if (this.track?.youtubeVideoId && this.ytPlayer) {
			this.ytPlayer.seekTo(t, true);
			this.currentTime = t;
			return;
		}
		if (!this.mediaEl) return;
		this.mediaEl.currentTime = t;
		this.currentTime = this.mediaEl.currentTime;
	}

	reset() {
		this.seek(0);
	}

	clear() {
		this.pause();
		this.seek(0);
		this.stopYTSync();
		this.ytPlayer = null;
		this.ytPlayerReady = false;
		this.track = null;
		this.syncMediaSession();
		this.currentTime = 0;
		this.duration = 0;
		this.bufferedTime = 0;
		this.playing = false;
		this.minimized = true;
		this.playOnMediaReady = false;
		this.pictureInPicture = false;
		if (this.mediaEl) this.mediaEl.removeAttribute('src');
	}

	setSpeed(rate: number) {
		this.speed = rate;
		if (this.mediaEl) this.mediaEl.playbackRate = rate;
		this.ytPlayer?.setPlaybackRate?.(rate);
	}

	setVolume(value: number) {
		const volume = Math.min(1, Math.max(0, value));
		this.volume = volume;
		if (volume > 0) this.lastAudibleVolume = volume;
		if (this.mediaEl) this.mediaEl.volume = volume;
		this.ytPlayer?.setVolume?.(volume * 100);
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
