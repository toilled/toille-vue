import { mount, hydrate } from 'svelte';
import { createApp } from './main';
import { setPath } from './router';

const { App } = createApp();

// Sync path on client load
setPath(window.location.pathname);

const target = document.getElementById('app');

if (target) {
    // If content exists, hydrate, otherwise mount
    if (target.hasChildNodes()) {
        hydrate(App, { target });
    } else {
        mount(App, { target });
    }
}
