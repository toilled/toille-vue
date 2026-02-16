import { writable, type Writable } from 'svelte/store';

export class Ref<T> {
    private store: Writable<T>;
    private _value: T;

    constructor(initialValue: T) {
        this._value = initialValue;
        this.store = writable(initialValue);
    }

    get value(): T {
        return this._value;
    }

    set value(v: T) {
        this._value = v;
        this.store.set(v);
    }

    subscribe(run: (value: T) => void) {
        // If the store is updated externally (unlikely here but possible), we should sync _value.
        // But here we control the store.
        return this.store.subscribe(run);
    }

    update(fn: (v: T) => T) {
        this.value = fn(this.value);
    }
}
