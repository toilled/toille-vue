# toille-vue

This is a simple Vue.js web application built with Vite and TypeScript. It serves as a personal website and includes a few interactive components.

## Features

*   **Dynamic Pages**: Page content is loaded from a JSON file and rendered dynamically using Vue Router.
*   **Interactive Components**: Includes an alcohol unit checker, a mini-game, and components that fetch data from external APIs.
*   **Styling**: Uses `@picocss/pico` for lightweight and clean styling.

## Project Structure

*   `src/components`: Contains all the Vue components.
*   `src/configs/pages.json`: Defines the pages and their content.
*   `src/interfaces`: Contains TypeScript interfaces.
*   `src/main.ts`: The application's entry point.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd toille-vue
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

## Available Scripts

*   **`npm run dev`**: Starts the development server.
*   **`npm run build`**: Builds the application for production.
*   **`npm run serve`**: Serves the production build locally.
*   **`npm run test`**: Runs the unit tests (Vitest).
*   **`npm run test:e2e`**: Runs end-to-end and visual regression tests (Playwright).
*   **`npm run test:e2e:ui`**: Runs Playwright tests with the interactive UI mode.

## Testing

### Unit Tests

Unit tests use [Vitest](https://vitest.dev/) with `@vue/test-utils` and `jsdom`. They live alongside the source code in `src/**/tests/`.

```bash
npm test
```

### E2E & Visual Regression Tests

End-to-end tests use [Playwright](https://playwright.dev/) and are located in `e2e/`. They also serve as **visual regression tests** — full-page screenshots are captured and compared against committed baselines to catch unintended UI changes.

**First-time setup:**
1. Install the Chromium browser binary:
   ```bash
   npx playwright install chromium
   ```
2. Ensure system dependencies are available (`libnspr4`, `libnss3`, `libasound2`). On Ubuntu/Debian:
   ```bash
   sudo apt-get install -y libnspr4 libnss3 libasound2t64
   ```
   If `sudo` is unavailable, the libraries can be extracted manually (see the `LD_LIBRARY_PATH` setup in `package.json`).

**Running:**
```bash
npm run test:e2e
```

**Updating snapshots** (run when UI changes are intentional):
```bash
npm run test:e2e -- --update-snapshots
```

Snapshot baselines are stored in `e2e/app.spec.ts-snapshots/` and should be committed to git.
