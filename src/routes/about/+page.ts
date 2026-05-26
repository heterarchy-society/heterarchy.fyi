import { peopleById, personAvatarUrl, imageSrcset } from '$lib/data/people';
import { contributors } from '$lib/data/about';

export function load() {
	return {
		contributors: contributors.flatMap((id) => {
			const p = peopleById.get(id);
			if (!p) return [];
			return [{ id: p.id, name: p.name, avatarUrl: personAvatarUrl(p), avatarSrcset: imageSrcset(p.avatarVersions) }];
		}),
	};
}
