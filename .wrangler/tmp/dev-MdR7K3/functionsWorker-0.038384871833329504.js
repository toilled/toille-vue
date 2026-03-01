var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-8Ftkit/functionsWorker-0.038384871833329504.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var connections = /* @__PURE__ */ new Map();
var onRequestGet = /* @__PURE__ */ __name2(async (context) => {
  const upgradeHeader = context.request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);
  server.accept();
  const id = Math.random().toString(36).substring(2, 10);
  connections.set(server, id);
  server.send(JSON.stringify({ type: "init", id }));
  server.addEventListener("message", (event) => {
    for (const [conn, connId] of connections.entries()) {
      if (conn !== server) {
        try {
          conn.send(event.data);
        } catch (e) {
        }
      }
    }
  });
  server.addEventListener("close", () => {
    connections.delete(server);
    for (const [conn, connId] of connections.entries()) {
      try {
        conn.send(JSON.stringify({ type: "disconnect", id }));
      } catch (e) {
      }
    }
  });
  return new Response(null, {
    status: 101,
    webSocket: client
  });
}, "onRequestGet");
var onRequestGet2 = /* @__PURE__ */ __name2(async (context) => {
  try {
    const db = context.env.DB;
    if (!db) {
      return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
    }
    const { results } = await db.prepare(
      "SELECT name, score FROM scores ORDER BY score DESC LIMIT 5"
    ).all();
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}, "onRequestGet");
var onRequestPost = /* @__PURE__ */ __name2(async (context) => {
  try {
    const { name, score } = await context.request.json();
    const db = context.env.DB;
    if (!db) return new Response(JSON.stringify({ error: "No Database" }), { status: 500 });
    await db.prepare(
      "INSERT INTO scores (name, score, date) VALUES (?, ?, ?)"
    ).bind(name, score, (/* @__PURE__ */ new Date()).toISOString()).run();
    const { results } = await db.prepare(
      "SELECT name, score FROM scores ORDER BY score DESC LIMIT 5"
    ).all();
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}, "onRequestPost");
// @__NO_SIDE_EFFECTS__
function makeMap$4(str) {
  const map = /* @__PURE__ */ Object.create(null);
  for (const key of str.split(",")) map[key] = 1;
  return (val) => val in map;
}
__name(makeMap$4, "makeMap$4");
__name2(makeMap$4, "makeMap$4");
var EMPTY_OBJ$1 = {};
var NOOP$3 = /* @__PURE__ */ __name2(() => {
}, "NOOP$3");
var extend$2 = Object.assign;
var remove$1 = /* @__PURE__ */ __name2((arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
}, "remove$1");
var hasOwnProperty$2 = Object.prototype.hasOwnProperty;
var hasOwn$1 = /* @__PURE__ */ __name2((val, key) => hasOwnProperty$2.call(val, key), "hasOwn$1");
var isArray$5 = Array.isArray;
var isMap$2 = /* @__PURE__ */ __name2((val) => toTypeString$3(val) === "[object Map]", "isMap$2");
var isSet$3 = /* @__PURE__ */ __name2((val) => toTypeString$3(val) === "[object Set]", "isSet$3");
var isFunction$4 = /* @__PURE__ */ __name2((val) => typeof val === "function", "isFunction$4");
var isString$4 = /* @__PURE__ */ __name2((val) => typeof val === "string", "isString$4");
var isSymbol$3 = /* @__PURE__ */ __name2((val) => typeof val === "symbol", "isSymbol$3");
var isObject$4 = /* @__PURE__ */ __name2((val) => val !== null && typeof val === "object", "isObject$4");
var objectToString$3 = Object.prototype.toString;
var toTypeString$3 = /* @__PURE__ */ __name2((value) => objectToString$3.call(value), "toTypeString$3");
var toRawType = /* @__PURE__ */ __name2((value) => {
  return toTypeString$3(value).slice(8, -1);
}, "toRawType");
var isPlainObject$2 = /* @__PURE__ */ __name2((val) => toTypeString$3(val) === "[object Object]", "isPlainObject$2");
var isIntegerKey = /* @__PURE__ */ __name2((key) => isString$4(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key, "isIntegerKey");
var hasChanged = /* @__PURE__ */ __name2((value, oldValue) => !Object.is(value, oldValue), "hasChanged");
var def$1 = /* @__PURE__ */ __name2((obj, key, value, writable = false) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value
  });
}, "def$1");
var activeEffectScope;
var EffectScope = class {
  static {
    __name(this, "EffectScope");
  }
  static {
    __name2(this, "EffectScope");
  }
  constructor(detached = false) {
    this.detached = detached;
    this._active = true;
    this._on = 0;
    this.effects = [];
    this.cleanups = [];
    this._isPaused = false;
    this.parent = activeEffectScope;
    if (!detached && activeEffectScope) {
      this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
        this
      ) - 1;
    }
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = true;
      let i, l;
      if (this.scopes) {
        for (i = 0, l = this.scopes.length; i < l; i++) {
          this.scopes[i].pause();
        }
      }
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].pause();
      }
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active) {
      if (this._isPaused) {
        this._isPaused = false;
        let i, l;
        if (this.scopes) {
          for (i = 0, l = this.scopes.length; i < l; i++) {
            this.scopes[i].resume();
          }
        }
        for (i = 0, l = this.effects.length; i < l; i++) {
          this.effects[i].resume();
        }
      }
    }
  }
  run(fn) {
    if (this._active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    if (++this._on === 1) {
      this.prevScope = activeEffectScope;
      activeEffectScope = this;
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      activeEffectScope = this.prevScope;
      this.prevScope = void 0;
    }
  }
  stop(fromParent) {
    if (this._active) {
      this._active = false;
      let i, l;
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].stop();
      }
      this.effects.length = 0;
      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]();
      }
      this.cleanups.length = 0;
      if (this.scopes) {
        for (i = 0, l = this.scopes.length; i < l; i++) {
          this.scopes[i].stop(true);
        }
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
    }
  }
};
function getCurrentScope() {
  return activeEffectScope;
}
__name(getCurrentScope, "getCurrentScope");
__name2(getCurrentScope, "getCurrentScope");
var activeSub;
var pausedQueueEffects = /* @__PURE__ */ new WeakSet();
var ReactiveEffect = class {
  static {
    __name(this, "ReactiveEffect");
  }
  static {
    __name2(this, "ReactiveEffect");
  }
  constructor(fn) {
    this.fn = fn;
    this.deps = void 0;
    this.depsTail = void 0;
    this.flags = 1 | 4;
    this.next = void 0;
    this.cleanup = void 0;
    this.scheduler = void 0;
    if (activeEffectScope && activeEffectScope.active) {
      activeEffectScope.effects.push(this);
    }
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    if (this.flags & 64) {
      this.flags &= -65;
      if (pausedQueueEffects.has(this)) {
        pausedQueueEffects.delete(this);
        this.trigger();
      }
    }
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags & 2 && !(this.flags & 32)) {
      return;
    }
    if (!(this.flags & 8)) {
      batch(this);
    }
  }
  run() {
    if (!(this.flags & 1)) {
      return this.fn();
    }
    this.flags |= 2;
    cleanupEffect(this);
    prepareDeps(this);
    const prevEffect = activeSub;
    const prevShouldTrack = shouldTrack;
    activeSub = this;
    shouldTrack = true;
    try {
      return this.fn();
    } finally {
      cleanupDeps(this);
      activeSub = prevEffect;
      shouldTrack = prevShouldTrack;
      this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let link = this.deps; link; link = link.nextDep) {
        removeSub(link);
      }
      this.deps = this.depsTail = void 0;
      cleanupEffect(this);
      this.onStop && this.onStop();
      this.flags &= -2;
    }
  }
  trigger() {
    if (this.flags & 64) {
      pausedQueueEffects.add(this);
    } else if (this.scheduler) {
      this.scheduler();
    } else {
      this.runIfDirty();
    }
  }
  /**
   * @internal
   */
  runIfDirty() {
    if (isDirty(this)) {
      this.run();
    }
  }
  get dirty() {
    return isDirty(this);
  }
};
var batchDepth = 0;
var batchedSub;
var batchedComputed;
function batch(sub, isComputed = false) {
  sub.flags |= 8;
  if (isComputed) {
    sub.next = batchedComputed;
    batchedComputed = sub;
    return;
  }
  sub.next = batchedSub;
  batchedSub = sub;
}
__name(batch, "batch");
__name2(batch, "batch");
function startBatch() {
  batchDepth++;
}
__name(startBatch, "startBatch");
__name2(startBatch, "startBatch");
function endBatch() {
  if (--batchDepth > 0) {
    return;
  }
  if (batchedComputed) {
    let e = batchedComputed;
    batchedComputed = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      e = next;
    }
  }
  let error;
  while (batchedSub) {
    let e = batchedSub;
    batchedSub = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      if (e.flags & 1) {
        try {
          ;
          e.trigger();
        } catch (err) {
          if (!error) error = err;
        }
      }
      e = next;
    }
  }
  if (error) throw error;
}
__name(endBatch, "endBatch");
__name2(endBatch, "endBatch");
function prepareDeps(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    link.version = -1;
    link.prevActiveLink = link.dep.activeLink;
    link.dep.activeLink = link;
  }
}
__name(prepareDeps, "prepareDeps");
__name2(prepareDeps, "prepareDeps");
function cleanupDeps(sub) {
  let head;
  let tail = sub.depsTail;
  let link = tail;
  while (link) {
    const prev = link.prevDep;
    if (link.version === -1) {
      if (link === tail) tail = prev;
      removeSub(link);
      removeDep(link);
    } else {
      head = link;
    }
    link.dep.activeLink = link.prevActiveLink;
    link.prevActiveLink = void 0;
    link = prev;
  }
  sub.deps = head;
  sub.depsTail = tail;
}
__name(cleanupDeps, "cleanupDeps");
__name2(cleanupDeps, "cleanupDeps");
function isDirty(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) {
      return true;
    }
  }
  if (sub._dirty) {
    return true;
  }
  return false;
}
__name(isDirty, "isDirty");
__name2(isDirty, "isDirty");
function refreshComputed(computed2) {
  if (computed2.flags & 4 && !(computed2.flags & 16)) {
    return;
  }
  computed2.flags &= -17;
  if (computed2.globalVersion === globalVersion) {
    return;
  }
  computed2.globalVersion = globalVersion;
  if (!computed2.isSSR && computed2.flags & 128 && (!computed2.deps && !computed2._dirty || !isDirty(computed2))) {
    return;
  }
  computed2.flags |= 2;
  const dep = computed2.dep;
  const prevSub = activeSub;
  const prevShouldTrack = shouldTrack;
  activeSub = computed2;
  shouldTrack = true;
  try {
    prepareDeps(computed2);
    const value = computed2.fn(computed2._value);
    if (dep.version === 0 || hasChanged(value, computed2._value)) {
      computed2.flags |= 128;
      computed2._value = value;
      dep.version++;
    }
  } catch (err) {
    dep.version++;
    throw err;
  } finally {
    activeSub = prevSub;
    shouldTrack = prevShouldTrack;
    cleanupDeps(computed2);
    computed2.flags &= -3;
  }
}
__name(refreshComputed, "refreshComputed");
__name2(refreshComputed, "refreshComputed");
function removeSub(link, soft = false) {
  const { dep, prevSub, nextSub } = link;
  if (prevSub) {
    prevSub.nextSub = nextSub;
    link.prevSub = void 0;
  }
  if (nextSub) {
    nextSub.prevSub = prevSub;
    link.nextSub = void 0;
  }
  if (dep.subs === link) {
    dep.subs = prevSub;
    if (!prevSub && dep.computed) {
      dep.computed.flags &= -5;
      for (let l = dep.computed.deps; l; l = l.nextDep) {
        removeSub(l, true);
      }
    }
  }
  if (!soft && !--dep.sc && dep.map) {
    dep.map.delete(dep.key);
  }
}
__name(removeSub, "removeSub");
__name2(removeSub, "removeSub");
function removeDep(link) {
  const { prevDep, nextDep } = link;
  if (prevDep) {
    prevDep.nextDep = nextDep;
    link.prevDep = void 0;
  }
  if (nextDep) {
    nextDep.prevDep = prevDep;
    link.nextDep = void 0;
  }
}
__name(removeDep, "removeDep");
__name2(removeDep, "removeDep");
var shouldTrack = true;
var trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
__name(pauseTracking, "pauseTracking");
__name2(pauseTracking, "pauseTracking");
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
__name(resetTracking, "resetTracking");
__name2(resetTracking, "resetTracking");
function cleanupEffect(e) {
  const { cleanup } = e;
  e.cleanup = void 0;
  if (cleanup) {
    const prevSub = activeSub;
    activeSub = void 0;
    try {
      cleanup();
    } finally {
      activeSub = prevSub;
    }
  }
}
__name(cleanupEffect, "cleanupEffect");
__name2(cleanupEffect, "cleanupEffect");
var globalVersion = 0;
var Link = class {
  static {
    __name(this, "Link");
  }
  static {
    __name2(this, "Link");
  }
  constructor(sub, dep) {
    this.sub = sub;
    this.dep = dep;
    this.version = dep.version;
    this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
};
var Dep = class {
  static {
    __name(this, "Dep");
  }
  static {
    __name2(this, "Dep");
  }
  // TODO isolatedDeclarations "__v_skip"
  constructor(computed2) {
    this.computed = computed2;
    this.version = 0;
    this.activeLink = void 0;
    this.subs = void 0;
    this.map = void 0;
    this.key = void 0;
    this.sc = 0;
    this.__v_skip = true;
  }
  track(debugInfo) {
    if (!activeSub || !shouldTrack || activeSub === this.computed) {
      return;
    }
    let link = this.activeLink;
    if (link === void 0 || link.sub !== activeSub) {
      link = this.activeLink = new Link(activeSub, this);
      if (!activeSub.deps) {
        activeSub.deps = activeSub.depsTail = link;
      } else {
        link.prevDep = activeSub.depsTail;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
      }
      addSub(link);
    } else if (link.version === -1) {
      link.version = this.version;
      if (link.nextDep) {
        const next = link.nextDep;
        next.prevDep = link.prevDep;
        if (link.prevDep) {
          link.prevDep.nextDep = next;
        }
        link.prevDep = activeSub.depsTail;
        link.nextDep = void 0;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
        if (activeSub.deps === link) {
          activeSub.deps = next;
        }
      }
    }
    return link;
  }
  trigger(debugInfo) {
    this.version++;
    globalVersion++;
    this.notify(debugInfo);
  }
  notify(debugInfo) {
    startBatch();
    try {
      if (false) ;
      for (let link = this.subs; link; link = link.prevSub) {
        if (link.sub.notify()) {
          ;
          link.sub.dep.notify();
        }
      }
    } finally {
      endBatch();
    }
  }
};
function addSub(link) {
  link.dep.sc++;
  if (link.sub.flags & 4) {
    const computed2 = link.dep.computed;
    if (computed2 && !link.dep.subs) {
      computed2.flags |= 4 | 16;
      for (let l = computed2.deps; l; l = l.nextDep) {
        addSub(l);
      }
    }
    const currentTail = link.dep.subs;
    if (currentTail !== link) {
      link.prevSub = currentTail;
      if (currentTail) currentTail.nextSub = link;
    }
    link.dep.subs = link;
  }
}
__name(addSub, "addSub");
__name2(addSub, "addSub");
var targetMap = /* @__PURE__ */ new WeakMap();
var ITERATE_KEY = Symbol(
  ""
);
var MAP_KEY_ITERATE_KEY = Symbol(
  ""
);
var ARRAY_ITERATE_KEY = Symbol(
  ""
);
function track(target, type, key) {
  if (shouldTrack && activeSub) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = new Dep());
      dep.map = depsMap;
      dep.key = key;
    }
    {
      dep.track();
    }
  }
}
__name(track, "track");
__name2(track, "track");
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    globalVersion++;
    return;
  }
  const run = /* @__PURE__ */ __name2((dep) => {
    if (dep) {
      {
        dep.trigger();
      }
    }
  }, "run");
  startBatch();
  if (type === "clear") {
    depsMap.forEach(run);
  } else {
    const targetIsArray = isArray$5(target);
    const isArrayIndex = targetIsArray && isIntegerKey(key);
    if (targetIsArray && key === "length") {
      const newLength = Number(newValue);
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol$3(key2) && key2 >= newLength) {
          run(dep);
        }
      });
    } else {
      if (key !== void 0 || depsMap.has(void 0)) {
        run(depsMap.get(key));
      }
      if (isArrayIndex) {
        run(depsMap.get(ARRAY_ITERATE_KEY));
      }
      switch (type) {
        case "add":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap$2(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isArrayIndex) {
            run(depsMap.get("length"));
          }
          break;
        case "delete":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap$2(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case "set":
          if (isMap$2(target)) {
            run(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
  }
  endBatch();
}
__name(trigger, "trigger");
__name2(trigger, "trigger");
function reactiveReadArray(array) {
  const raw = toRaw(array);
  if (raw === array) return raw;
  track(raw, "iterate", ARRAY_ITERATE_KEY);
  return isShallow(array) ? raw : raw.map(toReactive);
}
__name(reactiveReadArray, "reactiveReadArray");
__name2(reactiveReadArray, "reactiveReadArray");
function shallowReadArray(arr) {
  track(arr = toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
  return arr;
}
__name(shallowReadArray, "shallowReadArray");
__name2(shallowReadArray, "shallowReadArray");
function toWrapped(target, item) {
  if (isReadonly(target)) {
    return isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
  }
  return toReactive(item);
}
__name(toWrapped, "toWrapped");
__name2(toWrapped, "toWrapped");
var arrayInstrumentations = {
  __proto__: null,
  [Symbol.iterator]() {
    return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
  },
  concat(...args) {
    return reactiveReadArray(this).concat(
      ...args.map((x) => isArray$5(x) ? reactiveReadArray(x) : x)
    );
  },
  entries() {
    return iterator(this, "entries", (value) => {
      value[1] = toWrapped(this, value[1]);
      return value;
    });
  },
  every(fn, thisArg) {
    return apply(this, "every", fn, thisArg, void 0, arguments);
  },
  filter(fn, thisArg) {
    return apply(
      this,
      "filter",
      fn,
      thisArg,
      (v) => v.map((item) => toWrapped(this, item)),
      arguments
    );
  },
  find(fn, thisArg) {
    return apply(
      this,
      "find",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findIndex(fn, thisArg) {
    return apply(this, "findIndex", fn, thisArg, void 0, arguments);
  },
  findLast(fn, thisArg) {
    return apply(
      this,
      "findLast",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findLastIndex(fn, thisArg) {
    return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(fn, thisArg) {
    return apply(this, "forEach", fn, thisArg, void 0, arguments);
  },
  includes(...args) {
    return searchProxy(this, "includes", args);
  },
  indexOf(...args) {
    return searchProxy(this, "indexOf", args);
  },
  join(separator) {
    return reactiveReadArray(this).join(separator);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...args) {
    return searchProxy(this, "lastIndexOf", args);
  },
  map(fn, thisArg) {
    return apply(this, "map", fn, thisArg, void 0, arguments);
  },
  pop() {
    return noTracking(this, "pop");
  },
  push(...args) {
    return noTracking(this, "push", args);
  },
  reduce(fn, ...args) {
    return reduce(this, "reduce", fn, args);
  },
  reduceRight(fn, ...args) {
    return reduce(this, "reduceRight", fn, args);
  },
  shift() {
    return noTracking(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(fn, thisArg) {
    return apply(this, "some", fn, thisArg, void 0, arguments);
  },
  splice(...args) {
    return noTracking(this, "splice", args);
  },
  toReversed() {
    return reactiveReadArray(this).toReversed();
  },
  toSorted(comparer) {
    return reactiveReadArray(this).toSorted(comparer);
  },
  toSpliced(...args) {
    return reactiveReadArray(this).toSpliced(...args);
  },
  unshift(...args) {
    return noTracking(this, "unshift", args);
  },
  values() {
    return iterator(this, "values", (item) => toWrapped(this, item));
  }
};
function iterator(self2, method, wrapValue) {
  const arr = shallowReadArray(self2);
  const iter = arr[method]();
  if (arr !== self2 && !isShallow(self2)) {
    iter._next = iter.next;
    iter.next = () => {
      const result = iter._next();
      if (!result.done) {
        result.value = wrapValue(result.value);
      }
      return result;
    };
  }
  return iter;
}
__name(iterator, "iterator");
__name2(iterator, "iterator");
var arrayProto = Array.prototype;
function apply(self2, method, fn, thisArg, wrappedRetFn, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !isShallow(self2);
  const methodFn = arr[method];
  if (methodFn !== arrayProto[method]) {
    const result2 = methodFn.apply(self2, args);
    return needsWrap ? toReactive(result2) : result2;
  }
  let wrappedFn = fn;
  if (arr !== self2) {
    if (needsWrap) {
      wrappedFn = /* @__PURE__ */ __name2(function(item, index) {
        return fn.call(this, toWrapped(self2, item), index, self2);
      }, "wrappedFn");
    } else if (fn.length > 2) {
      wrappedFn = /* @__PURE__ */ __name2(function(item, index) {
        return fn.call(this, item, index, self2);
      }, "wrappedFn");
    }
  }
  const result = methodFn.call(arr, wrappedFn, thisArg);
  return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
}
__name(apply, "apply");
__name2(apply, "apply");
function reduce(self2, method, fn, args) {
  const arr = shallowReadArray(self2);
  let wrappedFn = fn;
  if (arr !== self2) {
    if (!isShallow(self2)) {
      wrappedFn = /* @__PURE__ */ __name2(function(acc, item, index) {
        return fn.call(this, acc, toWrapped(self2, item), index, self2);
      }, "wrappedFn");
    } else if (fn.length > 3) {
      wrappedFn = /* @__PURE__ */ __name2(function(acc, item, index) {
        return fn.call(this, acc, item, index, self2);
      }, "wrappedFn");
    }
  }
  return arr[method](wrappedFn, ...args);
}
__name(reduce, "reduce");
__name2(reduce, "reduce");
function searchProxy(self2, method, args) {
  const arr = toRaw(self2);
  track(arr, "iterate", ARRAY_ITERATE_KEY);
  const res = arr[method](...args);
  if ((res === -1 || res === false) && isProxy(args[0])) {
    args[0] = toRaw(args[0]);
    return arr[method](...args);
  }
  return res;
}
__name(searchProxy, "searchProxy");
__name2(searchProxy, "searchProxy");
function noTracking(self2, method, args = []) {
  pauseTracking();
  startBatch();
  const res = toRaw(self2)[method].apply(self2, args);
  endBatch();
  resetTracking();
  return res;
}
__name(noTracking, "noTracking");
__name2(noTracking, "noTracking");
var isNonTrackableKeys = /* @__PURE__ */ makeMap$4(`__proto__,__v_isRef,__isVue`);
var builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol$3)
);
function hasOwnProperty$1(key) {
  if (!isSymbol$3(key)) key = String(key);
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
__name(hasOwnProperty$1, "hasOwnProperty$1");
__name2(hasOwnProperty$1, "hasOwnProperty$1");
var BaseReactiveHandler = class {
  static {
    __name(this, "BaseReactiveHandler");
  }
  static {
    __name2(this, "BaseReactiveHandler");
  }
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    if (key === "__v_skip") return target["__v_skip"];
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray$5(target);
    if (!isReadonly2) {
      let fn;
      if (targetIsArray && (fn = arrayInstrumentations[key])) {
        return fn;
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty$1;
      }
    }
    const res = Reflect.get(
      target,
      key,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      isRef$2(target) ? target : receiver
    );
    if (isSymbol$3(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (isRef$2(res)) {
      const value = targetIsArray && isIntegerKey(key) ? res : res.value;
      return isReadonly2 && isObject$4(value) ? readonly(value) : value;
    }
    if (isObject$4(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  }
};
var MutableReactiveHandler = class extends BaseReactiveHandler {
  static {
    __name(this, "MutableReactiveHandler");
  }
  static {
    __name2(this, "MutableReactiveHandler");
  }
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const isArrayWithIntegerKey = isArray$5(target) && isIntegerKey(key);
    if (!this._isShallow) {
      const isOldValueReadonly = isReadonly(oldValue);
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArrayWithIntegerKey && isRef$2(oldValue) && !isRef$2(value)) {
        if (isOldValueReadonly) {
          return true;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn$1(target, key);
    const result = Reflect.set(
      target,
      key,
      value,
      isRef$2(target) ? target : receiver
    );
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn$1(target, key);
    target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol$3(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray$5(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
};
var ReadonlyReactiveHandler = class extends BaseReactiveHandler {
  static {
    __name(this, "ReadonlyReactiveHandler");
  }
  static {
    __name2(this, "ReadonlyReactiveHandler");
  }
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    return true;
  }
  deleteProperty(target, key) {
    return true;
  }
};
var mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
var readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
var shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(true);
var toShallow = /* @__PURE__ */ __name2((value) => value, "toShallow");
var getProto = /* @__PURE__ */ __name2((v) => Reflect.getPrototypeOf(v), "getProto");
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap$2(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return {
      // iterator protocol
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
__name(createIterableMethod, "createIterableMethod");
__name2(createIterableMethod, "createIterableMethod");
function createReadonlyMethod(type) {
  return function(...args) {
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
__name(createReadonlyMethod, "createReadonlyMethod");
__name2(createReadonlyMethod, "createReadonlyMethod");
function createInstrumentations(readonly2, shallow) {
  const instrumentations = {
    get(key) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "get", key);
        }
        track(rawTarget, "get", rawKey);
      }
      const { has } = getProto(rawTarget);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      if (has.call(rawTarget, key)) {
        return wrap(target.get(key));
      } else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
      } else if (target !== rawTarget) {
        target.get(key);
      }
    },
    get size() {
      const target = this["__v_raw"];
      !readonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
      return target.size;
    },
    has(key) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "has", key);
        }
        track(rawTarget, "has", rawKey);
      }
      return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
    },
    forEach(callback, thisArg) {
      const observed = this;
      const target = observed["__v_raw"];
      const rawTarget = toRaw(target);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      !readonly2 && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    }
  };
  extend$2(
    instrumentations,
    readonly2 ? {
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear")
    } : {
      add(value) {
        if (!shallow && !isShallow(value) && !isReadonly(value)) {
          value = toRaw(value);
        }
        const target = toRaw(this);
        const proto = getProto(target);
        const hadKey = proto.has.call(target, value);
        if (!hadKey) {
          target.add(value);
          trigger(target, "add", value, value);
        }
        return this;
      },
      set(key, value) {
        if (!shallow && !isShallow(value) && !isReadonly(value)) {
          value = toRaw(value);
        }
        const target = toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = toRaw(key);
          hadKey = has.call(target, key);
        }
        const oldValue = get.call(target, key);
        target.set(key, value);
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value);
        }
        return this;
      },
      delete(key) {
        const target = toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = toRaw(key);
          hadKey = has.call(target, key);
        }
        get ? get.call(target, key) : void 0;
        const result = target.delete(key);
        if (hadKey) {
          trigger(target, "delete", key, void 0);
        }
        return result;
      },
      clear() {
        const target = toRaw(this);
        const hadItems = target.size !== 0;
        const result = target.clear();
        if (hadItems) {
          trigger(
            target,
            "clear",
            void 0,
            void 0
          );
        }
        return result;
      }
    }
  );
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    instrumentations[method] = createIterableMethod(method, readonly2, shallow);
  });
  return instrumentations;
}
__name(createInstrumentations, "createInstrumentations");
__name2(createInstrumentations, "createInstrumentations");
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = createInstrumentations(isReadonly2, shallow);
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn$1(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
__name(createInstrumentationGetter, "createInstrumentationGetter");
__name2(createInstrumentationGetter, "createInstrumentationGetter");
var mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
var shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
var readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
var reactiveMap = /* @__PURE__ */ new WeakMap();
var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
var readonlyMap = /* @__PURE__ */ new WeakMap();
var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
__name(targetTypeMap, "targetTypeMap");
__name2(targetTypeMap, "targetTypeMap");
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
__name(getTargetType, "getTargetType");
__name2(getTargetType, "getTargetType");
function reactive(target) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
__name(reactive, "reactive");
__name2(reactive, "reactive");
function shallowReactive(target) {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  );
}
__name(shallowReactive, "shallowReactive");
__name2(shallowReactive, "shallowReactive");
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
__name(readonly, "readonly");
__name2(readonly, "readonly");
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject$4(target)) {
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
__name(createReactiveObject, "createReactiveObject");
__name2(createReactiveObject, "createReactiveObject");
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
__name(isReactive, "isReactive");
__name2(isReactive, "isReactive");
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
__name(isReadonly, "isReadonly");
__name2(isReadonly, "isReadonly");
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
__name(isShallow, "isShallow");
__name2(isShallow, "isShallow");
function isProxy(value) {
  return value ? !!value["__v_raw"] : false;
}
__name(isProxy, "isProxy");
__name2(isProxy, "isProxy");
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? toRaw(raw) : observed;
}
__name(toRaw, "toRaw");
__name2(toRaw, "toRaw");
function markRaw(value) {
  if (!hasOwn$1(value, "__v_skip") && Object.isExtensible(value)) {
    def$1(value, "__v_skip", true);
  }
  return value;
}
__name(markRaw, "markRaw");
__name2(markRaw, "markRaw");
var toReactive = /* @__PURE__ */ __name2((value) => isObject$4(value) ? reactive(value) : value, "toReactive");
var toReadonly = /* @__PURE__ */ __name2((value) => isObject$4(value) ? readonly(value) : value, "toReadonly");
function isRef$2(r) {
  return r ? r["__v_isRef"] === true : false;
}
__name(isRef$2, "isRef$2");
__name2(isRef$2, "isRef$2");
function ref(value) {
  return createRef(value, false);
}
__name(ref, "ref");
__name2(ref, "ref");
function shallowRef(value) {
  return createRef(value, true);
}
__name(shallowRef, "shallowRef");
__name2(shallowRef, "shallowRef");
function createRef(rawValue, shallow) {
  if (isRef$2(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
__name(createRef, "createRef");
__name2(createRef, "createRef");
var RefImpl = class {
  static {
    __name(this, "RefImpl");
  }
  static {
    __name2(this, "RefImpl");
  }
  constructor(value, isShallow2) {
    this.dep = new Dep();
    this["__v_isRef"] = true;
    this["__v_isShallow"] = false;
    this._rawValue = isShallow2 ? value : toRaw(value);
    this._value = isShallow2 ? value : toReactive(value);
    this["__v_isShallow"] = isShallow2;
  }
  get value() {
    {
      this.dep.track();
    }
    return this._value;
  }
  set value(newValue) {
    const oldValue = this._rawValue;
    const useDirectValue = this["__v_isShallow"] || isShallow(newValue) || isReadonly(newValue);
    newValue = useDirectValue ? newValue : toRaw(newValue);
    if (hasChanged(newValue, oldValue)) {
      this._rawValue = newValue;
      this._value = useDirectValue ? newValue : toReactive(newValue);
      {
        this.dep.trigger();
      }
    }
  }
};
function unref(ref2) {
  return isRef$2(ref2) ? ref2.value : ref2;
}
__name(unref, "unref");
__name2(unref, "unref");
var shallowUnwrapHandlers = {
  get: /* @__PURE__ */ __name2((target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)), "get"),
  set: /* @__PURE__ */ __name2((target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef$2(oldValue) && !isRef$2(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }, "set")
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
__name(proxyRefs, "proxyRefs");
__name2(proxyRefs, "proxyRefs");
var ComputedRefImpl = class {
  static {
    __name(this, "ComputedRefImpl");
  }
  static {
    __name2(this, "ComputedRefImpl");
  }
  constructor(fn, setter, isSSR) {
    this.fn = fn;
    this.setter = setter;
    this._value = void 0;
    this.dep = new Dep(this);
    this.__v_isRef = true;
    this.deps = void 0;
    this.depsTail = void 0;
    this.flags = 16;
    this.globalVersion = globalVersion - 1;
    this.next = void 0;
    this.effect = this;
    this["__v_isReadonly"] = !setter;
    this.isSSR = isSSR;
  }
  /**
   * @internal
   */
  notify() {
    this.flags |= 16;
    if (!(this.flags & 8) && // avoid infinite self recursion
    activeSub !== this) {
      batch(this, true);
      return true;
    }
  }
  get value() {
    const link = this.dep.track();
    refreshComputed(this);
    if (link) {
      link.version = this.dep.version;
    }
    return this._value;
  }
  set value(newValue) {
    if (this.setter) {
      this.setter(newValue);
    }
  }
};
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  if (isFunction$4(getterOrOptions)) {
    getter = getterOrOptions;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, isSSR);
  return cRef;
}
__name(computed$1, "computed$1");
__name2(computed$1, "computed$1");
var INITIAL_WATCHER_VALUE = {};
var cleanupMap = /* @__PURE__ */ new WeakMap();
var activeWatcher = void 0;
function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
  if (owner) {
    let cleanups = cleanupMap.get(owner);
    if (!cleanups) cleanupMap.set(owner, cleanups = []);
    cleanups.push(cleanupFn);
  }
}
__name(onWatcherCleanup, "onWatcherCleanup");
__name2(onWatcherCleanup, "onWatcherCleanup");
function watch$1(source, cb, options = EMPTY_OBJ$1) {
  const { immediate, deep, once, scheduler, augmentJob, call } = options;
  const reactiveGetter = /* @__PURE__ */ __name2((source2) => {
    if (deep) return source2;
    if (isShallow(source2) || deep === false || deep === 0)
      return traverse(source2, 1);
    return traverse(source2);
  }, "reactiveGetter");
  let effect2;
  let getter;
  let cleanup;
  let boundCleanup;
  let forceTrigger = false;
  let isMultiSource = false;
  if (isRef$2(source)) {
    getter = /* @__PURE__ */ __name2(() => source.value, "getter");
    forceTrigger = isShallow(source);
  } else if (isReactive(source)) {
    getter = /* @__PURE__ */ __name2(() => reactiveGetter(source), "getter");
    forceTrigger = true;
  } else if (isArray$5(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
    getter = /* @__PURE__ */ __name2(() => source.map((s) => {
      if (isRef$2(s)) {
        return s.value;
      } else if (isReactive(s)) {
        return reactiveGetter(s);
      } else if (isFunction$4(s)) {
        return call ? call(s, 2) : s();
      } else ;
    }), "getter");
  } else if (isFunction$4(source)) {
    if (cb) {
      getter = call ? () => call(source, 2) : source;
    } else {
      getter = /* @__PURE__ */ __name2(() => {
        if (cleanup) {
          pauseTracking();
          try {
            cleanup();
          } finally {
            resetTracking();
          }
        }
        const currentEffect = activeWatcher;
        activeWatcher = effect2;
        try {
          return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
        } finally {
          activeWatcher = currentEffect;
        }
      }, "getter");
    }
  } else {
    getter = NOOP$3;
  }
  if (cb && deep) {
    const baseGetter = getter;
    const depth = deep === true ? Infinity : deep;
    getter = /* @__PURE__ */ __name2(() => traverse(baseGetter(), depth), "getter");
  }
  const scope = getCurrentScope();
  const watchHandle = /* @__PURE__ */ __name2(() => {
    effect2.stop();
    if (scope && scope.active) {
      remove$1(scope.effects, effect2);
    }
  }, "watchHandle");
  if (once && cb) {
    const _cb = cb;
    cb = /* @__PURE__ */ __name2((...args) => {
      _cb(...args);
      watchHandle();
    }, "cb");
  }
  let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
  const job = /* @__PURE__ */ __name2((immediateFirstRun) => {
    if (!(effect2.flags & 1) || !effect2.dirty && !immediateFirstRun) {
      return;
    }
    if (cb) {
      const newValue = effect2.run();
      if (deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
        if (cleanup) {
          cleanup();
        }
        const currentWatcher = activeWatcher;
        activeWatcher = effect2;
        try {
          const args = [
            newValue,
            // pass undefined as the old value when it's changed for the first time
            oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
            boundCleanup
          ];
          oldValue = newValue;
          call ? call(cb, 3, args) : (
            // @ts-expect-error
            cb(...args)
          );
        } finally {
          activeWatcher = currentWatcher;
        }
      }
    } else {
      effect2.run();
    }
  }, "job");
  if (augmentJob) {
    augmentJob(job);
  }
  effect2 = new ReactiveEffect(getter);
  effect2.scheduler = scheduler ? () => scheduler(job, false) : job;
  boundCleanup = /* @__PURE__ */ __name2((fn) => onWatcherCleanup(fn, false, effect2), "boundCleanup");
  cleanup = effect2.onStop = () => {
    const cleanups = cleanupMap.get(effect2);
    if (cleanups) {
      if (call) {
        call(cleanups, 4);
      } else {
        for (const cleanup2 of cleanups) cleanup2();
      }
      cleanupMap.delete(effect2);
    }
  };
  if (cb) {
    if (immediate) {
      job(true);
    } else {
      oldValue = effect2.run();
    }
  } else if (scheduler) {
    scheduler(job.bind(null, true), true);
  } else {
    effect2.run();
  }
  watchHandle.pause = effect2.pause.bind(effect2);
  watchHandle.resume = effect2.resume.bind(effect2);
  watchHandle.stop = watchHandle;
  return watchHandle;
}
__name(watch$1, "watch$1");
__name2(watch$1, "watch$1");
function traverse(value, depth = Infinity, seen) {
  if (depth <= 0 || !isObject$4(value) || value["__v_skip"]) {
    return value;
  }
  seen = seen || /* @__PURE__ */ new Map();
  if ((seen.get(value) || 0) >= depth) {
    return value;
  }
  seen.set(value, depth);
  depth--;
  if (isRef$2(value)) {
    traverse(value.value, depth, seen);
  } else if (isArray$5(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], depth, seen);
    }
  } else if (isSet$3(value) || isMap$2(value)) {
    value.forEach((v) => {
      traverse(v, depth, seen);
    });
  } else if (isPlainObject$2(value)) {
    for (const key in value) {
      traverse(value[key], depth, seen);
    }
    for (const key of Object.getOwnPropertySymbols(value)) {
      if (Object.prototype.propertyIsEnumerable.call(value, key)) {
        traverse(value[key], depth, seen);
      }
    }
  }
  return value;
}
__name(traverse, "traverse");
__name2(traverse, "traverse");
// @__NO_SIDE_EFFECTS__
function makeMap$3(str) {
  const map = /* @__PURE__ */ Object.create(null);
  for (const key of str.split(",")) map[key] = 1;
  return (val) => val in map;
}
__name(makeMap$3, "makeMap$3");
__name2(makeMap$3, "makeMap$3");
var EMPTY_OBJ = {};
var EMPTY_ARR = [];
var NOOP$2 = /* @__PURE__ */ __name2(() => {
}, "NOOP$2");
var NO = /* @__PURE__ */ __name2(() => false, "NO");
var isOn$3 = /* @__PURE__ */ __name2((key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
(key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97), "isOn$3");
var isModelListener$1 = /* @__PURE__ */ __name2((key) => key.startsWith("onUpdate:"), "isModelListener$1");
var extend$1 = Object.assign;
var remove = /* @__PURE__ */ __name2((arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
}, "remove");
var hasOwnProperty = Object.prototype.hasOwnProperty;
var hasOwn = /* @__PURE__ */ __name2((val, key) => hasOwnProperty.call(val, key), "hasOwn");
var isArray$4 = Array.isArray;
var isMap$1 = /* @__PURE__ */ __name2((val) => toTypeString$2(val) === "[object Map]", "isMap$1");
var isSet$2 = /* @__PURE__ */ __name2((val) => toTypeString$2(val) === "[object Set]", "isSet$2");
var isFunction$3 = /* @__PURE__ */ __name2((val) => typeof val === "function", "isFunction$3");
var isString$3 = /* @__PURE__ */ __name2((val) => typeof val === "string", "isString$3");
var isSymbol$2 = /* @__PURE__ */ __name2((val) => typeof val === "symbol", "isSymbol$2");
var isObject$3 = /* @__PURE__ */ __name2((val) => val !== null && typeof val === "object", "isObject$3");
var isPromise$2 = /* @__PURE__ */ __name2((val) => {
  return (isObject$3(val) || isFunction$3(val)) && isFunction$3(val.then) && isFunction$3(val.catch);
}, "isPromise$2");
var objectToString$2 = Object.prototype.toString;
var toTypeString$2 = /* @__PURE__ */ __name2((value) => objectToString$2.call(value), "toTypeString$2");
var isPlainObject$1 = /* @__PURE__ */ __name2((val) => toTypeString$2(val) === "[object Object]", "isPlainObject$1");
var isReservedProp = /* @__PURE__ */ makeMap$3(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
var cacheStringFunction$3 = /* @__PURE__ */ __name2((fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return ((str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  });
}, "cacheStringFunction$3");
var camelizeRE$1 = /-\w/g;
var camelize$1 = cacheStringFunction$3(
  (str) => {
    return str.replace(camelizeRE$1, (c) => c.slice(1).toUpperCase());
  }
);
var hyphenateRE$3 = /\B([A-Z])/g;
var hyphenate$3 = cacheStringFunction$3(
  (str) => str.replace(hyphenateRE$3, "-$1").toLowerCase()
);
var capitalize$1 = cacheStringFunction$3((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
var toHandlerKey = cacheStringFunction$3(
  (str) => {
    const s = str ? `on${capitalize$1(str)}` : ``;
    return s;
  }
);
var invokeArrayFns = /* @__PURE__ */ __name2((fns, ...arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](...arg);
  }
}, "invokeArrayFns");
var def = /* @__PURE__ */ __name2((obj, key, value, writable = false) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value
  });
}, "def");
var looseToNumber = /* @__PURE__ */ __name2((val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
}, "looseToNumber");
var _globalThis$2;
var getGlobalThis$2 = /* @__PURE__ */ __name2(() => {
  return _globalThis$2 || (_globalThis$2 = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
}, "getGlobalThis$2");
function normalizeStyle$2(value) {
  if (isArray$4(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString$3(item) ? parseStringStyle$2(item) : normalizeStyle$2(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString$3(value) || isObject$3(value)) {
    return value;
  }
}
__name(normalizeStyle$2, "normalizeStyle$2");
__name2(normalizeStyle$2, "normalizeStyle$2");
var listDelimiterRE$2 = /;(?![^(]*\))/g;
var propertyDelimiterRE$2 = /:([^]+)/;
var styleCommentRE$2 = /\/\*[^]*?\*\//g;
function parseStringStyle$2(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE$2, "").split(listDelimiterRE$2).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE$2);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
__name(parseStringStyle$2, "parseStringStyle$2");
__name2(parseStringStyle$2, "parseStringStyle$2");
function normalizeClass$2(value) {
  let res = "";
  if (isString$3(value)) {
    res = value;
  } else if (isArray$4(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass$2(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject$3(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
__name(normalizeClass$2, "normalizeClass$2");
__name2(normalizeClass$2, "normalizeClass$2");
var isRef$1 = /* @__PURE__ */ __name2((val) => {
  return !!(val && val["__v_isRef"] === true);
}, "isRef$1");
var toDisplayString$1 = /* @__PURE__ */ __name2((val) => {
  return isString$3(val) ? val : val == null ? "" : isArray$4(val) || isObject$3(val) && (val.toString === objectToString$2 || !isFunction$3(val.toString)) ? isRef$1(val) ? toDisplayString$1(val.value) : JSON.stringify(val, replacer$1, 2) : String(val);
}, "toDisplayString$1");
var replacer$1 = /* @__PURE__ */ __name2((_key, val) => {
  if (isRef$1(val)) {
    return replacer$1(_key, val.value);
  } else if (isMap$1(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce(
        (entries, [key, val2], i) => {
          entries[stringifySymbol$1(key, i) + " =>"] = val2;
          return entries;
        },
        {}
      )
    };
  } else if (isSet$2(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol$1(v))
    };
  } else if (isSymbol$2(val)) {
    return stringifySymbol$1(val);
  } else if (isObject$3(val) && !isArray$4(val) && !isPlainObject$1(val)) {
    return String(val);
  }
  return val;
}, "replacer$1");
var stringifySymbol$1 = /* @__PURE__ */ __name2((v, i = "") => {
  var _a;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    isSymbol$2(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v
  );
}, "stringifySymbol$1");
function callWithErrorHandling(fn, instance, type, args) {
  try {
    return args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
}
__name(callWithErrorHandling, "callWithErrorHandling");
__name2(callWithErrorHandling, "callWithErrorHandling");
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction$3(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise$2(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  if (isArray$4(fn)) {
    const values = [];
    for (let i = 0; i < fn.length; i++) {
      values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }
    return values;
  }
}
__name(callWithAsyncErrorHandling, "callWithAsyncErrorHandling");
__name2(callWithAsyncErrorHandling, "callWithAsyncErrorHandling");
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = `https://vuejs.org/error-reference/#runtime-${type}`;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    if (errorHandler) {
      pauseTracking();
      callWithErrorHandling(errorHandler, null, 10, [
        err,
        exposedInstance,
        errorInfo
      ]);
      resetTracking();
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
}
__name(handleError, "handleError");
__name2(handleError, "handleError");
function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
  if (throwInProd) {
    throw err;
  } else {
    console.error(err);
  }
}
__name(logError, "logError");
__name2(logError, "logError");
var queue = [];
var flushIndex = -1;
var pendingPostFlushCbs = [];
var activePostFlushCbs = null;
var postFlushIndex = 0;
var resolvedPromise = /* @__PURE__ */ Promise.resolve();
var currentFlushPromise = null;
function nextTick(fn) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
}
__name(nextTick, "nextTick");
__name2(nextTick, "nextTick");
function findInsertionIndex$1(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJob = queue[middle];
    const middleJobId = getId(middleJob);
    if (middleJobId < id || middleJobId === id && middleJob.flags & 2) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return start;
}
__name(findInsertionIndex$1, "findInsertionIndex$1");
__name2(findInsertionIndex$1, "findInsertionIndex$1");
function queueJob(job) {
  if (!(job.flags & 1)) {
    const jobId = getId(job);
    const lastJob = queue[queue.length - 1];
    if (!lastJob || // fast path when the job id is larger than the tail
    !(job.flags & 2) && jobId >= getId(lastJob)) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex$1(jobId), 0, job);
    }
    job.flags |= 1;
    queueFlush();
  }
}
__name(queueJob, "queueJob");
__name2(queueJob, "queueJob");
function queueFlush() {
  if (!currentFlushPromise) {
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
__name(queueFlush, "queueFlush");
__name2(queueFlush, "queueFlush");
function queuePostFlushCb(cb) {
  if (!isArray$4(cb)) {
    if (activePostFlushCbs && cb.id === -1) {
      activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
    } else if (!(cb.flags & 1)) {
      pendingPostFlushCbs.push(cb);
      cb.flags |= 1;
    }
  } else {
    pendingPostFlushCbs.push(...cb);
  }
  queueFlush();
}
__name(queuePostFlushCb, "queuePostFlushCb");
__name2(queuePostFlushCb, "queuePostFlushCb");
function flushPreFlushCbs(instance, seen, i = flushIndex + 1) {
  for (; i < queue.length; i++) {
    const cb = queue[i];
    if (cb && cb.flags & 2) {
      if (instance && cb.id !== instance.uid) {
        continue;
      }
      queue.splice(i, 1);
      i--;
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      cb();
      if (!(cb.flags & 4)) {
        cb.flags &= -2;
      }
    }
  }
}
__name(flushPreFlushCbs, "flushPreFlushCbs");
__name2(flushPreFlushCbs, "flushPreFlushCbs");
function flushPostFlushCbs(seen) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)].sort(
      (a, b) => getId(a) - getId(b)
    );
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    activePostFlushCbs = deduped;
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      const cb = activePostFlushCbs[postFlushIndex];
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      if (!(cb.flags & 8)) cb();
      cb.flags &= -2;
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
__name(flushPostFlushCbs, "flushPostFlushCbs");
__name2(flushPostFlushCbs, "flushPostFlushCbs");
var getId = /* @__PURE__ */ __name2((job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id, "getId");
function flushJobs(seen) {
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && !(job.flags & 8)) {
        if (false) ;
        if (job.flags & 4) {
          job.flags &= ~1;
        }
        callWithErrorHandling(
          job,
          job.i,
          job.i ? 15 : 14
        );
        if (!(job.flags & 4)) {
          job.flags &= ~1;
        }
      }
    }
  } finally {
    for (; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job) {
        job.flags &= -2;
      }
    }
    flushIndex = -1;
    queue.length = 0;
    flushPostFlushCbs();
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs();
    }
  }
}
__name(flushJobs, "flushJobs");
__name2(flushJobs, "flushJobs");
var currentRenderingInstance = null;
var currentScopeId = null;
function setCurrentRenderingInstance$2(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
__name(setCurrentRenderingInstance$2, "setCurrentRenderingInstance$2");
__name2(setCurrentRenderingInstance$2, "setCurrentRenderingInstance$2");
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx) return fn;
  if (fn._n) {
    return fn;
  }
  const renderFnWithContext = /* @__PURE__ */ __name2((...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance$2(ctx);
    let res;
    try {
      res = fn(...args);
    } finally {
      setCurrentRenderingInstance$2(prevInstance);
      if (renderFnWithContext._d) {
        setBlockTracking(1);
      }
    }
    return res;
  }, "renderFnWithContext");
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
__name(withCtx, "withCtx");
__name2(withCtx, "withCtx");
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value;
    }
    let hook = binding.dir[name];
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}
__name(invokeDirectiveHook, "invokeDirectiveHook");
__name2(invokeDirectiveHook, "invokeDirectiveHook");
var TeleportEndKey = Symbol("_vte");
var isTeleport = /* @__PURE__ */ __name2((type) => type.__isTeleport, "isTeleport");
var leaveCbKey = Symbol("_leaveCb");
var enterCbKey = Symbol("_enterCb");
function useTransitionState() {
  const state = {
    isMounted: false,
    isLeaving: false,
    isUnmounting: false,
    leavingVNodes: /* @__PURE__ */ new Map()
  };
  onMounted(() => {
    state.isMounted = true;
  });
  onBeforeUnmount(() => {
    state.isUnmounting = true;
  });
  return state;
}
__name(useTransitionState, "useTransitionState");
__name2(useTransitionState, "useTransitionState");
var TransitionHookValidator = [Function, Array];
var BaseTransitionPropsValidators = {
  mode: String,
  appear: Boolean,
  persisted: Boolean,
  // enter
  onBeforeEnter: TransitionHookValidator,
  onEnter: TransitionHookValidator,
  onAfterEnter: TransitionHookValidator,
  onEnterCancelled: TransitionHookValidator,
  // leave
  onBeforeLeave: TransitionHookValidator,
  onLeave: TransitionHookValidator,
  onAfterLeave: TransitionHookValidator,
  onLeaveCancelled: TransitionHookValidator,
  // appear
  onBeforeAppear: TransitionHookValidator,
  onAppear: TransitionHookValidator,
  onAfterAppear: TransitionHookValidator,
  onAppearCancelled: TransitionHookValidator
};
var recursiveGetSubtree = /* @__PURE__ */ __name2((instance) => {
  const subTree = instance.subTree;
  return subTree.component ? recursiveGetSubtree(subTree.component) : subTree;
}, "recursiveGetSubtree");
var BaseTransitionImpl = {
  name: `BaseTransition`,
  props: BaseTransitionPropsValidators,
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    return () => {
      const children = slots.default && getTransitionRawChildren(slots.default(), true);
      if (!children || !children.length) {
        return;
      }
      const child = findNonCommentChild(children);
      const rawProps = toRaw(props);
      const { mode } = rawProps;
      if (state.isLeaving) {
        return emptyPlaceholder(child);
      }
      const innerChild = getInnerChild$1(child);
      if (!innerChild) {
        return emptyPlaceholder(child);
      }
      let enterHooks = resolveTransitionHooks(
        innerChild,
        rawProps,
        state,
        instance,
        // #11061, ensure enterHooks is fresh after clone
        (hooks) => enterHooks = hooks
      );
      if (innerChild.type !== Comment) {
        setTransitionHooks(innerChild, enterHooks);
      }
      let oldInnerChild = instance.subTree && getInnerChild$1(instance.subTree);
      if (oldInnerChild && oldInnerChild.type !== Comment && !isSameVNodeType(oldInnerChild, innerChild) && recursiveGetSubtree(instance).type !== Comment) {
        let leavingHooks = resolveTransitionHooks(
          oldInnerChild,
          rawProps,
          state,
          instance
        );
        setTransitionHooks(oldInnerChild, leavingHooks);
        if (mode === "out-in" && innerChild.type !== Comment) {
          state.isLeaving = true;
          leavingHooks.afterLeave = () => {
            state.isLeaving = false;
            if (!(instance.job.flags & 8)) {
              instance.update();
            }
            delete leavingHooks.afterLeave;
            oldInnerChild = void 0;
          };
          return emptyPlaceholder(child);
        } else if (mode === "in-out" && innerChild.type !== Comment) {
          leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
            const leavingVNodesCache = getLeavingNodesForType(
              state,
              oldInnerChild
            );
            leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
            el[leaveCbKey] = () => {
              earlyRemove();
              el[leaveCbKey] = void 0;
              delete enterHooks.delayedLeave;
              oldInnerChild = void 0;
            };
            enterHooks.delayedLeave = () => {
              delayedLeave();
              delete enterHooks.delayedLeave;
              oldInnerChild = void 0;
            };
          };
        } else {
          oldInnerChild = void 0;
        }
      } else if (oldInnerChild) {
        oldInnerChild = void 0;
      }
      return child;
    };
  }
};
function findNonCommentChild(children) {
  let child = children[0];
  if (children.length > 1) {
    for (const c of children) {
      if (c.type !== Comment) {
        child = c;
        break;
      }
    }
  }
  return child;
}
__name(findNonCommentChild, "findNonCommentChild");
__name2(findNonCommentChild, "findNonCommentChild");
var BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(state, vnode) {
  const { leavingVNodes } = state;
  let leavingVNodesCache = leavingVNodes.get(vnode.type);
  if (!leavingVNodesCache) {
    leavingVNodesCache = /* @__PURE__ */ Object.create(null);
    leavingVNodes.set(vnode.type, leavingVNodesCache);
  }
  return leavingVNodesCache;
}
__name(getLeavingNodesForType, "getLeavingNodesForType");
__name2(getLeavingNodesForType, "getLeavingNodesForType");
function resolveTransitionHooks(vnode, props, state, instance, postClone) {
  const {
    appear,
    mode,
    persisted = false,
    onBeforeEnter,
    onEnter,
    onAfterEnter,
    onEnterCancelled,
    onBeforeLeave,
    onLeave,
    onAfterLeave,
    onLeaveCancelled,
    onBeforeAppear,
    onAppear,
    onAfterAppear,
    onAppearCancelled
  } = props;
  const key = String(vnode.key);
  const leavingVNodesCache = getLeavingNodesForType(state, vnode);
  const callHook2 = /* @__PURE__ */ __name2((hook, args) => {
    hook && callWithAsyncErrorHandling(
      hook,
      instance,
      9,
      args
    );
  }, "callHook2");
  const callAsyncHook = /* @__PURE__ */ __name2((hook, args) => {
    const done = args[1];
    callHook2(hook, args);
    if (isArray$4(hook)) {
      if (hook.every((hook2) => hook2.length <= 1)) done();
    } else if (hook.length <= 1) {
      done();
    }
  }, "callAsyncHook");
  const hooks = {
    mode,
    persisted,
    beforeEnter(el) {
      let hook = onBeforeEnter;
      if (!state.isMounted) {
        if (appear) {
          hook = onBeforeAppear || onBeforeEnter;
        } else {
          return;
        }
      }
      if (el[leaveCbKey]) {
        el[leaveCbKey](
          true
          /* cancelled */
        );
      }
      const leavingVNode = leavingVNodesCache[key];
      if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el[leaveCbKey]) {
        leavingVNode.el[leaveCbKey]();
      }
      callHook2(hook, [el]);
    },
    enter(el) {
      let hook = onEnter;
      let afterHook = onAfterEnter;
      let cancelHook = onEnterCancelled;
      if (!state.isMounted) {
        if (appear) {
          hook = onAppear || onEnter;
          afterHook = onAfterAppear || onAfterEnter;
          cancelHook = onAppearCancelled || onEnterCancelled;
        } else {
          return;
        }
      }
      let called = false;
      const done = el[enterCbKey] = (cancelled) => {
        if (called) return;
        called = true;
        if (cancelled) {
          callHook2(cancelHook, [el]);
        } else {
          callHook2(afterHook, [el]);
        }
        if (hooks.delayedLeave) {
          hooks.delayedLeave();
        }
        el[enterCbKey] = void 0;
      };
      if (hook) {
        callAsyncHook(hook, [el, done]);
      } else {
        done();
      }
    },
    leave(el, remove2) {
      const key2 = String(vnode.key);
      if (el[enterCbKey]) {
        el[enterCbKey](
          true
          /* cancelled */
        );
      }
      if (state.isUnmounting) {
        return remove2();
      }
      callHook2(onBeforeLeave, [el]);
      let called = false;
      const done = el[leaveCbKey] = (cancelled) => {
        if (called) return;
        called = true;
        remove2();
        if (cancelled) {
          callHook2(onLeaveCancelled, [el]);
        } else {
          callHook2(onAfterLeave, [el]);
        }
        el[leaveCbKey] = void 0;
        if (leavingVNodesCache[key2] === vnode) {
          delete leavingVNodesCache[key2];
        }
      };
      leavingVNodesCache[key2] = vnode;
      if (onLeave) {
        callAsyncHook(onLeave, [el, done]);
      } else {
        done();
      }
    },
    clone(vnode2) {
      const hooks2 = resolveTransitionHooks(
        vnode2,
        props,
        state,
        instance,
        postClone
      );
      if (postClone) postClone(hooks2);
      return hooks2;
    }
  };
  return hooks;
}
__name(resolveTransitionHooks, "resolveTransitionHooks");
__name2(resolveTransitionHooks, "resolveTransitionHooks");
function emptyPlaceholder(vnode) {
  if (isKeepAlive(vnode)) {
    vnode = cloneVNode(vnode);
    vnode.children = null;
    return vnode;
  }
}
__name(emptyPlaceholder, "emptyPlaceholder");
__name2(emptyPlaceholder, "emptyPlaceholder");
function getInnerChild$1(vnode) {
  if (!isKeepAlive(vnode)) {
    if (isTeleport(vnode.type) && vnode.children) {
      return findNonCommentChild(vnode.children);
    }
    return vnode;
  }
  if (vnode.component) {
    return vnode.component.subTree;
  }
  const { shapeFlag, children } = vnode;
  if (children) {
    if (shapeFlag & 16) {
      return children[0];
    }
    if (shapeFlag & 32 && isFunction$3(children.default)) {
      return children.default();
    }
  }
}
__name(getInnerChild$1, "getInnerChild$1");
__name2(getInnerChild$1, "getInnerChild$1");
function setTransitionHooks(vnode, hooks) {
  if (vnode.shapeFlag & 6 && vnode.component) {
    vnode.transition = hooks;
    setTransitionHooks(vnode.component.subTree, hooks);
  } else if (vnode.shapeFlag & 128) {
    vnode.ssContent.transition = hooks.clone(vnode.ssContent);
    vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
  } else {
    vnode.transition = hooks;
  }
}
__name(setTransitionHooks, "setTransitionHooks");
__name2(setTransitionHooks, "setTransitionHooks");
function getTransitionRawChildren(children, keepComment = false, parentKey) {
  let ret = [];
  let keyedFragmentCount = 0;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i);
    if (child.type === Fragment) {
      if (child.patchFlag & 128) keyedFragmentCount++;
      ret = ret.concat(
        getTransitionRawChildren(child.children, keepComment, key)
      );
    } else if (keepComment || child.type !== Comment) {
      ret.push(key != null ? cloneVNode(child, { key }) : child);
    }
  }
  if (keyedFragmentCount > 1) {
    for (let i = 0; i < ret.length; i++) {
      ret[i].patchFlag = -2;
    }
  }
  return ret;
}
__name(getTransitionRawChildren, "getTransitionRawChildren");
__name2(getTransitionRawChildren, "getTransitionRawChildren");
// @__NO_SIDE_EFFECTS__
function defineComponent(options, extraOptions) {
  return isFunction$3(options) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    /* @__PURE__ */ (() => extend$1({ name: options.name }, extraOptions, { setup: options }))()
  ) : options;
}
__name(defineComponent, "defineComponent");
__name2(defineComponent, "defineComponent");
function markAsyncBoundary(instance) {
  instance.ids = [instance.ids[0] + instance.ids[2]++ + "-", 0, 0];
}
__name(markAsyncBoundary, "markAsyncBoundary");
__name2(markAsyncBoundary, "markAsyncBoundary");
var pendingSetRefMap = /* @__PURE__ */ new WeakMap();
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray$4(rawRef)) {
    rawRef.forEach(
      (r, i) => setRef(
        r,
        oldRawRef && (isArray$4(oldRawRef) ? oldRawRef[i] : oldRawRef),
        parentSuspense,
        vnode,
        isUnmount
      )
    );
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) {
      setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
    }
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref3 } = rawRef;
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  const rawSetupState = toRaw(setupState);
  const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
    return hasOwn(rawSetupState, key);
  };
  if (oldRef != null && oldRef !== ref3) {
    invalidatePendingSetRef(oldRawRef);
    if (isString$3(oldRef)) {
      refs[oldRef] = null;
      if (canSetSetupRef(oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (isRef$2(oldRef)) {
      {
        oldRef.value = null;
      }
      const oldRawRefAtom = oldRawRef;
      if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
    }
  }
  if (isFunction$3(ref3)) {
    callWithErrorHandling(ref3, owner, 12, [value, refs]);
  } else {
    const _isString = isString$3(ref3);
    const _isRef = isRef$2(ref3);
    if (_isString || _isRef) {
      const doSet = /* @__PURE__ */ __name2(() => {
        if (rawRef.f) {
          const existing = _isString ? canSetSetupRef(ref3) ? setupState[ref3] : refs[ref3] : ref3.value;
          if (isUnmount) {
            isArray$4(existing) && remove(existing, refValue);
          } else {
            if (!isArray$4(existing)) {
              if (_isString) {
                refs[ref3] = [refValue];
                if (canSetSetupRef(ref3)) {
                  setupState[ref3] = refs[ref3];
                }
              } else {
                const newVal = [refValue];
                {
                  ref3.value = newVal;
                }
                if (rawRef.k) refs[rawRef.k] = newVal;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref3] = value;
          if (canSetSetupRef(ref3)) {
            setupState[ref3] = value;
          }
        } else if (_isRef) {
          {
            ref3.value = value;
          }
          if (rawRef.k) refs[rawRef.k] = value;
        } else ;
      }, "doSet");
      if (value) {
        const job = /* @__PURE__ */ __name2(() => {
          doSet();
          pendingSetRefMap.delete(rawRef);
        }, "job");
        job.id = -1;
        pendingSetRefMap.set(rawRef, job);
        queuePostRenderEffect(job, parentSuspense);
      } else {
        invalidatePendingSetRef(rawRef);
        doSet();
      }
    }
  }
}
__name(setRef, "setRef");
__name2(setRef, "setRef");
function invalidatePendingSetRef(rawRef) {
  const pendingSetRef = pendingSetRefMap.get(rawRef);
  if (pendingSetRef) {
    pendingSetRef.flags |= 8;
    pendingSetRefMap.delete(rawRef);
  }
}
__name(invalidatePendingSetRef, "invalidatePendingSetRef");
__name2(invalidatePendingSetRef, "invalidatePendingSetRef");
var hasLoggedMismatchError = false;
var logMismatchError = /* @__PURE__ */ __name2(() => {
  if (hasLoggedMismatchError) {
    return;
  }
  console.error("Hydration completed but contains mismatches.");
  hasLoggedMismatchError = true;
}, "logMismatchError");
var isSVGContainer = /* @__PURE__ */ __name2((container) => container.namespaceURI.includes("svg") && container.tagName !== "foreignObject", "isSVGContainer");
var isMathMLContainer = /* @__PURE__ */ __name2((container) => container.namespaceURI.includes("MathML"), "isMathMLContainer");
var getContainerType = /* @__PURE__ */ __name2((container) => {
  if (container.nodeType !== 1) return void 0;
  if (isSVGContainer(container)) return "svg";
  if (isMathMLContainer(container)) return "mathml";
  return void 0;
}, "getContainerType");
var isComment = /* @__PURE__ */ __name2((node) => node.nodeType === 8, "isComment");
function createHydrationFunctions(rendererInternals) {
  const {
    mt: mountComponent,
    p: patch,
    o: {
      patchProp: patchProp2,
      createText,
      nextSibling,
      parentNode,
      remove: remove2,
      insert,
      createComment
    }
  } = rendererInternals;
  const hydrate = /* @__PURE__ */ __name2((vnode, container) => {
    if (!container.hasChildNodes()) {
      patch(null, vnode, container);
      flushPostFlushCbs();
      container._vnode = vnode;
      return;
    }
    hydrateNode(container.firstChild, vnode, null, null, null);
    flushPostFlushCbs();
    container._vnode = vnode;
  }, "hydrate");
  const hydrateNode = /* @__PURE__ */ __name2((node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized = false) => {
    optimized = optimized || !!vnode.dynamicChildren;
    const isFragmentStart = isComment(node) && node.data === "[";
    const onMismatch = /* @__PURE__ */ __name2(() => handleMismatch(
      node,
      vnode,
      parentComponent,
      parentSuspense,
      slotScopeIds,
      isFragmentStart
    ), "onMismatch");
    const { type, ref: ref3, shapeFlag, patchFlag } = vnode;
    let domType = node.nodeType;
    vnode.el = node;
    if (patchFlag === -2) {
      optimized = false;
      vnode.dynamicChildren = null;
    }
    let nextNode = null;
    switch (type) {
      case Text:
        if (domType !== 3) {
          if (vnode.children === "") {
            insert(vnode.el = createText(""), parentNode(node), node);
            nextNode = node;
          } else {
            nextNode = onMismatch();
          }
        } else {
          if (node.data !== vnode.children) {
            logMismatchError();
            node.data = vnode.children;
          }
          nextNode = nextSibling(node);
        }
        break;
      case Comment:
        if (isTemplateNode(node)) {
          nextNode = nextSibling(node);
          replaceNode(
            vnode.el = node.content.firstChild,
            node,
            parentComponent
          );
        } else if (domType !== 8 || isFragmentStart) {
          nextNode = onMismatch();
        } else {
          nextNode = nextSibling(node);
        }
        break;
      case Static:
        if (isFragmentStart) {
          node = nextSibling(node);
          domType = node.nodeType;
        }
        if (domType === 1 || domType === 3) {
          nextNode = node;
          const needToAdoptContent = !vnode.children.length;
          for (let i = 0; i < vnode.staticCount; i++) {
            if (needToAdoptContent)
              vnode.children += nextNode.nodeType === 1 ? nextNode.outerHTML : nextNode.data;
            if (i === vnode.staticCount - 1) {
              vnode.anchor = nextNode;
            }
            nextNode = nextSibling(nextNode);
          }
          return isFragmentStart ? nextSibling(nextNode) : nextNode;
        } else {
          onMismatch();
        }
        break;
      case Fragment:
        if (!isFragmentStart) {
          nextNode = onMismatch();
        } else {
          nextNode = hydrateFragment(
            node,
            vnode,
            parentComponent,
            parentSuspense,
            slotScopeIds,
            optimized
          );
        }
        break;
      default:
        if (shapeFlag & 1) {
          if ((domType !== 1 || vnode.type.toLowerCase() !== node.tagName.toLowerCase()) && !isTemplateNode(node)) {
            nextNode = onMismatch();
          } else {
            nextNode = hydrateElement(
              node,
              vnode,
              parentComponent,
              parentSuspense,
              slotScopeIds,
              optimized
            );
          }
        } else if (shapeFlag & 6) {
          vnode.slotScopeIds = slotScopeIds;
          const container = parentNode(node);
          if (isFragmentStart) {
            nextNode = locateClosingAnchor(node);
          } else if (isComment(node) && node.data === "teleport start") {
            nextNode = locateClosingAnchor(node, node.data, "teleport end");
          } else {
            nextNode = nextSibling(node);
          }
          mountComponent(
            vnode,
            container,
            null,
            parentComponent,
            parentSuspense,
            getContainerType(container),
            optimized
          );
          if (isAsyncWrapper(vnode) && !vnode.type.__asyncResolved) {
            let subTree;
            if (isFragmentStart) {
              subTree = createVNode(Fragment);
              subTree.anchor = nextNode ? nextNode.previousSibling : container.lastChild;
            } else {
              subTree = node.nodeType === 3 ? createTextVNode("") : createVNode("div");
            }
            subTree.el = node;
            vnode.component.subTree = subTree;
          }
        } else if (shapeFlag & 64) {
          if (domType !== 8) {
            nextNode = onMismatch();
          } else {
            nextNode = vnode.type.hydrate(
              node,
              vnode,
              parentComponent,
              parentSuspense,
              slotScopeIds,
              optimized,
              rendererInternals,
              hydrateChildren
            );
          }
        } else if (shapeFlag & 128) {
          nextNode = vnode.type.hydrate(
            node,
            vnode,
            parentComponent,
            parentSuspense,
            getContainerType(parentNode(node)),
            slotScopeIds,
            optimized,
            rendererInternals,
            hydrateNode
          );
        } else ;
    }
    if (ref3 != null) {
      setRef(ref3, null, parentSuspense, vnode);
    }
    return nextNode;
  }, "hydrateNode");
  const hydrateElement = /* @__PURE__ */ __name2((el, vnode, parentComponent, parentSuspense, slotScopeIds, optimized) => {
    optimized = optimized || !!vnode.dynamicChildren;
    const { type, props, patchFlag, shapeFlag, dirs, transition } = vnode;
    const forcePatch = type === "input" || type === "option";
    if (forcePatch || patchFlag !== -1) {
      if (dirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "created");
      }
      let needCallTransitionHooks = false;
      if (isTemplateNode(el)) {
        needCallTransitionHooks = needTransition(
          null,
          // no need check parentSuspense in hydration
          transition
        ) && parentComponent && parentComponent.vnode.props && parentComponent.vnode.props.appear;
        const content = el.content.firstChild;
        if (needCallTransitionHooks) {
          const cls = content.getAttribute("class");
          if (cls) content.$cls = cls;
          transition.beforeEnter(content);
        }
        replaceNode(content, el, parentComponent);
        vnode.el = el = content;
      }
      if (shapeFlag & 16 && // skip if element has innerHTML / textContent
      !(props && (props.innerHTML || props.textContent))) {
        let next = hydrateChildren(
          el.firstChild,
          vnode,
          el,
          parentComponent,
          parentSuspense,
          slotScopeIds,
          optimized
        );
        while (next) {
          if (!isMismatchAllowed(
            el,
            1
            /* CHILDREN */
          )) {
            logMismatchError();
          }
          const cur = next;
          next = next.nextSibling;
          remove2(cur);
        }
      } else if (shapeFlag & 8) {
        let clientText = vnode.children;
        if (clientText[0] === "\n" && (el.tagName === "PRE" || el.tagName === "TEXTAREA")) {
          clientText = clientText.slice(1);
        }
        const { textContent } = el;
        if (textContent !== clientText && // innerHTML normalize \r\n or \r into a single \n in the DOM
        textContent !== clientText.replace(/\r\n|\r/g, "\n")) {
          if (!isMismatchAllowed(
            el,
            0
            /* TEXT */
          )) {
            logMismatchError();
          }
          el.textContent = vnode.children;
        }
      }
      if (props) {
        if (forcePatch || !optimized || patchFlag & (16 | 32)) {
          const isCustomElement = el.tagName.includes("-");
          for (const key in props) {
            if (forcePatch && (key.endsWith("value") || key === "indeterminate") || isOn$3(key) && !isReservedProp(key) || // force hydrate v-bind with .prop modifiers
            key[0] === "." || isCustomElement) {
              patchProp2(el, key, null, props[key], void 0, parentComponent);
            }
          }
        } else if (props.onClick) {
          patchProp2(
            el,
            "onClick",
            null,
            props.onClick,
            void 0,
            parentComponent
          );
        } else if (patchFlag & 4 && isReactive(props.style)) {
          for (const key in props.style) props.style[key];
        }
      }
      let vnodeHooks;
      if (vnodeHooks = props && props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHooks, parentComponent, vnode);
      }
      if (dirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
      }
      if ((vnodeHooks = props && props.onVnodeMounted) || dirs || needCallTransitionHooks) {
        queueEffectWithSuspense(() => {
          vnodeHooks && invokeVNodeHook(vnodeHooks, parentComponent, vnode);
          needCallTransitionHooks && transition.enter(el);
          dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
        }, parentSuspense);
      }
    }
    return el.nextSibling;
  }, "hydrateElement");
  const hydrateChildren = /* @__PURE__ */ __name2((node, parentVNode, container, parentComponent, parentSuspense, slotScopeIds, optimized) => {
    optimized = optimized || !!parentVNode.dynamicChildren;
    const children = parentVNode.children;
    const l = children.length;
    for (let i = 0; i < l; i++) {
      const vnode = optimized ? children[i] : children[i] = normalizeVNode$2(children[i]);
      const isText = vnode.type === Text;
      if (node) {
        if (isText && !optimized) {
          if (i + 1 < l && normalizeVNode$2(children[i + 1]).type === Text) {
            insert(
              createText(
                node.data.slice(vnode.children.length)
              ),
              container,
              nextSibling(node)
            );
            node.data = vnode.children;
          }
        }
        node = hydrateNode(
          node,
          vnode,
          parentComponent,
          parentSuspense,
          slotScopeIds,
          optimized
        );
      } else if (isText && !vnode.children) {
        insert(vnode.el = createText(""), container);
      } else {
        if (!isMismatchAllowed(
          container,
          1
          /* CHILDREN */
        )) {
          logMismatchError();
        }
        patch(
          null,
          vnode,
          container,
          null,
          parentComponent,
          parentSuspense,
          getContainerType(container),
          slotScopeIds
        );
      }
    }
    return node;
  }, "hydrateChildren");
  const hydrateFragment = /* @__PURE__ */ __name2((node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized) => {
    const { slotScopeIds: fragmentSlotScopeIds } = vnode;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    const container = parentNode(node);
    const next = hydrateChildren(
      nextSibling(node),
      vnode,
      container,
      parentComponent,
      parentSuspense,
      slotScopeIds,
      optimized
    );
    if (next && isComment(next) && next.data === "]") {
      return nextSibling(vnode.anchor = next);
    } else {
      logMismatchError();
      insert(vnode.anchor = createComment(`]`), container, next);
      return next;
    }
  }, "hydrateFragment");
  const handleMismatch = /* @__PURE__ */ __name2((node, vnode, parentComponent, parentSuspense, slotScopeIds, isFragment) => {
    if (!isMismatchAllowed(
      node.parentElement,
      1
      /* CHILDREN */
    )) {
      logMismatchError();
    }
    vnode.el = null;
    if (isFragment) {
      const end = locateClosingAnchor(node);
      while (true) {
        const next2 = nextSibling(node);
        if (next2 && next2 !== end) {
          remove2(next2);
        } else {
          break;
        }
      }
    }
    const next = nextSibling(node);
    const container = parentNode(node);
    remove2(node);
    patch(
      null,
      vnode,
      container,
      next,
      parentComponent,
      parentSuspense,
      getContainerType(container),
      slotScopeIds
    );
    if (parentComponent) {
      parentComponent.vnode.el = vnode.el;
      updateHOCHostEl(parentComponent, vnode.el);
    }
    return next;
  }, "handleMismatch");
  const locateClosingAnchor = /* @__PURE__ */ __name2((node, open = "[", close = "]") => {
    let match2 = 0;
    while (node) {
      node = nextSibling(node);
      if (node && isComment(node)) {
        if (node.data === open) match2++;
        if (node.data === close) {
          if (match2 === 0) {
            return nextSibling(node);
          } else {
            match2--;
          }
        }
      }
    }
    return node;
  }, "locateClosingAnchor");
  const replaceNode = /* @__PURE__ */ __name2((newNode, oldNode, parentComponent) => {
    const parentNode2 = oldNode.parentNode;
    if (parentNode2) {
      parentNode2.replaceChild(newNode, oldNode);
    }
    let parent = parentComponent;
    while (parent) {
      if (parent.vnode.el === oldNode) {
        parent.vnode.el = parent.subTree.el = newNode;
      }
      parent = parent.parent;
    }
  }, "replaceNode");
  const isTemplateNode = /* @__PURE__ */ __name2((node) => {
    return node.nodeType === 1 && node.tagName === "TEMPLATE";
  }, "isTemplateNode");
  return [hydrate, hydrateNode];
}
__name(createHydrationFunctions, "createHydrationFunctions");
__name2(createHydrationFunctions, "createHydrationFunctions");
var allowMismatchAttr = "data-allow-mismatch";
var MismatchTypeString = {
  [
    0
    /* TEXT */
  ]: "text",
  [
    1
    /* CHILDREN */
  ]: "children",
  [
    2
    /* CLASS */
  ]: "class",
  [
    3
    /* STYLE */
  ]: "style",
  [
    4
    /* ATTRIBUTE */
  ]: "attribute"
};
function isMismatchAllowed(el, allowedType) {
  if (allowedType === 0 || allowedType === 1) {
    while (el && !el.hasAttribute(allowMismatchAttr)) {
      el = el.parentElement;
    }
  }
  const allowedAttr = el && el.getAttribute(allowMismatchAttr);
  if (allowedAttr == null) {
    return false;
  } else if (allowedAttr === "") {
    return true;
  } else {
    const list = allowedAttr.split(",");
    if (allowedType === 0 && list.includes("children")) {
      return true;
    }
    return list.includes(MismatchTypeString[allowedType]);
  }
}
__name(isMismatchAllowed, "isMismatchAllowed");
__name2(isMismatchAllowed, "isMismatchAllowed");
getGlobalThis$2().requestIdleCallback || ((cb) => setTimeout(cb, 1));
getGlobalThis$2().cancelIdleCallback || ((id) => clearTimeout(id));
function forEachElement(node, cb) {
  if (isComment(node) && node.data === "[") {
    let depth = 1;
    let next = node.nextSibling;
    while (next) {
      if (next.nodeType === 1) {
        const result = cb(next);
        if (result === false) {
          break;
        }
      } else if (isComment(next)) {
        if (next.data === "]") {
          if (--depth === 0) break;
        } else if (next.data === "[") {
          depth++;
        }
      }
      next = next.nextSibling;
    }
  } else {
    cb(node);
  }
}
__name(forEachElement, "forEachElement");
__name2(forEachElement, "forEachElement");
var isAsyncWrapper = /* @__PURE__ */ __name2((i) => !!i.type.__asyncLoader, "isAsyncWrapper");
// @__NO_SIDE_EFFECTS__
function defineAsyncComponent(source) {
  if (isFunction$3(source)) {
    source = { loader: source };
  }
  const {
    loader,
    loadingComponent,
    errorComponent,
    delay = 200,
    hydrate: hydrateStrategy,
    timeout,
    // undefined = never times out
    suspensible = true,
    onError: userOnError
  } = source;
  let pendingRequest = null;
  let resolvedComp;
  let retries = 0;
  const retry = /* @__PURE__ */ __name2(() => {
    retries++;
    pendingRequest = null;
    return load();
  }, "retry");
  const load = /* @__PURE__ */ __name2(() => {
    let thisRequest;
    return pendingRequest || (thisRequest = pendingRequest = loader().catch((err) => {
      err = err instanceof Error ? err : new Error(String(err));
      if (userOnError) {
        return new Promise((resolve2, reject) => {
          const userRetry = /* @__PURE__ */ __name2(() => resolve2(retry()), "userRetry");
          const userFail = /* @__PURE__ */ __name2(() => reject(err), "userFail");
          userOnError(err, userRetry, userFail, retries + 1);
        });
      } else {
        throw err;
      }
    }).then((comp) => {
      if (thisRequest !== pendingRequest && pendingRequest) {
        return pendingRequest;
      }
      if (comp && (comp.__esModule || comp[Symbol.toStringTag] === "Module")) {
        comp = comp.default;
      }
      resolvedComp = comp;
      return comp;
    }));
  }, "load");
  return /* @__PURE__ */ defineComponent({
    name: "AsyncComponentWrapper",
    __asyncLoader: load,
    __asyncHydrate(el, instance, hydrate) {
      let patched = false;
      (instance.bu || (instance.bu = [])).push(() => patched = true);
      const performHydrate = /* @__PURE__ */ __name2(() => {
        if (patched) {
          return;
        }
        hydrate();
      }, "performHydrate");
      const doHydrate = hydrateStrategy ? () => {
        const teardown = hydrateStrategy(
          performHydrate,
          (cb) => forEachElement(el, cb)
        );
        if (teardown) {
          (instance.bum || (instance.bum = [])).push(teardown);
        }
      } : performHydrate;
      if (resolvedComp) {
        doHydrate();
      } else {
        load().then(() => !instance.isUnmounted && doHydrate());
      }
    },
    get __asyncResolved() {
      return resolvedComp;
    },
    setup() {
      const instance = currentInstance;
      markAsyncBoundary(instance);
      if (resolvedComp) {
        return () => createInnerComp(resolvedComp, instance);
      }
      const onError = /* @__PURE__ */ __name2((err) => {
        pendingRequest = null;
        handleError(
          err,
          instance,
          13,
          !errorComponent
        );
      }, "onError");
      if (suspensible && instance.suspense || isInSSRComponentSetup) {
        return load().then((comp) => {
          return () => createInnerComp(comp, instance);
        }).catch((err) => {
          onError(err);
          return () => errorComponent ? createVNode(errorComponent, {
            error: err
          }) : null;
        });
      }
      const loaded = ref(false);
      const error = ref();
      const delayed = ref(!!delay);
      if (delay) {
        setTimeout(() => {
          delayed.value = false;
        }, delay);
      }
      if (timeout != null) {
        setTimeout(() => {
          if (!loaded.value && !error.value) {
            const err = new Error(
              `Async component timed out after ${timeout}ms.`
            );
            onError(err);
            error.value = err;
          }
        }, timeout);
      }
      load().then(() => {
        loaded.value = true;
        if (instance.parent && isKeepAlive(instance.parent.vnode)) {
          instance.parent.update();
        }
      }).catch((err) => {
        onError(err);
        error.value = err;
      });
      return () => {
        if (loaded.value && resolvedComp) {
          return createInnerComp(resolvedComp, instance);
        } else if (error.value && errorComponent) {
          return createVNode(errorComponent, {
            error: error.value
          });
        } else if (loadingComponent && !delayed.value) {
          return createInnerComp(
            loadingComponent,
            instance
          );
        }
      };
    }
  });
}
__name(defineAsyncComponent, "defineAsyncComponent");
__name2(defineAsyncComponent, "defineAsyncComponent");
function createInnerComp(comp, parent) {
  const { ref: ref22, props, children, ce } = parent.vnode;
  const vnode = createVNode(comp, props, children);
  vnode.ref = ref22;
  vnode.ce = ce;
  delete parent.vnode.ce;
  return vnode;
}
__name(createInnerComp, "createInnerComp");
__name2(createInnerComp, "createInnerComp");
var isKeepAlive = /* @__PURE__ */ __name2((vnode) => vnode.type.__isKeepAlive, "isKeepAlive");
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
__name(onActivated, "onActivated");
__name2(onActivated, "onActivated");
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
__name(onDeactivated, "onDeactivated");
__name2(onDeactivated, "onDeactivated");
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
__name(registerKeepAliveHook, "registerKeepAliveHook");
__name2(registerKeepAliveHook, "registerKeepAliveHook");
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(
    type,
    hook,
    keepAliveRoot,
    true
    /* prepend */
  );
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
__name(injectToKeepAliveRoot, "injectToKeepAliveRoot");
__name2(injectToKeepAliveRoot, "injectToKeepAliveRoot");
function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      pauseTracking();
      const reset = setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      reset();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }
}
__name(injectHook, "injectHook");
__name2(injectHook, "injectHook");
var createHook = /* @__PURE__ */ __name2((lifecycle) => (hook, target = currentInstance) => {
  if (!isInSSRComponentSetup || lifecycle === "sp") {
    injectHook(lifecycle, (...args) => hook(...args), target);
  }
}, "createHook");
var onBeforeMount = createHook("bm");
var onMounted = createHook("m");
var onBeforeUpdate = createHook(
  "bu"
);
var onUpdated = createHook("u");
var onBeforeUnmount = createHook(
  "bum"
);
var onUnmounted = createHook("um");
var onServerPrefetch = createHook(
  "sp"
);
var onRenderTriggered = createHook("rtg");
var onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
__name(onErrorCaptured, "onErrorCaptured");
__name2(onErrorCaptured, "onErrorCaptured");
var COMPONENTS = "components";
function resolveComponent(name, maybeSelfReference) {
  return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
}
__name(resolveComponent, "resolveComponent");
__name2(resolveComponent, "resolveComponent");
var NULL_DYNAMIC_COMPONENT = Symbol.for("v-ndc");
function resolveDynamicComponent(component) {
  if (isString$3(component)) {
    return resolveAsset(COMPONENTS, component, false) || component;
  } else {
    return component || NULL_DYNAMIC_COMPONENT;
  }
}
__name(resolveDynamicComponent, "resolveDynamicComponent");
__name2(resolveDynamicComponent, "resolveDynamicComponent");
function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
  const instance = currentRenderingInstance || currentInstance;
  if (instance) {
    const Component = instance.type;
    {
      const selfName = getComponentName(
        Component,
        false
      );
      if (selfName && (selfName === name || selfName === camelize$1(name) || selfName === capitalize$1(camelize$1(name)))) {
        return Component;
      }
    }
    const res = (
      // local registration
      // check instance[type] first which is resolved for options API
      resolve(instance[type] || Component[type], name) || // global registration
      resolve(instance.appContext[type], name)
    );
    if (!res && maybeSelfReference) {
      return Component;
    }
    return res;
  }
}
__name(resolveAsset, "resolveAsset");
__name2(resolveAsset, "resolveAsset");
function resolve(registry, name) {
  return registry && (registry[name] || registry[camelize$1(name)] || registry[capitalize$1(camelize$1(name))]);
}
__name(resolve, "resolve");
__name2(resolve, "resolve");
var getPublicInstance = /* @__PURE__ */ __name2((i) => {
  if (!i) return null;
  if (isStatefulComponent(i)) return getComponentPublicInstance(i);
  return getPublicInstance(i.parent);
}, "getPublicInstance");
var publicPropertiesMap = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ extend$1(/* @__PURE__ */ Object.create(null), {
    $: /* @__PURE__ */ __name2((i) => i, "$"),
    $el: /* @__PURE__ */ __name2((i) => i.vnode.el, "$el"),
    $data: /* @__PURE__ */ __name2((i) => i.data, "$data"),
    $props: /* @__PURE__ */ __name2((i) => i.props, "$props"),
    $attrs: /* @__PURE__ */ __name2((i) => i.attrs, "$attrs"),
    $slots: /* @__PURE__ */ __name2((i) => i.slots, "$slots"),
    $refs: /* @__PURE__ */ __name2((i) => i.refs, "$refs"),
    $parent: /* @__PURE__ */ __name2((i) => getPublicInstance(i.parent), "$parent"),
    $root: /* @__PURE__ */ __name2((i) => getPublicInstance(i.root), "$root"),
    $host: /* @__PURE__ */ __name2((i) => i.ce, "$host"),
    $emit: /* @__PURE__ */ __name2((i) => i.emit, "$emit"),
    $options: /* @__PURE__ */ __name2((i) => resolveMergedOptions(i), "$options"),
    $forceUpdate: /* @__PURE__ */ __name2((i) => i.f || (i.f = () => {
      queueJob(i.update);
    }), "$forceUpdate"),
    $nextTick: /* @__PURE__ */ __name2((i) => i.n || (i.n = nextTick.bind(i.proxy)), "$nextTick"),
    $watch: /* @__PURE__ */ __name2((i) => instanceWatch.bind(i), "$watch")
  })
);
var hasSetupBinding = /* @__PURE__ */ __name2((state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key), "hasSetupBinding");
var PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    if (key === "__v_skip") {
      return true;
    }
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    if (key[0] !== "$") {
      const n = accessCache[key];
      if (n !== void 0) {
        switch (n) {
          case 1:
            return setupState[key];
          case 2:
            return data[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if (hasOwn(props, key)) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance.attrs, "get", "");
      }
      return publicGetter(instance);
    } else if (
      // css module (injected by vue-loader)
      (cssModule = type.__cssModules) && (cssModule = cssModule[key])
    ) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (
      // global properties
      globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)
    ) {
      {
        return globalProperties[key];
      }
    } else ;
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      return false;
    } else {
      {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({
    _: { data, setupState, accessCache, ctx, appContext, props, type }
  }, key) {
    let cssModules;
    return !!(accessCache[key] || data !== EMPTY_OBJ && key[0] !== "$" && hasOwn(data, key) || hasSetupBinding(setupState, key) || hasOwn(props, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
function normalizePropsOrEmits(props) {
  return isArray$4(props) ? props.reduce(
    (normalized, p2) => (normalized[p2] = null, normalized),
    {}
  ) : props;
}
__name(normalizePropsOrEmits, "normalizePropsOrEmits");
__name2(normalizePropsOrEmits, "normalizePropsOrEmits");
var shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook$1(options.beforeCreate, instance, "bc");
  }
  const {
    // state
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    // lifecycle
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render: render2,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    // public API
    expose,
    inheritAttrs,
    // assets
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction$3(methodHandler)) {
        {
          ctx[key] = methodHandler.bind(publicThis);
        }
      }
    }
  }
  if (dataOptions) {
    const data = dataOptions.call(publicThis, publicThis);
    if (!isObject$3(data)) ;
    else {
      instance.data = reactive(data);
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get = isFunction$3(opt) ? opt.bind(publicThis, publicThis) : isFunction$3(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP$2;
      const set = !isFunction$3(opt) && isFunction$3(opt.set) ? opt.set.bind(publicThis) : NOOP$2;
      const c = computed({
        get,
        set
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: /* @__PURE__ */ __name2(() => c.value, "get"),
        set: /* @__PURE__ */ __name2((v) => c.value = v, "set")
      });
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction$3(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook$1(created, instance, "c");
  }
  function registerLifecycleHook(register, hook) {
    if (isArray$4(hook)) {
      hook.forEach((_hook) => register(_hook.bind(publicThis)));
    } else if (hook) {
      register(hook.bind(publicThis));
    }
  }
  __name(registerLifecycleHook, "registerLifecycleHook");
  __name2(registerLifecycleHook, "registerLifecycleHook");
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray$4(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: /* @__PURE__ */ __name2(() => publicThis[key], "get"),
          set: /* @__PURE__ */ __name2((val) => publicThis[key] = val, "set"),
          enumerable: true
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render2 && instance.render === NOOP$2) {
    instance.render = render2;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components) instance.components = components;
  if (directives) instance.directives = directives;
  if (serverPrefetch) {
    markAsyncBoundary(instance);
  }
}
__name(applyOptions, "applyOptions");
__name2(applyOptions, "applyOptions");
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP$2) {
  if (isArray$4(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject$3(opt)) {
      if ("default" in opt) {
        injected = inject(
          opt.from || key,
          opt.default,
          true
        );
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (isRef$2(injected)) {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: /* @__PURE__ */ __name2(() => injected.value, "get"),
        set: /* @__PURE__ */ __name2((v) => injected.value = v, "set")
      });
    } else {
      ctx[key] = injected;
    }
  }
}
__name(resolveInjections, "resolveInjections");
__name2(resolveInjections, "resolveInjections");
function callHook$1(hook, instance, type) {
  callWithAsyncErrorHandling(
    isArray$4(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy),
    instance,
    type
  );
}
__name(callHook$1, "callHook$1");
__name2(callHook$1, "callHook$1");
function createWatcher(raw, ctx, publicThis, key) {
  let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString$3(raw)) {
    const handler = ctx[raw];
    if (isFunction$3(handler)) {
      {
        watch(getter, handler);
      }
    }
  } else if (isFunction$3(raw)) {
    {
      watch(getter, raw.bind(publicThis));
    }
  } else if (isObject$3(raw)) {
    if (isArray$4(raw)) {
      raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
    } else {
      const handler = isFunction$3(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction$3(handler)) {
        watch(getter, handler, raw);
      }
    }
  } else ;
}
__name(createWatcher, "createWatcher");
__name2(createWatcher, "createWatcher");
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const {
    mixins: globalMixins,
    optionsCache: cache,
    config: { optionMergeStrategies }
  } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach(
        (m) => mergeOptions$1(resolved, m, optionMergeStrategies, true)
      );
    }
    mergeOptions$1(resolved, base, optionMergeStrategies);
  }
  if (isObject$3(base)) {
    cache.set(base, resolved);
  }
  return resolved;
}
__name(resolveMergedOptions, "resolveMergedOptions");
__name2(resolveMergedOptions, "resolveMergedOptions");
function mergeOptions$1(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions$1(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach(
      (m) => mergeOptions$1(to, m, strats, true)
    );
  }
  for (const key in from) {
    if (asMixin && key === "expose") ;
    else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
__name(mergeOptions$1, "mergeOptions$1");
__name2(mergeOptions$1, "mergeOptions$1");
var internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
  // objects
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  // lifecycle
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  // assets
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  // watch
  watch: mergeWatchOptions,
  // provide / inject
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function mergedDataFn() {
    return extend$1(
      isFunction$3(to) ? to.call(this, this) : to,
      isFunction$3(from) ? from.call(this, this) : from
    );
  }, "mergedDataFn"), "mergedDataFn");
}
__name(mergeDataFn, "mergeDataFn");
__name2(mergeDataFn, "mergeDataFn");
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
__name(mergeInject, "mergeInject");
__name2(mergeInject, "mergeInject");
function normalizeInject(raw) {
  if (isArray$4(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i];
    }
    return res;
  }
  return raw;
}
__name(normalizeInject, "normalizeInject");
__name2(normalizeInject, "normalizeInject");
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
__name(mergeAsArray, "mergeAsArray");
__name2(mergeAsArray, "mergeAsArray");
function mergeObjectOptions(to, from) {
  return to ? extend$1(/* @__PURE__ */ Object.create(null), to, from) : from;
}
__name(mergeObjectOptions, "mergeObjectOptions");
__name2(mergeObjectOptions, "mergeObjectOptions");
function mergeEmitsOrPropsOptions(to, from) {
  if (to) {
    if (isArray$4(to) && isArray$4(from)) {
      return [.../* @__PURE__ */ new Set([...to, ...from])];
    }
    return extend$1(
      /* @__PURE__ */ Object.create(null),
      normalizePropsOrEmits(to),
      normalizePropsOrEmits(from != null ? from : {})
    );
  } else {
    return from;
  }
}
__name(mergeEmitsOrPropsOptions, "mergeEmitsOrPropsOptions");
__name2(mergeEmitsOrPropsOptions, "mergeEmitsOrPropsOptions");
function mergeWatchOptions(to, from) {
  if (!to) return from;
  if (!from) return to;
  const merged = extend$1(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray(to[key], from[key]);
  }
  return merged;
}
__name(mergeWatchOptions, "mergeWatchOptions");
__name2(mergeWatchOptions, "mergeWatchOptions");
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
__name(createAppContext, "createAppContext");
__name2(createAppContext, "createAppContext");
var uid$1 = 0;
function createAppAPI(render2, hydrate) {
  return /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function createApp2(rootComponent, rootProps = null) {
    if (!isFunction$3(rootComponent)) {
      rootComponent = extend$1({}, rootComponent);
    }
    if (rootProps != null && !isObject$3(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new WeakSet();
    const pluginCleanupFns = [];
    let isMounted = false;
    const app = context.app = {
      _uid: uid$1++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config;
      },
      set config(v) {
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin)) ;
        else if (plugin && isFunction$3(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app, ...options);
        } else if (isFunction$3(plugin)) {
          installedPlugins.add(plugin);
          plugin(app, ...options);
        } else ;
        return app;
      },
      mixin(mixin) {
        {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin);
          }
        }
        return app;
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app;
      },
      mount(rootContainer, isHydrate, namespace) {
        if (!isMounted) {
          const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (namespace === true) {
            namespace = "svg";
          } else if (namespace === false) {
            namespace = void 0;
          }
          if (isHydrate && hydrate) {
            hydrate(vnode, rootContainer);
          } else {
            render2(vnode, rootContainer, namespace);
          }
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app__ = app;
          return getComponentPublicInstance(vnode.component);
        }
      },
      onUnmount(cleanupFn) {
        pluginCleanupFns.push(cleanupFn);
      },
      unmount() {
        if (isMounted) {
          callWithAsyncErrorHandling(
            pluginCleanupFns,
            app._instance,
            16
          );
          render2(null, app._container);
          delete app._container.__vue_app__;
        }
      },
      provide(key, value) {
        context.provides[key] = value;
        return app;
      },
      runWithContext(fn) {
        const lastApp = currentApp;
        currentApp = app;
        try {
          return fn();
        } finally {
          currentApp = lastApp;
        }
      }
    };
    return app;
  }, "createApp2"), "createApp");
}
__name(createAppAPI, "createAppAPI");
__name2(createAppAPI, "createAppAPI");
var currentApp = null;
function provide(key, value) {
  if (currentInstance) {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
__name(provide, "provide");
__name2(provide, "provide");
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = getCurrentInstance();
  if (instance || currentApp) {
    let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction$3(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    } else ;
  }
}
__name(inject, "inject");
__name2(inject, "inject");
var ssrContextKey = Symbol.for("v-scx");
var useSSRContext = /* @__PURE__ */ __name2(() => {
  {
    const ctx = inject(ssrContextKey);
    return ctx;
  }
}, "useSSRContext");
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
__name(watch, "watch");
__name2(watch, "watch");
function doWatch(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, flush, once } = options;
  const baseWatchOptions = extend$1({}, options);
  const runsImmediately = cb && immediate || !cb && flush !== "post";
  let ssrCleanup;
  if (isInSSRComponentSetup) {
    if (flush === "sync") {
      const ctx = useSSRContext();
      ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
    } else if (!runsImmediately) {
      const watchStopHandle = /* @__PURE__ */ __name2(() => {
      }, "watchStopHandle");
      watchStopHandle.stop = NOOP$2;
      watchStopHandle.resume = NOOP$2;
      watchStopHandle.pause = NOOP$2;
      return watchStopHandle;
    }
  }
  const instance = currentInstance;
  baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
  let isPre = false;
  if (flush === "post") {
    baseWatchOptions.scheduler = (job) => {
      queuePostRenderEffect(job, instance && instance.suspense);
    };
  } else if (flush !== "sync") {
    isPre = true;
    baseWatchOptions.scheduler = (job, isFirstRun) => {
      if (isFirstRun) {
        job();
      } else {
        queueJob(job);
      }
    };
  }
  baseWatchOptions.augmentJob = (job) => {
    if (cb) {
      job.flags |= 4;
    }
    if (isPre) {
      job.flags |= 2;
      if (instance) {
        job.id = instance.uid;
        job.i = instance;
      }
    }
  };
  const watchHandle = watch$1(source, cb, baseWatchOptions);
  if (isInSSRComponentSetup) {
    if (ssrCleanup) {
      ssrCleanup.push(watchHandle);
    } else if (runsImmediately) {
      watchHandle();
    }
  }
  return watchHandle;
}
__name(doWatch, "doWatch");
__name2(doWatch, "doWatch");
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString$3(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction$3(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const reset = setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  reset();
  return res;
}
__name(instanceWatch, "instanceWatch");
__name2(instanceWatch, "instanceWatch");
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]];
    }
    return cur;
  };
}
__name(createPathGetter, "createPathGetter");
__name2(createPathGetter, "createPathGetter");
var getModelModifiers = /* @__PURE__ */ __name2((props, modelName) => {
  return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize$1(modelName)}Modifiers`] || props[`${hyphenate$3(modelName)}Modifiers`];
}, "getModelModifiers");
function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted) return;
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modifiers = isModelListener2 && getModelModifiers(props, event.slice(7));
  if (modifiers) {
    if (modifiers.trim) {
      args = rawArgs.map((a) => isString$3(a) ? a.trim() : a);
    }
    if (modifiers.number) {
      args = rawArgs.map(looseToNumber);
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
  props[handlerName = toHandlerKey(camelize$1(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate$3(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(
      handler,
      instance,
      6,
      args
    );
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(
      onceHandler,
      instance,
      6,
      args
    );
  }
}
__name(emit, "emit");
__name2(emit, "emit");
var mixinEmitsCache = /* @__PURE__ */ new WeakMap();
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = asMixin ? mixinEmitsCache : appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction$3(comp)) {
    const extendEmits = /* @__PURE__ */ __name2((raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend$1(normalized, normalizedFromExtend);
      }
    }, "extendEmits");
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$3(comp)) {
      cache.set(comp, null);
    }
    return null;
  }
  if (isArray$4(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend$1(normalized, raw);
  }
  if (isObject$3(comp)) {
    cache.set(comp, normalized);
  }
  return normalized;
}
__name(normalizeEmitsOptions, "normalizeEmitsOptions");
__name2(normalizeEmitsOptions, "normalizeEmitsOptions");
function isEmitListener(options, key) {
  if (!options || !isOn$3(key)) {
    return false;
  }
  key = key.slice(2).replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate$3(key)) || hasOwn(options, key);
}
__name(isEmitListener, "isEmitListener");
__name2(isEmitListener, "isEmitListener");
function renderComponentRoot$2(instance) {
  const {
    type: Component,
    vnode,
    proxy,
    withProxy,
    propsOptions: [propsOptions],
    slots,
    attrs,
    emit: emit2,
    render: render2,
    renderCache,
    props,
    data,
    setupState,
    ctx,
    inheritAttrs
  } = instance;
  const prev = setCurrentRenderingInstance$2(instance);
  let result;
  let fallthroughAttrs;
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      const thisProxy = false ? new Proxy(proxyToUse, {
        get(target, key, receiver) {
          warn$1(
            `Property '${String(
              key
            )}' was accessed via 'this'. Avoid using 'this' in templates.`
          );
          return Reflect.get(target, key, receiver);
        }
      }) : proxyToUse;
      result = normalizeVNode$2(
        render2.call(
          thisProxy,
          proxyToUse,
          renderCache,
          false ? shallowReadonly(props) : props,
          setupState,
          data,
          ctx
        )
      );
      fallthroughAttrs = attrs;
    } else {
      const render22 = Component;
      if (false) ;
      result = normalizeVNode$2(
        render22.length > 1 ? render22(
          false ? shallowReadonly(props) : props,
          false ? {
            get attrs() {
              markAttrsAccessed();
              return shallowReadonly(attrs);
            },
            slots,
            emit: emit2
          } : { attrs, slots, emit: emit2 }
        ) : render22(
          false ? shallowReadonly(props) : props,
          null
        )
      );
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result = createVNode(Comment);
  }
  let root = result;
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root;
    if (keys.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys.some(isModelListener$1)) {
          fallthroughAttrs = filterModelListeners(
            fallthroughAttrs,
            propsOptions
          );
        }
        root = cloneVNode(root, fallthroughAttrs, false, true);
      }
    }
  }
  if (vnode.dirs) {
    root = cloneVNode(root, null, false, true);
    root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    setTransitionHooks(root, vnode.transition);
  }
  {
    result = root;
  }
  setCurrentRenderingInstance$2(prev);
  return result;
}
__name(renderComponentRoot$2, "renderComponentRoot$2");
__name2(renderComponentRoot$2, "renderComponentRoot$2");
var getFunctionalFallthrough = /* @__PURE__ */ __name2((attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn$3(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
}, "getFunctionalFallthrough");
var filterModelListeners = /* @__PURE__ */ __name2((attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener$1(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
}, "filterModelListeners");
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i = 0; i < dynamicProps.length; i++) {
        const key = dynamicProps[i];
        if (nextProps[key] !== prevProps[key] && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) {
        return true;
      }
    }
    if (prevProps === nextProps) {
      return false;
    }
    if (!prevProps) {
      return !!nextProps;
    }
    if (!nextProps) {
      return true;
    }
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
__name(shouldUpdateComponent, "shouldUpdateComponent");
__name2(shouldUpdateComponent, "shouldUpdateComponent");
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (nextProps[key] !== prevProps[key] && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
__name(hasPropsChanged, "hasPropsChanged");
__name2(hasPropsChanged, "hasPropsChanged");
function updateHOCHostEl({ vnode, parent }, el) {
  while (parent) {
    const root = parent.subTree;
    if (root.suspense && root.suspense.activeBranch === vnode) {
      root.el = vnode.el;
    }
    if (root === vnode) {
      (vnode = parent.vnode).el = el;
      parent = parent.parent;
    } else {
      break;
    }
  }
}
__name(updateHOCHostEl, "updateHOCHostEl");
__name2(updateHOCHostEl, "updateHOCHostEl");
var internalObjectProto = {};
var createInternalObject = /* @__PURE__ */ __name2(() => Object.create(internalObjectProto), "createInternalObject");
var isInternalObject = /* @__PURE__ */ __name2((obj) => Object.getPrototypeOf(obj) === internalObjectProto, "isInternalObject");
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = createInternalObject();
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  if (isStateful) {
    instance.props = isSSR ? props : shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
__name(initProps, "initProps");
__name2(initProps, "initProps");
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const {
    props,
    attrs,
    vnode: { patchFlag }
  } = instance;
  const rawCurrentProps = toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (optimized || patchFlag > 0) && !(patchFlag & 16)
  ) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize$1(key);
            props[camelizedKey] = resolvePropValue(
              options,
              rawCurrentProps,
              camelizedKey,
              value,
              instance,
              false
            );
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || // for camelCase
      !hasOwn(rawProps, key) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((kebabKey = hyphenate$3(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && // for camelCase
          (rawPrevProps[key] !== void 0 || // for kebab-case
          rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(
              options,
              rawCurrentProps,
              key,
              void 0,
              instance,
              true
            );
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance.attrs, "set", "");
  }
}
__name(updateProps, "updateProps");
__name2(updateProps, "updateProps");
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize$1(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue(
        options,
        rawCurrentProps,
        key,
        castValues[key],
        instance,
        !hasOwn(castValues, key)
      );
    }
  }
  return hasAttrsChanged;
}
__name(setFullProps, "setFullProps");
__name2(setFullProps, "setFullProps");
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && !opt.skipFactory && isFunction$3(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          const reset = setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(
            null,
            props
          );
          reset();
        }
      } else {
        value = defaultValue;
      }
      if (instance.ce) {
        instance.ce._setProp(key, value);
      }
    }
    if (opt[
      0
      /* shouldCast */
    ]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[
        1
        /* shouldCastTrue */
      ] && (value === "" || value === hyphenate$3(key))) {
        value = true;
      }
    }
  }
  return value;
}
__name(resolvePropValue, "resolvePropValue");
__name2(resolvePropValue, "resolvePropValue");
var mixinPropsCache = /* @__PURE__ */ new WeakMap();
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = asMixin ? mixinPropsCache : appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (!isFunction$3(comp)) {
    const extendProps = /* @__PURE__ */ __name2((raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend$1(normalized, props);
      if (keys) needCastKeys.push(...keys);
    }, "extendProps");
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$3(comp)) {
      cache.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray$4(raw)) {
    for (let i = 0; i < raw.length; i++) {
      const normalizedKey = camelize$1(raw[i]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    for (const key in raw) {
      const normalizedKey = camelize$1(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray$4(opt) || isFunction$3(opt) ? { type: opt } : extend$1({}, opt);
        const propType = prop.type;
        let shouldCast = false;
        let shouldCastTrue = true;
        if (isArray$4(propType)) {
          for (let index = 0; index < propType.length; ++index) {
            const type = propType[index];
            const typeName = isFunction$3(type) && type.name;
            if (typeName === "Boolean") {
              shouldCast = true;
              break;
            } else if (typeName === "String") {
              shouldCastTrue = false;
            }
          }
        } else {
          shouldCast = isFunction$3(propType) && propType.name === "Boolean";
        }
        prop[
          0
          /* shouldCast */
        ] = shouldCast;
        prop[
          1
          /* shouldCastTrue */
        ] = shouldCastTrue;
        if (shouldCast || hasOwn(prop, "default")) {
          needCastKeys.push(normalizedKey);
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject$3(comp)) {
    cache.set(comp, res);
  }
  return res;
}
__name(normalizePropsOptions, "normalizePropsOptions");
__name2(normalizePropsOptions, "normalizePropsOptions");
function validatePropName(key) {
  if (key[0] !== "$" && !isReservedProp(key)) {
    return true;
  }
  return false;
}
__name(validatePropName, "validatePropName");
__name2(validatePropName, "validatePropName");
var isInternalKey = /* @__PURE__ */ __name2((key) => key === "_" || key === "_ctx" || key === "$stable", "isInternalKey");
var normalizeSlotValue = /* @__PURE__ */ __name2((value) => isArray$4(value) ? value.map(normalizeVNode$2) : [normalizeVNode$2(value)], "normalizeSlotValue");
var normalizeSlot$1 = /* @__PURE__ */ __name2((key, rawSlot, ctx) => {
  if (rawSlot._n) {
    return rawSlot;
  }
  const normalized = withCtx((...args) => {
    if (false) ;
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
}, "normalizeSlot$1");
var normalizeObjectSlots = /* @__PURE__ */ __name2((rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key)) continue;
    const value = rawSlots[key];
    if (isFunction$3(value)) {
      slots[key] = normalizeSlot$1(key, value, ctx);
    } else if (value != null) {
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
}, "normalizeObjectSlots");
var normalizeVNodeSlots = /* @__PURE__ */ __name2((instance, children) => {
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
}, "normalizeVNodeSlots");
var assignSlots = /* @__PURE__ */ __name2((slots, children, optimized) => {
  for (const key in children) {
    if (optimized || !isInternalKey(key)) {
      slots[key] = children[key];
    }
  }
}, "assignSlots");
var initSlots = /* @__PURE__ */ __name2((instance, children, optimized) => {
  const slots = instance.slots = createInternalObject();
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      assignSlots(slots, children, optimized);
      if (optimized) {
        def(slots, "_", type, true);
      }
    } else {
      normalizeObjectSlots(children, slots);
    }
  } else if (children) {
    normalizeVNodeSlots(instance, children);
  }
}, "initSlots");
var updateSlots = /* @__PURE__ */ __name2((instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      if (optimized && type === 1) {
        needDeletionCheck = false;
      } else {
        assignSlots(slots, children, optimized);
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && deletionComparisonTarget[key] == null) {
        delete slots[key];
      }
    }
  }
}, "updateSlots");
var queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
__name(createRenderer, "createRenderer");
__name2(createRenderer, "createRenderer");
function createHydrationRenderer(options) {
  return baseCreateRenderer(options, createHydrationFunctions);
}
__name(createHydrationRenderer, "createHydrationRenderer");
__name2(createHydrationRenderer, "createHydrationRenderer");
function baseCreateRenderer(options, createHydrationFns) {
  const target = getGlobalThis$2();
  target.__VUE__ = true;
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP$2,
    insertStaticContent: hostInsertStaticContent
  } = options;
  const patch = /* @__PURE__ */ __name2((n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    const { type, ref: ref3, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, namespace);
        }
        break;
      case Fragment:
        processFragment(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        break;
      default:
        if (shapeFlag & 1) {
          processElement(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 6) {
          processComponent(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 64) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else if (shapeFlag & 128) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else ;
    }
    if (ref3 != null && parentComponent) {
      setRef(ref3, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    } else if (ref3 == null && n1 && n1.ref != null) {
      setRef(n1.ref, null, parentSuspense, n1, true);
    }
  }, "patch");
  const processText = /* @__PURE__ */ __name2((n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateText(n2.children),
        container,
        anchor
      );
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  }, "processText");
  const processCommentNode = /* @__PURE__ */ __name2((n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateComment(n2.children || ""),
        container,
        anchor
      );
    } else {
      n2.el = n1.el;
    }
  }, "processCommentNode");
  const mountStaticNode = /* @__PURE__ */ __name2((n2, container, anchor, namespace) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(
      n2.children,
      container,
      anchor,
      namespace,
      n2.el,
      n2.anchor
    );
  }, "mountStaticNode");
  const moveStaticNode = /* @__PURE__ */ __name2(({ el, anchor }, container, nextSibling) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next;
    }
    hostInsert(anchor, container, nextSibling);
  }, "moveStaticNode");
  const removeStaticNode = /* @__PURE__ */ __name2(({ el, anchor }) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostRemove(el);
      el = next;
    }
    hostRemove(anchor);
  }, "removeStaticNode");
  const processElement = /* @__PURE__ */ __name2((n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    if (n2.type === "svg") {
      namespace = "svg";
    } else if (n2.type === "math") {
      namespace = "mathml";
    }
    if (n1 == null) {
      mountElement(
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      const customElement = !!(n1.el && n1.el._isVueCE) ? n1.el : null;
      try {
        if (customElement) {
          customElement._beginPatch();
        }
        patchElement(
          n1,
          n2,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } finally {
        if (customElement) {
          customElement._endPatch();
        }
      }
    }
  }, "processElement");
  const mountElement = /* @__PURE__ */ __name2((vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { props, shapeFlag, transition, dirs } = vnode;
    el = vnode.el = hostCreateElement(
      vnode.type,
      namespace,
      props && props.is,
      props
    );
    if (shapeFlag & 8) {
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & 16) {
      mountChildren(
        vnode.children,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(vnode, namespace),
        slotScopeIds,
        optimized
      );
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "created");
    }
    setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    if (props) {
      for (const key in props) {
        if (key !== "value" && !isReservedProp(key)) {
          hostPatchProp(el, key, null, props[key], namespace, parentComponent);
        }
      }
      if ("value" in props) {
        hostPatchProp(el, "value", null, props.value, namespace);
      }
      if (vnodeHook = props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = needTransition(parentSuspense, transition);
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        needCallTransitionHooks && transition.enter(el);
        dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
      }, parentSuspense);
    }
  }, "mountElement");
  const setScopeId = /* @__PURE__ */ __name2((el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) {
      hostSetScopeId(el, scopeId);
    }
    if (slotScopeIds) {
      for (let i = 0; i < slotScopeIds.length; i++) {
        hostSetScopeId(el, slotScopeIds[i]);
      }
    }
    if (parentComponent) {
      let subTree = parentComponent.subTree;
      if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
        const parentVNode = parentComponent.vnode;
        setScopeId(
          el,
          parentVNode,
          parentVNode.scopeId,
          parentVNode.slotScopeIds,
          parentComponent.parent
        );
      }
    }
  }, "setScopeId");
  const mountChildren = /* @__PURE__ */ __name2((children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
    for (let i = start; i < children.length; i++) {
      const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode$2(children[i]);
      patch(
        null,
        child,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
  }, "mountChildren");
  const patchElement = /* @__PURE__ */ __name2((n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) {
      hostSetElementText(el, "");
    }
    if (dynamicChildren) {
      patchBlockChildren(
        n1.dynamicChildren,
        dynamicChildren,
        el,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds
      );
    } else if (!optimized) {
      patchChildren(
        n1,
        n2,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds,
        false
      );
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(el, oldProps, newProps, parentComponent, namespace);
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, namespace);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next = newProps[key];
            if (next !== prev || key === "value") {
              hostPatchProp(el, key, prev, next, namespace, parentComponent);
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(el, oldProps, newProps, parentComponent, namespace);
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  }, "patchElement");
  const patchBlockChildren = /* @__PURE__ */ __name2((oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      const container = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        oldVNode.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (oldVNode.type === Fragment || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !isSameVNodeType(oldVNode, newVNode) || // - In the case of a component, it could contain anything.
        oldVNode.shapeFlag & (6 | 64 | 128)) ? hostParentNode(oldVNode.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          fallbackContainer
        )
      );
      patch(
        oldVNode,
        newVNode,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        true
      );
    }
  }, "patchBlockChildren");
  const patchProps = /* @__PURE__ */ __name2((el, oldProps, newProps, parentComponent, namespace) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(
              el,
              key,
              oldProps[key],
              null,
              namespace,
              parentComponent
            );
          }
        }
      }
      for (const key in newProps) {
        if (isReservedProp(key)) continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(el, key, prev, next, namespace, parentComponent);
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
      }
    }
  }, "patchProps");
  const processFragment = /* @__PURE__ */ __name2((n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(
        // #10007
        // such fragment like `<></>` will be compiled into
        // a fragment which doesn't have a children.
        // In this case fallback to an empty array
        n2.children || [],
        container,
        fragmentEndAnchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && // #2715 the previous fragment could've been a BAILed one as a result
      // of renderSlot() with no valid children
      n1.dynamicChildren) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          container,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds
        );
        if (
          // #2080 if the stable fragment has a key, it's a <template v-for> that may
          //  get moved around. Make sure all root level vnodes inherit el.
          // #2134 or if it's a component root, it may also get moved around
          // as the component is being moved.
          n2.key != null || parentComponent && n2 === parentComponent.subTree
        ) {
          traverseStaticChildren(
            n1,
            n2,
            true
            /* shallow */
          );
        }
      } else {
        patchChildren(
          n1,
          n2,
          container,
          fragmentEndAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    }
  }, "processFragment");
  const processComponent = /* @__PURE__ */ __name2((n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(
          n2,
          container,
          anchor,
          namespace,
          optimized
        );
      } else {
        mountComponent(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          optimized
        );
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  }, "processComponent");
  const mountComponent = /* @__PURE__ */ __name2((initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
    const instance = initialVNode.component = createComponentInstance$2(
      initialVNode,
      parentComponent,
      parentSuspense
    );
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      setupComponent$2(instance, false, optimized);
    }
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized);
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
        initialVNode.placeholder = placeholder.el;
      }
    } else {
      setupRenderEffect(
        instance,
        initialVNode,
        container,
        anchor,
        parentSuspense,
        namespace,
        optimized
      );
    }
  }, "mountComponent");
  const updateComponent = /* @__PURE__ */ __name2((n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        updateComponentPreRender(instance, n2, optimized);
        return;
      } else {
        instance.next = n2;
        instance.update();
      }
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }, "updateComponent");
  const setupRenderEffect = /* @__PURE__ */ __name2((instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
    const componentUpdateFn = /* @__PURE__ */ __name2(() => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m, parent, root, type } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);
        if (el && hydrateNode) {
          const hydrateSubTree = /* @__PURE__ */ __name2(() => {
            instance.subTree = renderComponentRoot$2(instance);
            hydrateNode(
              el,
              instance.subTree,
              instance,
              parentSuspense,
              null
            );
          }, "hydrateSubTree");
          if (isAsyncWrapperVNode && type.__asyncHydrate) {
            type.__asyncHydrate(
              el,
              instance,
              hydrateSubTree
            );
          } else {
            hydrateSubTree();
          }
        } else {
          if (root.ce && // @ts-expect-error _def is private
          root.ce._def.shadowRoot !== false) {
            root.ce._injectChildStyle(type);
          }
          const subTree = instance.subTree = renderComponentRoot$2(instance);
          patch(
            null,
            subTree,
            container,
            anchor,
            instance,
            parentSuspense,
            namespace
          );
          initialVNode.el = subTree.el;
        }
        if (m) {
          queuePostRenderEffect(m, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode),
            parentSuspense
          );
        }
        if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        initialVNode = container = anchor = null;
      } else {
        let { next, bu, u, parent, vnode } = instance;
        {
          const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
          if (nonHydratedAsyncRoot) {
            if (next) {
              next.el = vnode.el;
              updateComponentPreRender(instance, next, optimized);
            }
            nonHydratedAsyncRoot.asyncDep.then(() => {
              if (!instance.isUnmounted) {
                componentUpdateFn();
              }
            });
            return;
          }
        }
        let originNext = next;
        let vnodeHook;
        toggleRecurse(instance, false);
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next, optimized);
        } else {
          next = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent, next, vnode);
        }
        toggleRecurse(instance, true);
        const nextTree = renderComponentRoot$2(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(
          prevTree,
          nextTree,
          // parent may have changed if it's in a teleport
          hostParentNode(prevTree.el),
          // anchor may have changed if it's in a fragment
          getNextHostNode(prevTree),
          instance,
          parentSuspense,
          namespace
        );
        next.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u) {
          queuePostRenderEffect(u, parentSuspense);
        }
        if (vnodeHook = next.props && next.props.onVnodeUpdated) {
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, next, vnode),
            parentSuspense
          );
        }
      }
    }, "componentUpdateFn");
    instance.scope.on();
    const effect2 = instance.effect = new ReactiveEffect(componentUpdateFn);
    instance.scope.off();
    const update = instance.update = effect2.run.bind(effect2);
    const job = instance.job = effect2.runIfDirty.bind(effect2);
    job.i = instance;
    job.id = instance.uid;
    effect2.scheduler = () => queueJob(job);
    toggleRecurse(instance, true);
    update();
  }, "setupRenderEffect");
  const updateComponentPreRender = /* @__PURE__ */ __name2((instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs(instance);
    resetTracking();
  }, "updateComponentPreRender");
  const patchChildren = /* @__PURE__ */ __name2((n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        }
      }
    }
  }, "patchChildren");
  const patchUnkeyedChildren = /* @__PURE__ */ __name2((c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode$2(c2[i]);
      patch(
        c1[i],
        nextChild,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
    if (oldLength > newLength) {
      unmountChildren(
        c1,
        parentComponent,
        parentSuspense,
        true,
        false,
        commonLength
      );
    } else {
      mountChildren(
        c2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized,
        commonLength
      );
    }
  }, "patchUnkeyedChildren");
  const patchKeyedChildren = /* @__PURE__ */ __name2((c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode$2(c2[i]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode$2(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(
            null,
            c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode$2(c2[i]),
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true);
        i++;
      }
    } else {
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode$2(c2[i]);
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(
            prevChild,
            c2[newIndex],
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchorVNode = c2[nextIndex + 1];
        const anchor = nextIndex + 1 < l2 ? (
          // #13559, fallback to el placeholder for unresolved async component
          anchorVNode.el || anchorVNode.placeholder
        ) : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(
            null,
            nextChild,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, 2);
          } else {
            j--;
          }
        }
      }
    }
  }, "patchKeyedChildren");
  const move = /* @__PURE__ */ __name2((vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type.move(vnode, container, anchor, internals);
      return;
    }
    if (type === Fragment) {
      hostInsert(el, container, anchor);
      for (let i = 0; i < children.length; i++) {
        move(children[i], container, anchor, moveType);
      }
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition2) {
      if (moveType === 0) {
        transition.beforeEnter(el);
        hostInsert(el, container, anchor);
        queuePostRenderEffect(() => transition.enter(el), parentSuspense);
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove22 = /* @__PURE__ */ __name2(() => {
          if (vnode.ctx.isUnmounted) {
            hostRemove(el);
          } else {
            hostInsert(el, container, anchor);
          }
        }, "remove22");
        const performLeave = /* @__PURE__ */ __name2(() => {
          if (el._isLeaving) {
            el[leaveCbKey](
              true
              /* cancelled */
            );
          }
          leave(el, () => {
            remove22();
            afterLeave && afterLeave();
          });
        }, "performLeave");
        if (delayLeave) {
          delayLeave(el, remove22, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  }, "move");
  const unmount = /* @__PURE__ */ __name2((vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const {
      type,
      props,
      ref: ref3,
      children,
      dynamicChildren,
      shapeFlag,
      patchFlag,
      dirs,
      cacheIndex
    } = vnode;
    if (patchFlag === -2) {
      optimized = false;
    }
    if (ref3 != null) {
      pauseTracking();
      setRef(ref3, null, parentSuspense, vnode, true);
      resetTracking();
    }
    if (cacheIndex != null) {
      parentComponent.renderCache[cacheIndex] = void 0;
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(
          vnode,
          parentComponent,
          parentSuspense,
          internals,
          doRemove
        );
      } else if (dynamicChildren && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !dynamicChildren.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(
          dynamicChildren,
          parentComponent,
          parentSuspense,
          false,
          true
        );
      } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove2(vnode);
      }
    }
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
      }, parentSuspense);
    }
  }, "unmount");
  const remove2 = /* @__PURE__ */ __name2((vnode) => {
    const { type, el, anchor, transition } = vnode;
    if (type === Fragment) {
      {
        removeFragment(el, anchor);
      }
      return;
    }
    if (type === Static) {
      removeStaticNode(vnode);
      return;
    }
    const performRemove = /* @__PURE__ */ __name2(() => {
      hostRemove(el);
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
    }, "performRemove");
    if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const performLeave = /* @__PURE__ */ __name2(() => leave(el, performRemove), "performLeave");
      if (delayLeave) {
        delayLeave(vnode.el, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  }, "remove2");
  const removeFragment = /* @__PURE__ */ __name2((cur, end) => {
    let next;
    while (cur !== end) {
      next = hostNextSibling(cur);
      hostRemove(cur);
      cur = next;
    }
    hostRemove(end);
  }, "removeFragment");
  const unmountComponent = /* @__PURE__ */ __name2((instance, parentSuspense, doRemove) => {
    const { bum, scope, job, subTree, um, m, a } = instance;
    invalidateMount(m);
    invalidateMount(a);
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (job) {
      job.flags |= 8;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
  }, "unmountComponent");
  const unmountChildren = /* @__PURE__ */ __name2((children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
    for (let i = start; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    }
  }, "unmountChildren");
  const getNextHostNode = /* @__PURE__ */ __name2((vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    const el = hostNextSibling(vnode.anchor || vnode.el);
    const teleportEnd = el && el[TeleportEndKey];
    return teleportEnd ? hostNextSibling(teleportEnd) : el;
  }, "getNextHostNode");
  let isFlushing = false;
  const render2 = /* @__PURE__ */ __name2((vnode, container, namespace) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
      }
    } else {
      patch(
        container._vnode || null,
        vnode,
        container,
        null,
        null,
        null,
        namespace
      );
    }
    container._vnode = vnode;
    if (!isFlushing) {
      isFlushing = true;
      flushPreFlushCbs();
      flushPostFlushCbs();
      isFlushing = false;
    }
  }, "render");
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove2,
    mt: mountComponent,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate;
  let hydrateNode;
  if (createHydrationFns) {
    [hydrate, hydrateNode] = createHydrationFns(
      internals
    );
  }
  return {
    render: render2,
    hydrate,
    createApp: createAppAPI(render2, hydrate)
  };
}
__name(baseCreateRenderer, "baseCreateRenderer");
__name2(baseCreateRenderer, "baseCreateRenderer");
function resolveChildrenNamespace({ type, props }, currentNamespace) {
  return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
}
__name(resolveChildrenNamespace, "resolveChildrenNamespace");
__name2(resolveChildrenNamespace, "resolveChildrenNamespace");
function toggleRecurse({ effect: effect2, job }, allowed) {
  if (allowed) {
    effect2.flags |= 32;
    job.flags |= 4;
  } else {
    effect2.flags &= -33;
    job.flags &= -5;
  }
}
__name(toggleRecurse, "toggleRecurse");
__name2(toggleRecurse, "toggleRecurse");
function needTransition(parentSuspense, transition) {
  return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
}
__name(needTransition, "needTransition");
__name2(needTransition, "needTransition");
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray$4(ch1) && isArray$4(ch2)) {
    for (let i = 0; i < ch1.length; i++) {
      const c1 = ch1[i];
      let c2 = ch2[i];
      if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
        if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
          c2 = ch2[i] = cloneIfMounted(ch2[i]);
          c2.el = c1.el;
        }
        if (!shallow && c2.patchFlag !== -2)
          traverseStaticChildren(c1, c2);
      }
      if (c2.type === Text && // avoid cached text nodes retaining detached dom nodes
      c2.patchFlag !== -1) {
        c2.el = c1.el;
      }
      if (c2.type === Comment && !c2.el) {
        c2.el = c1.el;
      }
    }
  }
}
__name(traverseStaticChildren, "traverseStaticChildren");
__name2(traverseStaticChildren, "traverseStaticChildren");
function getSequence(arr) {
  const p2 = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p2[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = u + v >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p2[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p2[v];
  }
  return result;
}
__name(getSequence, "getSequence");
__name2(getSequence, "getSequence");
function locateNonHydratedAsyncRoot(instance) {
  const subComponent = instance.subTree.component;
  if (subComponent) {
    if (subComponent.asyncDep && !subComponent.asyncResolved) {
      return subComponent;
    } else {
      return locateNonHydratedAsyncRoot(subComponent);
    }
  }
}
__name(locateNonHydratedAsyncRoot, "locateNonHydratedAsyncRoot");
__name2(locateNonHydratedAsyncRoot, "locateNonHydratedAsyncRoot");
function invalidateMount(hooks) {
  if (hooks) {
    for (let i = 0; i < hooks.length; i++)
      hooks[i].flags |= 8;
  }
}
__name(invalidateMount, "invalidateMount");
__name2(invalidateMount, "invalidateMount");
var isSuspense = /* @__PURE__ */ __name2((type) => type.__isSuspense, "isSuspense");
function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray$4(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}
__name(queueEffectWithSuspense, "queueEffectWithSuspense");
__name2(queueEffectWithSuspense, "queueEffectWithSuspense");
var Fragment = Symbol.for("v-fgt");
var Text = Symbol.for("v-txt");
var Comment = Symbol.for("v-cmt");
var Static = Symbol.for("v-stc");
var blockStack = [];
var currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
__name(openBlock, "openBlock");
__name2(openBlock, "openBlock");
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
__name(closeBlock, "closeBlock");
__name2(closeBlock, "closeBlock");
var isBlockTreeEnabled = 1;
function setBlockTracking(value, inVOnce = false) {
  isBlockTreeEnabled += value;
  if (value < 0 && currentBlock && inVOnce) {
    currentBlock.hasOnce = true;
  }
}
__name(setBlockTracking, "setBlockTracking");
__name2(setBlockTracking, "setBlockTracking");
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}
__name(setupBlock, "setupBlock");
__name2(setupBlock, "setupBlock");
function createBlock(type, props, children, patchFlag, dynamicProps) {
  return setupBlock(
    createVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      true
    )
  );
}
__name(createBlock, "createBlock");
__name2(createBlock, "createBlock");
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
__name(isVNode, "isVNode");
__name2(isVNode, "isVNode");
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
__name(isSameVNodeType, "isSameVNodeType");
__name2(isSameVNodeType, "isSameVNodeType");
var normalizeKey = /* @__PURE__ */ __name2(({ key }) => key != null ? key : null, "normalizeKey");
var normalizeRef = /* @__PURE__ */ __name2(({
  ref: ref3,
  ref_key,
  ref_for
}) => {
  if (typeof ref3 === "number") {
    ref3 = "" + ref3;
  }
  return ref3 != null ? isString$3(ref3) || isRef$2(ref3) || isFunction$3(ref3) ? { i: currentRenderingInstance, r: ref3, k: ref_key, f: !!ref_for } : ref3 : null;
}, "normalizeRef");
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) {
      type.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString$3(children) ? 8 : 16;
  }
  if (isBlockTreeEnabled > 0 && // avoid a block node from tracking itself
  !isBlockNode && // has current parent block
  currentBlock && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (vnode.patchFlag > 0 || shapeFlag & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
__name(createBaseVNode, "createBaseVNode");
__name2(createBaseVNode, "createBaseVNode");
var createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment;
  }
  if (isVNode(type)) {
    const cloned = cloneVNode(
      type,
      props,
      true
      /* mergeRef: true */
    );
    if (children) {
      normalizeChildren(cloned, children);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
      if (cloned.shapeFlag & 6) {
        currentBlock[currentBlock.indexOf(type)] = cloned;
      } else {
        currentBlock.push(cloned);
      }
    }
    cloned.patchFlag = -2;
    return cloned;
  }
  if (isClassComponent(type)) {
    type = type.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style } = props;
    if (klass && !isString$3(klass)) {
      props.class = normalizeClass$2(klass);
    }
    if (isObject$3(style)) {
      if (isProxy(style) && !isArray$4(style)) {
        style = extend$1({}, style);
      }
      props.style = normalizeStyle$2(style);
    }
  }
  const shapeFlag = isString$3(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject$3(type) ? 4 : isFunction$3(type) ? 2 : 0;
  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true
  );
}
__name(_createVNode, "_createVNode");
__name2(_createVNode, "_createVNode");
function guardReactiveProps(props) {
  if (!props) return null;
  return isProxy(props) || isInternalObject(props) ? extend$1({}, props) : props;
}
__name(guardReactiveProps, "guardReactiveProps");
__name2(guardReactiveProps, "guardReactiveProps");
function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
  const { props, ref: ref3, patchFlag, children, transition } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      mergeRef && ref3 ? isArray$4(ref3) ? ref3.concat(normalizeRef(extraProps)) : [ref3, normalizeRef(extraProps)] : normalizeRef(extraProps)
    ) : ref3,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children,
    target: vnode.target,
    targetStart: vnode.targetStart,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    placeholder: vnode.placeholder,
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
    ce: vnode.ce
  };
  if (transition && cloneTransition) {
    setTransitionHooks(
      cloned,
      transition.clone(cloned)
    );
  }
  return cloned;
}
__name(cloneVNode, "cloneVNode");
__name2(cloneVNode, "cloneVNode");
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text, null, text, flag);
}
__name(createTextVNode, "createTextVNode");
__name2(createTextVNode, "createTextVNode");
function normalizeVNode$2(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray$4(child)) {
    return createVNode(
      Fragment,
      null,
      // #3666, avoid reference pollution when reusing vnode
      child.slice()
    );
  } else if (isVNode(child)) {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}
__name(normalizeVNode$2, "normalizeVNode$2");
__name2(normalizeVNode$2, "normalizeVNode$2");
function cloneIfMounted(child) {
  return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
__name(cloneIfMounted, "cloneIfMounted");
__name2(cloneIfMounted, "cloneIfMounted");
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray$4(children)) {
    type = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type = 32;
      const slotFlag = children._;
      if (!slotFlag && !isInternalObject(children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction$3(children)) {
    children = { default: children, _ctx: currentRenderingInstance };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else {
      type = 8;
    }
  }
  vnode.children = children;
  vnode.shapeFlag |= type;
}
__name(normalizeChildren, "normalizeChildren");
__name2(normalizeChildren, "normalizeChildren");
function mergeProps(...args) {
  const ret = {};
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i];
    for (const key in toMerge) {
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass$2([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle$2([ret.style, toMerge.style]);
      } else if (isOn$3(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray$4(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
__name(mergeProps, "mergeProps");
__name2(mergeProps, "mergeProps");
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}
__name(invokeVNodeHook, "invokeVNodeHook");
__name2(invokeVNodeHook, "invokeVNodeHook");
var emptyAppContext = createAppContext();
var uid = 0;
function createComponentInstance$2(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new EffectScope(
      true
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    ids: parent ? parent.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: EMPTY_OBJ,
    // inheritAttrs
    inheritAttrs: type.inheritAttrs,
    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    // suspense related
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  {
    instance.ctx = { _: instance };
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
__name(createComponentInstance$2, "createComponentInstance$2");
__name2(createComponentInstance$2, "createComponentInstance$2");
var currentInstance = null;
var getCurrentInstance = /* @__PURE__ */ __name2(() => currentInstance || currentRenderingInstance, "getCurrentInstance");
var internalSetCurrentInstance;
var setInSSRSetupState;
{
  const g = getGlobalThis$2();
  const registerGlobalSetter = /* @__PURE__ */ __name2((key, setter) => {
    let setters;
    if (!(setters = g[key])) setters = g[key] = [];
    setters.push(setter);
    return (v) => {
      if (setters.length > 1) setters.forEach((set) => set(v));
      else setters[0](v);
    };
  }, "registerGlobalSetter");
  internalSetCurrentInstance = registerGlobalSetter(
    `__VUE_INSTANCE_SETTERS__`,
    (v) => currentInstance = v
  );
  setInSSRSetupState = registerGlobalSetter(
    `__VUE_SSR_SETTERS__`,
    (v) => isInSSRComponentSetup = v
  );
}
var setCurrentInstance = /* @__PURE__ */ __name2((instance) => {
  const prev = currentInstance;
  internalSetCurrentInstance(instance);
  instance.scope.on();
  return () => {
    instance.scope.off();
    internalSetCurrentInstance(prev);
  };
}, "setCurrentInstance");
var unsetCurrentInstance = /* @__PURE__ */ __name2(() => {
  currentInstance && currentInstance.scope.off();
  internalSetCurrentInstance(null);
}, "unsetCurrentInstance");
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
__name(isStatefulComponent, "isStatefulComponent");
__name2(isStatefulComponent, "isStatefulComponent");
var isInSSRComponentSetup = false;
function setupComponent$2(instance, isSSR = false, optimized = false) {
  isSSR && setInSSRSetupState(isSSR);
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children, optimized || isSSR);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isSSR && setInSSRSetupState(false);
  return setupResult;
}
__name(setupComponent$2, "setupComponent$2");
__name2(setupComponent$2, "setupComponent$2");
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
  const { setup } = Component;
  if (setup) {
    pauseTracking();
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    const reset = setCurrentInstance(instance);
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      0,
      [
        instance.props,
        setupContext
      ]
    );
    const isAsyncSetup = isPromise$2(setupResult);
    resetTracking();
    reset();
    if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) {
      markAsyncBoundary(instance);
    }
    if (isAsyncSetup) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          handleSetupResult(instance, resolvedResult);
        }).catch((e) => {
          handleError(e, instance, 0);
        });
      } else {
        instance.asyncDep = setupResult;
      }
    } else {
      handleSetupResult(instance, setupResult);
    }
  } else {
    finishComponentSetup(instance);
  }
}
__name(setupStatefulComponent, "setupStatefulComponent");
__name2(setupStatefulComponent, "setupStatefulComponent");
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction$3(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject$3(setupResult)) {
    instance.setupState = proxyRefs(setupResult);
  } else ;
  finishComponentSetup(instance);
}
__name(handleSetupResult, "handleSetupResult");
__name2(handleSetupResult, "handleSetupResult");
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    instance.render = Component.render || NOOP$2;
  }
  {
    const reset = setCurrentInstance(instance);
    pauseTracking();
    try {
      applyOptions(instance);
    } finally {
      resetTracking();
      reset();
    }
  }
}
__name(finishComponentSetup, "finishComponentSetup");
__name2(finishComponentSetup, "finishComponentSetup");
var attrsProxyHandlers = {
  get(target, key) {
    track(target, "get", "");
    return target[key];
  }
};
function createSetupContext(instance) {
  const expose = /* @__PURE__ */ __name2((exposed) => {
    instance.exposed = exposed || {};
  }, "expose");
  {
    return {
      attrs: new Proxy(instance.attrs, attrsProxyHandlers),
      slots: instance.slots,
      emit: instance.emit,
      expose
    };
  }
}
__name(createSetupContext, "createSetupContext");
__name2(createSetupContext, "createSetupContext");
function getComponentPublicInstance(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  } else {
    return instance.proxy;
  }
}
__name(getComponentPublicInstance, "getComponentPublicInstance");
__name2(getComponentPublicInstance, "getComponentPublicInstance");
function getComponentName(Component, includeInferred = true) {
  return isFunction$3(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
__name(getComponentName, "getComponentName");
__name2(getComponentName, "getComponentName");
function isClassComponent(value) {
  return isFunction$3(value) && "__vccOpts" in value;
}
__name(isClassComponent, "isClassComponent");
__name2(isClassComponent, "isClassComponent");
var computed = /* @__PURE__ */ __name2((getterOrOptions, debugOptions) => {
  const c = computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
  return c;
}, "computed");
function h(type, propsOrChildren, children) {
  try {
    setBlockTracking(-1);
    const l = arguments.length;
    if (l === 2) {
      if (isObject$3(propsOrChildren) && !isArray$4(propsOrChildren)) {
        if (isVNode(propsOrChildren)) {
          return createVNode(type, null, [propsOrChildren]);
        }
        return createVNode(type, propsOrChildren);
      } else {
        return createVNode(type, null, propsOrChildren);
      }
    } else {
      if (l > 3) {
        children = Array.prototype.slice.call(arguments, 2);
      } else if (l === 3 && isVNode(children)) {
        children = [children];
      }
      return createVNode(type, propsOrChildren, children);
    }
  } finally {
    setBlockTracking(1);
  }
}
__name(h, "h");
__name2(h, "h");
var version = "3.5.25";
var _ssrUtils = {
  createComponentInstance: createComponentInstance$2,
  setupComponent: setupComponent$2,
  renderComponentRoot: renderComponentRoot$2,
  setCurrentRenderingInstance: setCurrentRenderingInstance$2,
  isVNode,
  normalizeVNode: normalizeVNode$2
};
var ssrUtils = _ssrUtils;
// @__NO_SIDE_EFFECTS__
function makeMap$2(str) {
  const map = /* @__PURE__ */ Object.create(null);
  for (const key of str.split(",")) map[key] = 1;
  return (val) => val in map;
}
__name(makeMap$2, "makeMap$2");
__name2(makeMap$2, "makeMap$2");
var isOn$2 = /* @__PURE__ */ __name2((key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
(key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97), "isOn$2");
var isModelListener = /* @__PURE__ */ __name2((key) => key.startsWith("onUpdate:"), "isModelListener");
var extend = Object.assign;
var isArray$3 = Array.isArray;
var isSet$1 = /* @__PURE__ */ __name2((val) => toTypeString$1(val) === "[object Set]", "isSet$1");
var isDate = /* @__PURE__ */ __name2((val) => toTypeString$1(val) === "[object Date]", "isDate");
var isFunction$2 = /* @__PURE__ */ __name2((val) => typeof val === "function", "isFunction$2");
var isString$2 = /* @__PURE__ */ __name2((val) => typeof val === "string", "isString$2");
var isSymbol$1 = /* @__PURE__ */ __name2((val) => typeof val === "symbol", "isSymbol$1");
var isObject$2 = /* @__PURE__ */ __name2((val) => val !== null && typeof val === "object", "isObject$2");
var objectToString$1 = Object.prototype.toString;
var toTypeString$1 = /* @__PURE__ */ __name2((value) => objectToString$1.call(value), "toTypeString$1");
var cacheStringFunction$2 = /* @__PURE__ */ __name2((fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return ((str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  });
}, "cacheStringFunction$2");
var camelizeRE = /-\w/g;
var camelize = cacheStringFunction$2(
  (str) => {
    return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
  }
);
var hyphenateRE$2 = /\B([A-Z])/g;
var hyphenate$2 = cacheStringFunction$2(
  (str) => str.replace(hyphenateRE$2, "-$1").toLowerCase()
);
var capitalize = cacheStringFunction$2((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
var toNumber = /* @__PURE__ */ __name2((val) => {
  const n = isString$2(val) ? Number(val) : NaN;
  return isNaN(n) ? val : n;
}, "toNumber");
var specialBooleanAttrs$2 = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
var isSpecialBooleanAttr = /* @__PURE__ */ makeMap$2(specialBooleanAttrs$2);
function includeBooleanAttr$2(value) {
  return !!value || value === "";
}
__name(includeBooleanAttr$2, "includeBooleanAttr$2");
__name2(includeBooleanAttr$2, "includeBooleanAttr$2");
function looseCompareArrays(a, b) {
  if (a.length !== b.length) return false;
  let equal = true;
  for (let i = 0; equal && i < a.length; i++) {
    equal = looseEqual(a[i], b[i]);
  }
  return equal;
}
__name(looseCompareArrays, "looseCompareArrays");
__name2(looseCompareArrays, "looseCompareArrays");
function looseEqual(a, b) {
  if (a === b) return true;
  let aValidType = isDate(a);
  let bValidType = isDate(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a.getTime() === b.getTime() : false;
  }
  aValidType = isSymbol$1(a);
  bValidType = isSymbol$1(b);
  if (aValidType || bValidType) {
    return a === b;
  }
  aValidType = isArray$3(a);
  bValidType = isArray$3(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareArrays(a, b) : false;
  }
  aValidType = isObject$2(a);
  bValidType = isObject$2(b);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false;
    }
    const aKeysCount = Object.keys(a).length;
    const bKeysCount = Object.keys(b).length;
    if (aKeysCount !== bKeysCount) {
      return false;
    }
    for (const key in a) {
      const aHasKey = a.hasOwnProperty(key);
      const bHasKey = b.hasOwnProperty(key);
      if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) {
        return false;
      }
    }
  }
  return String(a) === String(b);
}
__name(looseEqual, "looseEqual");
__name2(looseEqual, "looseEqual");
function looseIndexOf(arr, val) {
  return arr.findIndex((item) => looseEqual(item, val));
}
__name(looseIndexOf, "looseIndexOf");
__name2(looseIndexOf, "looseIndexOf");
var policy = void 0;
var tt = typeof window !== "undefined" && window.trustedTypes;
if (tt) {
  try {
    policy = /* @__PURE__ */ tt.createPolicy("vue", {
      createHTML: /* @__PURE__ */ __name2((val) => val, "createHTML")
    });
  } catch (e) {
  }
}
var unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
var svgNS = "http://www.w3.org/2000/svg";
var mathmlNS = "http://www.w3.org/1998/Math/MathML";
var doc = typeof document !== "undefined" ? document : null;
var templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
var nodeOps = {
  insert: /* @__PURE__ */ __name2((child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  }, "insert"),
  remove: /* @__PURE__ */ __name2((child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  }, "remove"),
  createElement: /* @__PURE__ */ __name2((tag, namespace, is, props) => {
    const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  }, "createElement"),
  createText: /* @__PURE__ */ __name2((text) => doc.createTextNode(text), "createText"),
  createComment: /* @__PURE__ */ __name2((text) => doc.createComment(text), "createComment"),
  setText: /* @__PURE__ */ __name2((node, text) => {
    node.nodeValue = text;
  }, "setText"),
  setElementText: /* @__PURE__ */ __name2((el, text) => {
    el.textContent = text;
  }, "setElementText"),
  parentNode: /* @__PURE__ */ __name2((node) => node.parentNode, "parentNode"),
  nextSibling: /* @__PURE__ */ __name2((node) => node.nextSibling, "nextSibling"),
  querySelector: /* @__PURE__ */ __name2((selector) => doc.querySelector(selector), "querySelector"),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(content, parent, anchor, namespace, start, end) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start && (start === end || start.nextSibling)) {
      while (true) {
        parent.insertBefore(start.cloneNode(true), anchor);
        if (start === end || !(start = start.nextSibling)) break;
      }
    } else {
      templateContainer.innerHTML = unsafeToTrustedHTML(
        namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content
      );
      const template = templateContainer.content;
      if (namespace === "svg" || namespace === "mathml") {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      parent.insertBefore(template, anchor);
    }
    return [
      // first
      before ? before.nextSibling : parent.firstChild,
      // last
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};
var TRANSITION = "transition";
var ANIMATION = "animation";
var vtcKey = Symbol("_vtc");
var DOMTransitionPropsValidators = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: true
  },
  duration: [String, Number, Object],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String
};
var TransitionPropsValidators = /* @__PURE__ */ extend(
  {},
  BaseTransitionPropsValidators,
  DOMTransitionPropsValidators
);
var decorate$1 = /* @__PURE__ */ __name2((t) => {
  t.displayName = "Transition";
  t.props = TransitionPropsValidators;
  return t;
}, "decorate$1");
var Transition = /* @__PURE__ */ decorate$1(
  (props, { slots }) => h(BaseTransition, resolveTransitionProps(props), slots)
);
var callHook = /* @__PURE__ */ __name2((hook, args = []) => {
  if (isArray$3(hook)) {
    hook.forEach((h2) => h2(...args));
  } else if (hook) {
    hook(...args);
  }
}, "callHook");
var hasExplicitCallback = /* @__PURE__ */ __name2((hook) => {
  return hook ? isArray$3(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
}, "hasExplicitCallback");
function resolveTransitionProps(rawProps) {
  const baseProps = {};
  for (const key in rawProps) {
    if (!(key in DOMTransitionPropsValidators)) {
      baseProps[key] = rawProps[key];
    }
  }
  if (rawProps.css === false) {
    return baseProps;
  }
  const {
    name = "v",
    type,
    duration,
    enterFromClass = `${name}-enter-from`,
    enterActiveClass = `${name}-enter-active`,
    enterToClass = `${name}-enter-to`,
    appearFromClass = enterFromClass,
    appearActiveClass = enterActiveClass,
    appearToClass = enterToClass,
    leaveFromClass = `${name}-leave-from`,
    leaveActiveClass = `${name}-leave-active`,
    leaveToClass = `${name}-leave-to`
  } = rawProps;
  const durations = normalizeDuration(duration);
  const enterDuration = durations && durations[0];
  const leaveDuration = durations && durations[1];
  const {
    onBeforeEnter,
    onEnter,
    onEnterCancelled,
    onLeave,
    onLeaveCancelled,
    onBeforeAppear = onBeforeEnter,
    onAppear = onEnter,
    onAppearCancelled = onEnterCancelled
  } = baseProps;
  const finishEnter = /* @__PURE__ */ __name2((el, isAppear, done, isCancelled) => {
    el._enterCancelled = isCancelled;
    removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
    removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
    done && done();
  }, "finishEnter");
  const finishLeave = /* @__PURE__ */ __name2((el, done) => {
    el._isLeaving = false;
    removeTransitionClass(el, leaveFromClass);
    removeTransitionClass(el, leaveToClass);
    removeTransitionClass(el, leaveActiveClass);
    done && done();
  }, "finishLeave");
  const makeEnterHook = /* @__PURE__ */ __name2((isAppear) => {
    return (el, done) => {
      const hook = isAppear ? onAppear : onEnter;
      const resolve2 = /* @__PURE__ */ __name2(() => finishEnter(el, isAppear, done), "resolve");
      callHook(hook, [el, resolve2]);
      nextFrame(() => {
        removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
        addTransitionClass(el, isAppear ? appearToClass : enterToClass);
        if (!hasExplicitCallback(hook)) {
          whenTransitionEnds(el, type, enterDuration, resolve2);
        }
      });
    };
  }, "makeEnterHook");
  return extend(baseProps, {
    onBeforeEnter(el) {
      callHook(onBeforeEnter, [el]);
      addTransitionClass(el, enterFromClass);
      addTransitionClass(el, enterActiveClass);
    },
    onBeforeAppear(el) {
      callHook(onBeforeAppear, [el]);
      addTransitionClass(el, appearFromClass);
      addTransitionClass(el, appearActiveClass);
    },
    onEnter: makeEnterHook(false),
    onAppear: makeEnterHook(true),
    onLeave(el, done) {
      el._isLeaving = true;
      const resolve2 = /* @__PURE__ */ __name2(() => finishLeave(el, done), "resolve");
      addTransitionClass(el, leaveFromClass);
      if (!el._enterCancelled) {
        forceReflow(el);
        addTransitionClass(el, leaveActiveClass);
      } else {
        addTransitionClass(el, leaveActiveClass);
        forceReflow(el);
      }
      nextFrame(() => {
        if (!el._isLeaving) {
          return;
        }
        removeTransitionClass(el, leaveFromClass);
        addTransitionClass(el, leaveToClass);
        if (!hasExplicitCallback(onLeave)) {
          whenTransitionEnds(el, type, leaveDuration, resolve2);
        }
      });
      callHook(onLeave, [el, resolve2]);
    },
    onEnterCancelled(el) {
      finishEnter(el, false, void 0, true);
      callHook(onEnterCancelled, [el]);
    },
    onAppearCancelled(el) {
      finishEnter(el, true, void 0, true);
      callHook(onAppearCancelled, [el]);
    },
    onLeaveCancelled(el) {
      finishLeave(el);
      callHook(onLeaveCancelled, [el]);
    }
  });
}
__name(resolveTransitionProps, "resolveTransitionProps");
__name2(resolveTransitionProps, "resolveTransitionProps");
function normalizeDuration(duration) {
  if (duration == null) {
    return null;
  } else if (isObject$2(duration)) {
    return [NumberOf(duration.enter), NumberOf(duration.leave)];
  } else {
    const n = NumberOf(duration);
    return [n, n];
  }
}
__name(normalizeDuration, "normalizeDuration");
__name2(normalizeDuration, "normalizeDuration");
function NumberOf(val) {
  const res = toNumber(val);
  return res;
}
__name(NumberOf, "NumberOf");
__name2(NumberOf, "NumberOf");
function addTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.add(c));
  (el[vtcKey] || (el[vtcKey] = /* @__PURE__ */ new Set())).add(cls);
}
__name(addTransitionClass, "addTransitionClass");
__name2(addTransitionClass, "addTransitionClass");
function removeTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
  const _vtc = el[vtcKey];
  if (_vtc) {
    _vtc.delete(cls);
    if (!_vtc.size) {
      el[vtcKey] = void 0;
    }
  }
}
__name(removeTransitionClass, "removeTransitionClass");
__name2(removeTransitionClass, "removeTransitionClass");
function nextFrame(cb) {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
}
__name(nextFrame, "nextFrame");
__name2(nextFrame, "nextFrame");
var endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve2) {
  const id = el._endId = ++endId;
  const resolveIfNotStale = /* @__PURE__ */ __name2(() => {
    if (id === el._endId) {
      resolve2();
    }
  }, "resolveIfNotStale");
  if (explicitTimeout != null) {
    return setTimeout(resolveIfNotStale, explicitTimeout);
  }
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
  if (!type) {
    return resolve2();
  }
  const endEvent = type + "end";
  let ended = 0;
  const end = /* @__PURE__ */ __name2(() => {
    el.removeEventListener(endEvent, onEnd);
    resolveIfNotStale();
  }, "end");
  const onEnd = /* @__PURE__ */ __name2((e) => {
    if (e.target === el && ++ended >= propCount) {
      end();
    }
  }, "onEnd");
  setTimeout(() => {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(endEvent, onEnd);
}
__name(whenTransitionEnds, "whenTransitionEnds");
__name2(whenTransitionEnds, "whenTransitionEnds");
function getTransitionInfo(el, expectedType) {
  const styles = window.getComputedStyle(el);
  const getStyleProperties = /* @__PURE__ */ __name2((key) => (styles[key] || "").split(", "), "getStyleProperties");
  const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
  const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
  const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
  const animationTimeout = getTimeout(animationDelays, animationDurations);
  let type = null;
  let timeout = 0;
  let propCount = 0;
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
    propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
  }
  const hasTransform = type === TRANSITION && /\b(?:transform|all)(?:,|$)/.test(
    getStyleProperties(`${TRANSITION}Property`).toString()
  );
  return {
    type,
    timeout,
    propCount,
    hasTransform
  };
}
__name(getTransitionInfo, "getTransitionInfo");
__name2(getTransitionInfo, "getTransitionInfo");
function getTimeout(delays, durations) {
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }
  return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
}
__name(getTimeout, "getTimeout");
__name2(getTimeout, "getTimeout");
function toMs(s) {
  if (s === "auto") return 0;
  return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
}
__name(toMs, "toMs");
__name2(toMs, "toMs");
function forceReflow(el) {
  const targetDocument = el ? el.ownerDocument : document;
  return targetDocument.body.offsetHeight;
}
__name(forceReflow, "forceReflow");
__name2(forceReflow, "forceReflow");
function patchClass(el, value, isSVG) {
  const transitionClasses = el[vtcKey];
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}
__name(patchClass, "patchClass");
__name2(patchClass, "patchClass");
var vShowOriginalDisplay = Symbol("_vod");
var vShowHidden = Symbol("_vsh");
var CSS_VAR_TEXT = Symbol("");
var displayRE = /(?:^|;)\s*display\s*:/;
function patchStyle(el, prev, next) {
  const style = el.style;
  const isCssString = isString$2(next);
  let hasControlledDisplay = false;
  if (next && !isCssString) {
    if (prev) {
      if (!isString$2(prev)) {
        for (const key in prev) {
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      } else {
        for (const prevStyle of prev.split(";")) {
          const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      }
    }
    for (const key in next) {
      if (key === "display") {
        hasControlledDisplay = true;
      }
      setStyle(style, key, next[key]);
    }
  } else {
    if (isCssString) {
      if (prev !== next) {
        const cssVarText = style[CSS_VAR_TEXT];
        if (cssVarText) {
          next += ";" + cssVarText;
        }
        style.cssText = next;
        hasControlledDisplay = displayRE.test(next);
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
  }
  if (vShowOriginalDisplay in el) {
    el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
    if (el[vShowHidden]) {
      style.display = "none";
    }
  }
}
__name(patchStyle, "patchStyle");
__name2(patchStyle, "patchStyle");
var importantRE = /\s*!important$/;
function setStyle(style, name, val) {
  if (isArray$3(val)) {
    val.forEach((v) => setStyle(style, name, v));
  } else {
    if (val == null) val = "";
    if (name.startsWith("--")) {
      style.setProperty(name, val);
    } else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) {
        style.setProperty(
          hyphenate$2(prefixed),
          val.replace(importantRE, ""),
          "important"
        );
      } else {
        style[prefixed] = val;
      }
    }
  }
}
__name(setStyle, "setStyle");
__name2(setStyle, "setStyle");
var prefixes = ["Webkit", "Moz", "ms"];
var prefixCache = {};
function autoPrefix(style, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize$1(rawName);
  if (name !== "filter" && name in style) {
    return prefixCache[rawName] = name;
  }
  name = capitalize(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
__name(autoPrefix, "autoPrefix");
__name2(autoPrefix, "autoPrefix");
var xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance, isBoolean = isSpecialBooleanAttr(key)) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    if (value == null || isBoolean && !includeBooleanAttr$2(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(
        key,
        isBoolean ? "" : isSymbol$1(value) ? String(value) : value
      );
    }
  }
}
__name(patchAttr, "patchAttr");
__name2(patchAttr, "patchAttr");
function patchDOMProp(el, key, value, parentComponent, attrName) {
  if (key === "innerHTML" || key === "textContent") {
    if (value != null) {
      el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
    }
    return;
  }
  const tag = el.tagName;
  if (key === "value" && tag !== "PROGRESS" && // custom elements may use _value internally
  !tag.includes("-")) {
    const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
    const newValue = value == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      el.type === "checkbox" ? "on" : ""
    ) : String(value);
    if (oldValue !== newValue || !("_value" in el)) {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    el._value = value;
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      value = includeBooleanAttr$2(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
  }
  needRemove && el.removeAttribute(attrName || key);
}
__name(patchDOMProp, "patchDOMProp");
__name2(patchDOMProp, "patchDOMProp");
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
__name(addEventListener, "addEventListener");
__name2(addEventListener, "addEventListener");
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
__name(removeEventListener, "removeEventListener");
__name2(removeEventListener, "removeEventListener");
var veiKey = Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el[veiKey] || (el[veiKey] = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(
        nextValue,
        instance
      );
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
__name(patchEvent, "patchEvent");
__name2(patchEvent, "patchEvent");
var optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  if (optionsModifierRE.test(name)) {
    options = {};
    let m;
    while (m = name.match(optionsModifierRE)) {
      name = name.slice(0, name.length - m[0].length);
      options[m[0].toLowerCase()] = true;
    }
  }
  const event = name[2] === ":" ? name.slice(3) : hyphenate$2(name.slice(2));
  return [event, options];
}
__name(parseName, "parseName");
__name2(parseName, "parseName");
var cachedNow = 0;
var p = /* @__PURE__ */ Promise.resolve();
var getNow = /* @__PURE__ */ __name2(() => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now()), "getNow");
function createInvoker(initialValue, instance) {
  const invoker = /* @__PURE__ */ __name2((e) => {
    if (!e._vts) {
      e._vts = Date.now();
    } else if (e._vts <= invoker.attached) {
      return;
    }
    callWithAsyncErrorHandling(
      patchStopImmediatePropagation(e, invoker.value),
      instance,
      5,
      [e]
    );
  }, "invoker");
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}
__name(createInvoker, "createInvoker");
__name2(createInvoker, "createInvoker");
function patchStopImmediatePropagation(e, value) {
  if (isArray$3(value)) {
    const originalStop = e.stopImmediatePropagation;
    e.stopImmediatePropagation = () => {
      originalStop.call(e);
      e._stopped = true;
    };
    return value.map(
      (fn) => (e2) => !e2._stopped && fn && fn(e2)
    );
  } else {
    return value;
  }
}
__name(patchStopImmediatePropagation, "patchStopImmediatePropagation");
__name2(patchStopImmediatePropagation, "patchStopImmediatePropagation");
var isNativeOn = /* @__PURE__ */ __name2((key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // lowercase letter
key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123, "isNativeOn");
var patchProp = /* @__PURE__ */ __name2((el, key, prevValue, nextValue, namespace, parentComponent) => {
  const isSVG = namespace === "svg";
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn$2(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(el, key, nextValue);
    if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) {
      patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
    }
  } else if (
    // #11081 force set props for possible async custom element
    el._isVueCE && (/[A-Z]/.test(key) || !isString$2(nextValue))
  ) {
    patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
}, "patchProp");
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && isNativeOn(key) && isFunction$2(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") {
    return false;
  }
  if (key === "sandbox" && el.tagName === "IFRAME") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (key === "width" || key === "height") {
    const tag = el.tagName;
    if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") {
      return false;
    }
  }
  if (isNativeOn(key) && isString$2(value)) {
    return false;
  }
  return key in el;
}
__name(shouldSetAsProp, "shouldSetAsProp");
__name2(shouldSetAsProp, "shouldSetAsProp");
var vModelText = {};
var vModelCheckbox = {};
var vModelRadio = {};
function initVModelForSSR() {
  vModelText.getSSRProps = ({ value }) => ({ value });
  vModelRadio.getSSRProps = ({ value }, vnode) => {
    if (vnode.props && looseEqual(vnode.props.value, value)) {
      return { checked: true };
    }
  };
  vModelCheckbox.getSSRProps = ({ value }, vnode) => {
    if (isArray$3(value)) {
      if (vnode.props && looseIndexOf(value, vnode.props.value) > -1) {
        return { checked: true };
      }
    } else if (isSet$1(value)) {
      if (vnode.props && value.has(vnode.props.value)) {
        return { checked: true };
      }
    } else if (value) {
      return { checked: true };
    }
  };
}
__name(initVModelForSSR, "initVModelForSSR");
__name2(initVModelForSSR, "initVModelForSSR");
var rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
var renderer;
var enabledHydration = false;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
__name(ensureRenderer, "ensureRenderer");
__name2(ensureRenderer, "ensureRenderer");
function ensureHydrationRenderer() {
  renderer = enabledHydration ? renderer : createHydrationRenderer(rendererOptions);
  enabledHydration = true;
  return renderer;
}
__name(ensureHydrationRenderer, "ensureHydrationRenderer");
__name2(ensureHydrationRenderer, "ensureHydrationRenderer");
var createApp$1 = /* @__PURE__ */ __name2(((...args) => {
  const app = ensureRenderer().createApp(...args);
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container) return;
    const component = app._component;
    if (!isFunction$2(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    if (container.nodeType === 1) {
      container.textContent = "";
    }
    const proxy = mount(container, false, resolveRootNamespace(container));
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app;
}), "createApp$1");
var createSSRApp = /* @__PURE__ */ __name2(((...args) => {
  const app = ensureHydrationRenderer().createApp(...args);
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (container) {
      return mount(container, true, resolveRootNamespace(container));
    }
  };
  return app;
}), "createSSRApp");
function resolveRootNamespace(container) {
  if (container instanceof SVGElement) {
    return "svg";
  }
  if (typeof MathMLElement === "function" && container instanceof MathMLElement) {
    return "mathml";
  }
}
__name(resolveRootNamespace, "resolveRootNamespace");
__name2(resolveRootNamespace, "resolveRootNamespace");
function normalizeContainer(container) {
  if (isString$2(container)) {
    const res = document.querySelector(container);
    return res;
  }
  return container;
}
__name(normalizeContainer, "normalizeContainer");
__name2(normalizeContainer, "normalizeContainer");
var ssrDirectiveInitialized = false;
var initDirectivesForSSR = /* @__PURE__ */ __name2(() => {
  if (!ssrDirectiveInitialized) {
    ssrDirectiveInitialized = true;
    initVModelForSSR();
  }
}, "initDirectivesForSSR");
// @__NO_SIDE_EFFECTS__
function makeMap$1(str) {
  const map = /* @__PURE__ */ Object.create(null);
  for (const key of str.split(",")) map[key] = 1;
  return (val) => val in map;
}
__name(makeMap$1, "makeMap$1");
__name2(makeMap$1, "makeMap$1");
var NOOP$1 = /* @__PURE__ */ __name2(() => {
}, "NOOP$1");
var isOn$1 = /* @__PURE__ */ __name2((key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
(key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97), "isOn$1");
var isArray$2 = Array.isArray;
var isFunction$1 = /* @__PURE__ */ __name2((val) => typeof val === "function", "isFunction$1");
var isString$1 = /* @__PURE__ */ __name2((val) => typeof val === "string", "isString$1");
var isObject$1 = /* @__PURE__ */ __name2((val) => val !== null && typeof val === "object", "isObject$1");
var isPromise$1 = /* @__PURE__ */ __name2((val) => {
  return (isObject$1(val) || isFunction$1(val)) && isFunction$1(val.then) && isFunction$1(val.catch);
}, "isPromise$1");
var cacheStringFunction$1 = /* @__PURE__ */ __name2((fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return ((str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  });
}, "cacheStringFunction$1");
var hyphenateRE$1 = /\B([A-Z])/g;
var hyphenate$1 = cacheStringFunction$1(
  (str) => str.replace(hyphenateRE$1, "-$1").toLowerCase()
);
var _globalThis$1;
var getGlobalThis$1 = /* @__PURE__ */ __name2(() => {
  return _globalThis$1 || (_globalThis$1 = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
}, "getGlobalThis$1");
function normalizeStyle$1(value) {
  if (isArray$2(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString$1(item) ? parseStringStyle$1(item) : normalizeStyle$1(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString$1(value) || isObject$1(value)) {
    return value;
  }
}
__name(normalizeStyle$1, "normalizeStyle$1");
__name2(normalizeStyle$1, "normalizeStyle$1");
var listDelimiterRE$1 = /;(?![^(]*\))/g;
var propertyDelimiterRE$1 = /:([^]+)/;
var styleCommentRE$1 = /\/\*[^]*?\*\//g;
function parseStringStyle$1(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE$1, "").split(listDelimiterRE$1).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE$1);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
__name(parseStringStyle$1, "parseStringStyle$1");
__name2(parseStringStyle$1, "parseStringStyle$1");
function stringifyStyle$1(styles) {
  if (!styles) return "";
  if (isString$1(styles)) return styles;
  let ret = "";
  for (const key in styles) {
    const value = styles[key];
    if (isString$1(value) || typeof value === "number") {
      const normalizedKey = key.startsWith(`--`) ? key : hyphenate$1(key);
      ret += `${normalizedKey}:${value};`;
    }
  }
  return ret;
}
__name(stringifyStyle$1, "stringifyStyle$1");
__name2(stringifyStyle$1, "stringifyStyle$1");
function normalizeClass$1(value) {
  let res = "";
  if (isString$1(value)) {
    res = value;
  } else if (isArray$2(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass$1(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject$1(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
__name(normalizeClass$1, "normalizeClass$1");
__name2(normalizeClass$1, "normalizeClass$1");
var SVG_TAGS$1 = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view";
var VOID_TAGS$1 = "area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr";
var isSVGTag$1 = /* @__PURE__ */ makeMap$1(SVG_TAGS$1);
var isVoidTag$1 = /* @__PURE__ */ makeMap$1(VOID_TAGS$1);
var specialBooleanAttrs$1 = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
var isBooleanAttr$1 = /* @__PURE__ */ makeMap$1(
  specialBooleanAttrs$1 + `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,inert,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`
);
function includeBooleanAttr$1(value) {
  return !!value || value === "";
}
__name(includeBooleanAttr$1, "includeBooleanAttr$1");
__name2(includeBooleanAttr$1, "includeBooleanAttr$1");
var unsafeAttrCharRE$1 = /[>/="'\u0009\u000a\u000c\u0020]/;
var attrValidationCache$1 = {};
function isSSRSafeAttrName$1(name) {
  if (attrValidationCache$1.hasOwnProperty(name)) {
    return attrValidationCache$1[name];
  }
  const isUnsafe = unsafeAttrCharRE$1.test(name);
  if (isUnsafe) {
    console.error(`unsafe attribute name: ${name}`);
  }
  return attrValidationCache$1[name] = !isUnsafe;
}
__name(isSSRSafeAttrName$1, "isSSRSafeAttrName$1");
__name2(isSSRSafeAttrName$1, "isSSRSafeAttrName$1");
var propsToAttrMap$1 = {
  acceptCharset: "accept-charset",
  className: "class",
  htmlFor: "for",
  httpEquiv: "http-equiv"
};
function isRenderableAttrValue$1(value) {
  if (value == null) {
    return false;
  }
  const type = typeof value;
  return type === "string" || type === "number" || type === "boolean";
}
__name(isRenderableAttrValue$1, "isRenderableAttrValue$1");
__name2(isRenderableAttrValue$1, "isRenderableAttrValue$1");
var escapeRE$1 = /["'&<>]/;
function escapeHtml$1(string) {
  const str = "" + string;
  const match2 = escapeRE$1.exec(str);
  if (!match2) {
    return str;
  }
  let html = "";
  let escaped;
  let index;
  let lastIndex = 0;
  for (index = match2.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34:
        escaped = "&quot;";
        break;
      case 38:
        escaped = "&amp;";
        break;
      case 39:
        escaped = "&#39;";
        break;
      case 60:
        escaped = "&lt;";
        break;
      case 62:
        escaped = "&gt;";
        break;
      default:
        continue;
    }
    if (lastIndex !== index) {
      html += str.slice(lastIndex, index);
    }
    lastIndex = index + 1;
    html += escaped;
  }
  return lastIndex !== index ? html + str.slice(lastIndex, index) : html;
}
__name(escapeHtml$1, "escapeHtml$1");
__name2(escapeHtml$1, "escapeHtml$1");
var commentStripRE$1 = /^-?>|<!--|-->|--!>|<!-$/g;
function escapeHtmlComment$1(src) {
  return src.replace(commentStripRE$1, "");
}
__name(escapeHtmlComment$1, "escapeHtmlComment$1");
__name2(escapeHtmlComment$1, "escapeHtmlComment$1");
function normalizeCssVarValue$1(value) {
  if (value == null) {
    return "initial";
  }
  if (typeof value === "string") {
    return value === "" ? " " : value;
  }
  return String(value);
}
__name(normalizeCssVarValue$1, "normalizeCssVarValue$1");
__name2(normalizeCssVarValue$1, "normalizeCssVarValue$1");
var shouldIgnoreProp$1 = /* @__PURE__ */ makeMap$1(
  `,key,ref,innerHTML,textContent,ref_key,ref_for`
);
function ssrRenderAttrs$1(props, tag) {
  let ret = "";
  for (let key in props) {
    if (shouldIgnoreProp$1(key) || isOn$1(key) || tag === "textarea" && key === "value" || // force as property (not rendered in SSR)
    key.startsWith(".")) {
      continue;
    }
    const value = props[key];
    if (key.startsWith("^")) key = key.slice(1);
    if (key === "class" || key === "className") {
      ret += ` class="${ssrRenderClass$1(value)}"`;
    } else if (key === "style") {
      ret += ` style="${ssrRenderStyle$1(value)}"`;
    } else {
      ret += ssrRenderDynamicAttr$1(key, value, tag);
    }
  }
  return ret;
}
__name(ssrRenderAttrs$1, "ssrRenderAttrs$1");
__name2(ssrRenderAttrs$1, "ssrRenderAttrs$1");
function ssrRenderDynamicAttr$1(key, value, tag) {
  if (!isRenderableAttrValue$1(value)) {
    return ``;
  }
  const attrKey = tag && (tag.indexOf("-") > 0 || isSVGTag$1(tag)) ? key : propsToAttrMap$1[key] || key.toLowerCase();
  if (isBooleanAttr$1(attrKey)) {
    return includeBooleanAttr$1(value) ? ` ${attrKey}` : ``;
  } else if (isSSRSafeAttrName$1(attrKey)) {
    return value === "" ? ` ${attrKey}` : ` ${attrKey}="${escapeHtml$1(value)}"`;
  } else {
    console.warn(
      `[@vue/server-renderer] Skipped rendering unsafe attribute name: ${attrKey}`
    );
    return ``;
  }
}
__name(ssrRenderDynamicAttr$1, "ssrRenderDynamicAttr$1");
__name2(ssrRenderDynamicAttr$1, "ssrRenderDynamicAttr$1");
function ssrRenderClass$1(raw) {
  return escapeHtml$1(normalizeClass$1(raw));
}
__name(ssrRenderClass$1, "ssrRenderClass$1");
__name2(ssrRenderClass$1, "ssrRenderClass$1");
function ssrRenderStyle$1(raw) {
  if (!raw) {
    return "";
  }
  if (isString$1(raw)) {
    return escapeHtml$1(raw);
  }
  const styles = normalizeStyle$1(ssrResetCssVars$1(raw));
  return escapeHtml$1(stringifyStyle$1(styles));
}
__name(ssrRenderStyle$1, "ssrRenderStyle$1");
__name2(ssrRenderStyle$1, "ssrRenderStyle$1");
function ssrResetCssVars$1(raw) {
  if (!isArray$2(raw) && isObject$1(raw)) {
    const res = {};
    for (const key in raw) {
      if (key.startsWith(":--")) {
        res[key.slice(1)] = normalizeCssVarValue$1(raw[key]);
      } else {
        res[key] = raw[key];
      }
    }
    return res;
  }
  return raw;
}
__name(ssrResetCssVars$1, "ssrResetCssVars$1");
__name2(ssrResetCssVars$1, "ssrResetCssVars$1");
function ssrRenderTeleport$1(parentPush, contentRenderFn, target, disabled, parentComponent) {
  parentPush("<!--teleport start-->");
  const context = parentComponent.appContext.provides[ssrContextKey];
  const teleportBuffers = context.__teleportBuffers || (context.__teleportBuffers = {});
  const targetBuffer = teleportBuffers[target] || (teleportBuffers[target] = []);
  const bufferIndex = targetBuffer.length;
  let teleportContent;
  if (disabled) {
    contentRenderFn(parentPush);
    teleportContent = `<!--teleport start anchor--><!--teleport anchor-->`;
  } else {
    const { getBuffer, push } = createBuffer$1();
    push(`<!--teleport start anchor-->`);
    contentRenderFn(push);
    push(`<!--teleport anchor-->`);
    teleportContent = getBuffer();
  }
  targetBuffer.splice(bufferIndex, 0, teleportContent);
  parentPush("<!--teleport end-->");
}
__name(ssrRenderTeleport$1, "ssrRenderTeleport$1");
__name2(ssrRenderTeleport$1, "ssrRenderTeleport$1");
{
  const g = getGlobalThis$1();
  const registerGlobalSetter = /* @__PURE__ */ __name2((key, setter) => {
    let setters;
    if (!(setters = g[key])) setters = g[key] = [];
    setters.push(setter);
    return (v) => {
      if (setters.length > 1) setters.forEach((set) => set(v));
      else setters[0](v);
    };
  }, "registerGlobalSetter");
  registerGlobalSetter(
    `__VUE_INSTANCE_SETTERS__`,
    (v) => v
  );
  registerGlobalSetter(
    `__VUE_SSR_SETTERS__`,
    (v) => v
  );
}
function ssrCompile$1(template, instance) {
  {
    throw new Error(
      `On-the-fly template compilation is not supported in the ESM build of @vue/server-renderer. All templates must be pre-compiled into render functions.`
    );
  }
}
__name(ssrCompile$1, "ssrCompile$1");
__name2(ssrCompile$1, "ssrCompile$1");
var {
  createComponentInstance: createComponentInstance$1,
  setCurrentRenderingInstance: setCurrentRenderingInstance$1,
  setupComponent: setupComponent$1,
  renderComponentRoot: renderComponentRoot$1,
  normalizeVNode: normalizeVNode$1
} = ssrUtils;
function createBuffer$1() {
  let appendable = false;
  const buffer2 = [];
  return {
    getBuffer() {
      return buffer2;
    },
    push(item) {
      const isStringItem = isString$1(item);
      if (appendable && isStringItem) {
        buffer2[buffer2.length - 1] += item;
        return;
      }
      buffer2.push(item);
      appendable = isStringItem;
      if (isPromise$1(item) || isArray$2(item) && item.hasAsync) {
        buffer2.hasAsync = true;
      }
    }
  };
}
__name(createBuffer$1, "createBuffer$1");
__name2(createBuffer$1, "createBuffer$1");
function renderComponentVNode$1(vnode, parentComponent = null, slotScopeId) {
  const instance = vnode.component = createComponentInstance$1(
    vnode,
    parentComponent,
    null
  );
  const res = setupComponent$1(
    instance,
    true
    /* isSSR */
  );
  const hasAsyncSetup = isPromise$1(res);
  let prefetches = instance.sp;
  if (hasAsyncSetup || prefetches) {
    const p2 = Promise.resolve(res).then(() => {
      if (hasAsyncSetup) prefetches = instance.sp;
      if (prefetches) {
        return Promise.all(
          prefetches.map((prefetch) => prefetch.call(instance.proxy))
        );
      }
    }).catch(NOOP$1);
    return p2.then(() => renderComponentSubTree$1(instance, slotScopeId));
  } else {
    return renderComponentSubTree$1(instance, slotScopeId);
  }
}
__name(renderComponentVNode$1, "renderComponentVNode$1");
__name2(renderComponentVNode$1, "renderComponentVNode$1");
function renderComponentSubTree$1(instance, slotScopeId) {
  const comp = instance.type;
  const { getBuffer, push } = createBuffer$1();
  if (isFunction$1(comp)) {
    let root = renderComponentRoot$1(instance);
    if (!comp.props) {
      for (const key in instance.attrs) {
        if (key.startsWith(`data-v-`)) {
          (root.props || (root.props = {}))[key] = ``;
        }
      }
    }
    renderVNode$1(push, instance.subTree = root, instance, slotScopeId);
  } else {
    if ((!instance.render || instance.render === NOOP$1) && !instance.ssrRender && !comp.ssrRender && isString$1(comp.template)) {
      comp.ssrRender = ssrCompile$1(comp.template);
    }
    const ssrRender = instance.ssrRender || comp.ssrRender;
    if (ssrRender) {
      let attrs = instance.inheritAttrs !== false ? instance.attrs : void 0;
      let hasCloned = false;
      let cur = instance;
      while (true) {
        const scopeId = cur.vnode.scopeId;
        if (scopeId) {
          if (!hasCloned) {
            attrs = { ...attrs };
            hasCloned = true;
          }
          attrs[scopeId] = "";
        }
        const parent = cur.parent;
        if (parent && parent.subTree && parent.subTree === cur.vnode) {
          cur = parent;
        } else {
          break;
        }
      }
      if (slotScopeId) {
        if (!hasCloned) attrs = { ...attrs };
        const slotScopeIdList = slotScopeId.trim().split(" ");
        for (let i = 0; i < slotScopeIdList.length; i++) {
          attrs[slotScopeIdList[i]] = "";
        }
      }
      const prev = setCurrentRenderingInstance$1(instance);
      try {
        ssrRender(
          instance.proxy,
          push,
          instance,
          attrs,
          // compiler-optimized bindings
          instance.props,
          instance.setupState,
          instance.data,
          instance.ctx
        );
      } finally {
        setCurrentRenderingInstance$1(prev);
      }
    } else if (instance.render && instance.render !== NOOP$1) {
      renderVNode$1(
        push,
        instance.subTree = renderComponentRoot$1(instance),
        instance,
        slotScopeId
      );
    } else {
      comp.name || comp.__file || `<Anonymous>`;
      push(`<!---->`);
    }
  }
  return getBuffer();
}
__name(renderComponentSubTree$1, "renderComponentSubTree$1");
__name2(renderComponentSubTree$1, "renderComponentSubTree$1");
function renderVNode$1(push, vnode, parentComponent, slotScopeId) {
  const { type, shapeFlag, children, dirs, props } = vnode;
  if (dirs) {
    vnode.props = applySSRDirectives$1(vnode, props, dirs);
  }
  switch (type) {
    case Text:
      push(escapeHtml$1(children));
      break;
    case Comment:
      push(
        children ? `<!--${escapeHtmlComment$1(children)}-->` : `<!---->`
      );
      break;
    case Static:
      push(children);
      break;
    case Fragment:
      if (vnode.slotScopeIds) {
        slotScopeId = (slotScopeId ? slotScopeId + " " : "") + vnode.slotScopeIds.join(" ");
      }
      push(`<!--[-->`);
      renderVNodeChildren$1(
        push,
        children,
        parentComponent,
        slotScopeId
      );
      push(`<!--]-->`);
      break;
    default:
      if (shapeFlag & 1) {
        renderElementVNode$1(push, vnode, parentComponent, slotScopeId);
      } else if (shapeFlag & 6) {
        push(renderComponentVNode$1(vnode, parentComponent, slotScopeId));
      } else if (shapeFlag & 64) {
        renderTeleportVNode$1(push, vnode, parentComponent, slotScopeId);
      } else if (shapeFlag & 128) {
        renderVNode$1(push, vnode.ssContent, parentComponent, slotScopeId);
      } else ;
  }
}
__name(renderVNode$1, "renderVNode$1");
__name2(renderVNode$1, "renderVNode$1");
function renderVNodeChildren$1(push, children, parentComponent, slotScopeId) {
  for (let i = 0; i < children.length; i++) {
    renderVNode$1(push, normalizeVNode$1(children[i]), parentComponent, slotScopeId);
  }
}
__name(renderVNodeChildren$1, "renderVNodeChildren$1");
__name2(renderVNodeChildren$1, "renderVNodeChildren$1");
function renderElementVNode$1(push, vnode, parentComponent, slotScopeId) {
  const tag = vnode.type;
  let { props, children, shapeFlag, scopeId } = vnode;
  let openTag = `<${tag}`;
  if (props) {
    openTag += ssrRenderAttrs$1(props, tag);
  }
  if (scopeId) {
    openTag += ` ${scopeId}`;
  }
  let curParent = parentComponent;
  let curVnode = vnode;
  while (curParent && curVnode === curParent.subTree) {
    curVnode = curParent.vnode;
    if (curVnode.scopeId) {
      openTag += ` ${curVnode.scopeId}`;
    }
    curParent = curParent.parent;
  }
  if (slotScopeId) {
    openTag += ` ${slotScopeId}`;
  }
  push(openTag + `>`);
  if (!isVoidTag$1(tag)) {
    let hasChildrenOverride = false;
    if (props) {
      if (props.innerHTML) {
        hasChildrenOverride = true;
        push(props.innerHTML);
      } else if (props.textContent) {
        hasChildrenOverride = true;
        push(escapeHtml$1(props.textContent));
      } else if (tag === "textarea" && props.value) {
        hasChildrenOverride = true;
        push(escapeHtml$1(props.value));
      }
    }
    if (!hasChildrenOverride) {
      if (shapeFlag & 8) {
        push(escapeHtml$1(children));
      } else if (shapeFlag & 16) {
        renderVNodeChildren$1(
          push,
          children,
          parentComponent,
          slotScopeId
        );
      }
    }
    push(`</${tag}>`);
  }
}
__name(renderElementVNode$1, "renderElementVNode$1");
__name2(renderElementVNode$1, "renderElementVNode$1");
function applySSRDirectives$1(vnode, rawProps, dirs) {
  const toMerge = [];
  for (let i = 0; i < dirs.length; i++) {
    const binding = dirs[i];
    const {
      dir: { getSSRProps }
    } = binding;
    if (getSSRProps) {
      const props = getSSRProps(binding, vnode);
      if (props) toMerge.push(props);
    }
  }
  return mergeProps(rawProps || {}, ...toMerge);
}
__name(applySSRDirectives$1, "applySSRDirectives$1");
__name2(applySSRDirectives$1, "applySSRDirectives$1");
function renderTeleportVNode$1(push, vnode, parentComponent, slotScopeId) {
  const target = vnode.props && vnode.props.to;
  const disabled = vnode.props && vnode.props.disabled;
  if (!target) {
    return [];
  }
  if (!isString$1(target)) {
    return [];
  }
  ssrRenderTeleport$1(
    push,
    (push2) => {
      renderVNodeChildren$1(
        push2,
        vnode.children,
        parentComponent,
        slotScopeId
      );
    },
    target,
    disabled || disabled === "",
    parentComponent
  );
}
__name(renderTeleportVNode$1, "renderTeleportVNode$1");
__name2(renderTeleportVNode$1, "renderTeleportVNode$1");
var { isVNode: isVNode$1 } = ssrUtils;
function nestedUnrollBuffer(buffer2, parentRet, startIndex) {
  if (!buffer2.hasAsync) {
    return parentRet + unrollBufferSync$1(buffer2);
  }
  let ret = parentRet;
  for (let i = startIndex; i < buffer2.length; i += 1) {
    const item = buffer2[i];
    if (isString$1(item)) {
      ret += item;
      continue;
    }
    if (isPromise$1(item)) {
      return item.then((nestedItem) => {
        buffer2[i] = nestedItem;
        return nestedUnrollBuffer(buffer2, ret, i);
      });
    }
    const result = nestedUnrollBuffer(item, ret, 0);
    if (isPromise$1(result)) {
      return result.then((nestedItem) => {
        buffer2[i] = nestedItem;
        return nestedUnrollBuffer(buffer2, "", i);
      });
    }
    ret = result;
  }
  return ret;
}
__name(nestedUnrollBuffer, "nestedUnrollBuffer");
__name2(nestedUnrollBuffer, "nestedUnrollBuffer");
function unrollBuffer$1(buffer2) {
  return nestedUnrollBuffer(buffer2, "", 0);
}
__name(unrollBuffer$1, "unrollBuffer$1");
__name2(unrollBuffer$1, "unrollBuffer$1");
function unrollBufferSync$1(buffer2) {
  let ret = "";
  for (let i = 0; i < buffer2.length; i++) {
    let item = buffer2[i];
    if (isString$1(item)) {
      ret += item;
    } else {
      ret += unrollBufferSync$1(item);
    }
  }
  return ret;
}
__name(unrollBufferSync$1, "unrollBufferSync$1");
__name2(unrollBufferSync$1, "unrollBufferSync$1");
async function renderToString(input, context = {}) {
  if (isVNode$1(input)) {
    return renderToString(createApp$1({ render: /* @__PURE__ */ __name2(() => input, "render") }), context);
  }
  const vnode = createVNode(input._component, input._props);
  vnode.appContext = input._context;
  input.provide(ssrContextKey, context);
  const buffer2 = await renderComponentVNode$1(vnode);
  const result = await unrollBuffer$1(buffer2);
  await resolveTeleports(context);
  if (context.__watcherHandles) {
    for (const unwatch of context.__watcherHandles) {
      unwatch();
    }
  }
  return result;
}
__name(renderToString, "renderToString");
__name2(renderToString, "renderToString");
async function resolveTeleports(context) {
  if (context.__teleportBuffers) {
    context.teleports = context.teleports || {};
    for (const key in context.__teleportBuffers) {
      context.teleports[key] = await unrollBuffer$1(
        await Promise.all([context.__teleportBuffers[key]])
      );
    }
  }
}
__name(resolveTeleports, "resolveTeleports");
__name2(resolveTeleports, "resolveTeleports");
initDirectivesForSSR();
var isBrowser = typeof document !== "undefined";
function isRouteComponent(component) {
  return typeof component === "object" || "displayName" in component || "props" in component || "__vccOpts" in component;
}
__name(isRouteComponent, "isRouteComponent");
__name2(isRouteComponent, "isRouteComponent");
function isESModule(obj) {
  return obj.__esModule || obj[Symbol.toStringTag] === "Module" || obj.default && isRouteComponent(obj.default);
}
__name(isESModule, "isESModule");
__name2(isESModule, "isESModule");
var assign = Object.assign;
function applyToParams(fn, params) {
  const newParams = {};
  for (const key in params) {
    const value = params[key];
    newParams[key] = isArray$1(value) ? value.map(fn) : fn(value);
  }
  return newParams;
}
__name(applyToParams, "applyToParams");
__name2(applyToParams, "applyToParams");
var noop = /* @__PURE__ */ __name2(() => {
}, "noop");
var isArray$1 = Array.isArray;
function mergeOptions(defaults, partialOptions) {
  const options = {};
  for (const key in defaults) options[key] = key in partialOptions ? partialOptions[key] : defaults[key];
  return options;
}
__name(mergeOptions, "mergeOptions");
__name2(mergeOptions, "mergeOptions");
var HASH_RE = /#/g;
var AMPERSAND_RE = /&/g;
var SLASH_RE = /\//g;
var EQUAL_RE = /=/g;
var IM_RE = /\?/g;
var PLUS_RE = /\+/g;
var ENC_BRACKET_OPEN_RE = /%5B/g;
var ENC_BRACKET_CLOSE_RE = /%5D/g;
var ENC_CARET_RE = /%5E/g;
var ENC_BACKTICK_RE = /%60/g;
var ENC_CURLY_OPEN_RE = /%7B/g;
var ENC_PIPE_RE = /%7C/g;
var ENC_CURLY_CLOSE_RE = /%7D/g;
var ENC_SPACE_RE = /%20/g;
function commonEncode(text) {
  return text == null ? "" : encodeURI("" + text).replace(ENC_PIPE_RE, "|").replace(ENC_BRACKET_OPEN_RE, "[").replace(ENC_BRACKET_CLOSE_RE, "]");
}
__name(commonEncode, "commonEncode");
__name2(commonEncode, "commonEncode");
function encodeHash(text) {
  return commonEncode(text).replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
__name(encodeHash, "encodeHash");
__name2(encodeHash, "encodeHash");
function encodeQueryValue(text) {
  return commonEncode(text).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
__name(encodeQueryValue, "encodeQueryValue");
__name2(encodeQueryValue, "encodeQueryValue");
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
__name(encodeQueryKey, "encodeQueryKey");
__name2(encodeQueryKey, "encodeQueryKey");
function encodePath(text) {
  return commonEncode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F");
}
__name(encodePath, "encodePath");
__name2(encodePath, "encodePath");
function encodeParam(text) {
  return encodePath(text).replace(SLASH_RE, "%2F");
}
__name(encodeParam, "encodeParam");
__name2(encodeParam, "encodeParam");
function decode(text) {
  if (text == null) return null;
  try {
    return decodeURIComponent("" + text);
  } catch (err) {
  }
  return "" + text;
}
__name(decode, "decode");
__name2(decode, "decode");
var TRAILING_SLASH_RE = /\/$/;
var removeTrailingSlash = /* @__PURE__ */ __name2((path) => path.replace(TRAILING_SLASH_RE, ""), "removeTrailingSlash");
function parseURL(parseQuery$1, location, currentLocation = "/") {
  let path, query = {}, searchString = "", hash = "";
  const hashPos = location.indexOf("#");
  let searchPos = location.indexOf("?");
  searchPos = hashPos >= 0 && searchPos > hashPos ? -1 : searchPos;
  if (searchPos >= 0) {
    path = location.slice(0, searchPos);
    searchString = location.slice(searchPos, hashPos > 0 ? hashPos : location.length);
    query = parseQuery$1(searchString.slice(1));
  }
  if (hashPos >= 0) {
    path = path || location.slice(0, hashPos);
    hash = location.slice(hashPos, location.length);
  }
  path = resolveRelativePath(path != null ? path : location, currentLocation);
  return {
    fullPath: path + searchString + hash,
    path,
    query,
    hash: decode(hash)
  };
}
__name(parseURL, "parseURL");
__name2(parseURL, "parseURL");
function stringifyURL(stringifyQuery$1, location) {
  const query = location.query ? stringifyQuery$1(location.query) : "";
  return location.path + (query && "?") + query + (location.hash || "");
}
__name(stringifyURL, "stringifyURL");
__name2(stringifyURL, "stringifyURL");
function isSameRouteLocation(stringifyQuery$1, a, b) {
  const aLastIndex = a.matched.length - 1;
  const bLastIndex = b.matched.length - 1;
  return aLastIndex > -1 && aLastIndex === bLastIndex && isSameRouteRecord(a.matched[aLastIndex], b.matched[bLastIndex]) && isSameRouteLocationParams(a.params, b.params) && stringifyQuery$1(a.query) === stringifyQuery$1(b.query) && a.hash === b.hash;
}
__name(isSameRouteLocation, "isSameRouteLocation");
__name2(isSameRouteLocation, "isSameRouteLocation");
function isSameRouteRecord(a, b) {
  return (a.aliasOf || a) === (b.aliasOf || b);
}
__name(isSameRouteRecord, "isSameRouteRecord");
__name2(isSameRouteRecord, "isSameRouteRecord");
function isSameRouteLocationParams(a, b) {
  if (Object.keys(a).length !== Object.keys(b).length) return false;
  for (var key in a) if (!isSameRouteLocationParamsValue(a[key], b[key])) return false;
  return true;
}
__name(isSameRouteLocationParams, "isSameRouteLocationParams");
__name2(isSameRouteLocationParams, "isSameRouteLocationParams");
function isSameRouteLocationParamsValue(a, b) {
  return isArray$1(a) ? isEquivalentArray(a, b) : isArray$1(b) ? isEquivalentArray(b, a) : a?.valueOf() === b?.valueOf();
}
__name(isSameRouteLocationParamsValue, "isSameRouteLocationParamsValue");
__name2(isSameRouteLocationParamsValue, "isSameRouteLocationParamsValue");
function isEquivalentArray(a, b) {
  return isArray$1(b) ? a.length === b.length && a.every((value, i) => value === b[i]) : a.length === 1 && a[0] === b;
}
__name(isEquivalentArray, "isEquivalentArray");
__name2(isEquivalentArray, "isEquivalentArray");
function resolveRelativePath(to, from) {
  if (to.startsWith("/")) return to;
  if (!to) return from;
  const fromSegments = from.split("/");
  const toSegments = to.split("/");
  const lastToSegment = toSegments[toSegments.length - 1];
  if (lastToSegment === ".." || lastToSegment === ".") toSegments.push("");
  let position = fromSegments.length - 1;
  let toPosition;
  let segment;
  for (toPosition = 0; toPosition < toSegments.length; toPosition++) {
    segment = toSegments[toPosition];
    if (segment === ".") continue;
    if (segment === "..") {
      if (position > 1) position--;
    } else break;
  }
  return fromSegments.slice(0, position).join("/") + "/" + toSegments.slice(toPosition).join("/");
}
__name(resolveRelativePath, "resolveRelativePath");
__name2(resolveRelativePath, "resolveRelativePath");
var START_LOCATION_NORMALIZED = {
  path: "/",
  name: void 0,
  params: {},
  query: {},
  hash: "",
  fullPath: "/",
  matched: [],
  meta: {},
  redirectedFrom: void 0
};
var NavigationType = /* @__PURE__ */ (function(NavigationType$1) {
  NavigationType$1["pop"] = "pop";
  NavigationType$1["push"] = "push";
  return NavigationType$1;
})({});
var NavigationDirection = /* @__PURE__ */ (function(NavigationDirection$1) {
  NavigationDirection$1["back"] = "back";
  NavigationDirection$1["forward"] = "forward";
  NavigationDirection$1["unknown"] = "";
  return NavigationDirection$1;
})({});
var START = "";
function normalizeBase(base) {
  if (!base) if (isBrowser) {
    const baseEl = document.querySelector("base");
    base = baseEl && baseEl.getAttribute("href") || "/";
    base = base.replace(/^\w+:\/\/[^\/]+/, "");
  } else base = "/";
  if (base[0] !== "/" && base[0] !== "#") base = "/" + base;
  return removeTrailingSlash(base);
}
__name(normalizeBase, "normalizeBase");
__name2(normalizeBase, "normalizeBase");
var BEFORE_HASH_RE = /^[^#]+#/;
function createHref(base, location) {
  return base.replace(BEFORE_HASH_RE, "#") + location;
}
__name(createHref, "createHref");
__name2(createHref, "createHref");
function getElementPosition(el, offset) {
  const docRect = document.documentElement.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  return {
    behavior: offset.behavior,
    left: elRect.left - docRect.left - (offset.left || 0),
    top: elRect.top - docRect.top - (offset.top || 0)
  };
}
__name(getElementPosition, "getElementPosition");
__name2(getElementPosition, "getElementPosition");
var computeScrollPosition = /* @__PURE__ */ __name2(() => ({
  left: window.scrollX,
  top: window.scrollY
}), "computeScrollPosition");
function scrollToPosition(position) {
  let scrollToOptions;
  if ("el" in position) {
    const positionEl = position.el;
    const isIdSelector = typeof positionEl === "string" && positionEl.startsWith("#");
    const el = typeof positionEl === "string" ? isIdSelector ? document.getElementById(positionEl.slice(1)) : document.querySelector(positionEl) : positionEl;
    if (!el) {
      return;
    }
    scrollToOptions = getElementPosition(el, position);
  } else scrollToOptions = position;
  if ("scrollBehavior" in document.documentElement.style) window.scrollTo(scrollToOptions);
  else window.scrollTo(scrollToOptions.left != null ? scrollToOptions.left : window.scrollX, scrollToOptions.top != null ? scrollToOptions.top : window.scrollY);
}
__name(scrollToPosition, "scrollToPosition");
__name2(scrollToPosition, "scrollToPosition");
function getScrollKey(path, delta) {
  return (history.state ? history.state.position - delta : -1) + path;
}
__name(getScrollKey, "getScrollKey");
__name2(getScrollKey, "getScrollKey");
var scrollPositions = /* @__PURE__ */ new Map();
function saveScrollPosition(key, scrollPosition) {
  scrollPositions.set(key, scrollPosition);
}
__name(saveScrollPosition, "saveScrollPosition");
__name2(saveScrollPosition, "saveScrollPosition");
function getSavedScrollPosition(key) {
  const scroll = scrollPositions.get(key);
  scrollPositions.delete(key);
  return scroll;
}
__name(getSavedScrollPosition, "getSavedScrollPosition");
__name2(getSavedScrollPosition, "getSavedScrollPosition");
function isRouteLocation(route) {
  return typeof route === "string" || route && typeof route === "object";
}
__name(isRouteLocation, "isRouteLocation");
__name2(isRouteLocation, "isRouteLocation");
function isRouteName(name) {
  return typeof name === "string" || typeof name === "symbol";
}
__name(isRouteName, "isRouteName");
__name2(isRouteName, "isRouteName");
var ErrorTypes = /* @__PURE__ */ (function(ErrorTypes$1) {
  ErrorTypes$1[ErrorTypes$1["MATCHER_NOT_FOUND"] = 1] = "MATCHER_NOT_FOUND";
  ErrorTypes$1[ErrorTypes$1["NAVIGATION_GUARD_REDIRECT"] = 2] = "NAVIGATION_GUARD_REDIRECT";
  ErrorTypes$1[ErrorTypes$1["NAVIGATION_ABORTED"] = 4] = "NAVIGATION_ABORTED";
  ErrorTypes$1[ErrorTypes$1["NAVIGATION_CANCELLED"] = 8] = "NAVIGATION_CANCELLED";
  ErrorTypes$1[ErrorTypes$1["NAVIGATION_DUPLICATED"] = 16] = "NAVIGATION_DUPLICATED";
  return ErrorTypes$1;
})({});
var NavigationFailureSymbol = Symbol("");
({
  [ErrorTypes.MATCHER_NOT_FOUND]({ location, currentLocation }) {
    return `No match for
 ${JSON.stringify(location)}${currentLocation ? "\nwhile being at\n" + JSON.stringify(currentLocation) : ""}`;
  },
  [ErrorTypes.NAVIGATION_GUARD_REDIRECT]({ from, to }) {
    return `Redirected from "${from.fullPath}" to "${stringifyRoute(to)}" via a navigation guard.`;
  },
  [ErrorTypes.NAVIGATION_ABORTED]({ from, to }) {
    return `Navigation aborted from "${from.fullPath}" to "${to.fullPath}" via a navigation guard.`;
  },
  [ErrorTypes.NAVIGATION_CANCELLED]({ from, to }) {
    return `Navigation cancelled from "${from.fullPath}" to "${to.fullPath}" with a new navigation.`;
  },
  [ErrorTypes.NAVIGATION_DUPLICATED]({ from, to }) {
    return `Avoided redundant navigation to current location: "${from.fullPath}".`;
  }
});
function createRouterError(type, params) {
  return assign(/* @__PURE__ */ new Error(), {
    type,
    [NavigationFailureSymbol]: true
  }, params);
}
__name(createRouterError, "createRouterError");
__name2(createRouterError, "createRouterError");
function isNavigationFailure(error, type) {
  return error instanceof Error && NavigationFailureSymbol in error && (type == null || !!(error.type & type));
}
__name(isNavigationFailure, "isNavigationFailure");
__name2(isNavigationFailure, "isNavigationFailure");
var propertiesToLog = [
  "params",
  "query",
  "hash"
];
function stringifyRoute(to) {
  if (typeof to === "string") return to;
  if (to.path != null) return to.path;
  const location = {};
  for (const key of propertiesToLog) if (key in to) location[key] = to[key];
  return JSON.stringify(location, null, 2);
}
__name(stringifyRoute, "stringifyRoute");
__name2(stringifyRoute, "stringifyRoute");
function parseQuery(search) {
  const query = {};
  if (search === "" || search === "?") return query;
  const searchParams = (search[0] === "?" ? search.slice(1) : search).split("&");
  for (let i = 0; i < searchParams.length; ++i) {
    const searchParam = searchParams[i].replace(PLUS_RE, " ");
    const eqPos = searchParam.indexOf("=");
    const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
    const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
    if (key in query) {
      let currentValue = query[key];
      if (!isArray$1(currentValue)) currentValue = query[key] = [currentValue];
      currentValue.push(value);
    } else query[key] = value;
  }
  return query;
}
__name(parseQuery, "parseQuery");
__name2(parseQuery, "parseQuery");
function stringifyQuery(query) {
  let search = "";
  for (let key in query) {
    const value = query[key];
    key = encodeQueryKey(key);
    if (value == null) {
      if (value !== void 0) search += (search.length ? "&" : "") + key;
      continue;
    }
    (isArray$1(value) ? value.map((v) => v && encodeQueryValue(v)) : [value && encodeQueryValue(value)]).forEach((value$1) => {
      if (value$1 !== void 0) {
        search += (search.length ? "&" : "") + key;
        if (value$1 != null) search += "=" + value$1;
      }
    });
  }
  return search;
}
__name(stringifyQuery, "stringifyQuery");
__name2(stringifyQuery, "stringifyQuery");
function normalizeQuery(query) {
  const normalizedQuery = {};
  for (const key in query) {
    const value = query[key];
    if (value !== void 0) normalizedQuery[key] = isArray$1(value) ? value.map((v) => v == null ? null : "" + v) : value == null ? value : "" + value;
  }
  return normalizedQuery;
}
__name(normalizeQuery, "normalizeQuery");
__name2(normalizeQuery, "normalizeQuery");
var matchedRouteKey = Symbol("");
var viewDepthKey = Symbol("");
var routerKey = Symbol("");
var routeLocationKey = Symbol("");
var routerViewLocationKey = Symbol("");
function useCallbacks() {
  let handlers = [];
  function add(handler) {
    handlers.push(handler);
    return () => {
      const i = handlers.indexOf(handler);
      if (i > -1) handlers.splice(i, 1);
    };
  }
  __name(add, "add");
  __name2(add, "add");
  function reset() {
    handlers = [];
  }
  __name(reset, "reset");
  __name2(reset, "reset");
  return {
    add,
    list: /* @__PURE__ */ __name2(() => handlers.slice(), "list"),
    reset
  };
}
__name(useCallbacks, "useCallbacks");
__name2(useCallbacks, "useCallbacks");
function guardToPromiseFn(guard, to, from, record, name, runWithContext = (fn) => fn()) {
  const enterCallbackArray = record && (record.enterCallbacks[name] = record.enterCallbacks[name] || []);
  return () => new Promise((resolve2, reject) => {
    const next = /* @__PURE__ */ __name2((valid) => {
      if (valid === false) reject(createRouterError(ErrorTypes.NAVIGATION_ABORTED, {
        from,
        to
      }));
      else if (valid instanceof Error) reject(valid);
      else if (isRouteLocation(valid)) reject(createRouterError(ErrorTypes.NAVIGATION_GUARD_REDIRECT, {
        from: to,
        to: valid
      }));
      else {
        if (enterCallbackArray && record.enterCallbacks[name] === enterCallbackArray && typeof valid === "function") enterCallbackArray.push(valid);
        resolve2();
      }
    }, "next");
    const guardReturn = runWithContext(() => guard.call(record && record.instances[name], to, from, next));
    let guardCall = Promise.resolve(guardReturn);
    if (guard.length < 3) guardCall = guardCall.then(next);
    guardCall.catch((err) => reject(err));
  });
}
__name(guardToPromiseFn, "guardToPromiseFn");
__name2(guardToPromiseFn, "guardToPromiseFn");
function extractComponentsGuards(matched, guardType, to, from, runWithContext = (fn) => fn()) {
  const guards = [];
  for (const record of matched) {
    for (const name in record.components) {
      let rawComponent = record.components[name];
      if (guardType !== "beforeRouteEnter" && !record.instances[name]) continue;
      if (isRouteComponent(rawComponent)) {
        const guard = (rawComponent.__vccOpts || rawComponent)[guardType];
        guard && guards.push(guardToPromiseFn(guard, to, from, record, name, runWithContext));
      } else {
        let componentPromise = rawComponent();
        guards.push(() => componentPromise.then((resolved) => {
          if (!resolved) throw new Error(`Couldn't resolve component "${name}" at "${record.path}"`);
          const resolvedComponent = isESModule(resolved) ? resolved.default : resolved;
          record.mods[name] = resolved;
          record.components[name] = resolvedComponent;
          const guard = (resolvedComponent.__vccOpts || resolvedComponent)[guardType];
          return guard && guardToPromiseFn(guard, to, from, record, name, runWithContext)();
        }));
      }
    }
  }
  return guards;
}
__name(extractComponentsGuards, "extractComponentsGuards");
__name2(extractComponentsGuards, "extractComponentsGuards");
function extractChangingRecords(to, from) {
  const leavingRecords = [];
  const updatingRecords = [];
  const enteringRecords = [];
  const len = Math.max(from.matched.length, to.matched.length);
  for (let i = 0; i < len; i++) {
    const recordFrom = from.matched[i];
    if (recordFrom) if (to.matched.find((record) => isSameRouteRecord(record, recordFrom))) updatingRecords.push(recordFrom);
    else leavingRecords.push(recordFrom);
    const recordTo = to.matched[i];
    if (recordTo) {
      if (!from.matched.find((record) => isSameRouteRecord(record, recordTo))) enteringRecords.push(recordTo);
    }
  }
  return [
    leavingRecords,
    updatingRecords,
    enteringRecords
  ];
}
__name(extractChangingRecords, "extractChangingRecords");
__name2(extractChangingRecords, "extractChangingRecords");
function createMemoryHistory(base = "") {
  let listeners = [];
  let queue2 = [[START, {}]];
  let position = 0;
  base = normalizeBase(base);
  function setLocation(location$1, state = {}) {
    position++;
    if (position !== queue2.length) queue2.splice(position);
    queue2.push([location$1, state]);
  }
  __name(setLocation, "setLocation");
  __name2(setLocation, "setLocation");
  function triggerListeners(to, from, { direction, delta }) {
    const info = {
      direction,
      delta,
      type: NavigationType.pop
    };
    for (const callback of listeners) callback(to, from, info);
  }
  __name(triggerListeners, "triggerListeners");
  __name2(triggerListeners, "triggerListeners");
  const routerHistory = {
    location: START,
    state: {},
    base,
    createHref: createHref.bind(null, base),
    replace(to, state) {
      queue2.splice(position--, 1);
      setLocation(to, state);
    },
    push(to, state) {
      setLocation(to, state);
    },
    listen(callback) {
      listeners.push(callback);
      return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      };
    },
    destroy() {
      listeners = [];
      queue2 = [[START, {}]];
      position = 0;
    },
    go(delta, shouldTrigger = true) {
      const from = this.location;
      const direction = delta < 0 ? NavigationDirection.back : NavigationDirection.forward;
      position = Math.max(0, Math.min(position + delta, queue2.length - 1));
      if (shouldTrigger) triggerListeners(this.location, from, {
        direction,
        delta
      });
    }
  };
  Object.defineProperty(routerHistory, "location", {
    enumerable: true,
    get: /* @__PURE__ */ __name2(() => queue2[position][0], "get")
  });
  Object.defineProperty(routerHistory, "state", {
    enumerable: true,
    get: /* @__PURE__ */ __name2(() => queue2[position][1], "get")
  });
  return routerHistory;
}
__name(createMemoryHistory, "createMemoryHistory");
__name2(createMemoryHistory, "createMemoryHistory");
var TokenType = /* @__PURE__ */ (function(TokenType$1) {
  TokenType$1[TokenType$1["Static"] = 0] = "Static";
  TokenType$1[TokenType$1["Param"] = 1] = "Param";
  TokenType$1[TokenType$1["Group"] = 2] = "Group";
  return TokenType$1;
})({});
var TokenizerState = /* @__PURE__ */ (function(TokenizerState$1) {
  TokenizerState$1[TokenizerState$1["Static"] = 0] = "Static";
  TokenizerState$1[TokenizerState$1["Param"] = 1] = "Param";
  TokenizerState$1[TokenizerState$1["ParamRegExp"] = 2] = "ParamRegExp";
  TokenizerState$1[TokenizerState$1["ParamRegExpEnd"] = 3] = "ParamRegExpEnd";
  TokenizerState$1[TokenizerState$1["EscapeNext"] = 4] = "EscapeNext";
  return TokenizerState$1;
})(TokenizerState || {});
var ROOT_TOKEN = {
  type: TokenType.Static,
  value: ""
};
var VALID_PARAM_RE = /[a-zA-Z0-9_]/;
function tokenizePath(path) {
  if (!path) return [[]];
  if (path === "/") return [[ROOT_TOKEN]];
  if (!path.startsWith("/")) throw new Error(`Invalid path "${path}"`);
  function crash(message) {
    throw new Error(`ERR (${state})/"${buffer}": ${message}`);
  }
  __name(crash, "crash");
  __name2(crash, "crash");
  let state = TokenizerState.Static;
  let previousState = state;
  const tokens = [];
  let segment;
  function finalizeSegment() {
    if (segment) tokens.push(segment);
    segment = [];
  }
  __name(finalizeSegment, "finalizeSegment");
  __name2(finalizeSegment, "finalizeSegment");
  let i = 0;
  let char;
  let buffer = "";
  let customRe = "";
  function consumeBuffer() {
    if (!buffer) return;
    if (state === TokenizerState.Static) segment.push({
      type: TokenType.Static,
      value: buffer
    });
    else if (state === TokenizerState.Param || state === TokenizerState.ParamRegExp || state === TokenizerState.ParamRegExpEnd) {
      if (segment.length > 1 && (char === "*" || char === "+")) crash(`A repeatable param (${buffer}) must be alone in its segment. eg: '/:ids+.`);
      segment.push({
        type: TokenType.Param,
        value: buffer,
        regexp: customRe,
        repeatable: char === "*" || char === "+",
        optional: char === "*" || char === "?"
      });
    } else crash("Invalid state to consume buffer");
    buffer = "";
  }
  __name(consumeBuffer, "consumeBuffer");
  __name2(consumeBuffer, "consumeBuffer");
  function addCharToBuffer() {
    buffer += char;
  }
  __name(addCharToBuffer, "addCharToBuffer");
  __name2(addCharToBuffer, "addCharToBuffer");
  while (i < path.length) {
    char = path[i++];
    if (char === "\\" && state !== TokenizerState.ParamRegExp) {
      previousState = state;
      state = TokenizerState.EscapeNext;
      continue;
    }
    switch (state) {
      case TokenizerState.Static:
        if (char === "/") {
          if (buffer) consumeBuffer();
          finalizeSegment();
        } else if (char === ":") {
          consumeBuffer();
          state = TokenizerState.Param;
        } else addCharToBuffer();
        break;
      case TokenizerState.EscapeNext:
        addCharToBuffer();
        state = previousState;
        break;
      case TokenizerState.Param:
        if (char === "(") state = TokenizerState.ParamRegExp;
        else if (VALID_PARAM_RE.test(char)) addCharToBuffer();
        else {
          consumeBuffer();
          state = TokenizerState.Static;
          if (char !== "*" && char !== "?" && char !== "+") i--;
        }
        break;
      case TokenizerState.ParamRegExp:
        if (char === ")") if (customRe[customRe.length - 1] == "\\") customRe = customRe.slice(0, -1) + char;
        else state = TokenizerState.ParamRegExpEnd;
        else customRe += char;
        break;
      case TokenizerState.ParamRegExpEnd:
        consumeBuffer();
        state = TokenizerState.Static;
        if (char !== "*" && char !== "?" && char !== "+") i--;
        customRe = "";
        break;
      default:
        crash("Unknown state");
        break;
    }
  }
  if (state === TokenizerState.ParamRegExp) crash(`Unfinished custom RegExp for param "${buffer}"`);
  consumeBuffer();
  finalizeSegment();
  return tokens;
}
__name(tokenizePath, "tokenizePath");
__name2(tokenizePath, "tokenizePath");
var BASE_PARAM_PATTERN = "[^/]+?";
var BASE_PATH_PARSER_OPTIONS = {
  sensitive: false,
  strict: false,
  start: true,
  end: true
};
var PathScore = /* @__PURE__ */ (function(PathScore$1) {
  PathScore$1[PathScore$1["_multiplier"] = 10] = "_multiplier";
  PathScore$1[PathScore$1["Root"] = 90] = "Root";
  PathScore$1[PathScore$1["Segment"] = 40] = "Segment";
  PathScore$1[PathScore$1["SubSegment"] = 30] = "SubSegment";
  PathScore$1[PathScore$1["Static"] = 40] = "Static";
  PathScore$1[PathScore$1["Dynamic"] = 20] = "Dynamic";
  PathScore$1[PathScore$1["BonusCustomRegExp"] = 10] = "BonusCustomRegExp";
  PathScore$1[PathScore$1["BonusWildcard"] = -50] = "BonusWildcard";
  PathScore$1[PathScore$1["BonusRepeatable"] = -20] = "BonusRepeatable";
  PathScore$1[PathScore$1["BonusOptional"] = -8] = "BonusOptional";
  PathScore$1[PathScore$1["BonusStrict"] = 0.7000000000000001] = "BonusStrict";
  PathScore$1[PathScore$1["BonusCaseSensitive"] = 0.25] = "BonusCaseSensitive";
  return PathScore$1;
})(PathScore || {});
var REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
function tokensToParser(segments, extraOptions) {
  const options = assign({}, BASE_PATH_PARSER_OPTIONS, extraOptions);
  const score = [];
  let pattern = options.start ? "^" : "";
  const keys = [];
  for (const segment of segments) {
    const segmentScores = segment.length ? [] : [PathScore.Root];
    if (options.strict && !segment.length) pattern += "/";
    for (let tokenIndex = 0; tokenIndex < segment.length; tokenIndex++) {
      const token = segment[tokenIndex];
      let subSegmentScore = PathScore.Segment + (options.sensitive ? PathScore.BonusCaseSensitive : 0);
      if (token.type === TokenType.Static) {
        if (!tokenIndex) pattern += "/";
        pattern += token.value.replace(REGEX_CHARS_RE, "\\$&");
        subSegmentScore += PathScore.Static;
      } else if (token.type === TokenType.Param) {
        const { value, repeatable, optional, regexp } = token;
        keys.push({
          name: value,
          repeatable,
          optional
        });
        const re$1 = regexp ? regexp : BASE_PARAM_PATTERN;
        if (re$1 !== BASE_PARAM_PATTERN) {
          subSegmentScore += PathScore.BonusCustomRegExp;
          try {
            `${re$1}`;
          } catch (err) {
            throw new Error(`Invalid custom RegExp for param "${value}" (${re$1}): ` + err.message);
          }
        }
        let subPattern = repeatable ? `((?:${re$1})(?:/(?:${re$1}))*)` : `(${re$1})`;
        if (!tokenIndex) subPattern = optional && segment.length < 2 ? `(?:/${subPattern})` : "/" + subPattern;
        if (optional) subPattern += "?";
        pattern += subPattern;
        subSegmentScore += PathScore.Dynamic;
        if (optional) subSegmentScore += PathScore.BonusOptional;
        if (repeatable) subSegmentScore += PathScore.BonusRepeatable;
        if (re$1 === ".*") subSegmentScore += PathScore.BonusWildcard;
      }
      segmentScores.push(subSegmentScore);
    }
    score.push(segmentScores);
  }
  if (options.strict && options.end) {
    const i = score.length - 1;
    score[i][score[i].length - 1] += PathScore.BonusStrict;
  }
  if (!options.strict) pattern += "/?";
  if (options.end) pattern += "$";
  else if (options.strict && !pattern.endsWith("/")) pattern += "(?:/|$)";
  const re = new RegExp(pattern, options.sensitive ? "" : "i");
  function parse2(path) {
    const match2 = path.match(re);
    const params = {};
    if (!match2) return null;
    for (let i = 1; i < match2.length; i++) {
      const value = match2[i] || "";
      const key = keys[i - 1];
      params[key.name] = value && key.repeatable ? value.split("/") : value;
    }
    return params;
  }
  __name(parse2, "parse2");
  __name2(parse2, "parse");
  function stringify(params) {
    let path = "";
    let avoidDuplicatedSlash = false;
    for (const segment of segments) {
      if (!avoidDuplicatedSlash || !path.endsWith("/")) path += "/";
      avoidDuplicatedSlash = false;
      for (const token of segment) if (token.type === TokenType.Static) path += token.value;
      else if (token.type === TokenType.Param) {
        const { value, repeatable, optional } = token;
        const param = value in params ? params[value] : "";
        if (isArray$1(param) && !repeatable) throw new Error(`Provided param "${value}" is an array but it is not repeatable (* or + modifiers)`);
        const text = isArray$1(param) ? param.join("/") : param;
        if (!text) if (optional) {
          if (segment.length < 2) if (path.endsWith("/")) path = path.slice(0, -1);
          else avoidDuplicatedSlash = true;
        } else throw new Error(`Missing required param "${value}"`);
        path += text;
      }
    }
    return path || "/";
  }
  __name(stringify, "stringify");
  __name2(stringify, "stringify");
  return {
    re,
    score,
    keys,
    parse: parse2,
    stringify
  };
}
__name(tokensToParser, "tokensToParser");
__name2(tokensToParser, "tokensToParser");
function compareScoreArray(a, b) {
  let i = 0;
  while (i < a.length && i < b.length) {
    const diff = b[i] - a[i];
    if (diff) return diff;
    i++;
  }
  if (a.length < b.length) return a.length === 1 && a[0] === PathScore.Static + PathScore.Segment ? -1 : 1;
  else if (a.length > b.length) return b.length === 1 && b[0] === PathScore.Static + PathScore.Segment ? 1 : -1;
  return 0;
}
__name(compareScoreArray, "compareScoreArray");
__name2(compareScoreArray, "compareScoreArray");
function comparePathParserScore(a, b) {
  let i = 0;
  const aScore = a.score;
  const bScore = b.score;
  while (i < aScore.length && i < bScore.length) {
    const comp = compareScoreArray(aScore[i], bScore[i]);
    if (comp) return comp;
    i++;
  }
  if (Math.abs(bScore.length - aScore.length) === 1) {
    if (isLastScoreNegative(aScore)) return 1;
    if (isLastScoreNegative(bScore)) return -1;
  }
  return bScore.length - aScore.length;
}
__name(comparePathParserScore, "comparePathParserScore");
__name2(comparePathParserScore, "comparePathParserScore");
function isLastScoreNegative(score) {
  const last = score[score.length - 1];
  return score.length > 0 && last[last.length - 1] < 0;
}
__name(isLastScoreNegative, "isLastScoreNegative");
__name2(isLastScoreNegative, "isLastScoreNegative");
var PATH_PARSER_OPTIONS_DEFAULTS = {
  strict: false,
  end: true,
  sensitive: false
};
function createRouteRecordMatcher(record, parent, options) {
  const parser = tokensToParser(tokenizePath(record.path), options);
  const matcher = assign(parser, {
    record,
    parent,
    children: [],
    alias: []
  });
  if (parent) {
    if (!matcher.record.aliasOf === !parent.record.aliasOf) parent.children.push(matcher);
  }
  return matcher;
}
__name(createRouteRecordMatcher, "createRouteRecordMatcher");
__name2(createRouteRecordMatcher, "createRouteRecordMatcher");
function createRouterMatcher(routes3, globalOptions) {
  const matchers = [];
  const matcherMap = /* @__PURE__ */ new Map();
  globalOptions = mergeOptions(PATH_PARSER_OPTIONS_DEFAULTS, globalOptions);
  function getRecordMatcher(name) {
    return matcherMap.get(name);
  }
  __name(getRecordMatcher, "getRecordMatcher");
  __name2(getRecordMatcher, "getRecordMatcher");
  function addRoute(record, parent, originalRecord) {
    const isRootAdd = !originalRecord;
    const mainNormalizedRecord = normalizeRouteRecord(record);
    mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record;
    const options = mergeOptions(globalOptions, record);
    const normalizedRecords = [mainNormalizedRecord];
    if ("alias" in record) {
      const aliases = typeof record.alias === "string" ? [record.alias] : record.alias;
      for (const alias of aliases) normalizedRecords.push(normalizeRouteRecord(assign({}, mainNormalizedRecord, {
        components: originalRecord ? originalRecord.record.components : mainNormalizedRecord.components,
        path: alias,
        aliasOf: originalRecord ? originalRecord.record : mainNormalizedRecord
      })));
    }
    let matcher;
    let originalMatcher;
    for (const normalizedRecord of normalizedRecords) {
      const { path } = normalizedRecord;
      if (parent && path[0] !== "/") {
        const parentPath = parent.record.path;
        const connectingSlash = parentPath[parentPath.length - 1] === "/" ? "" : "/";
        normalizedRecord.path = parent.record.path + (path && connectingSlash + path);
      }
      matcher = createRouteRecordMatcher(normalizedRecord, parent, options);
      if (originalRecord) {
        originalRecord.alias.push(matcher);
      } else {
        originalMatcher = originalMatcher || matcher;
        if (originalMatcher !== matcher) originalMatcher.alias.push(matcher);
        if (isRootAdd && record.name && !isAliasRecord(matcher)) {
          removeRoute(record.name);
        }
      }
      if (isMatchable(matcher)) insertMatcher(matcher);
      if (mainNormalizedRecord.children) {
        const children = mainNormalizedRecord.children;
        for (let i = 0; i < children.length; i++) addRoute(children[i], matcher, originalRecord && originalRecord.children[i]);
      }
      originalRecord = originalRecord || matcher;
    }
    return originalMatcher ? () => {
      removeRoute(originalMatcher);
    } : noop;
  }
  __name(addRoute, "addRoute");
  __name2(addRoute, "addRoute");
  function removeRoute(matcherRef) {
    if (isRouteName(matcherRef)) {
      const matcher = matcherMap.get(matcherRef);
      if (matcher) {
        matcherMap.delete(matcherRef);
        matchers.splice(matchers.indexOf(matcher), 1);
        matcher.children.forEach(removeRoute);
        matcher.alias.forEach(removeRoute);
      }
    } else {
      const index = matchers.indexOf(matcherRef);
      if (index > -1) {
        matchers.splice(index, 1);
        if (matcherRef.record.name) matcherMap.delete(matcherRef.record.name);
        matcherRef.children.forEach(removeRoute);
        matcherRef.alias.forEach(removeRoute);
      }
    }
  }
  __name(removeRoute, "removeRoute");
  __name2(removeRoute, "removeRoute");
  function getRoutes() {
    return matchers;
  }
  __name(getRoutes, "getRoutes");
  __name2(getRoutes, "getRoutes");
  function insertMatcher(matcher) {
    const index = findInsertionIndex(matcher, matchers);
    matchers.splice(index, 0, matcher);
    if (matcher.record.name && !isAliasRecord(matcher)) matcherMap.set(matcher.record.name, matcher);
  }
  __name(insertMatcher, "insertMatcher");
  __name2(insertMatcher, "insertMatcher");
  function resolve2(location$1, currentLocation) {
    let matcher;
    let params = {};
    let path;
    let name;
    if ("name" in location$1 && location$1.name) {
      matcher = matcherMap.get(location$1.name);
      if (!matcher) throw createRouterError(ErrorTypes.MATCHER_NOT_FOUND, { location: location$1 });
      name = matcher.record.name;
      params = assign(pickParams(currentLocation.params, matcher.keys.filter((k) => !k.optional).concat(matcher.parent ? matcher.parent.keys.filter((k) => k.optional) : []).map((k) => k.name)), location$1.params && pickParams(location$1.params, matcher.keys.map((k) => k.name)));
      path = matcher.stringify(params);
    } else if (location$1.path != null) {
      path = location$1.path;
      matcher = matchers.find((m) => m.re.test(path));
      if (matcher) {
        params = matcher.parse(path);
        name = matcher.record.name;
      }
    } else {
      matcher = currentLocation.name ? matcherMap.get(currentLocation.name) : matchers.find((m) => m.re.test(currentLocation.path));
      if (!matcher) throw createRouterError(ErrorTypes.MATCHER_NOT_FOUND, {
        location: location$1,
        currentLocation
      });
      name = matcher.record.name;
      params = assign({}, currentLocation.params, location$1.params);
      path = matcher.stringify(params);
    }
    const matched = [];
    let parentMatcher = matcher;
    while (parentMatcher) {
      matched.unshift(parentMatcher.record);
      parentMatcher = parentMatcher.parent;
    }
    return {
      name,
      path,
      params,
      matched,
      meta: mergeMetaFields(matched)
    };
  }
  __name(resolve2, "resolve2");
  __name2(resolve2, "resolve");
  routes3.forEach((route) => addRoute(route));
  function clearRoutes() {
    matchers.length = 0;
    matcherMap.clear();
  }
  __name(clearRoutes, "clearRoutes");
  __name2(clearRoutes, "clearRoutes");
  return {
    addRoute,
    resolve: resolve2,
    removeRoute,
    clearRoutes,
    getRoutes,
    getRecordMatcher
  };
}
__name(createRouterMatcher, "createRouterMatcher");
__name2(createRouterMatcher, "createRouterMatcher");
function pickParams(params, keys) {
  const newParams = {};
  for (const key of keys) if (key in params) newParams[key] = params[key];
  return newParams;
}
__name(pickParams, "pickParams");
__name2(pickParams, "pickParams");
function normalizeRouteRecord(record) {
  const normalized = {
    path: record.path,
    redirect: record.redirect,
    name: record.name,
    meta: record.meta || {},
    aliasOf: record.aliasOf,
    beforeEnter: record.beforeEnter,
    props: normalizeRecordProps(record),
    children: record.children || [],
    instances: {},
    leaveGuards: /* @__PURE__ */ new Set(),
    updateGuards: /* @__PURE__ */ new Set(),
    enterCallbacks: {},
    components: "components" in record ? record.components || null : record.component && { default: record.component }
  };
  Object.defineProperty(normalized, "mods", { value: {} });
  return normalized;
}
__name(normalizeRouteRecord, "normalizeRouteRecord");
__name2(normalizeRouteRecord, "normalizeRouteRecord");
function normalizeRecordProps(record) {
  const propsObject = {};
  const props = record.props || false;
  if ("component" in record) propsObject.default = props;
  else for (const name in record.components) propsObject[name] = typeof props === "object" ? props[name] : props;
  return propsObject;
}
__name(normalizeRecordProps, "normalizeRecordProps");
__name2(normalizeRecordProps, "normalizeRecordProps");
function isAliasRecord(record) {
  while (record) {
    if (record.record.aliasOf) return true;
    record = record.parent;
  }
  return false;
}
__name(isAliasRecord, "isAliasRecord");
__name2(isAliasRecord, "isAliasRecord");
function mergeMetaFields(matched) {
  return matched.reduce((meta, record) => assign(meta, record.meta), {});
}
__name(mergeMetaFields, "mergeMetaFields");
__name2(mergeMetaFields, "mergeMetaFields");
function findInsertionIndex(matcher, matchers) {
  let lower = 0;
  let upper = matchers.length;
  while (lower !== upper) {
    const mid = lower + upper >> 1;
    if (comparePathParserScore(matcher, matchers[mid]) < 0) upper = mid;
    else lower = mid + 1;
  }
  const insertionAncestor = getInsertionAncestor(matcher);
  if (insertionAncestor) {
    upper = matchers.lastIndexOf(insertionAncestor, upper - 1);
  }
  return upper;
}
__name(findInsertionIndex, "findInsertionIndex");
__name2(findInsertionIndex, "findInsertionIndex");
function getInsertionAncestor(matcher) {
  let ancestor = matcher;
  while (ancestor = ancestor.parent) if (isMatchable(ancestor) && comparePathParserScore(matcher, ancestor) === 0) return ancestor;
}
__name(getInsertionAncestor, "getInsertionAncestor");
__name2(getInsertionAncestor, "getInsertionAncestor");
function isMatchable({ record }) {
  return !!(record.name || record.components && Object.keys(record.components).length || record.redirect);
}
__name(isMatchable, "isMatchable");
__name2(isMatchable, "isMatchable");
function useLink(props) {
  const router = inject(routerKey);
  const currentRoute = inject(routeLocationKey);
  const route = computed(() => {
    const to = unref(props.to);
    return router.resolve(to);
  });
  const activeRecordIndex = computed(() => {
    const { matched } = route.value;
    const { length } = matched;
    const routeMatched = matched[length - 1];
    const currentMatched = currentRoute.matched;
    if (!routeMatched || !currentMatched.length) return -1;
    const index = currentMatched.findIndex(isSameRouteRecord.bind(null, routeMatched));
    if (index > -1) return index;
    const parentRecordPath = getOriginalPath(matched[length - 2]);
    return length > 1 && getOriginalPath(routeMatched) === parentRecordPath && currentMatched[currentMatched.length - 1].path !== parentRecordPath ? currentMatched.findIndex(isSameRouteRecord.bind(null, matched[length - 2])) : index;
  });
  const isActive = computed(() => activeRecordIndex.value > -1 && includesParams(currentRoute.params, route.value.params));
  const isExactActive = computed(() => activeRecordIndex.value > -1 && activeRecordIndex.value === currentRoute.matched.length - 1 && isSameRouteLocationParams(currentRoute.params, route.value.params));
  function navigate(e = {}) {
    if (guardEvent(e)) {
      const p2 = router[unref(props.replace) ? "replace" : "push"](unref(props.to)).catch(noop);
      if (props.viewTransition && typeof document !== "undefined" && "startViewTransition" in document) document.startViewTransition(() => p2);
      return p2;
    }
    return Promise.resolve();
  }
  __name(navigate, "navigate");
  __name2(navigate, "navigate");
  return {
    route,
    href: computed(() => route.value.href),
    isActive,
    isExactActive,
    navigate
  };
}
__name(useLink, "useLink");
__name2(useLink, "useLink");
function preferSingleVNode(vnodes) {
  return vnodes.length === 1 ? vnodes[0] : vnodes;
}
__name(preferSingleVNode, "preferSingleVNode");
__name2(preferSingleVNode, "preferSingleVNode");
var RouterLinkImpl = /* @__PURE__ */ defineComponent({
  name: "RouterLink",
  compatConfig: { MODE: 3 },
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    custom: Boolean,
    ariaCurrentValue: {
      type: String,
      default: "page"
    },
    viewTransition: Boolean
  },
  useLink,
  setup(props, { slots }) {
    const link = reactive(useLink(props));
    const { options } = inject(routerKey);
    const elClass = computed(() => ({
      [getLinkClass(props.activeClass, options.linkActiveClass, "router-link-active")]: link.isActive,
      [getLinkClass(props.exactActiveClass, options.linkExactActiveClass, "router-link-exact-active")]: link.isExactActive
    }));
    return () => {
      const children = slots.default && preferSingleVNode(slots.default(link));
      return props.custom ? children : h("a", {
        "aria-current": link.isExactActive ? props.ariaCurrentValue : null,
        href: link.href,
        onClick: link.navigate,
        class: elClass.value
      }, children);
    };
  }
});
var RouterLink = RouterLinkImpl;
function guardEvent(e) {
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
  if (e.defaultPrevented) return;
  if (e.button !== void 0 && e.button !== 0) return;
  if (e.currentTarget && e.currentTarget.getAttribute) {
    const target = e.currentTarget.getAttribute("target");
    if (/\b_blank\b/i.test(target)) return;
  }
  if (e.preventDefault) e.preventDefault();
  return true;
}
__name(guardEvent, "guardEvent");
__name2(guardEvent, "guardEvent");
function includesParams(outer, inner) {
  for (const key in inner) {
    const innerValue = inner[key];
    const outerValue = outer[key];
    if (typeof innerValue === "string") {
      if (innerValue !== outerValue) return false;
    } else if (!isArray$1(outerValue) || outerValue.length !== innerValue.length || innerValue.some((value, i) => value.valueOf() !== outerValue[i].valueOf())) return false;
  }
  return true;
}
__name(includesParams, "includesParams");
__name2(includesParams, "includesParams");
function getOriginalPath(record) {
  return record ? record.aliasOf ? record.aliasOf.path : record.path : "";
}
__name(getOriginalPath, "getOriginalPath");
__name2(getOriginalPath, "getOriginalPath");
var getLinkClass = /* @__PURE__ */ __name2((propClass, globalClass, defaultClass) => propClass != null ? propClass : globalClass != null ? globalClass : defaultClass, "getLinkClass");
var RouterViewImpl = /* @__PURE__ */ defineComponent({
  name: "RouterView",
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      default: "default"
    },
    route: Object
  },
  compatConfig: { MODE: 3 },
  setup(props, { attrs, slots }) {
    const injectedRoute = inject(routerViewLocationKey);
    const routeToDisplay = computed(() => props.route || injectedRoute.value);
    const injectedDepth = inject(viewDepthKey, 0);
    const depth = computed(() => {
      let initialDepth = unref(injectedDepth);
      const { matched } = routeToDisplay.value;
      let matchedRoute;
      while ((matchedRoute = matched[initialDepth]) && !matchedRoute.components) initialDepth++;
      return initialDepth;
    });
    const matchedRouteRef = computed(() => routeToDisplay.value.matched[depth.value]);
    provide(viewDepthKey, computed(() => depth.value + 1));
    provide(matchedRouteKey, matchedRouteRef);
    provide(routerViewLocationKey, routeToDisplay);
    const viewRef = ref();
    watch(() => [
      viewRef.value,
      matchedRouteRef.value,
      props.name
    ], ([instance, to, name], [oldInstance, from, oldName]) => {
      if (to) {
        to.instances[name] = instance;
        if (from && from !== to && instance && instance === oldInstance) {
          if (!to.leaveGuards.size) to.leaveGuards = from.leaveGuards;
          if (!to.updateGuards.size) to.updateGuards = from.updateGuards;
        }
      }
      if (instance && to && (!from || !isSameRouteRecord(to, from) || !oldInstance)) (to.enterCallbacks[name] || []).forEach((callback) => callback(instance));
    }, { flush: "post" });
    return () => {
      const route = routeToDisplay.value;
      const currentName = props.name;
      const matchedRoute = matchedRouteRef.value;
      const ViewComponent = matchedRoute && matchedRoute.components[currentName];
      if (!ViewComponent) return normalizeSlot(slots.default, {
        Component: ViewComponent,
        route
      });
      const routePropsOption = matchedRoute.props[currentName];
      const routeProps = routePropsOption ? routePropsOption === true ? route.params : typeof routePropsOption === "function" ? routePropsOption(route) : routePropsOption : null;
      const onVnodeUnmounted = /* @__PURE__ */ __name2((vnode) => {
        if (vnode.component.isUnmounted) matchedRoute.instances[currentName] = null;
      }, "onVnodeUnmounted");
      const component = h(ViewComponent, assign({}, routeProps, attrs, {
        onVnodeUnmounted,
        ref: viewRef
      }));
      return normalizeSlot(slots.default, {
        Component: component,
        route
      }) || component;
    };
  }
});
function normalizeSlot(slot, data) {
  if (!slot) return null;
  const slotContent = slot(data);
  return slotContent.length === 1 ? slotContent[0] : slotContent;
}
__name(normalizeSlot, "normalizeSlot");
__name2(normalizeSlot, "normalizeSlot");
var RouterView = RouterViewImpl;
function createRouter(options) {
  const matcher = createRouterMatcher(options.routes, options);
  const parseQuery$1 = options.parseQuery || parseQuery;
  const stringifyQuery$1 = options.stringifyQuery || stringifyQuery;
  const routerHistory = options.history;
  const beforeGuards = useCallbacks();
  const beforeResolveGuards = useCallbacks();
  const afterGuards = useCallbacks();
  const currentRoute = shallowRef(START_LOCATION_NORMALIZED);
  let pendingLocation = START_LOCATION_NORMALIZED;
  if (isBrowser && options.scrollBehavior && "scrollRestoration" in history) history.scrollRestoration = "manual";
  const normalizeParams = applyToParams.bind(null, (paramValue) => "" + paramValue);
  const encodeParams = applyToParams.bind(null, encodeParam);
  const decodeParams = applyToParams.bind(null, decode);
  function addRoute(parentOrRoute, route) {
    let parent;
    let record;
    if (isRouteName(parentOrRoute)) {
      parent = matcher.getRecordMatcher(parentOrRoute);
      record = route;
    } else record = parentOrRoute;
    return matcher.addRoute(record, parent);
  }
  __name(addRoute, "addRoute");
  __name2(addRoute, "addRoute");
  function removeRoute(name) {
    const recordMatcher = matcher.getRecordMatcher(name);
    if (recordMatcher) matcher.removeRoute(recordMatcher);
  }
  __name(removeRoute, "removeRoute");
  __name2(removeRoute, "removeRoute");
  function getRoutes() {
    return matcher.getRoutes().map((routeMatcher) => routeMatcher.record);
  }
  __name(getRoutes, "getRoutes");
  __name2(getRoutes, "getRoutes");
  function hasRoute(name) {
    return !!matcher.getRecordMatcher(name);
  }
  __name(hasRoute, "hasRoute");
  __name2(hasRoute, "hasRoute");
  function resolve2(rawLocation, currentLocation) {
    currentLocation = assign({}, currentLocation || currentRoute.value);
    if (typeof rawLocation === "string") {
      const locationNormalized = parseURL(parseQuery$1, rawLocation, currentLocation.path);
      const matchedRoute$1 = matcher.resolve({ path: locationNormalized.path }, currentLocation);
      const href$1 = routerHistory.createHref(locationNormalized.fullPath);
      return assign(locationNormalized, matchedRoute$1, {
        params: decodeParams(matchedRoute$1.params),
        hash: decode(locationNormalized.hash),
        redirectedFrom: void 0,
        href: href$1
      });
    }
    let matcherLocation;
    if (rawLocation.path != null) {
      matcherLocation = assign({}, rawLocation, { path: parseURL(parseQuery$1, rawLocation.path, currentLocation.path).path });
    } else {
      const targetParams = assign({}, rawLocation.params);
      for (const key in targetParams) if (targetParams[key] == null) delete targetParams[key];
      matcherLocation = assign({}, rawLocation, { params: encodeParams(targetParams) });
      currentLocation.params = encodeParams(currentLocation.params);
    }
    const matchedRoute = matcher.resolve(matcherLocation, currentLocation);
    const hash = rawLocation.hash || "";
    matchedRoute.params = normalizeParams(decodeParams(matchedRoute.params));
    const fullPath = stringifyURL(stringifyQuery$1, assign({}, rawLocation, {
      hash: encodeHash(hash),
      path: matchedRoute.path
    }));
    const href = routerHistory.createHref(fullPath);
    return assign({
      fullPath,
      hash,
      query: stringifyQuery$1 === stringifyQuery ? normalizeQuery(rawLocation.query) : rawLocation.query || {}
    }, matchedRoute, {
      redirectedFrom: void 0,
      href
    });
  }
  __name(resolve2, "resolve2");
  __name2(resolve2, "resolve");
  function locationAsObject(to) {
    return typeof to === "string" ? parseURL(parseQuery$1, to, currentRoute.value.path) : assign({}, to);
  }
  __name(locationAsObject, "locationAsObject");
  __name2(locationAsObject, "locationAsObject");
  function checkCanceledNavigation(to, from) {
    if (pendingLocation !== to) return createRouterError(ErrorTypes.NAVIGATION_CANCELLED, {
      from,
      to
    });
  }
  __name(checkCanceledNavigation, "checkCanceledNavigation");
  __name2(checkCanceledNavigation, "checkCanceledNavigation");
  function push(to) {
    return pushWithRedirect(to);
  }
  __name(push, "push");
  __name2(push, "push");
  function replace(to) {
    return push(assign(locationAsObject(to), { replace: true }));
  }
  __name(replace, "replace");
  __name2(replace, "replace");
  function handleRedirectRecord(to, from) {
    const lastMatched = to.matched[to.matched.length - 1];
    if (lastMatched && lastMatched.redirect) {
      const { redirect } = lastMatched;
      let newTargetLocation = typeof redirect === "function" ? redirect(to, from) : redirect;
      if (typeof newTargetLocation === "string") {
        newTargetLocation = newTargetLocation.includes("?") || newTargetLocation.includes("#") ? newTargetLocation = locationAsObject(newTargetLocation) : { path: newTargetLocation };
        newTargetLocation.params = {};
      }
      return assign({
        query: to.query,
        hash: to.hash,
        params: newTargetLocation.path != null ? {} : to.params
      }, newTargetLocation);
    }
  }
  __name(handleRedirectRecord, "handleRedirectRecord");
  __name2(handleRedirectRecord, "handleRedirectRecord");
  function pushWithRedirect(to, redirectedFrom) {
    const targetLocation = pendingLocation = resolve2(to);
    const from = currentRoute.value;
    const data = to.state;
    const force = to.force;
    const replace$1 = to.replace === true;
    const shouldRedirect = handleRedirectRecord(targetLocation, from);
    if (shouldRedirect) return pushWithRedirect(assign(locationAsObject(shouldRedirect), {
      state: typeof shouldRedirect === "object" ? assign({}, data, shouldRedirect.state) : data,
      force,
      replace: replace$1
    }), redirectedFrom || targetLocation);
    const toLocation = targetLocation;
    toLocation.redirectedFrom = redirectedFrom;
    let failure;
    if (!force && isSameRouteLocation(stringifyQuery$1, from, targetLocation)) {
      failure = createRouterError(ErrorTypes.NAVIGATION_DUPLICATED, {
        to: toLocation,
        from
      });
      handleScroll(from, from, true, false);
    }
    return (failure ? Promise.resolve(failure) : navigate(toLocation, from)).catch((error) => isNavigationFailure(error) ? isNavigationFailure(error, ErrorTypes.NAVIGATION_GUARD_REDIRECT) ? error : markAsReady(error) : triggerError(error, toLocation, from)).then((failure$1) => {
      if (failure$1) {
        if (isNavigationFailure(failure$1, ErrorTypes.NAVIGATION_GUARD_REDIRECT)) {
          return pushWithRedirect(assign({ replace: replace$1 }, locationAsObject(failure$1.to), {
            state: typeof failure$1.to === "object" ? assign({}, data, failure$1.to.state) : data,
            force
          }), redirectedFrom || toLocation);
        }
      } else failure$1 = finalizeNavigation(toLocation, from, true, replace$1, data);
      triggerAfterEach(toLocation, from, failure$1);
      return failure$1;
    });
  }
  __name(pushWithRedirect, "pushWithRedirect");
  __name2(pushWithRedirect, "pushWithRedirect");
  function checkCanceledNavigationAndReject(to, from) {
    const error = checkCanceledNavigation(to, from);
    return error ? Promise.reject(error) : Promise.resolve();
  }
  __name(checkCanceledNavigationAndReject, "checkCanceledNavigationAndReject");
  __name2(checkCanceledNavigationAndReject, "checkCanceledNavigationAndReject");
  function runWithContext(fn) {
    const app = installedApps.values().next().value;
    return app && typeof app.runWithContext === "function" ? app.runWithContext(fn) : fn();
  }
  __name(runWithContext, "runWithContext");
  __name2(runWithContext, "runWithContext");
  function navigate(to, from) {
    let guards;
    const [leavingRecords, updatingRecords, enteringRecords] = extractChangingRecords(to, from);
    guards = extractComponentsGuards(leavingRecords.reverse(), "beforeRouteLeave", to, from);
    for (const record of leavingRecords) record.leaveGuards.forEach((guard) => {
      guards.push(guardToPromiseFn(guard, to, from));
    });
    const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from);
    guards.push(canceledNavigationCheck);
    return runGuardQueue(guards).then(() => {
      guards = [];
      for (const guard of beforeGuards.list()) guards.push(guardToPromiseFn(guard, to, from));
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = extractComponentsGuards(updatingRecords, "beforeRouteUpdate", to, from);
      for (const record of updatingRecords) record.updateGuards.forEach((guard) => {
        guards.push(guardToPromiseFn(guard, to, from));
      });
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const record of enteringRecords) if (record.beforeEnter) if (isArray$1(record.beforeEnter)) for (const beforeEnter of record.beforeEnter) guards.push(guardToPromiseFn(beforeEnter, to, from));
      else guards.push(guardToPromiseFn(record.beforeEnter, to, from));
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      to.matched.forEach((record) => record.enterCallbacks = {});
      guards = extractComponentsGuards(enteringRecords, "beforeRouteEnter", to, from, runWithContext);
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const guard of beforeResolveGuards.list()) guards.push(guardToPromiseFn(guard, to, from));
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).catch((err) => isNavigationFailure(err, ErrorTypes.NAVIGATION_CANCELLED) ? err : Promise.reject(err));
  }
  __name(navigate, "navigate");
  __name2(navigate, "navigate");
  function triggerAfterEach(to, from, failure) {
    afterGuards.list().forEach((guard) => runWithContext(() => guard(to, from, failure)));
  }
  __name(triggerAfterEach, "triggerAfterEach");
  __name2(triggerAfterEach, "triggerAfterEach");
  function finalizeNavigation(toLocation, from, isPush, replace$1, data) {
    const error = checkCanceledNavigation(toLocation, from);
    if (error) return error;
    const isFirstNavigation = from === START_LOCATION_NORMALIZED;
    const state = !isBrowser ? {} : history.state;
    if (isPush) if (replace$1 || isFirstNavigation) routerHistory.replace(toLocation.fullPath, assign({ scroll: isFirstNavigation && state && state.scroll }, data));
    else routerHistory.push(toLocation.fullPath, data);
    currentRoute.value = toLocation;
    handleScroll(toLocation, from, isPush, isFirstNavigation);
    markAsReady();
  }
  __name(finalizeNavigation, "finalizeNavigation");
  __name2(finalizeNavigation, "finalizeNavigation");
  let removeHistoryListener;
  function setupListeners() {
    if (removeHistoryListener) return;
    removeHistoryListener = routerHistory.listen((to, _from, info) => {
      if (!router.listening) return;
      const toLocation = resolve2(to);
      const shouldRedirect = handleRedirectRecord(toLocation, router.currentRoute.value);
      if (shouldRedirect) {
        pushWithRedirect(assign(shouldRedirect, {
          replace: true,
          force: true
        }), toLocation).catch(noop);
        return;
      }
      pendingLocation = toLocation;
      const from = currentRoute.value;
      if (isBrowser) saveScrollPosition(getScrollKey(from.fullPath, info.delta), computeScrollPosition());
      navigate(toLocation, from).catch((error) => {
        if (isNavigationFailure(error, ErrorTypes.NAVIGATION_ABORTED | ErrorTypes.NAVIGATION_CANCELLED)) return error;
        if (isNavigationFailure(error, ErrorTypes.NAVIGATION_GUARD_REDIRECT)) {
          pushWithRedirect(assign(locationAsObject(error.to), { force: true }), toLocation).then((failure) => {
            if (isNavigationFailure(failure, ErrorTypes.NAVIGATION_ABORTED | ErrorTypes.NAVIGATION_DUPLICATED) && !info.delta && info.type === NavigationType.pop) routerHistory.go(-1, false);
          }).catch(noop);
          return Promise.reject();
        }
        if (info.delta) routerHistory.go(-info.delta, false);
        return triggerError(error, toLocation, from);
      }).then((failure) => {
        failure = failure || finalizeNavigation(toLocation, from, false);
        if (failure) {
          if (info.delta && !isNavigationFailure(failure, ErrorTypes.NAVIGATION_CANCELLED)) routerHistory.go(-info.delta, false);
          else if (info.type === NavigationType.pop && isNavigationFailure(failure, ErrorTypes.NAVIGATION_ABORTED | ErrorTypes.NAVIGATION_DUPLICATED)) routerHistory.go(-1, false);
        }
        triggerAfterEach(toLocation, from, failure);
      }).catch(noop);
    });
  }
  __name(setupListeners, "setupListeners");
  __name2(setupListeners, "setupListeners");
  let readyHandlers = useCallbacks();
  let errorListeners = useCallbacks();
  let ready;
  function triggerError(error, to, from) {
    markAsReady(error);
    const list = errorListeners.list();
    if (list.length) list.forEach((handler) => handler(error, to, from));
    else {
      console.error(error);
    }
    return Promise.reject(error);
  }
  __name(triggerError, "triggerError");
  __name2(triggerError, "triggerError");
  function isReady() {
    if (ready && currentRoute.value !== START_LOCATION_NORMALIZED) return Promise.resolve();
    return new Promise((resolve$1, reject) => {
      readyHandlers.add([resolve$1, reject]);
    });
  }
  __name(isReady, "isReady");
  __name2(isReady, "isReady");
  function markAsReady(err) {
    if (!ready) {
      ready = !err;
      setupListeners();
      readyHandlers.list().forEach(([resolve$1, reject]) => err ? reject(err) : resolve$1());
      readyHandlers.reset();
    }
    return err;
  }
  __name(markAsReady, "markAsReady");
  __name2(markAsReady, "markAsReady");
  function handleScroll(to, from, isPush, isFirstNavigation) {
    const { scrollBehavior } = options;
    if (!isBrowser || !scrollBehavior) return Promise.resolve();
    const scrollPosition = !isPush && getSavedScrollPosition(getScrollKey(to.fullPath, 0)) || (isFirstNavigation || !isPush) && history.state && history.state.scroll || null;
    return nextTick().then(() => scrollBehavior(to, from, scrollPosition)).then((position) => position && scrollToPosition(position)).catch((err) => triggerError(err, to, from));
  }
  __name(handleScroll, "handleScroll");
  __name2(handleScroll, "handleScroll");
  const go = /* @__PURE__ */ __name2((delta) => routerHistory.go(delta), "go");
  let started;
  const installedApps = /* @__PURE__ */ new Set();
  const router = {
    currentRoute,
    listening: true,
    addRoute,
    removeRoute,
    clearRoutes: matcher.clearRoutes,
    hasRoute,
    getRoutes,
    resolve: resolve2,
    options,
    push,
    replace,
    go,
    back: /* @__PURE__ */ __name2(() => go(-1), "back"),
    forward: /* @__PURE__ */ __name2(() => go(1), "forward"),
    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,
    onError: errorListeners.add,
    isReady,
    install(app) {
      app.component("RouterLink", RouterLink);
      app.component("RouterView", RouterView);
      app.config.globalProperties.$router = router;
      Object.defineProperty(app.config.globalProperties, "$route", {
        enumerable: true,
        get: /* @__PURE__ */ __name2(() => unref(currentRoute), "get")
      });
      if (isBrowser && !started && currentRoute.value === START_LOCATION_NORMALIZED) {
        started = true;
        push(routerHistory.location).catch((err) => {
        });
      }
      const reactiveRoute = {};
      for (const key in START_LOCATION_NORMALIZED) Object.defineProperty(reactiveRoute, key, {
        get: /* @__PURE__ */ __name2(() => currentRoute.value[key], "get"),
        enumerable: true
      });
      app.provide(routerKey, router);
      app.provide(routeLocationKey, shallowReactive(reactiveRoute));
      app.provide(routerViewLocationKey, currentRoute);
      const unmountApp = app.unmount;
      installedApps.add(app);
      app.unmount = function() {
        installedApps.delete(app);
        if (installedApps.size < 1) {
          pendingLocation = START_LOCATION_NORMALIZED;
          removeHistoryListener && removeHistoryListener();
          removeHistoryListener = null;
          currentRoute.value = START_LOCATION_NORMALIZED;
          started = false;
          ready = false;
        }
        unmountApp();
      };
    }
  };
  function runGuardQueue(guards) {
    return guards.reduce((promise, guard) => promise.then(() => runWithContext(guard)), Promise.resolve());
  }
  __name(runGuardQueue, "runGuardQueue");
  __name2(runGuardQueue, "runGuardQueue");
  return router;
}
__name(createRouter, "createRouter");
__name2(createRouter, "createRouter");
function useRouter() {
  return inject(routerKey);
}
__name(useRouter, "useRouter");
__name2(useRouter, "useRouter");
function useRoute(_name) {
  return inject(routeLocationKey);
}
__name(useRoute, "useRoute");
__name2(useRoute, "useRoute");
// @__NO_SIDE_EFFECTS__
function makeMap(str) {
  const map = /* @__PURE__ */ Object.create(null);
  for (const key of str.split(",")) map[key] = 1;
  return (val) => val in map;
}
__name(makeMap, "makeMap");
__name2(makeMap, "makeMap");
var NOOP = /* @__PURE__ */ __name2(() => {
}, "NOOP");
var isOn = /* @__PURE__ */ __name2((key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
(key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97), "isOn");
var isArray = Array.isArray;
var isMap = /* @__PURE__ */ __name2((val) => toTypeString(val) === "[object Map]", "isMap");
var isSet = /* @__PURE__ */ __name2((val) => toTypeString(val) === "[object Set]", "isSet");
var isFunction = /* @__PURE__ */ __name2((val) => typeof val === "function", "isFunction");
var isString = /* @__PURE__ */ __name2((val) => typeof val === "string", "isString");
var isSymbol = /* @__PURE__ */ __name2((val) => typeof val === "symbol", "isSymbol");
var isObject = /* @__PURE__ */ __name2((val) => val !== null && typeof val === "object", "isObject");
var isPromise = /* @__PURE__ */ __name2((val) => {
  return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
}, "isPromise");
var objectToString = Object.prototype.toString;
var toTypeString = /* @__PURE__ */ __name2((value) => objectToString.call(value), "toTypeString");
var isPlainObject = /* @__PURE__ */ __name2((val) => toTypeString(val) === "[object Object]", "isPlainObject");
var cacheStringFunction = /* @__PURE__ */ __name2((fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return ((str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  });
}, "cacheStringFunction");
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = cacheStringFunction(
  (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
);
var _globalThis;
var getGlobalThis = /* @__PURE__ */ __name2(() => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
}, "getGlobalThis");
function normalizeStyle(value) {
  if (isArray(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value) || isObject(value)) {
    return value;
  }
}
__name(normalizeStyle, "normalizeStyle");
__name2(normalizeStyle, "normalizeStyle");
var listDelimiterRE = /;(?![^(]*\))/g;
var propertyDelimiterRE = /:([^]+)/;
var styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
__name(parseStringStyle, "parseStringStyle");
__name2(parseStringStyle, "parseStringStyle");
function stringifyStyle(styles) {
  if (!styles) return "";
  if (isString(styles)) return styles;
  let ret = "";
  for (const key in styles) {
    const value = styles[key];
    if (isString(value) || typeof value === "number") {
      const normalizedKey = key.startsWith(`--`) ? key : hyphenate(key);
      ret += `${normalizedKey}:${value};`;
    }
  }
  return ret;
}
__name(stringifyStyle, "stringifyStyle");
__name2(stringifyStyle, "stringifyStyle");
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
__name(normalizeClass, "normalizeClass");
__name2(normalizeClass, "normalizeClass");
var SVG_TAGS = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view";
var VOID_TAGS = "area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr";
var isSVGTag = /* @__PURE__ */ makeMap(SVG_TAGS);
var isVoidTag = /* @__PURE__ */ makeMap(VOID_TAGS);
var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
var isBooleanAttr = /* @__PURE__ */ makeMap(
  specialBooleanAttrs + `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,inert,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`
);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
__name(includeBooleanAttr, "includeBooleanAttr");
__name2(includeBooleanAttr, "includeBooleanAttr");
var unsafeAttrCharRE = /[>/="'\u0009\u000a\u000c\u0020]/;
var attrValidationCache = {};
function isSSRSafeAttrName(name) {
  if (attrValidationCache.hasOwnProperty(name)) {
    return attrValidationCache[name];
  }
  const isUnsafe = unsafeAttrCharRE.test(name);
  if (isUnsafe) {
    console.error(`unsafe attribute name: ${name}`);
  }
  return attrValidationCache[name] = !isUnsafe;
}
__name(isSSRSafeAttrName, "isSSRSafeAttrName");
__name2(isSSRSafeAttrName, "isSSRSafeAttrName");
var propsToAttrMap = {
  acceptCharset: "accept-charset",
  className: "class",
  htmlFor: "for",
  httpEquiv: "http-equiv"
};
function isRenderableAttrValue(value) {
  if (value == null) {
    return false;
  }
  const type = typeof value;
  return type === "string" || type === "number" || type === "boolean";
}
__name(isRenderableAttrValue, "isRenderableAttrValue");
__name2(isRenderableAttrValue, "isRenderableAttrValue");
var escapeRE = /["'&<>]/;
function escapeHtml(string) {
  const str = "" + string;
  const match2 = escapeRE.exec(str);
  if (!match2) {
    return str;
  }
  let html = "";
  let escaped;
  let index;
  let lastIndex = 0;
  for (index = match2.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34:
        escaped = "&quot;";
        break;
      case 38:
        escaped = "&amp;";
        break;
      case 39:
        escaped = "&#39;";
        break;
      case 60:
        escaped = "&lt;";
        break;
      case 62:
        escaped = "&gt;";
        break;
      default:
        continue;
    }
    if (lastIndex !== index) {
      html += str.slice(lastIndex, index);
    }
    lastIndex = index + 1;
    html += escaped;
  }
  return lastIndex !== index ? html + str.slice(lastIndex, index) : html;
}
__name(escapeHtml, "escapeHtml");
__name2(escapeHtml, "escapeHtml");
var commentStripRE = /^-?>|<!--|-->|--!>|<!-$/g;
function escapeHtmlComment(src) {
  return src.replace(commentStripRE, "");
}
__name(escapeHtmlComment, "escapeHtmlComment");
__name2(escapeHtmlComment, "escapeHtmlComment");
var isRef = /* @__PURE__ */ __name2((val) => {
  return !!(val && val["__v_isRef"] === true);
}, "isRef");
var toDisplayString = /* @__PURE__ */ __name2((val) => {
  return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? isRef(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
}, "toDisplayString");
var replacer = /* @__PURE__ */ __name2((_key, val) => {
  if (isRef(val)) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce(
        (entries, [key, val2], i) => {
          entries[stringifySymbol(key, i) + " =>"] = val2;
          return entries;
        },
        {}
      )
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v))
    };
  } else if (isSymbol(val)) {
    return stringifySymbol(val);
  } else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
    return String(val);
  }
  return val;
}, "replacer");
var stringifySymbol = /* @__PURE__ */ __name2((v, i = "") => {
  var _a;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v
  );
}, "stringifySymbol");
function normalizeCssVarValue(value) {
  if (value == null) {
    return "initial";
  }
  if (typeof value === "string") {
    return value === "" ? " " : value;
  }
  return String(value);
}
__name(normalizeCssVarValue, "normalizeCssVarValue");
__name2(normalizeCssVarValue, "normalizeCssVarValue");
var shouldIgnoreProp = /* @__PURE__ */ makeMap(
  `,key,ref,innerHTML,textContent,ref_key,ref_for`
);
function ssrRenderAttrs(props, tag) {
  let ret = "";
  for (const key in props) {
    if (shouldIgnoreProp(key) || isOn(key) || tag === "textarea" && key === "value") {
      continue;
    }
    const value = props[key];
    if (key === "class") {
      ret += ` class="${ssrRenderClass(value)}"`;
    } else if (key === "style") {
      ret += ` style="${ssrRenderStyle(value)}"`;
    } else if (key === "className") {
      ret += ` class="${String(value)}"`;
    } else {
      ret += ssrRenderDynamicAttr(key, value, tag);
    }
  }
  return ret;
}
__name(ssrRenderAttrs, "ssrRenderAttrs");
__name2(ssrRenderAttrs, "ssrRenderAttrs");
function ssrRenderDynamicAttr(key, value, tag) {
  if (!isRenderableAttrValue(value)) {
    return ``;
  }
  const attrKey = tag && (tag.indexOf("-") > 0 || isSVGTag(tag)) ? key : propsToAttrMap[key] || key.toLowerCase();
  if (isBooleanAttr(attrKey)) {
    return includeBooleanAttr(value) ? ` ${attrKey}` : ``;
  } else if (isSSRSafeAttrName(attrKey)) {
    return value === "" ? ` ${attrKey}` : ` ${attrKey}="${escapeHtml(value)}"`;
  } else {
    console.warn(
      `[@vue/server-renderer] Skipped rendering unsafe attribute name: ${attrKey}`
    );
    return ``;
  }
}
__name(ssrRenderDynamicAttr, "ssrRenderDynamicAttr");
__name2(ssrRenderDynamicAttr, "ssrRenderDynamicAttr");
function ssrRenderAttr(key, value) {
  if (!isRenderableAttrValue(value)) {
    return ``;
  }
  return ` ${key}="${escapeHtml(value)}"`;
}
__name(ssrRenderAttr, "ssrRenderAttr");
__name2(ssrRenderAttr, "ssrRenderAttr");
function ssrRenderClass(raw) {
  return escapeHtml(normalizeClass(raw));
}
__name(ssrRenderClass, "ssrRenderClass");
__name2(ssrRenderClass, "ssrRenderClass");
function ssrRenderStyle(raw) {
  if (!raw) {
    return "";
  }
  if (isString(raw)) {
    return escapeHtml(raw);
  }
  const styles = normalizeStyle(ssrResetCssVars(raw));
  return escapeHtml(stringifyStyle(styles));
}
__name(ssrRenderStyle, "ssrRenderStyle");
__name2(ssrRenderStyle, "ssrRenderStyle");
function ssrResetCssVars(raw) {
  if (!isArray(raw) && isObject(raw)) {
    const res = {};
    for (const key in raw) {
      if (key.startsWith(":--")) {
        res[key.slice(1)] = normalizeCssVarValue(raw[key]);
      } else {
        res[key] = raw[key];
      }
    }
    return res;
  }
  return raw;
}
__name(ssrResetCssVars, "ssrResetCssVars");
__name2(ssrResetCssVars, "ssrResetCssVars");
function ssrRenderComponent(comp, props = null, children = null, parentComponent = null, slotScopeId) {
  return renderComponentVNode(
    createVNode(comp, props, children),
    parentComponent,
    slotScopeId
  );
}
__name(ssrRenderComponent, "ssrRenderComponent");
__name2(ssrRenderComponent, "ssrRenderComponent");
function ssrRenderTeleport(parentPush, contentRenderFn, target, disabled, parentComponent) {
  parentPush("<!--teleport start-->");
  const context = parentComponent.appContext.provides[ssrContextKey];
  const teleportBuffers = context.__teleportBuffers || (context.__teleportBuffers = {});
  const targetBuffer = teleportBuffers[target] || (teleportBuffers[target] = []);
  const bufferIndex = targetBuffer.length;
  let teleportContent;
  if (disabled) {
    contentRenderFn(parentPush);
    teleportContent = `<!--teleport start anchor--><!--teleport anchor-->`;
  } else {
    const { getBuffer, push } = createBuffer();
    push(`<!--teleport start anchor-->`);
    contentRenderFn(push);
    push(`<!--teleport anchor-->`);
    teleportContent = getBuffer();
  }
  targetBuffer.splice(bufferIndex, 0, teleportContent);
  parentPush("<!--teleport end-->");
}
__name(ssrRenderTeleport, "ssrRenderTeleport");
__name2(ssrRenderTeleport, "ssrRenderTeleport");
function ssrInterpolate(value) {
  return escapeHtml(toDisplayString(value));
}
__name(ssrInterpolate, "ssrInterpolate");
__name2(ssrInterpolate, "ssrInterpolate");
{
  const g = getGlobalThis();
  const registerGlobalSetter = /* @__PURE__ */ __name2((key, setter) => {
    let setters;
    if (!(setters = g[key])) setters = g[key] = [];
    setters.push(setter);
    return (v) => {
      if (setters.length > 1) setters.forEach((set) => set(v));
      else setters[0](v);
    };
  }, "registerGlobalSetter");
  registerGlobalSetter(
    `__VUE_INSTANCE_SETTERS__`,
    (v) => v
  );
  registerGlobalSetter(
    `__VUE_SSR_SETTERS__`,
    (v) => v
  );
}
function ssrRenderList(source, renderItem) {
  if (isArray(source) || isString(source)) {
    for (let i = 0, l = source.length; i < l; i++) {
      renderItem(source[i], i);
    }
  } else if (typeof source === "number") {
    for (let i = 0; i < source; i++) {
      renderItem(i + 1, i);
    }
  } else if (isObject(source)) {
    if (source[Symbol.iterator]) {
      const arr = Array.from(source);
      for (let i = 0, l = arr.length; i < l; i++) {
        renderItem(arr[i], i);
      }
    } else {
      const keys = Object.keys(source);
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        renderItem(source[key], key, i);
      }
    }
  }
}
__name(ssrRenderList, "ssrRenderList");
__name2(ssrRenderList, "ssrRenderList");
function ssrCompile(template, instance) {
  {
    throw new Error(
      `On-the-fly template compilation is not supported in the ESM build of @vue/server-renderer. All templates must be pre-compiled into render functions.`
    );
  }
}
__name(ssrCompile, "ssrCompile");
__name2(ssrCompile, "ssrCompile");
var {
  createComponentInstance,
  setCurrentRenderingInstance,
  setupComponent,
  renderComponentRoot,
  normalizeVNode
} = ssrUtils;
function createBuffer() {
  let appendable = false;
  const buffer2 = [];
  return {
    getBuffer() {
      return buffer2;
    },
    push(item) {
      const isStringItem = isString(item);
      if (appendable && isStringItem) {
        buffer2[buffer2.length - 1] += item;
        return;
      }
      buffer2.push(item);
      appendable = isStringItem;
      if (isPromise(item) || isArray(item) && item.hasAsync) {
        buffer2.hasAsync = true;
      }
    }
  };
}
__name(createBuffer, "createBuffer");
__name2(createBuffer, "createBuffer");
function renderComponentVNode(vnode, parentComponent = null, slotScopeId) {
  const instance = vnode.component = createComponentInstance(
    vnode,
    parentComponent,
    null
  );
  const res = setupComponent(
    instance,
    true
    /* isSSR */
  );
  const hasAsyncSetup = isPromise(res);
  let prefetches = instance.sp;
  if (hasAsyncSetup || prefetches) {
    const p2 = Promise.resolve(res).then(() => {
      if (hasAsyncSetup) prefetches = instance.sp;
      if (prefetches) {
        return Promise.all(
          prefetches.map((prefetch) => prefetch.call(instance.proxy))
        );
      }
    }).catch(NOOP);
    return p2.then(() => renderComponentSubTree(instance, slotScopeId));
  } else {
    return renderComponentSubTree(instance, slotScopeId);
  }
}
__name(renderComponentVNode, "renderComponentVNode");
__name2(renderComponentVNode, "renderComponentVNode");
function renderComponentSubTree(instance, slotScopeId) {
  const comp = instance.type;
  const { getBuffer, push } = createBuffer();
  if (isFunction(comp)) {
    let root = renderComponentRoot(instance);
    if (!comp.props) {
      for (const key in instance.attrs) {
        if (key.startsWith(`data-v-`)) {
          (root.props || (root.props = {}))[key] = ``;
        }
      }
    }
    renderVNode(push, instance.subTree = root, instance, slotScopeId);
  } else {
    if ((!instance.render || instance.render === NOOP) && !instance.ssrRender && !comp.ssrRender && isString(comp.template)) {
      comp.ssrRender = ssrCompile(comp.template);
    }
    const ssrRender = instance.ssrRender || comp.ssrRender;
    if (ssrRender) {
      let attrs = instance.inheritAttrs !== false ? instance.attrs : void 0;
      let hasCloned = false;
      let cur = instance;
      while (true) {
        const scopeId = cur.vnode.scopeId;
        if (scopeId) {
          if (!hasCloned) {
            attrs = { ...attrs };
            hasCloned = true;
          }
          attrs[scopeId] = "";
        }
        const parent = cur.parent;
        if (parent && parent.subTree && parent.subTree === cur.vnode) {
          cur = parent;
        } else {
          break;
        }
      }
      if (slotScopeId) {
        if (!hasCloned) attrs = { ...attrs };
        const slotScopeIdList = slotScopeId.trim().split(" ");
        for (let i = 0; i < slotScopeIdList.length; i++) {
          attrs[slotScopeIdList[i]] = "";
        }
      }
      const prev = setCurrentRenderingInstance(instance);
      try {
        ssrRender(
          instance.proxy,
          push,
          instance,
          attrs,
          // compiler-optimized bindings
          instance.props,
          instance.setupState,
          instance.data,
          instance.ctx
        );
      } finally {
        setCurrentRenderingInstance(prev);
      }
    } else if (instance.render && instance.render !== NOOP) {
      renderVNode(
        push,
        instance.subTree = renderComponentRoot(instance),
        instance,
        slotScopeId
      );
    } else {
      comp.name || comp.__file || `<Anonymous>`;
      push(`<!---->`);
    }
  }
  return getBuffer();
}
__name(renderComponentSubTree, "renderComponentSubTree");
__name2(renderComponentSubTree, "renderComponentSubTree");
function renderVNode(push, vnode, parentComponent, slotScopeId) {
  const { type, shapeFlag, children, dirs, props } = vnode;
  if (dirs) {
    vnode.props = applySSRDirectives(vnode, props, dirs);
  }
  switch (type) {
    case Text:
      push(escapeHtml(children));
      break;
    case Comment:
      push(
        children ? `<!--${escapeHtmlComment(children)}-->` : `<!---->`
      );
      break;
    case Static:
      push(children);
      break;
    case Fragment:
      if (vnode.slotScopeIds) {
        slotScopeId = (slotScopeId ? slotScopeId + " " : "") + vnode.slotScopeIds.join(" ");
      }
      push(`<!--[-->`);
      renderVNodeChildren(
        push,
        children,
        parentComponent,
        slotScopeId
      );
      push(`<!--]-->`);
      break;
    default:
      if (shapeFlag & 1) {
        renderElementVNode(push, vnode, parentComponent, slotScopeId);
      } else if (shapeFlag & 6) {
        push(renderComponentVNode(vnode, parentComponent, slotScopeId));
      } else if (shapeFlag & 64) {
        renderTeleportVNode(push, vnode, parentComponent, slotScopeId);
      } else if (shapeFlag & 128) {
        renderVNode(push, vnode.ssContent, parentComponent, slotScopeId);
      } else ;
  }
}
__name(renderVNode, "renderVNode");
__name2(renderVNode, "renderVNode");
function renderVNodeChildren(push, children, parentComponent, slotScopeId) {
  for (let i = 0; i < children.length; i++) {
    renderVNode(push, normalizeVNode(children[i]), parentComponent, slotScopeId);
  }
}
__name(renderVNodeChildren, "renderVNodeChildren");
__name2(renderVNodeChildren, "renderVNodeChildren");
function renderElementVNode(push, vnode, parentComponent, slotScopeId) {
  const tag = vnode.type;
  let { props, children, shapeFlag, scopeId } = vnode;
  let openTag = `<${tag}`;
  if (props) {
    openTag += ssrRenderAttrs(props, tag);
  }
  if (scopeId) {
    openTag += ` ${scopeId}`;
  }
  let curParent = parentComponent;
  let curVnode = vnode;
  while (curParent && curVnode === curParent.subTree) {
    curVnode = curParent.vnode;
    if (curVnode.scopeId) {
      openTag += ` ${curVnode.scopeId}`;
    }
    curParent = curParent.parent;
  }
  if (slotScopeId) {
    openTag += ` ${slotScopeId}`;
  }
  push(openTag + `>`);
  if (!isVoidTag(tag)) {
    let hasChildrenOverride = false;
    if (props) {
      if (props.innerHTML) {
        hasChildrenOverride = true;
        push(props.innerHTML);
      } else if (props.textContent) {
        hasChildrenOverride = true;
        push(escapeHtml(props.textContent));
      } else if (tag === "textarea" && props.value) {
        hasChildrenOverride = true;
        push(escapeHtml(props.value));
      }
    }
    if (!hasChildrenOverride) {
      if (shapeFlag & 8) {
        push(escapeHtml(children));
      } else if (shapeFlag & 16) {
        renderVNodeChildren(
          push,
          children,
          parentComponent,
          slotScopeId
        );
      }
    }
    push(`</${tag}>`);
  }
}
__name(renderElementVNode, "renderElementVNode");
__name2(renderElementVNode, "renderElementVNode");
function applySSRDirectives(vnode, rawProps, dirs) {
  const toMerge = [];
  for (let i = 0; i < dirs.length; i++) {
    const binding = dirs[i];
    const {
      dir: { getSSRProps }
    } = binding;
    if (getSSRProps) {
      const props = getSSRProps(binding, vnode);
      if (props) toMerge.push(props);
    }
  }
  return mergeProps(rawProps || {}, ...toMerge);
}
__name(applySSRDirectives, "applySSRDirectives");
__name2(applySSRDirectives, "applySSRDirectives");
function renderTeleportVNode(push, vnode, parentComponent, slotScopeId) {
  const target = vnode.props && vnode.props.to;
  const disabled = vnode.props && vnode.props.disabled;
  if (!target) {
    return [];
  }
  if (!isString(target)) {
    return [];
  }
  ssrRenderTeleport(
    push,
    (push2) => {
      renderVNodeChildren(
        push2,
        vnode.children,
        parentComponent,
        slotScopeId
      );
    },
    target,
    disabled || disabled === "",
    parentComponent
  );
}
__name(renderTeleportVNode, "renderTeleportVNode");
__name2(renderTeleportVNode, "renderTeleportVNode");
initDirectivesForSSR();
var _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "Title",
  __ssrInlineRender: true,
  props: {
    title: {},
    subtitle: {},
    activity: { type: Boolean },
    joke: { type: Boolean }
  },
  emits: ["activity", "joke"],
  setup(__props, { emit: __emit }) {
    const animatingTitle = ref(false);
    const animatingSubtitle = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<ul${ssrRenderAttrs(_attrs)} data-v-9019f30a><li data-v-9019f30a><hgroup data-v-9019f30a><h1 class="${ssrRenderClass([{ "space-warp": animatingTitle.value }, "title question"])}" data-v-9019f30a>${ssrInterpolate(__props.title)}</h1><h2 class="${ssrRenderClass([{ "space-warp": animatingSubtitle.value }, "title question"])}" data-v-9019f30a>${ssrInterpolate(__props.subtitle)}</h2></hgroup></li></ul>`);
    };
  }
});
var _export_sfc = /* @__PURE__ */ __name2((sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
}, "_export_sfc");
var _sfc_setup$e = _sfc_main$e.setup;
_sfc_main$e.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Title.vue");
  return _sfc_setup$e ? _sfc_setup$e(props, ctx) : void 0;
};
var Title = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__scopeId", "data-v-9019f30a"]]);
var _imports_0 = "/person-icon.svg";
var _imports_1 = "/plane-icon.svg";
var _imports_2 = "/64k-icon.svg";
var _imports_3 = "/sound-icon.svg";
var _imports_4 = "/mute-icon.svg";
var _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "MenuItem",
  __ssrInlineRender: true,
  props: {
    page: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_router_link = resolveComponent("router-link");
      _push(`<li${ssrRenderAttrs(mergeProps({ class: "menu-item" }, _attrs))} data-v-911096ea>`);
      _push(ssrRenderComponent(_component_router_link, {
        to: __props.page.link,
        onMousedown: /* @__PURE__ */ __name2(() => {
        }, "onMousedown")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(__props.page.name)}`);
          } else {
            return [
              createTextVNode(toDisplayString$1(__props.page.name), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li>`);
    };
  }
});
var _sfc_setup$d = _sfc_main$d.setup;
_sfc_main$d.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/MenuItem.vue");
  return _sfc_setup$d ? _sfc_setup$d(props, ctx) : void 0;
};
var MenuItem = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["__scopeId", "data-v-911096ea"]]);
var _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "WeatherIcon",
  __ssrInlineRender: true,
  setup(__props) {
    const iconType = ref("");
    const description = ref("Loading weather...");
    const showModal = ref(false);
    const isMounted = ref(false);
    const hourlyForecast = ref([]);
    const fetchWeather = /* @__PURE__ */ __name2(async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=51.9001&longitude=-2.0877&current_weather=true&hourly=temperature_2m,rain&timezone=Europe%2FLondon"
        );
        if (!res.ok) throw new Error("Failed to fetch weather");
        const data = await res.json();
        const code = data.current_weather.weathercode;
        const temp = data.current_weather.temperature;
        updateIcon(code, temp);
        processHourlyData(data.hourly);
      } catch (error) {
        console.error("Weather fetch error:", error);
        description.value = "Weather data unavailable";
        iconType.value = "";
      }
    }, "fetchWeather");
    const processHourlyData = /* @__PURE__ */ __name2((hourly) => {
      const now = /* @__PURE__ */ new Date();
      const currentHourStr = now.toISOString().slice(0, 13);
      let startIndex = hourly.time.findIndex((t) => t.startsWith(currentHourStr));
      if (startIndex === -1) {
        const nowTime = now.getTime();
        let minDiff = Infinity;
        startIndex = 0;
        for (let i = 0; i < hourly.time.length; i++) {
          const t = new Date(hourly.time[i]).getTime();
          const diff = Math.abs(t - nowTime);
          if (diff < minDiff) {
            minDiff = diff;
            startIndex = i;
          }
        }
      }
      const next6 = [];
      for (let i = startIndex; i < startIndex + 6; i++) {
        if (hourly.time[i]) {
          next6.push({
            time: hourly.time[i].slice(11, 16),
            // Extract HH:MM
            temp: hourly.temperature_2m[i],
            rain: hourly.rain ? hourly.rain[i] : 0
          });
        }
      }
      hourlyForecast.value = next6;
    }, "processHourlyData");
    const updateIcon = /* @__PURE__ */ __name2((code, temp) => {
      let weatherDesc = "";
      switch (true) {
        case code === 0:
          iconType.value = "sun";
          weatherDesc = "Clear Sky";
          break;
        case [1, 2, 3].includes(code):
          iconType.value = "cloud";
          weatherDesc = "Partly Cloudy";
          break;
        case [45, 48].includes(code):
          iconType.value = "cloud";
          weatherDesc = "Fog";
          break;
        case [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code):
          iconType.value = "rain";
          weatherDesc = "Rain";
          break;
        case [71, 73, 75, 77, 85, 86].includes(code):
          iconType.value = "snow";
          weatherDesc = "Snow";
          break;
        case [95, 96, 99].includes(code):
          iconType.value = "thunder";
          weatherDesc = "Thunderstorm";
          break;
        default:
          iconType.value = "cloud";
          weatherDesc = "Unknown";
          break;
      }
      description.value = `${weatherDesc} (${temp}\xB0C) in Cheltenham, UK`;
    }, "updateIcon");
    const computedPoints = computed(() => {
      if (hourlyForecast.value.length === 0) return [];
      const temps = hourlyForecast.value.map((d) => d.temp);
      const min = Math.min(...temps);
      const max = Math.max(...temps);
      const padding = 2;
      const range = max - min + padding * 2 || 1;
      const bottomVal = min - padding;
      const width = 300;
      const height = 130;
      const stepX = width / (hourlyForecast.value.length - 1 || 1);
      const rains = hourlyForecast.value.map((d) => d.rain);
      const maxRain = Math.max(...rains, 5);
      return hourlyForecast.value.map((d, i) => {
        const rainHeight = d.rain / maxRain * (height * 0.4);
        return {
          x: i * stepX,
          y: height - (d.temp - bottomVal) / range * height,
          temp: d.temp,
          time: d.time,
          rain: d.rain,
          rainHeight,
          rainY: 135 - rainHeight
          // Start from bottom line (135)
        };
      });
    });
    const graphPoints = computed(() => {
      return computedPoints.value.map((p2) => `${p2.x},${p2.y}`).join(" ");
    });
    onMounted(() => {
      isMounted.value = true;
      fetchWeather();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "icon-wrapper",
        title: description.value
      }, _attrs))} data-v-b5b7b94b>`);
      if (iconType.value === "sun") {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" class="icon" data-v-b5b7b94b><circle cx="12" cy="12" r="5" data-v-b5b7b94b></circle><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="black" stroke-width="2" stroke-linecap="round" data-v-b5b7b94b></path></svg>`);
      } else if (iconType.value === "cloud") {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" class="icon" data-v-b5b7b94b><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" data-v-b5b7b94b></path></svg>`);
      } else if (iconType.value === "rain") {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" class="icon" data-v-b5b7b94b><path d="M16 13c.8 0 1.5.2 2.1.6 1.1 0 2.2 1.3 1.9 2.4-.2 1.1-1.3 1.6-2.4 1.6H7c-1.8 0-3.3-1.2-3.8-2.9-.5-1.7.3-3.6 1.9-4.3.4-2.8 2.8-5 5.7-5 2.1 0 4 .1 5.3 1.7" fill="none" stroke="black" stroke-width="2" data-v-b5b7b94b></path><path d="M8 19v2m4-2v2m4-2v2" stroke="black" stroke-width="2" stroke-linecap="round" data-v-b5b7b94b></path></svg>`);
      } else if (iconType.value === "snow") {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" class="icon" data-v-b5b7b94b><path d="M12 2v20m-8-6 16-8m-16 8 16-8" stroke="black" stroke-width="2" stroke-linecap="round" data-v-b5b7b94b></path><path d="M12 2l-2 3m2-3l2 3m-2 17l-2-3m2 3l2-3M4 16l3 1m-3-1l2-3m14 2l-3 1m3-1l-2-3M4 8l3-1m-3 1l2 3m14-2l-3-1m3 1l-2 3" stroke="black" stroke-width="2" stroke-linecap="round" data-v-b5b7b94b></path></svg>`);
      } else if (iconType.value === "thunder") {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" class="icon" data-v-b5b7b94b><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" data-v-b5b7b94b></path><path d="M13 14l-2 4h3l-1 4" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-b5b7b94b></path></svg>`);
      } else {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" class="icon" data-v-b5b7b94b><text x="50%" y="75%" text-anchor="middle" font-size="20" font-weight="bold" fill="black" data-v-b5b7b94b>?</text></svg>`);
      }
      if (isMounted.value) {
        ssrRenderTeleport(_push, (_push2) => {
          if (showModal.value) {
            _push2(`<div class="weather-modal-overlay" data-v-b5b7b94b><article class="weather-modal" data-v-b5b7b94b><header class="modal-header" data-v-b5b7b94b><h3 data-v-b5b7b94b>Weather Forecast</h3><button class="close-btn" aria-label="Close" data-v-b5b7b94b>\xD7</button></header><div class="chart-container" data-v-b5b7b94b><svg viewBox="0 0 300 150" class="weather-chart" data-v-b5b7b94b><line x1="0" y1="135" x2="300" y2="135" stroke="#444" stroke-width="1" data-v-b5b7b94b></line><!--[-->`);
            ssrRenderList(computedPoints.value, (point, index) => {
              _push2(`<g data-v-b5b7b94b><rect${ssrRenderAttr("x", point.x - 5)}${ssrRenderAttr("y", point.rainY)} width="10"${ssrRenderAttr("height", point.rainHeight)} fill="rgba(0, 100, 255, 0.4)" class="rain-bar" data-v-b5b7b94b></rect>`);
              if (point.rain > 0) {
                _push2(`<text${ssrRenderAttr("x", point.x)}${ssrRenderAttr("y", point.rainY - 4)} text-anchor="middle" fill="#3399ff" font-size="9" data-v-b5b7b94b>${ssrInterpolate(point.rain)}mm</text>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</g>`);
            });
            _push2(`<!--]--><polyline${ssrRenderAttr("points", graphPoints.value)} fill="none" stroke="#00ff9d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" data-v-b5b7b94b></polyline><!--[-->`);
            ssrRenderList(computedPoints.value, (point, index) => {
              _push2(`<g data-v-b5b7b94b><circle${ssrRenderAttr("cx", point.x)}${ssrRenderAttr("cy", point.y)} r="4" fill="#111" stroke="#00ff9d" stroke-width="2" class="data-point" data-v-b5b7b94b></circle><text${ssrRenderAttr("x", point.x)} y="148" text-anchor="middle" fill="#ccc" font-size="10" data-v-b5b7b94b>${ssrInterpolate(point.time)}</text><text${ssrRenderAttr("x", point.x)}${ssrRenderAttr("y", point.y - 10)} text-anchor="middle" fill="#fff" font-size="12" font-weight="bold" data-v-b5b7b94b>${ssrInterpolate(point.temp)}\xB0</text></g>`);
            });
            _push2(`<!--]--></svg></div><footer class="modal-footer" data-v-b5b7b94b><small data-v-b5b7b94b>Next 6 hours in Cheltenham</small><div class="legend" data-v-b5b7b94b><span class="legend-item" data-v-b5b7b94b><span class="dot temp" data-v-b5b7b94b></span>Temp</span><span class="legend-item" data-v-b5b7b94b><span class="dot rain" data-v-b5b7b94b></span>Rain</span></div></footer></article></div>`);
          } else {
            _push2(`<!---->`);
          }
        }, "body", false, _parent);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
var _sfc_setup$c = _sfc_main$c.setup;
_sfc_main$c.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/WeatherIcon.vue");
  return _sfc_setup$c ? _sfc_setup$c(props, ctx) : void 0;
};
var WeatherIcon = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__scopeId", "data-v-b5b7b94b"]]);
var CyberpunkAudio = class {
  static {
    __name(this, "CyberpunkAudio");
  }
  static {
    __name2(this, "CyberpunkAudio");
  }
  ctx = null;
  isPlaying = false;
  nextNoteTime = 0;
  tempo = 110;
  lookahead = 25;
  // ms
  scheduleAheadTime = 0.1;
  // s
  timerID = null;
  current16thNote = 0;
  bassPattern = [];
  kickPattern = [];
  snarePattern = [];
  hiHatPattern = [];
  seed;
  listeners = [];
  // Reusable buffers
  snareBuffer = null;
  hiHatBuffer = null;
  // Note scale
  root = 41.2;
  scale = [
    this.root,
    // I
    this.root * 1.2,
    // m3
    this.root * 1.5,
    // V
    this.root * 1.78,
    // b7
    this.root * 2
    // VIII
  ];
  constructor() {
    this.seed = Date.now();
    this.generateBassPattern();
    this.generateDrumPatterns();
  }
  addListener(callback) {
    this.listeners.push(callback);
  }
  removeListener(callback) {
    this.listeners = this.listeners.filter((l) => l !== callback);
  }
  // Seeded random number generator (Mulberry32)
  random() {
    let t = this.seed += 1831565813;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  generateBassPattern() {
    this.bassPattern = new Array(128).fill(0);
    const motifLength = 32;
    for (let i = 0; i < 128; i++) {
      if (i % 2 === 0) {
        const motifPos = i % motifLength;
        const isStrongBeat = motifPos % 16 === 0;
        const isOffBeat = motifPos % 4 === 2;
        let noteProbability = 0.5;
        if (isStrongBeat) noteProbability = 0.9;
        else if (isOffBeat) noteProbability = 0.7;
        const isVariationSection = i >= 64;
        if (isVariationSection && i % 4 === 0) {
          noteProbability += 0.2;
        }
        if (this.random() < noteProbability) {
          const r = this.random();
          let noteIndex;
          if (isStrongBeat) {
            noteIndex = r > 0.7 ? 4 : 0;
          } else {
            if (r > 0.8) noteIndex = 3;
            else if (r > 0.6) noteIndex = 2;
            else if (r > 0.4) noteIndex = 1;
            else noteIndex = 0;
          }
          this.bassPattern[i] = noteIndex + 1;
        }
      }
    }
  }
  generateDrumPatterns() {
    this.kickPattern = new Array(128).fill(0);
    this.snarePattern = new Array(128).fill(0);
    this.hiHatPattern = new Array(128).fill(0);
    for (let bar = 0; bar < 8; bar++) {
      const offset = bar * 16;
      this.kickPattern[offset + 0] = 1;
      if (this.random() < 0.9) {
        this.kickPattern[offset + 8] = 1;
      }
      if (this.random() < 0.3) {
        this.kickPattern[offset + 10] = 0.8;
      }
      if (this.random() < 0.3) {
        this.kickPattern[offset + 14] = 0.7;
      }
      if ((bar + 1) % 4 === 0) {
        if (this.random() < 0.5) this.kickPattern[offset + 11] = 0.6;
        if (this.random() < 0.5) this.kickPattern[offset + 15] = 0.6;
      }
      this.snarePattern[offset + 4] = 1;
      this.snarePattern[offset + 12] = 1;
      if (this.random() < 0.4) this.snarePattern[offset + 7] = 0.3;
      if (this.random() < 0.3) this.snarePattern[offset + 9] = 0.3;
      if (this.random() < 0.3) this.snarePattern[offset + 15] = 0.2;
      for (let i = 0; i < 16; i++) {
        const globalIndex = offset + i;
        const isDownbeat = i % 4 === 0;
        const isUpbeat = i % 4 === 2;
        if (isUpbeat) {
          this.hiHatPattern[globalIndex] = 0.8;
        } else if (isDownbeat) {
          this.hiHatPattern[globalIndex] = 0.4;
        } else {
          this.hiHatPattern[globalIndex] = 0.2;
        }
        if (this.random() < 0.1) {
          this.hiHatPattern[globalIndex] = 0;
        }
      }
      if (this.random() < 0.2) {
        const upbeatIndex = offset + 2 + Math.floor(this.random() * 4) * 4;
        this.hiHatPattern[upbeatIndex] = 1.2;
      }
    }
  }
  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.createNoiseBuffers();
      }
    }
  }
  createNoiseBuffers() {
    if (!this.ctx) return;
    const snareSize = this.ctx.sampleRate * 0.1;
    this.snareBuffer = this.ctx.createBuffer(1, snareSize, this.ctx.sampleRate);
    const snareData = this.snareBuffer.getChannelData(0);
    for (let i = 0; i < snareSize; i++) {
      snareData[i] = Math.random() * 2 - 1;
    }
    const hatSize = this.ctx.sampleRate * 0.05;
    this.hiHatBuffer = this.ctx.createBuffer(1, hatSize, this.ctx.sampleRate);
    const hatData = this.hiHatBuffer.getChannelData(0);
    for (let i = 0; i < hatSize; i++) {
      hatData[i] = Math.random() * 2 - 1;
    }
  }
  play() {
    this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.current16thNote = 0;
      this.nextNoteTime = this.ctx.currentTime;
      this.scheduler();
    }
  }
  pause() {
    this.isPlaying = false;
    if (this.timerID !== null) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }
    if (this.ctx && this.ctx.state === "running") {
      this.ctx.suspend();
    }
  }
  scheduler() {
    if (!this.ctx || !this.isPlaying) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.current16thNote, this.nextNoteTime);
      this.nextNote();
    }
    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }
  nextNote() {
    const secondsPerBeat = 60 / this.tempo;
    this.nextNoteTime += 0.25 * secondsPerBeat;
    this.current16thNote++;
    if (this.current16thNote === 128) {
      this.current16thNote = 0;
    }
  }
  scheduleNote(beatNumber, time) {
    if (!this.ctx) return;
    let delay = (time - this.ctx.currentTime) * 1e3;
    if (delay < 0) delay = 0;
    const triggerVisual = /* @__PURE__ */ __name2((type, data) => {
      setTimeout(() => {
        this.listeners.forEach((l) => l(type, data));
      }, delay);
    }, "triggerVisual");
    if (beatNumber % 2 === 0) {
      const noteVal = this.bassPattern[beatNumber];
      if (noteVal > 0) {
        const noteIndex = noteVal - 1;
        this.playBass(time, this.scale[noteIndex]);
        triggerVisual("bass", noteIndex);
      }
    }
    const kickVel = this.kickPattern[beatNumber];
    if (kickVel > 0) {
      this.playKick(time, kickVel);
      triggerVisual("kick", kickVel);
    }
    const snareVel = this.snarePattern[beatNumber];
    if (snareVel > 0) {
      this.playSnare(time, snareVel);
      triggerVisual("snare", snareVel);
    }
    const hatVel = this.hiHatPattern[beatNumber];
    if (hatVel > 0) {
      this.playHiHat(time, hatVel);
      triggerVisual("hihat", hatVel);
    }
  }
  playBass(time, freq) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, time);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, time);
    filter.frequency.exponentialRampToValueAtTime(800, time + 0.1);
    filter.frequency.exponentialRampToValueAtTime(200, time + 0.2);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.25);
  }
  playKick(time, velocity = 1) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
    const peakGain = 0.7 * velocity;
    gain.gain.setValueAtTime(peakGain, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.1);
  }
  playSnare(time, velocity = 1) {
    if (!this.ctx || !this.snareBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.snareBuffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 1e3;
    const noiseGain = this.ctx.createGain();
    const peakNoiseGain = 0.4 * velocity;
    noiseGain.gain.setValueAtTime(peakNoiseGain, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(time);
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(250, time);
    const peakOscGain = 0.2 * velocity;
    oscGain.gain.setValueAtTime(peakOscGain, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.1);
  }
  playHiHat(time, velocity = 1) {
    if (!this.ctx || !this.hiHatBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.hiHatBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 8e3;
    const gain = this.ctx.createGain();
    const isOpen = velocity > 1;
    const duration = isOpen ? 0.3 : 0.05;
    const actualVelocity = isOpen ? 1 : velocity;
    const peakGain = 0.15 * actualVelocity;
    gain.gain.setValueAtTime(peakGain, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(time);
  }
};
new CyberpunkAudio();
var _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "Menu",
  __ssrInlineRender: true,
  props: {
    pages: {},
    contentVisible: { type: Boolean }
  },
  emits: ["explore", "fly", "toggle-content", "demo"],
  setup(__props, { emit: __emit }) {
    const soundOn = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<ul${ssrRenderAttrs(_attrs)} data-v-2cec6591><!--[-->`);
      ssrRenderList(__props.pages, (page) => {
        _push(ssrRenderComponent(MenuItem, {
          key: page.link,
          page
        }, null, _parent));
      });
      _push(`<!--]--><li class="icons-container" data-v-2cec6591><div class="icon-wrapper" title="Explore City" data-v-2cec6591><img${ssrRenderAttr("src", _imports_0)} alt="Explore City" class="icon" data-v-2cec6591></div><div class="icon-wrapper" title="Fly Tour" data-v-2cec6591><img${ssrRenderAttr("src", _imports_1)} alt="Fly Tour" class="icon" data-v-2cec6591></div><div class="icon-wrapper" title="64k Demo" data-v-2cec6591><img${ssrRenderAttr("src", _imports_2)} alt="64k Demo" class="icon" data-v-2cec6591></div><div class="icon-wrapper" title="Toggle Sound" data-v-2cec6591>`);
      if (soundOn.value) {
        _push(`<img${ssrRenderAttr("src", _imports_3)} alt="Toggle sound" class="icon" data-v-2cec6591>`);
      } else {
        _push(`<img${ssrRenderAttr("src", _imports_4)} alt="Toggle sound" class="icon" data-v-2cec6591>`);
      }
      _push(`</div><div class="icon-wrapper" title="Toggle Visibility" data-v-2cec6591>`);
      if (__props.contentVisible) {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000" class="icon" data-v-2cec6591><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" data-v-2cec6591></path><path fill-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clip-rule="evenodd" data-v-2cec6591></path></svg>`);
      } else {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000" class="icon" data-v-2cec6591><path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" data-v-2cec6591></path><path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.244 4.243z" data-v-2cec6591></path><path d="M6.75 12c0-.619.107-1.215.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" data-v-2cec6591></path></svg>`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(WeatherIcon, { class: "icon" }, null, _parent));
      _push(`</li></ul>`);
    };
  }
});
var _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Menu.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
var Menu = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-2cec6591"]]);
var _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "Checker",
  __ssrInlineRender: true,
  setup(__props) {
    const count = ref(0);
    const limitTime = ref("");
    const soberTime = ref("");
    function updateTimes() {
      const options = {
        hour: "2-digit",
        minute: "2-digit"
      };
      const currentTime = (/* @__PURE__ */ new Date()).getTime();
      if (count.value === 0) {
        limitTime.value = new Date(currentTime).toLocaleTimeString([], options);
        soberTime.value = new Date(currentTime).toLocaleTimeString([], options);
      } else {
        limitTime.value = new Date(
          currentTime + count.value * 60 * 60 * 1e3
        ).toLocaleTimeString([], options);
        soberTime.value = new Date(
          currentTime + (count.value + 1) * 60 * 60 * 1e3
        ).toLocaleTimeString([], options);
      }
    }
    __name(updateTimes, "updateTimes");
    __name2(updateTimes, "updateTimes");
    onMounted(updateTimes);
    watch(count, updateTimes);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "content-container" }, _attrs))}><article class="marginless"><header>Alcohol Checker</header><section class="grid"><button class="outline">Add</button><button class="outline">Subtract</button></section><table class="marginless"><thead><tr><th>Units consumed</th><th>Borderline time</th><th>Safe time</th></tr></thead><tbody><tr><td>${ssrInterpolate(count.value)}</td><td>${ssrInterpolate(limitTime.value)}</td><td>${ssrInterpolate(soberTime.value)}</td></tr></tbody></table></article></footer>`);
    };
  }
});
var _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Checker.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
var Checker = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$a
}, Symbol.toStringTag, { value: "Module" }));
var _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "Activity",
  __ssrInlineRender: true,
  setup(__props) {
    const activity = ref(null);
    const loading = ref(false);
    const hideHint = ref(false);
    async function fetchActivity() {
      loading.value = true;
      try {
        const response = await fetch("https://bored.api.lewagon.com/api/activity");
        activity.value = await response.json();
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    }
    __name(fetchActivity, "fetchActivity");
    __name2(fetchActivity, "fetchActivity");
    onMounted(fetchActivity);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<footer${ssrRenderAttrs(mergeProps({
        style: { cursor: loading.value ? "progress" : "" },
        class: "content-container"
      }, _attrs))}>`);
      if (activity.value) {
        _push(`<article title="Click for a new suggestion" class="marginless"><header><strong> Try this ${ssrInterpolate(activity.value.type)} activity </strong> (The Bored API) </header><p class="marginless">${ssrInterpolate(activity.value.activity)}</p></article>`);
      } else {
        _push(`<article class="marginless"><header><strong>Try this activity</strong></header><p class="marginless" aria-busy="true"> Loading from The Bored API. </p></article>`);
      }
      if (!hideHint.value) {
        _push(`<article style="${ssrRenderStyle({ "padding-top": "0", "margin-top": "0", "margin-bottom": "0" })}"><footer style="${ssrRenderStyle({ "font-style": "oblique", "font-size": "0.8em", "margin-top": "0" })}"> Click to update </footer></article>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</footer>`);
    };
  }
});
var _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Activity.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
var _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "Suggestion",
  __ssrInlineRender: true,
  props: {
    url: {},
    valueName: {},
    title: {}
  },
  setup(__props) {
    const props = __props;
    const suggestion = ref(null);
    const loading = ref(false);
    const hideHint = ref(false);
    const hoverHintText = computed(() => "Click for a new " + props.valueName);
    async function fetchSuggestion() {
      loading.value = true;
      try {
        const response = await fetch(props.url, {
          headers: { Accept: "application/json" }
        });
        suggestion.value = await response.json();
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    }
    __name(fetchSuggestion, "fetchSuggestion");
    __name2(fetchSuggestion, "fetchSuggestion");
    onMounted(fetchSuggestion);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<footer${ssrRenderAttrs(mergeProps({
        style: { cursor: loading.value ? "progress" : "" },
        class: "content-container"
      }, _attrs))}>`);
      if (suggestion.value) {
        _push(`<article${ssrRenderAttr("title", hoverHintText.value)} class="marginless"><header><strong>${ssrInterpolate(__props.title)}</strong></header><p class="marginless">${ssrInterpolate(suggestion.value[__props.valueName])}</p></article>`);
      } else {
        _push(`<article class="marginless"><header><strong>${ssrInterpolate(__props.title)}</strong></header><p class="marginless" aria-busy="true">${ssrInterpolate(__props.url)} might be down.</p></article>`);
      }
      if (!hideHint.value) {
        _push(`<article style="${ssrRenderStyle({ "padding-top": "0", "margin-top": "0", "margin-bottom": "0" })}"><footer style="${ssrRenderStyle({ "font-style": "oblique", "font-size": "0.8em", "margin-top": "0" })}"> Click to update </footer></article>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</footer>`);
    };
  }
});
var _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Suggestion.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
var _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "TypingText",
  __ssrInlineRender: true,
  props: {
    text: {}
  },
  setup(__props) {
    const props = __props;
    const displayedText = ref("");
    let index = 0;
    onMounted(() => {
      const typing = setInterval(() => {
        if (index < props.text.length) {
          displayedText.value += props.text.charAt(index);
          index++;
        } else {
          clearInterval(typing);
        }
      }, 100);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<p${ssrRenderAttrs(mergeProps({ class: "typing-effect" }, _attrs))} data-v-bc68f328>${ssrInterpolate(displayedText.value)}<span class="cursor" data-v-bc68f328></span></p>`);
    };
  }
});
var _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/TypingText.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
var TypingText = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-bc68f328"]]);
var _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "SplashScreen",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "splash-screen" }, _attrs))} data-v-313d051d><div class="glitch" data-text="INITIALIZING..." data-v-313d051d>INITIALIZING...</div></div>`);
    };
  }
});
var _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/SplashScreen.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
var SplashScreen = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-313d051d"]]);
var pages = [
  {
    name: "Home",
    link: "/",
    title: "Home",
    body: [
      "This website serves as a home page for testing various ideas developed using Vue JS. The content presented here may undergo periodic changes as I continue to experiment with different concepts and functionalities.",
      "I have recently embarked on a new chapter in my career, joining RM as a Software Engineer.  I am enthusiastic about this opportunity to further develop my skills and contribute to the company's success. I am eager to collaborate with the talented team at RM and embrace the challenges that lie ahead.  I believe this role will provide me with a platform for significant professional growth, and I am excited to see what the future holds."
    ]
  },
  {
    name: "About",
    link: "/about",
    title: "About Me",
    body: [
      "I am a BSc (Hons) graduate who has been confident working with computers in some way for most of my life.",
      "With 14 years of experience in software and web development, I have primarily focused on PHP, while also utilizing JavaScript on various occasions. My expertise encompasses a comprehensive understanding of version control systems, particularly Git, and proficiency in managing MySQL databases.",
      "Throughout my career, I have gained experience with multiple frameworks and libraries, notably:<ul><li>Laravel and Symfony for PHP, which enhances the development of robust applications.</li><li>React, SolidJS and VueJS for JavaScript, allowing for the creation of dynamic user interfaces.</li></ul>",
      "This diverse skill set positions me well for contributing to complex projects in the software development landscape."
    ]
  },
  {
    name: "Interests",
    link: "/interests",
    title: "My Interests",
    body: [
      "In addition to my professional commitments, I engage in developing new coding ideas as a hobby during my spare time. This pursuit not only allows me to explore innovative concepts but also enables me to stay informed about emerging programming languages and technologies.",
      'Furthermore, I maintain an active interest in music. I play several musical instruments, with the guitar being my primary focus. My passion for music has led me to create original compositions, some of which I have shared on <a href="https://www.youtube.com/@toilled" class="contrast" target="_blank">YouTube</a>. This platform serves as a means for me to express my creativity and connect with others who share similar interests.',
      "Through these hobbies, I continue to enhance my skills and broaden my horizons in both technology and the arts."
    ]
  },
  {
    name: "Hidden",
    link: "/hidden",
    title: "Hidden",
    hidden: true,
    body: [
      "This page is a little secret! It's not included in the main navigation menu, but it's here for you to explore. On this page, you'll find links to a few extra things I've built. These are small projects and games that I've created for fun. Feel free to check them out and see what you think!",
      '<ul><li><a href="/checker">Checker</li><li><a href="/game">Game</li><li><a href="/noughts-and-crosses">Noughts and Crosses</li><li><a href="/ask">Ask Me</li></ul>'
    ]
  }
];
var title = "Elliot Dickerson";
var subtitle = "A site to test things";
var titles = {
  title,
  subtitle
};
var _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "App",
  __ssrInlineRender: true,
  setup(__props) {
    const CyberpunkCity = /* @__PURE__ */ defineAsyncComponent(() => {
      {
        return Promise.resolve({ render: /* @__PURE__ */ __name2(() => null, "render") });
      }
    });
    const visiblePages = computed(() => {
      return pages.filter((page) => !page.hidden);
    });
    const containerRef = ref(null);
    const checker = ref(false);
    const activity = ref(false);
    const joke = ref(false);
    const showHint = ref(false);
    const showSplash = ref(true);
    const route = useRoute();
    const router = useRouter();
    const transitionName = ref("cards");
    const gameMode = ref(false);
    const isContentVisible = ref(true);
    const isClient = ref(false);
    function toggleContent() {
      isContentVisible.value = !isContentVisible.value;
    }
    __name(toggleContent, "toggleContent");
    __name2(toggleContent, "toggleContent");
    const cyberpunkCityRef = ref(null);
    function startExploration() {
      if (cyberpunkCityRef.value && cyberpunkCityRef.value.startExplorationMode) {
        cyberpunkCityRef.value.startExplorationMode();
      }
    }
    __name(startExploration, "startExploration");
    __name2(startExploration, "startExploration");
    function startFlyingTour() {
      if (cyberpunkCityRef.value && cyberpunkCityRef.value.startFlyingTour) {
        cyberpunkCityRef.value.startFlyingTour();
      }
    }
    __name(startFlyingTour, "startFlyingTour");
    __name2(startFlyingTour, "startFlyingTour");
    function startDemoMode() {
      if (cyberpunkCityRef.value && cyberpunkCityRef.value.startDemoMode) {
        cyberpunkCityRef.value.startDemoMode();
      }
    }
    __name(startDemoMode, "startDemoMode");
    __name2(startDemoMode, "startDemoMode");
    function handleKeydown(e) {
      if (gameMode.value) return;
      if (e.key === "Escape") {
        const gameRoutes = ["/game", "/noughts-and-crosses", "/checker", "/ask"];
        if (gameRoutes.includes(route.path)) {
          router.push("/hidden");
        }
      }
      switch (e.key) {
        case "ArrowRight": {
          const currentIndex = visiblePages.value.findIndex((page) => page.link === route.path);
          if (currentIndex !== -1 && currentIndex < visiblePages.value.length - 1) {
            router.push(visiblePages.value[currentIndex + 1].link);
          }
          break;
        }
        case "ArrowLeft": {
          const currentIndex = visiblePages.value.findIndex((page) => page.link === route.path);
          if (currentIndex > 0) {
            router.push(visiblePages.value[currentIndex - 1].link);
          }
          break;
        }
      }
    }
    __name(handleKeydown, "handleKeydown");
    __name2(handleKeydown, "handleKeydown");
    function onBeforeLeave(el) {
      if (containerRef.value) {
        const { height } = getComputedStyle(el);
        containerRef.value.style.height = height;
      }
    }
    __name(onBeforeLeave, "onBeforeLeave");
    __name2(onBeforeLeave, "onBeforeLeave");
    function onEnter(el) {
      if (containerRef.value) {
        const { height } = getComputedStyle(el);
        containerRef.value.style.height = height;
      }
    }
    __name(onEnter, "onEnter");
    __name2(onEnter, "onEnter");
    function onAfterEnter() {
      if (containerRef.value) {
        containerRef.value.style.height = "";
      }
    }
    __name(onAfterEnter, "onAfterEnter");
    __name2(onAfterEnter, "onAfterEnter");
    function getPageIndex(routeName) {
      if (routeName === "/") {
        return pages.findIndex((page) => page.link === "/");
      }
      const index = pages.findIndex((page) => page.link.slice(1) === routeName);
      return index === -1 ? Object.keys(pages).length : index;
    }
    __name(getPageIndex, "getPageIndex");
    __name2(getPageIndex, "getPageIndex");
    const noFootersShowing = computed(() => {
      return !activity.value && !checker.value && !joke.value;
    });
    function toggleActivity() {
      activity.value = !activity.value;
    }
    __name(toggleActivity, "toggleActivity");
    __name2(toggleActivity, "toggleActivity");
    function toggleJoke() {
      joke.value = !joke.value;
    }
    __name(toggleJoke, "toggleJoke");
    __name2(toggleJoke, "toggleJoke");
    let splashTimeout;
    onMounted(() => {
      isClient.value = true;
      splashTimeout = setTimeout(() => {
        showSplash.value = false;
      }, 500);
      setTimeout(() => {
        showHint.value = true;
      }, 2e3);
      setTimeout(() => {
        showHint.value = false;
      }, 5e3);
      let lastTouchTime = 0;
      document.body.addEventListener("touchstart", () => {
        lastTouchTime = Date.now();
        document.body.classList.remove("can-hover");
      });
      document.body.addEventListener("mousemove", () => {
        if (Date.now() - lastTouchTime > 500) {
          document.body.classList.add("can-hover");
        }
      });
      window.addEventListener("keydown", handleKeydown);
    });
    onErrorCaptured((err) => {
      console.error("App Error Captured:", err);
      showSplash.value = false;
      return true;
    });
    onUnmounted(() => {
      clearTimeout(splashTimeout);
      window.removeEventListener("keydown", handleKeydown);
    });
    watch(
      () => route.path,
      (newPath, oldPath) => {
        if (oldPath) {
          const oldPageIndex = getPageIndex(oldPath.slice(1));
          const newPageIndex = getPageIndex(newPath.slice(1));
          transitionName.value = newPageIndex > oldPageIndex ? "cards" : "cards-reverse";
        }
        let pageTitle;
        switch (newPath) {
          case "/noughts-and-crosses":
            pageTitle = "Noughts and Crosses";
            break;
          case "/game":
            pageTitle = "Catch the Button!";
            break;
          case "/checker":
            pageTitle = "Checker";
            break;
          case "/ask":
            pageTitle = "Ask Me";
            break;
          default: {
            let routeName;
            if (route.params.name) {
              routeName = route.params.name;
            } else if (newPath === "/") {
              routeName = "home";
            }
            if (routeName) {
              let currentPage;
              if (routeName === "home") {
                currentPage = pages.find((page) => page.link === "/");
              } else {
                currentPage = pages.find((page) => page.link.slice(1) === routeName);
              }
              pageTitle = currentPage ? currentPage.title : "404";
            } else {
              pageTitle = "404";
            }
            break;
          }
        }
        if (typeof document !== "undefined") {
          document.title = "Elliot > " + pageTitle;
        }
      },
      { immediate: true }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_router_view = resolveComponent("router-view");
      _push(`<!--[--><div id="content-wrapper" class="${ssrRenderClass({ "fade-out": gameMode.value })}"><nav>`);
      _push(ssrRenderComponent(Title, {
        title: unref(titles).title,
        subtitle: unref(titles).subtitle,
        activity: activity.value,
        joke: joke.value,
        onActivity: toggleActivity,
        onJoke: toggleJoke
      }, null, _parent));
      _push(ssrRenderComponent(Menu, {
        pages: visiblePages.value,
        "content-visible": isContentVisible.value,
        onExplore: startExploration,
        onFly: startFlyingTour,
        onDemo: startDemoMode,
        onToggleContent: toggleContent
      }, null, _parent));
      _push(`</nav><div class="router-view-container" style="${ssrRenderStyle(isContentVisible.value ? null : { display: "none" })}">`);
      _push(ssrRenderComponent(_component_router_view, null, {
        default: withCtx(({ Component, route: route2 }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(``);
            renderVNode(_push2, createVNode(resolveDynamicComponent(Component), {
              key: route2.path
            }, null), _parent2, _scopeId);
          } else {
            return [
              createVNode(Transition, {
                name: transitionName.value,
                onBeforeLeave,
                onEnter,
                onAfterEnter
              }, {
                default: withCtx(() => [
                  (openBlock(), createBlock(resolveDynamicComponent(Component), {
                    key: route2.path
                  }))
                ]),
                _: 2
              }, 1032, ["name"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (noFootersShowing.value && showHint.value) {
        _push(`<footer class="content-container" style="${ssrRenderStyle(isContentVisible.value ? null : { display: "none" })}">`);
        _push(ssrRenderComponent(TypingText, { text: "The titles might be clickable..." }, null, _parent));
        _push(`</footer>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (isClient.value) {
        _push(ssrRenderComponent(unref(CyberpunkCity), {
          ref_key: "cyberpunkCityRef",
          ref: cyberpunkCityRef,
          onGameStart: /* @__PURE__ */ __name2(($event) => gameMode.value = true, "onGameStart"),
          onGameEnd: /* @__PURE__ */ __name2(($event) => gameMode.value = false, "onGameEnd")
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (checker.value) {
        _push(ssrRenderComponent(_sfc_main$a, {
          class: { "fade-out": gameMode.value }
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_sfc_main$9, {
        style: activity.value ? null : { display: "none" },
        class: { "fade-out": gameMode.value }
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$8, {
        style: joke.value ? null : { display: "none" },
        class: { "fade-out": gameMode.value },
        url: "https://icanhazdadjoke.com/",
        valueName: "joke",
        title: "Have a laugh!"
      }, null, _parent));
      if (showSplash.value) {
        _push(ssrRenderComponent(SplashScreen, null, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
});
var _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/App.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
var _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "Paragraph",
  __ssrInlineRender: true,
  props: {
    paragraph: {},
    last: { type: Boolean }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["text-paragraph", { marginless: __props.last }]
      }, _attrs))}>${__props.paragraph ?? ""}</div>`);
    };
  }
});
var _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Paragraph.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "PageContent",
  __ssrInlineRender: true,
  setup(__props) {
    const showHint = ref(false);
    const route = useRoute();
    const page = computed(() => {
      if (route.params.name) {
        return pages.find((p2) => p2.link.slice(1) === route.params.name);
      }
      if (route.params.pathMatch) {
        return null;
      }
      return pages[0];
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<main${ssrRenderAttrs(_attrs)}><section><article class="marginless"><header><h2 class="title">`);
      if (page.value) {
        _push(`<!--[-->${ssrInterpolate(page.value.title)} `);
        if (showHint.value) {
          _push(`<span style="${ssrRenderStyle({ "font-weight": "100", "font-style": "italic", "font-size": "0.6em", "vertical-align": "middle" })}"> - Nothing here </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!--[--> 404 - Page not found <!--]-->`);
      }
      _push(`</h2></header>`);
      if (page.value) {
        _push(`<!--[-->`);
        ssrRenderList(page.value.body, (paragraph, index) => {
          _push(ssrRenderComponent(_sfc_main$4, {
            key: index,
            paragraph,
            last: index + 1 === page.value.body.length
          }, null, _parent));
        });
        _push(`<!--]-->`);
      } else {
        _push(ssrRenderComponent(_sfc_main$4, {
          paragraph: `The page <strong>${unref(route).params.name}</strong> does not exist!`,
          last: true
        }, null, _parent));
      }
      _push(`</article></section></main>`);
    };
  }
});
var _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/PageContent.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var routes2 = [
  { path: "/", component: _sfc_main$3, props: { name: "home" } },
  { path: "/:name", component: _sfc_main$3, props: true },
  { path: "/checker", component: /* @__PURE__ */ __name2(() => Promise.resolve().then(() => Checker), "component") },
  { path: "/game", component: /* @__PURE__ */ __name2(() => Promise.resolve().then(() => MiniGame$1), "component") },
  {
    path: "/noughts-and-crosses",
    component: /* @__PURE__ */ __name2(() => Promise.resolve().then(() => NoughtsAndCrosses$1), "component")
  },
  { path: "/ask", component: /* @__PURE__ */ __name2(() => Promise.resolve().then(() => Ask$1), "component") },
  { path: "/:pathMatch(.*)*", component: _sfc_main$3 }
];
function createApp() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: routes2
  });
  const app = createSSRApp(_sfc_main$5);
  app.use(router);
  return { app, router };
}
__name(createApp, "createApp");
__name2(createApp, "createApp");
async function render(url) {
  const { app, router } = createApp();
  await router.push(url);
  await router.isReady();
  const ctx = {};
  const html = await renderToString(app, ctx);
  return html;
}
__name(render, "render");
__name2(render, "render");
var _sfc_main$2 = {
  __name: "MiniGame",
  __ssrInlineRender: true,
  setup(__props) {
    const score = ref(0);
    const buttonStyle = reactive({
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      transition: "all 0.3s ease"
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container" }, _attrs))} data-v-2754fa07><h1 data-v-2754fa07>Catch the Button!</h1><p data-v-2754fa07>Score: ${ssrInterpolate(score.value)}</p><div class="game-area" data-v-2754fa07><button style="${ssrRenderStyle(buttonStyle)}" data-v-2754fa07>Click Me!</button></div></div>`);
    };
  }
};
var _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/MiniGame.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var MiniGame = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-2754fa07"]]);
var MiniGame$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MiniGame
}, Symbol.toStringTag, { value: "Module" }));
function useNoughtsAndCrosses() {
  const board = ref(Array(9).fill(""));
  const currentPlayer = ref("X");
  const winner = ref(null);
  const makeMove = /* @__PURE__ */ __name2((index) => {
    if (board.value[index] || winner.value) return;
    board.value[index] = currentPlayer.value;
    if (checkWinner(board.value, currentPlayer.value)) {
      winner.value = currentPlayer.value;
      return;
    }
    if (board.value.every((cell) => cell)) {
      winner.value = "draw";
      return;
    }
    currentPlayer.value = "O";
    computerMove();
  }, "makeMove");
  const computerMove = /* @__PURE__ */ __name2(() => {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
      if (board.value[i] === "") {
        const newBoard = [...board.value];
        newBoard[i] = "O";
        const score = minimax(newBoard, 0, false);
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    board.value[move] = "O";
    if (checkWinner(board.value, "O")) {
      winner.value = "O";
    } else if (board.value.every((cell) => cell)) {
      winner.value = "draw";
    }
    currentPlayer.value = "X";
  }, "computerMove");
  const minimax = /* @__PURE__ */ __name2((board2, depth, isMaximizing) => {
    if (checkWinner(board2, "O")) return 10 - depth;
    if (checkWinner(board2, "X")) return depth - 10;
    if (board2.every((cell) => cell)) return 0;
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board2[i] === "") {
          const newBoard = [...board2];
          newBoard[i] = "O";
          const score = minimax(newBoard, depth + 1, false);
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board2[i] === "") {
          const newBoard = [...board2];
          newBoard[i] = "X";
          const score = minimax(newBoard, depth + 1, true);
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }, "minimax");
  const checkWinner = /* @__PURE__ */ __name2((board2, player) => {
    const winConditions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    return winConditions.some(
      (combination) => combination.every((index) => board2[index] === player)
    );
  }, "checkWinner");
  const resetGame = /* @__PURE__ */ __name2(() => {
    board.value = Array(9).fill("");
    currentPlayer.value = "X";
    winner.value = null;
  }, "resetGame");
  return {
    board,
    winner,
    makeMove,
    resetGame
  };
}
__name(useNoughtsAndCrosses, "useNoughtsAndCrosses");
__name2(useNoughtsAndCrosses, "useNoughtsAndCrosses");
var _sfc_main$1 = {
  __name: "NoughtsAndCrosses",
  __ssrInlineRender: true,
  setup(__props) {
    const { board, winner } = useNoughtsAndCrosses();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container" }, _attrs))} data-v-286607d1><h1 data-v-286607d1>Noughts and Crosses</h1>`);
      if (unref(winner)) {
        _push(`<div class="winner" data-v-286607d1><h2 data-v-286607d1>${ssrInterpolate(unref(winner) === "draw" ? "It's a draw!" : unref(winner) === "X" ? "You win!" : "You lose!")}</h2><button data-v-286607d1>Play Again</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="board" data-v-286607d1><!--[-->`);
      ssrRenderList(unref(board), (cell, index) => {
        _push(`<div class="cell" data-v-286607d1>${ssrInterpolate(cell)}</div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
};
var _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/NoughtsAndCrosses.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var NoughtsAndCrosses = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-286607d1"]]);
var NoughtsAndCrosses$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: NoughtsAndCrosses
}, Symbol.toStringTag, { value: "Module" }));
var _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Ask",
  __ssrInlineRender: true,
  setup(__props) {
    const userInput = ref("");
    const messages = ref([]);
    const isTyping = ref(false);
    ref(null);
    onMounted(() => {
      messages.value.push({
        text: "Hello! I'm an automated assistant. Ask me anything about my skills or experience.",
        sender: "bot"
      });
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "container" }, _attrs))} data-v-709fce48><article data-v-709fce48><header data-v-709fce48><h2 data-v-709fce48>Ask Me</h2></header><div class="chat-window" data-v-709fce48><!--[-->`);
      ssrRenderList(messages.value, (msg, index) => {
        _push(`<div class="${ssrRenderClass(["message", msg.sender])}" data-v-709fce48><div class="message-content" data-v-709fce48>${ssrInterpolate(msg.text)}</div></div>`);
      });
      _push(`<!--]-->`);
      if (isTyping.value) {
        _push(`<div class="message bot" data-v-709fce48><div class="message-content" data-v-709fce48>Typing...</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><footer class="input-area" data-v-709fce48><form style="${ssrRenderStyle({ "display": "flex", "gap": "0.5rem", "width": "100%", "margin-bottom": "0" })}" data-v-709fce48><input${ssrRenderAttr("value", userInput.value)} type="text" name="chat-input" placeholder="Ask a question..."${includeBooleanAttr(isTyping.value) ? " disabled" : ""} style="${ssrRenderStyle({ "margin-bottom": "0" })}" data-v-709fce48><button type="submit"${includeBooleanAttr(!userInput.value.trim() || isTyping.value) ? " disabled" : ""} style="${ssrRenderStyle({ "width": "auto", "margin-bottom": "0" })}" data-v-709fce48>Send</button></form></footer></article></main>`);
    };
  }
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Ask.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Ask = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-709fce48"]]);
var Ask$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ask
}, Symbol.toStringTag, { value: "Module" }));
var onRequest = /* @__PURE__ */ __name2(async (context) => {
  const url = new URL(context.request.url);
  if (/\.[a-zA-Z0-9]+$/.test(url.pathname)) {
    return context.next();
  }
  try {
    const appHtml = await render(url.pathname);
    let response = await context.next();
    let headers = new Headers();
    let template = "";
    if (response.ok && response.headers.get("content-type")?.includes("text/html")) {
      template = await response.text();
      headers = new Headers(response.headers);
    } else {
      if (context.env && context.env.ASSETS) {
        const indexRequest = new Request(new URL("/index.html", url.origin), context.request);
        const indexResponse = await context.env.ASSETS.fetch(indexRequest);
        if (indexResponse.ok) {
          template = await indexResponse.text();
          headers = new Headers(indexResponse.headers);
        } else {
          return response;
        }
      } else {
        return response;
      }
    }
    const html = template.replace("<!--app-html-->", appHtml);
    headers.set("content-type", "text/html;charset=UTF-8");
    headers.set("cache-control", "public, max-age=0, must-revalidate");
    return new Response(html, {
      headers,
      status: 200
    });
  } catch (error) {
    console.error("SSR Error:", error);
    return context.next();
  }
}, "onRequest");
var routes = [
  {
    routePath: "/api/multiplayer",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/scores",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/scores",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/:path*",
    mountPath: "/",
    method: "",
    middlewares: [],
    modules: [onRequest]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes2 = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes2.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode2 = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode2(value, key);
        });
      } else {
        params[key.name] = decode2(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-FW7u8F/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-FW7u8F/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
/**
* @vue/shared v3.5.25
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/**
* @vue/reactivity v3.5.25
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/**
* @vue/runtime-core v3.5.25
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/**
* @vue/runtime-dom v3.5.25
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/**
* @vue/shared v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/**
* @vue/server-renderer v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */
/**
* @vue/server-renderer v3.5.25
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
//# sourceMappingURL=functionsWorker-0.038384871833329504.js.map
