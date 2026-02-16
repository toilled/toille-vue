import { render as svelteRender } from 'svelte/server';
import { createApp } from './main';
import { setPath } from './router';

export async function render(url: string) {
    const { App } = createApp();
    setPath(url);

    const { html } = svelteRender(App);
    return html;
}
