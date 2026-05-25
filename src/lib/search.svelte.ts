let open = $state(false);

export const search = {
	get open() { return open; },
	show() { open = true; },
	hide() { open = false; },
	toggle() { open = !open; },
};
