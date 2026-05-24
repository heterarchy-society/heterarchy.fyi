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

class MediaPlayerState {
	track = $state<MediaTrack | null>(null);
	currentTime = $state(0);
	duration = $state(0);
	playing = $state(false);
	speed = $state(1);
	volume = $state(1);
	lastAudibleVolume = 1;
	textFollowRequest = $state(0);
	audio: HTMLAudioElement | null = null;

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
		this.playing = false;
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
