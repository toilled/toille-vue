# Library & Tool Analysis for toille-vue

## Current Stack Overview

### Production Dependencies
| Library | Version | Usage | Files Imported |
|---------|---------|-------|----------------|
| **three** | ^0.181.2 | 3D cyberpunk city game engine | 30+ files (52 imports) |
| **mqtt** | ^5.15.1 | Multiplayer WebSocket communication | 1 file |
| **dompurify** | ^3.4.1 | HTML sanitization | 2 components |
| **vue-i18n** | ^11.4.5 | Internationalization (13 languages) | 14 files |
| **vue-router** | ^4.4.0 | Client-side routing | 3 files |
| **@unhead/vue** | ^3.1.5 | SEO head management | 8 files |
| **vue** | ^3.4.31 | Core framework | - |
| **@vue/server-renderer** | ^3.5.27 | SSR support | - |

### Dev Dependencies
| Tool | Version | Usage |
|------|---------|-------|
| **vite** | ^6.4.1 | Build tool |
| **vitest** | ^3.2.4 | Unit testing |
| **terser** | ^5.44.1 | JS minification |
| **vite-plugin-compression** | ^0.5.1 | Gzip/Brotli compression |
| **unplugin-auto-import** | ^21.0.0 | Auto-import APIs |
| **unplugin-vue-components** | ^32.1.0 | Auto-import components |
| **wrangler** | ^4.54.0 | Cloudflare Pages deployment |
| **typescript** | ^5.8.2 | Type checking |
| **eslint** | ^9.21.0 | Linting |
| **prettier** | 3.5.3 | Code formatting |

---

## Detailed Analysis & Alternatives

### 1. Three.js → **Keep** (No change recommended)

**Current Usage:** Extensive 3D cyberpunk city with post-processing, traffic, multiplayer, story modes.

**Alternatives Considered:**
- **Babylon.js** - Full engine with built-in physics, audio, XR. Larger bundle (~1.4MB vs ~168KB).
- **PlayCanvas** - Cloud-based editor, better for teams. Less flexible.
- **TresJS** - Vue-specific R3F wrapper. Adds React-like abstraction.

**Recommendation:** **Keep Three.js**
- Already deeply integrated (30+ files, 52 imports)
- Largest ecosystem (5M weekly downloads)
- Smallest bundle size for the features used
- No physics/audio/XR needed (custom implementations exist)
- Switching cost would be enormous

---

### 2. MQTT.js → **Evaluate alternatives**

**Current Usage:** Single file (`MultiplayerManager.ts`) for real-time player position sync via public broker.

**Alternatives Considered:**
- **Native WebSockets** - Direct WebSocket API, no MQTT overhead
- **Socket.IO** - Higher-level, auto-reconnect, rooms, fallback
- **Supabase Realtime** - If already using Supabase
- **PartyKit** - Cloudflare-based realtime

**Recommendation:** **Consider native WebSockets**
- MQTT adds ~50KB gzipped for a simple pub/sub use case
- Native WebSocket API is sufficient for this use case
- Could use Cloudflare Durable Objects for multiplayer state
- **Trade-off:** Lose MQTT features (QoS, retained messages) but gain simplicity

---

### 3. DOMPurify → **Replace with modern alternative**

**Current Usage:** HTML sanitization in `Quiz.vue` and `Paragraph.vue`.

**Alternatives Considered:**
- **sanitize-html** - More features, tag transforms, style filtering
- **neo.sanitize** - Browser-native, zero deps, <3KB
- **HTML Sanitizer API** - Native browser API (Chrome 124+)

**Recommendation:** **Replace with HTML Sanitizer API or sanitize-html**
- DOMPurify requires DOM (JSDOM in SSR) - already has SSR bypass in code
- HTML Sanitizer API is native, zero dependencies
- `sanitize-html` has better feature set if needed
- Current code already checks `import.meta.env.SSR` to skip sanitization

---

### 4. vue-i18n → **Keep** (No change recommended)

**Current Usage:** 13 languages, lazy-loading, type-safe messages.

**Alternatives Considered:**
- **Fluenti** - Compile-time i18n, 5-10x faster runtime
- **intlayer** - Better DX, component-based
- **fluent-vue** - Mozilla's Fluent syntax

**Recommendation:** **Keep vue-i18n**
- Mature, well-documented, large ecosystem
- Type-safe with MessageSchema
- Already optimized with lazy-loading
- Switching cost moderate, minimal gain

---

### 5. vite-plugin-compression → **Upgrade to vite-plugin-bundler**

**Current Usage:** Gzip + Brotli compression.

**Alternatives Considered:**
- **vite-plugin-bundler** (renamed from vite-plugin-brotli-compress) - Adds Zstd, worker threads, size budgets
- **vite-plugin-compressor** - Similar features

**Recommendation:** **Upgrade to vite-plugin-bundler**
- Adds Zstd support (better than Brotli for Cloudflare)
- Worker threads for faster builds
- Size budgets for CI enforcement
- Better maintained, more features

---

### 6. terser → **Replace with esbuild or SWC**

**Current Usage:** JS minification with console/debugger stripping.

**Alternatives Considered:**
- **esbuild** - 10-100x faster, built into Vite
- **SWC** - 7x faster than terser, better compression on large bundles
- **oxc-minify** - Fastest, good compression

**Recommendation:** **Switch to esbuild** (default in Vite)
- Already built into Vite, zero config needed
- 87x faster than terser
- Slightly larger output (~1-2%) but negligible
- Remove terser dependency

---

### 7. unplugin-auto-import & unplugin-vue-components → **Keep**

**Current Usage:** Auto-import Vue APIs and components.

**Alternatives:** None significant - these are the standard.

**Recommendation:** **Keep**
- Industry standard for Vue DX
- Well-maintained, large ecosystem
- No viable alternatives

---

### 8. @unhead/vue → **Keep**

**Current Usage:** SEO meta tags, head management.

**Alternatives:** None significant.

**Recommendation:** **Keep**
- Official Vue head management solution
- SSR-compatible
- Well-maintained

---

## Priority Recommendations

### High Priority (Easy wins)
1. **Replace terser with esbuild** - Remove terser, use Vite's default
2. **Upgrade vite-plugin-compression** to vite-plugin-bundler

### Medium Priority (Consider)
3. **Replace DOMPurify** with HTML Sanitizer API or sanitize-html
4. **Evaluate MQTT replacement** - Consider native WebSockets

### Low Priority (Keep as-is)
5. **Three.js** - No change
6. **vue-i18n** - No change
7. **unplugin-* packages** - No change
8. **@unhead/vue** - No change

---

## Bundle Size Impact

| Change | Estimated Savings |
|--------|-------------------|
| Remove terser | ~50KB dev dependency |
| Replace DOMPurify | ~8KB gzipped |
| Replace MQTT | ~50KB gzipped |
| Upgrade compression plugin | Better compression ratios |

---

## Migration Effort

| Change | Effort | Risk |
|--------|--------|------|
| terser → esbuild | Low | Low |
| vite-plugin-compression upgrade | Low | Low |
| DOMPurify replacement | Medium | Medium |
| MQTT → WebSockets | High | High |
