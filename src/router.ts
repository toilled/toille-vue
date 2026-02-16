import { writable } from 'svelte/store';

export const path = writable<string>('/');
export const params = writable<Record<string, string>>({});

export const setPath = (p: string) => {
    path.set(p);
};

export const navigate = (p: string) => {
    if (typeof window !== 'undefined') {
        window.history.pushState({}, '', p);
        path.set(p);
        window.scrollTo(0, 0);
    } else {
        path.set(p);
    }
};

if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
        path.set(window.location.pathname);
    });
    // Initialize
    path.set(window.location.pathname);
}
